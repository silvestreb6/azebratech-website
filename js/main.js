/* ============================================
   AZEBRA - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initScrollReveal();
  initMobileMenu();
  initContactForm();
  initLangSwitcher();
});

/* ---------- Particle Canvas (Hero Background) ---------- */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;

      const colors = [
        'rgba(0, 212, 255,',   // cyan
        'rgba(123, 47, 247,',  // purple
        'rgba(255, 45, 149,',  // magenta
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.fill();
    }
  }

  // Adjust particle count based on screen size; fewer on mobile
  const isMobile = canvas.width < 768;
  const maxParticles = isMobile ? 25 : 80;
  const count = Math.min(maxParticles, Math.floor((canvas.width * canvas.height) / 15000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Skip expensive O(n²) line connections on mobile
    if (!isMobile) connectParticles();
    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Pause animation when not visible
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animationId) animate();
    } else {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });

  observer.observe(canvas);
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---------- Scroll Reveal Animation ---------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation for siblings
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          let delay = 0;
          siblings.forEach((el, i) => {
            if (el === entry.target) delay = i * 100;
          });

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-submit');
    const isPt = document.documentElement.lang.startsWith('pt');
    const data = new FormData(form);

    // Quietly ignore obvious bot submissions.
    if (String(data.get('_gotcha') || '').trim() !== '') {
      form.reset();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.remove('success');
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      form.reset();
      if (btn) {
        btn.classList.add('success');
        setTimeout(() => {
          btn.classList.remove('success');
        }, 3000);
      }
    } catch {
      const msg = isPt
        ? 'Nao foi possivel enviar agora. Verifique os dados e tente novamente em instantes.'
        : 'We could not submit your request right now. Please review your details and try again shortly.';
      alert(msg);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

/* ---------- Language Switcher ---------- */
function initLangSwitcher() {
  document.querySelectorAll('.lang-switch').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      const targetPath = new URL(href, window.location.origin).pathname;
      const lang = targetPath.startsWith('/pt') ? 'pt' : 'en';
      localStorage.setItem('azebra-lang', lang);
    });
  });
}

/* ---------- GA4 Custom Event Tracking ---------- */
function initEventTracking() {
  if (typeof gtag !== 'function') return;

  // Track WhatsApp float button clicks
  document.querySelectorAll('.whatsapp-float').forEach(el => {
    el.addEventListener('click', () => {
      gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: window.location.pathname
      });
    });
  });

  // Track CTA button clicks (mid-article and final CTAs)
  document.querySelectorAll('.article-cta a, .cta-card a, .cta-btn, a[href*="/lp/"]').forEach(el => {
    el.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: el.getAttribute('href') || '',
        page_path: window.location.pathname
      });
    });
  });

  // Track scroll depth on blog articles (50% and 90%)
  if (window.location.pathname.includes('/blog/') && window.location.pathname !== '/blog/' && window.location.pathname !== '/pt/blog/') {
    let scrolled50 = false;
    let scrolled90 = false;

    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

      if (!scrolled50 && scrollPercent >= 0.5) {
        scrolled50 = true;
        gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          event_label: '50%',
          page_path: window.location.pathname
        });
      }

      if (!scrolled90 && scrollPercent >= 0.9) {
        scrolled90 = true;
        gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          event_label: '90%',
          page_path: window.location.pathname
        });
      }
    }, { passive: true });
  }

  // Track outbound link clicks
  document.querySelectorAll('a[target="_blank"][rel*="noopener"]').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('href') || '';
      if (url.startsWith('http') && !url.includes('azebratech.com')) {
        gtag('event', 'outbound_click', {
          event_category: 'engagement',
          event_label: url,
          page_path: window.location.pathname
        });
      }
    });
  });

  // Track landing page views as key event
  if (window.location.pathname.includes('/lp/')) {
    gtag('event', 'lp_view', {
      event_category: 'conversion',
      event_label: window.location.pathname
    });
  }
}

// Add event tracking to DOMContentLoaded
document.addEventListener('DOMContentLoaded', initEventTracking);
