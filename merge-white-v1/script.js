/* Agentic GUARDIANS · merge-white-v1
   Behavior from merge-v1; visual tokens from Main.dc white. Prototype forms only. */
(function () {
  'use strict';

  var root = document.documentElement;
  var INSTANT = root.classList.contains('instant');
  var RM = root.classList.contains('reduced') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function navH() { return window.innerWidth <= 760 ? 56 : 64; }

  function wireEmailForm(form, opts) {
    if (!form) return;
    var input = $('input[type=email]', form);
    var ok = opts && opts.ok;
    var err = opts && opts.err;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input && input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        if (input) { input.classList.add('bad'); input.focus(); }
        if (err) err.textContent = 'enter a valid email';
        return;
      }
      if (input) input.classList.remove('bad');
      if (err) err.textContent = '';
      form.classList.add('done');
      if (ok) ok.hidden = false;
    });
    if (input) input.addEventListener('input', function () {
      input.classList.remove('bad');
      if (err) err.textContent = '';
    });
  }

  wireEmailForm($('#accessForm'), { ok: $('#formOk'), err: $('#formErr') });
  wireEmailForm($('#openForm'), { ok: $('#openFormOk') });

  /* ---------- reveals ---------- */
  var rvs = $$('.rv');
  if (INSTANT || !('IntersectionObserver' in window)) {
    rvs.forEach(function (e) { e.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          rio.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0.12 });
    rvs.forEach(function (e) { rio.observe(e); });
  }

  /* ---------- 1 · OPEN (first-screen-v1) + lede + after-hook ---------- */
  (function () {
    var stage = $('#openStage');
    var lede = $('#lede');
    var hook = $('#hook');
    var after = $('#afterHook');
    var btnReplay = $('#btnReplay');
    var openCue = $('#openCue');
    var pays = $$('.pay');
    var nav = $('#nav');
    var openSec = $('#open');
    var NAV_AFTER_HOOK = 400; /* reveal delay after hook; BEATS unchanged */
    if (!stage || !hook) return;

    function openPast() {
      if (!openSec) return false;
      return openSec.getBoundingClientRect().bottom < navH() + 8;
    }
    function setNavAway(away) {
      if (away) {
        if (nav && nav.contains(document.activeElement) && document.activeElement.blur) {
          document.activeElement.blur();
        }
        root.classList.add('nav-away');
        if (nav) {
          nav.setAttribute('aria-hidden', 'true');
          if ('inert' in nav) nav.inert = true;
        }
      } else {
        root.classList.remove('nav-away');
        if (nav) {
          nav.removeAttribute('aria-hidden');
          if ('inert' in nav) nav.inert = false;
        }
      }
    }
    function revealNav() { setNavAway(false); }
    function concealNavForOpening() {
      if (openPast()) { revealNav(); return; }
      setNavAway(true);
    }
    if (root.classList.contains('nav-away')) setNavAway(true);

    /* Locked open (Armin, 6 Nov 2026 · pass 4):
       alive → lede alone (~2.7s) → pays one-by-one (lede soft-exits) → off held →
       soft field → hook → light red compromised cards stagger → after → replay.
       soft→hook ~800ms / hook→after ~3600ms (room for bad cards) / off→soft ~2750ms; ordinary cards 300ms apart (trimmed ~1s further; question pause unchanged).
       Bad cards answer the question quietly — red = compromised only. */
    var BEATS = {
      alive: 400,
      lede: 700,
      ledeOut: 3400,
      pays: [3400, 3700, 4000, 4300, 4600, 4900, 5200, 5500],
      off: 6400,
      soft: 9150,
      hook: 9950,
      bad: [10450, 10950, 11500],
      after: 13550,
      replay: 14550
    };
    var OFF_I = 8;
    var BAD_START = 9;
    var timers = [];

    function clearTimers() {
      timers.forEach(function (t) { clearTimeout(t); });
      timers = [];
    }
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }

    function reset() {
      clearTimers();
      stage.classList.remove('is-alive', 'is-hook', 'is-land');
      if (lede) lede.classList.remove('is-in', 'is-out');
      hook.classList.remove('is-in');
      if (after) after.classList.remove('is-in');
      pays.forEach(function (p) { p.classList.remove('is-in', 'is-soft'); });
      if (btnReplay) btnReplay.hidden = true;
      if (openCue) openCue.classList.remove('on', 'loop');
    }

    function showPay(i, softOlder) {
      var p = pays[i];
      if (!p) return;
      p.classList.add('is-in');
      if (softOlder) {
        pays.forEach(function (q, j) {
          if (j < i && q.classList.contains('is-in')) q.classList.add('is-soft');
        });
      }
    }

    function armCue() {
      if (openCue && !INSTANT) {
        openCue.classList.add('on', 'loop');
        openCue.classList.remove('past');
      }
    }

    function showAfter() {
      stage.classList.add('is-land');
      if (after) after.classList.add('is-in');
      armCue();
    }

    function play() {
      var beat = root.dataset.beat;
      var shot = root.dataset.shot;
      if (RM || beat || shot === 'open-hook' || shot === 'open-after-hook') {
        revealNav();
        if (shot === 'open-after-hook' || beat === 'after' || (RM && !beat && shot !== 'open-hook')) {
          stage.classList.add('is-land');
          if (after) after.classList.add('is-in');
        }
        if (beat === 'hook' || beat === 'after' || shot === 'open-hook' || shot === 'open-after-hook' || (RM && !beat)) {
          stage.classList.add('is-hook');
          hook.classList.add('is-in');
          pays.forEach(function (p, i) {
            if (i <= OFF_I || i >= BAD_START) p.classList.add('is-in');
            if (i < OFF_I) p.classList.add('is-soft');
          });
        }
        if (btnReplay && !shot) btnReplay.hidden = false;
        armCue();
        return;
      }
      reset();
      concealNavForOpening();
      stage.classList.add('is-alive');

      later(BEATS.lede, function () {
        if (lede) {
          lede.classList.remove('is-out');
          lede.classList.add('is-in');
        }
      });

      later(BEATS.ledeOut, function () {
        if (lede) {
          lede.classList.remove('is-in');
          lede.classList.add('is-out');
        }
      });

      BEATS.pays.forEach(function (t, i) {
        later(t, function () { showPay(i, true); });
      });

      later(BEATS.off, function () {
        pays.forEach(function (p, i) {
          if (i < OFF_I) p.classList.add('is-soft');
        });
        showPay(OFF_I, false);
      });

      later(BEATS.soft, function () { stage.classList.add('is-hook'); });
      later(BEATS.hook, function () { hook.classList.add('is-in'); });
      later(BEATS.hook + NAV_AFTER_HOOK, revealNav);
      BEATS.bad.forEach(function (t, i) {
        later(t, function () { showPay(BAD_START + i, false); });
      });
      later(BEATS.after, showAfter);
      later(BEATS.replay, function () {
        if (btnReplay) btnReplay.hidden = false;
      });
    }

    if (btnReplay) btnReplay.addEventListener('click', play);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', play);
    } else {
      play();
    }
  })();

  /* ---------- 3 · proof sticky steps (r5 DNA) ---------- */
  (function () {
    var track = $('#track'), stage = $('#stage'), si = $('#stageIn');
    if (!track || !si) return;
    var N = 4;

    function placeWatcher(el) {
      var w = $('.watcher', el); if (!w) return;
      w.hidden = false;
      var on = $$('.term-body .ln', el).filter(function (l) {
        if (l.classList.contains('ln-cur')) return false;
        var st = getComputedStyle(l);
        return st.visibility !== 'hidden' && st.display !== 'none';
      });
      var l = on[on.length - 1]; if (!l) return;
      var lh = parseFloat(getComputedStyle(l).lineHeight) || 24;
      w.style.top = (l.offsetTop + lh / 2 - 4) + 'px';
    }

    function setStep(el, n) {
      var s = String(n + 1);
      if (el.getAttribute('data-step') !== s) el.setAttribute('data-step', s);
      $$('.caps .cap', el).forEach(function (c) {
        c.classList.toggle('on', +c.getAttribute('data-c') === n);
      });
      $$('.step-k .pips i', el).forEach(function (p, i) {
        p.classList.toggle('on', i < n);
      });
      placeWatcher(el);
    }

    if (INSTANT || root.dataset.shot === 'proof-blocked') {
      si.classList.add('live');
      setStep(si, 4);
      window.addEventListener('load', function () { placeWatcher(si); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeWatcher(si); });
      return;
    }

    setStep(si, 1);
    var fit = function () {
      var was = si.getAttribute('data-step');
      si.setAttribute('data-step', String(N + 1));
      placeWatcher(si);
      si.setAttribute('data-step', was);
    };
    fit();
    window.addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    var cur = 0, queued = false;
    var gate = $('#proof') && $('#proof .trust-ask');
    var tick = function () {
      queued = false;
      var nh = navH(), vh = window.innerHeight;
      var sh = stage.offsetHeight, stick = Math.min(nh, vh - sh);
      if (stage.style.top !== stick + 'px') stage.style.top = stick + 'px';
      var r = track.getBoundingClientRect(), total = track.offsetHeight - sh;
      var p = total > 0 ? (stick - r.top) / total : 0;
      var k = Math.max(1, Math.min(N, 1 + Math.floor(p * N)));
      var gone = !gate || gate.getBoundingClientRect().bottom < nh + 2;
      if (!gone && r.top < vh * 0.55) gone = true;
      si.classList.toggle('live', gone);
      if (!gone) k = 1;
      if (k !== cur) { cur = k; setStep(si, k); }
    };
    var req = function () { if (!queued) { queued = true; requestAnimationFrame(tick); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { fit(); req(); });
    tick();
  })();

  /* ---------- hide open replay once past hero; nav signup only after hero form leaves ---------- */
  (function () {
    var btn = $('#btnReplay');
    var open = $('#open');
    var nav = $('#nav');
    var heroForm = $('#openForm');
    if (!open) return;
    function sync() {
      var r = open.getBoundingClientRect();
      var past = r.bottom < navH() + 8;
      root.toggleAttribute('data-past-open', past);
      var signupInView = false;
      if (heroForm) {
        var fr = heroForm.getBoundingClientRect();
        signupInView = fr.width > 0 && fr.bottom > navH() + 4 && fr.top < window.innerHeight - 8;
      }
      root.toggleAttribute('data-nav-signup', !signupInView);
      if (past) {
        if (btn) btn.hidden = true;
        root.classList.remove('nav-away');
        if (nav) {
          nav.removeAttribute('aria-hidden');
          if ('inert' in nav) nav.inert = false;
        }
      }
    }
    addEventListener('scroll', sync, { passive: true });
    sync();
  })();

  /* ---------- scroll cues ---------- */
  (function () {
    var cues = $$('.cue');
    if (!cues.length) return;
    if (INSTANT || RM) {
      cues.forEach(function (c) { c.classList.add('on'); c.classList.remove('loop', 'past'); });
      return;
    }
    cues.forEach(function (cue) {
      var isOpen = !!cue.closest('#open');
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          var bot = en.boundingClientRect.bottom, nh = navH();
          if (bot < nh + 4) {
            cue.classList.remove('loop');
            cue.classList.add('past');
            return;
          }
          if (en.isIntersecting || (en.boundingClientRect.top < innerHeight && bot > nh)) {
            if (isOpen) {
              var after = $('#afterHook');
              if (after && !after.classList.contains('is-in') && !RM && !root.dataset.beat) return;
            }
            cue.classList.add('on', 'loop');
            cue.classList.remove('past');
          } else if (en.boundingClientRect.top >= innerHeight) {
            cue.classList.remove('loop');
          }
        });
      }, { threshold: [0, 0.01, 1], rootMargin: '0px 0px -2% 0px' });
      io.observe(cue);
    });
  })();

})();
