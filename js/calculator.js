/* ============================================
   AZEBRA - Denial Calculator + Lead Magnet
   ============================================ */

(function () {
  'use strict';

  // --- Denial Cost Calculator ---
  document.querySelectorAll('.denial-calculator').forEach(function (calc) {
    var btn = calc.querySelector('.calc-btn');
    var results = calc.querySelector('.calc-results');
    if (!btn || !results) return;

    btn.addEventListener('click', function () {
      var lang = document.documentElement.lang;
      var isPT = lang === 'pt-BR';

      var input1 = calc.querySelector('[data-calc="claims"]');
      var input2 = calc.querySelector('[data-calc="value"]');
      var input3 = calc.querySelector('[data-calc="rate"]');

      var claims = parseFloat(input1.value);
      var avgValue = parseFloat(input2.value);
      var denialRate = parseFloat(input3.value);

      if (!claims || !avgValue || !denialRate || claims <= 0 || avgValue <= 0 || denialRate <= 0) {
        input1.style.borderColor = claims > 0 ? '' : 'var(--accent-magenta)';
        input2.style.borderColor = avgValue > 0 ? '' : 'var(--accent-magenta)';
        input3.style.borderColor = denialRate > 0 ? '' : 'var(--accent-magenta)';
        return;
      }

      input1.style.borderColor = '';
      input2.style.borderColor = '';
      input3.style.borderColor = '';

      var deniedClaims, totalAnnualCost, annualSavings;

      if (isPT) {
        // PT-BR: glosas model
        var glosas = claims * (denialRate / 100);
        var valorRetido = glosas * avgValue;
        totalAnnualCost = valorRetido * 12;

        // Automação: taxa reduz ~47% (baseado em OhioHealth -42%, conservador)
        var taxaAutomada = denialRate * 0.53;
        var valorRetidoAuto = (claims * (taxaAutomada / 100)) * avgValue;
        annualSavings = (valorRetido - valorRetidoAuto) * 12;
      } else {
        // EN: denial model
        deniedClaims = claims * (denialRate / 100);
        var revenueAtRisk = deniedClaims * avgValue;
        var permanentlyLost = revenueAtRisk * 0.475;
        var reworkCost = deniedClaims * 57.23;
        totalAnnualCost = (permanentlyLost + reworkCost) * 12;

        var automatedRate = denialRate * 0.6;
        var automatedDenied = claims * (automatedRate / 100);
        var automatedCost = ((automatedDenied * avgValue * 0.475) + (automatedDenied * 57.23)) * 12;
        annualSavings = totalAnnualCost - automatedCost;
      }

      // Format numbers
      var currency = isPT ? 'R$' : '$';
      var costEl = results.querySelector('[data-result="cost"]');
      var savingsEl = results.querySelector('[data-result="savings"]');

      costEl.textContent = currency + formatNumber(totalAnnualCost);
      savingsEl.textContent = currency + formatNumber(annualSavings);

      results.classList.add('visible');
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // GA4 event
      if (typeof gtag === 'function') {
        gtag('event', 'calculator_used', {
          event_category: 'engagement',
          event_label: isPT ? 'glosas-calculator' : 'denial-calculator',
          value: Math.round(totalAnnualCost)
        });
      }
    });
  });

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // --- Lead Magnet Form ---
  document.querySelectorAll('.lead-magnet-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('.btn-primary');
      var originalText = btn.textContent;
      btn.textContent = '...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          form.style.display = 'none';
          var success = form.parentElement.querySelector('.lead-magnet-success');
          if (success) success.classList.add('visible');

          if (typeof gtag === 'function') {
            gtag('event', 'lead_magnet_download', {
              event_category: 'conversion',
              event_label: form.querySelector('[name="source"]').value
            });
          }
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
          var isPT = document.documentElement.lang === 'pt-BR';
          alert(isPT ? 'Erro ao enviar. Tente novamente.' : 'Error submitting. Please try again.');
        }
      }).catch(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  });
})();
