/* Agentic Guardians · merge-v1
   Open (first-screen) + after-hook trust/signup + sticky proof (r5) + reveals + forms. */
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

  /* ---------- 3 · proof plays once when the demo enters ---------- */
  (function () {
    var si = $('#stageIn');
    if (!si) return;

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

    if (INSTANT || RM || root.dataset.shot === 'proof-blocked') {
      si.classList.add('live');
      setStep(si, 4);
      window.addEventListener('load', function () { placeWatcher(si); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeWatcher(si); });
      return;
    }

    function mqMob() { return window.matchMedia('(max-width:760px)').matches; }
    if (mqMob()) {
      var track = $('#track'), stage = $('#stage');
      var bridge = document.querySelector('.bay-p');
      var N = 4, cur = 0, queued = false;
      var tick = function () {
        queued = false;
        if (!mqMob() || !track || !stage) return;
        var nh = navH();
        var sh = stage.offsetHeight;
        var r = track.getBoundingClientRect(), total = track.offsetHeight - sh;
        var p = total > 0 ? (nh - r.top) / total : 0;
        var k = Math.max(1, Math.min(N, 1 + Math.floor(p * N)));
        var gone = !bridge || bridge.getBoundingClientRect().bottom < nh + 2;
        si.classList.toggle('live', gone);
        if (!gone) k = 1;
        if (k !== cur) { cur = k; setStep(si, k); }
      };
      var req = function () { if (!queued) { queued = true; requestAnimationFrame(tick); } };
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', function () { placeWatcher(si); req(); });
      tick();
      return;
    }

    var i = 0, paused = true, done = false, timer = null;
    var delays = [800, 800, 800, 900];
    function go() {
      if (done) return;
      paused = false;
      setStep(si, i);
      si.classList.add('live');
      if (i >= 4) {
        done = true;
        timer = null;
        io.disconnect();
        return;
      }
      i += 1;
      timer = setTimeout(function () {
        timer = null;
        if (!paused && !done) go();
      }, delays[i - 1]);
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          paused = false;
          if (!done && !timer) go();
        } else if (!done && i > 0) {
          paused = true;
          if (timer) { clearTimeout(timer); timer = null; }
        }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
    io.observe(si);
    window.addEventListener('resize', function () { placeWatcher(si); });
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

  /* ---------- world flip: short dawn, reversible, same flag as the nav ---------- */
  (function () {
    var meta = document.querySelector('meta[name="theme-color"]');
    var why = $('#why');
    var ask = document.querySelector('#proof .trust-ask');
    var frozen = /[?&]world=(light|dark)/.test(location.search);
    function world(light) {
      var w = light ? 'light' : 'dark';
      if (root.getAttribute('data-world') !== w) {
        root.setAttribute('data-world', w);
        if (meta) meta.setAttribute('content', light ? '#f9f8f4' : '#050505');
      }
      root.toggleAttribute('data-nav-light', !!light);
    }
    function tickWorld() {
      if (!why) return;
      var vh = window.innerHeight;
      var whyBottom = why.getBoundingClientRect().bottom;
      var askTop = ask ? ask.getBoundingClientRect().top : Infinity;
      var light = root.getAttribute('data-world') === 'light';
      if (!light && (whyBottom < vh * 0.55 || askTop < vh * 0.8)) world(true);
      else if (light && whyBottom > vh * 0.7) world(false);
    }
    if (/[?&]world=light/.test(location.search)) world(true);
    else if (/[?&]world=dark/.test(location.search)) world(false);
    else tickWorld();
    if (!frozen) {
      var queued = false;
      var req = function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; tickWorld(); });
      };
      addEventListener('scroll', req, { passive: true });
      addEventListener('resize', req);
    }
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

/* Letter reveal for section headings. No-ops when motion is reduced or JS never runs. */
(function () {
  var root = document.documentElement;
  if (root.classList.contains('reduced')) return;
  var heads = document.querySelectorAll('.lt-h');
  if (!heads.length || !('IntersectionObserver' in window)) return;
  function split(el) {
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || el.getAttribute('data-split')) return;
    el.setAttribute('data-split', '1');
    el.setAttribute('aria-label', text);
    var words = text.split(' ');
    var letters = [];
    el.textContent = '';
    words.forEach(function (word, idx) {
      if (idx) el.appendChild(document.createTextNode(' '));
      var w = document.createElement('span');
      w.className = 'wrd';
      w.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < word.length; i++) {
        var s = document.createElement('span');
        s.className = 'lt';
        s.textContent = word.charAt(i);
        w.appendChild(s);
        letters.push(s);
      }
      el.appendChild(w);
    });
    var step = Math.min(18, Math.max(8, Math.round(520 / Math.max(letters.length - 1, 1))));
    letters.forEach(function (s, i) { s.style.transitionDelay = (i * step) + 'ms'; });
  }
  heads.forEach(split);
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (!en.isIntersecting) return;
      var bits = en.target.querySelectorAll('.lt');
      for (var i = 0; i < bits.length; i++) bits[i].classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
  heads.forEach(function (el) { io.observe(el); });
})();
