(function() {
  // Only redirect on production domain
  if (window.location.hostname !== 'azebratech.com') return;

  // Respect explicit user language choice
  if (localStorage.getItem('azebra-lang')) return;

  // Check browser language first (instant, no API call)
  var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (lang.startsWith('pt')) {
    window.location.replace('/pt/');
    return;
  }

  // Fallback: IP-based geolocation for users in Brazil with non-PT browser
  fetch('https://ipapi.co/country_code/')
    .then(function(r) { return r.text(); })
    .then(function(code) {
      var c = (code || '').trim();
      if (c.length === 2 && c === 'BR') {
        window.location.replace('/pt/');
      }
    })
    .catch(function() {
      // Silently fail — user stays on English
    });
})();
