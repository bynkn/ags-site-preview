/* Agentic GUARDIANS · How it works
   Minimal copy of script.js: sign-up form + .rv reveals. No opening animation, pill always visible. */
(function () {
  'use strict';
  var root = document.documentElement;
  var INSTANT = root.classList.contains('instant');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* Sign-up endpoint: keep in sync with script.js. Left empty, the live site shows an error instead of dropping the email. */
  var SIGNUP_ENDPOINT = '';
  var IS_LOCAL = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname);

  function wireEmailForm(form, opts) {
    if (!form) return;
    var input = $('input[type=email]', form);
    var ok = opts && opts.ok;
    var err = opts && opts.err;
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-err';
      err.setAttribute('role', 'alert');
      form.appendChild(err);
    }
    function succeed() {
      form.classList.add('done');
      if (ok) ok.hidden = false;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input && input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        if (input) { input.classList.add('bad'); input.focus(); }
        err.textContent = 'enter a valid email';
        return;
      }
      if (input) input.classList.remove('bad');
      err.textContent = '';
      var who = form.querySelector('input[name=who]:checked');
      var run = form.querySelector('input[name=what-run]');
      var data = {
        email: v,
        who: who ? who.value : '',
        runs: run ? run.value.trim() : '',
        source: form.id || 'form',
        page: location.href,
        time: new Date().toISOString()
      };
      if (!SIGNUP_ENDPOINT) {
        if (IS_LOCAL) { console.warn('SIGNUP_ENDPOINT is empty: preview only, nothing was sent.', data); succeed(); }
        else err.textContent = 'Sign-up is unavailable right now. Please email founders@agenticguardians.com.';
        return;
      }
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      fetch(SIGNUP_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); succeed(); })
        .catch(function () {
          err.textContent = 'Something went wrong. Please try again or email founders@agenticguardians.com.';
          if (btn) btn.disabled = false;
        });
    });
    if (input) input.addEventListener('input', function () {
      input.classList.remove('bad');
      err.textContent = '';
    });
  }

  wireEmailForm($('#accessForm'), { ok: $('#formOk'), err: $('#formErr') });

  /* reveals */
  var rvs = $$('.rv');
  if (INSTANT || root.classList.contains('reduced') || !('IntersectionObserver' in window)) {
    rvs.forEach(function (e) { e.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    rvs.forEach(function (e) { rio.observe(e); });
  }
})();
