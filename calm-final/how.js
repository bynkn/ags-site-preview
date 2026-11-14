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

/* Animated flow (how-it-works.html). Three runs: allow, hold, block. */
(function () {
  'use strict';
  var stage = document.getElementById('afStage');
  if (!stage) return;
  var root = document.documentElement;
  var REDUCED = root.classList.contains('reduced');
  var svg = document.getElementById('afLines');
  var tok = document.getElementById('afTok');
  var tokT = document.getElementById('afTokT');
  var cap = document.getElementById('af-cap');
  var chain = document.getElementById('afChain');
  var learn = document.getElementById('afLearn');
  var foot = document.getElementById('afFoot');
  var btnP = document.getElementById('afPause');
  var btnR = document.getElementById('afReplay');
  function q(s) { return stage.querySelector(s); }
  var N = {
    plat: q('.af-plat'), conn: q('.af-conn'), eng: q('.af-eng'), world: q('.af-world'),
    person: q('.af-person'), rec: q('.af-rec'),
    allow: q('.d-allow'), hold: q('.d-hold'), block: q('.d-block')
  };
  var NS = 'http://www.w3.org/2000/svg';
  var paths = {};

  function box(el) {
    var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height,
      cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 };
  }
  function mobile() { return window.matchMedia('(max-width:760px)').matches; }
  function retCurve() {
    var d = box(N.block), p = box(N.plat), W = stage.clientWidth;
    if (mobile()) {
      var x = W - 6, h = box(N.hold);
      return [[d.x + d.w, d.cy], [x, d.cy], [x, p.cy], [p.x + p.w, p.cy]];
    }
    var top = 10, a = box(N.allow); /* leave from the top of the decision stack so the dashed path crosses no card */
    return [[a.cx, a.y], [a.cx, top], [p.cx, top], [p.cx, p.y]];
  }
  /* Hold -> person: on desktop, go out to the right of the decision stack so the line never crosses Block. */
  function holdPath() {
    var h = box(N.hold), pr = box(N.person), d = box(N.block);
    if (mobile()) return [[h.cx, h.cy], [pr.cx, pr.cy]];
    var x = Math.max(d.x + d.w, h.x + h.w, pr.x + pr.w) + 18;
    return [[h.x + h.w, h.cy], [x, h.cy], [x, pr.cy], [pr.x + pr.w, pr.cy]];
  }
  function bez(c, t) {
    var u = 1 - t;
    return [u*u*u*c[0][0] + 3*u*u*t*c[1][0] + 3*u*t*t*c[2][0] + t*t*t*c[3][0],
            u*u*u*c[0][1] + 3*u*u*t*c[1][1] + 3*u*t*t*c[2][1] + t*t*t*c[3][1]];
  }
  function line(id, a, b, cls) {
    var p = paths[id];
    if (!p) { p = document.createElementNS(NS, 'path'); svg.appendChild(p); paths[id] = p; }
    p.setAttribute('d', 'M' + a.cx + ' ' + a.cy + ' L' + b.cx + ' ' + b.cy);
    p.setAttribute('class', cls || '');
  }
  function draw() {
    svg.setAttribute('viewBox', '0 0 ' + stage.clientWidth + ' ' + stage.clientHeight);
    var P = box(N.plat), C = box(N.conn), E = box(N.eng), W = box(N.world), H = box(N.person), R = box(N.rec);
    line('pc', P, C); line('ce', C, E);
    line('ea', E, box(N.allow)); line('eh', E, box(N.hold)); line('eb', E, box(N.block));
    var hpts = holdPath();
    var hp = paths.hp || (paths.hp = svg.appendChild(document.createElementNS(NS, 'path')));
    hp.setAttribute('d', 'M' + hpts.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L'));
    line('er', E, R); line('pw', P, W);
    line('fb', H, E, 'fb');
    var c = retCurve();
    var rp = paths.ret || (paths.ret = svg.appendChild(document.createElementNS(NS, 'path')));
    rp.setAttribute('d', 'M' + c[0] + ' C' + c[1] + ' ' + c[2] + ' ' + c[3]);
    rp.setAttribute('class', 'ret');
    learn.style.left = (H.cx + E.cx) / 2 + 'px';
    learn.style.top = (H.cy + E.cy) / 2 + 'px';
  }
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(stage);
  else window.addEventListener('resize', draw);

  if (REDUCED) {
    stage.classList.add('af-static');
    ['allow', 'hold', 'block'].forEach(function (k) { N[k].classList.add('on'); });
    cap.textContent = 'Allow: it runs. Hold: a person decides. Block: it never runs, and the agent gets the reason.';
    return;
  }

  /* timing engine with pause */
  var userPaused = false, inView = false, gen = 0, cur = null;
  function halted() { return userPaused || !inView || document.hidden; }
  function sync() { if (cur) { try { halted() ? cur.pause() : cur.play(); } catch (e) {} } }
  function Abort() {}
  function check(g) { if (g !== gen) throw new Abort(); }
  function wait(ms, g) {
    return new Promise(function (res, rej) {
      var left = ms, last = performance.now();
      function tick(now) {
        if (g !== gen) return rej(new Abort());
        if (!halted()) left -= now - last;
        last = now;
        if (left <= 0) res(); else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  function place(pt) { tok.style.transform = 'translate(' + pt[0] + 'px,' + pt[1] + 'px) translate(-50%,-50%)'; }
  function move(pts, ms, g) {
    check(g);
    var frames = pts.map(function (p) { return { transform: 'translate(' + p[0] + 'px,' + p[1] + 'px) translate(-50%,-50%)' }; });
    cur = tok.animate(frames, { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
    sync();
    var a = cur;
    return a.finished.then(function () { place(pts[pts.length - 1]); if (a === cur) cur = null; check(g); },
      function () { throw new Abort(); });
  }
  function c(el) { var b = box(el); return [b.cx, b.cy]; }
  function say(t) { cap.textContent = t; }
  function lit(el, on) { el.classList.toggle('lit', !!on); }
  function addRec() {
    var olds = chain.querySelectorAll('i');
    olds.forEach(function (i) { i.classList.remove('now', 'new'); });
    if (olds.length >= 5) chain.removeChild(olds[0]);
    var i = document.createElement('i'); i.className = 'now new'; chain.appendChild(i);
  }
  function reset() {
    ['plat', 'conn', 'eng', 'person', 'rec', 'world'].forEach(function (k) { N[k].classList.remove('lit', 'on', 'tap', 'ok', 'no'); });
    ['allow', 'hold', 'block'].forEach(function (k) { N[k].classList.remove('on'); });
    Object.keys(paths).forEach(function (k) { paths[k].classList.remove('lit'); });
    learn.classList.remove('on'); foot.classList.remove('on');
    tok.style.opacity = 0; tok.className = 'af-tok';
    N.eng.classList.remove('is-scan');
  }
  var RUNS = [
    { tool: 'read_file', d: 'allow', say: 'Allow. It fits this agent’s baseline, so it runs.' },
    { tool: 'web_fetch', d: 'hold', say: 'Hold. It’s new for this agent, so a person decides.' },
    { tool: 'shell', d: 'block', say: 'Block. It doesn’t fit, so it never runs.' }
  ];
  async function run(r, i, g) {
    reset();
    tokT.textContent = r.tool;
    place(c(N.plat)); tok.style.opacity = 1;
    lit(N.plat, 1); say('Run ' + (i + 1) + ' of 3. The agent picks an action: ' + r.tool + '.');
    await wait(900, g);
    paths.pc.classList.add('lit');
    await move([c(N.plat), c(N.conn)], 700, g);
    lit(N.plat, 0); lit(N.conn, 1); say('The connector pauses it, before it runs.');
    await wait(700, g);
    paths.ce.classList.add('lit');
    await move([c(N.conn), c(N.eng)], 700, g);
    lit(N.conn, 0); lit(N.eng, 1); N.eng.classList.add('is-scan');
    say('We score it against this agent’s own baseline. No AI.');
    await wait(1100, g);
    N.eng.classList.remove('is-scan');
    var D = N[r.d];
    paths[{ allow: 'ea', hold: 'eh', block: 'eb' }[r.d]].classList.add('lit');
    await move([c(N.eng), c(D)], 600, g);
    lit(N.eng, 0); D.classList.add('on');
    tok.classList.add({ allow: 'ok', hold: 'hold', block: 'blk' }[r.d]);
    say(r.say);
    await wait(1100, g);
    if (r.d === 'hold') {
      paths.hp.classList.add('lit');
      var hpts = holdPath();
      await move([c(D)].concat(hpts.slice(1, -1), [hpts[hpts.length - 1]], [c(N.person)]), 900, g);
      N.person.classList.add('on'); say('A person reviews it.');
      await wait(1000, g);
      N.person.classList.add('tap'); say('They approve it once.');
      paths.er.classList.add('lit'); N.rec.classList.add('lit'); addRec();
      await wait(1000, g);
      var back = holdPath().slice().reverse();
      await move([c(N.person)].concat(back.slice(0, -1), [c(D)]), 700, g);
    }
    if (r.d === 'block') {
      paths.er.classList.add('lit'); N.rec.classList.add('lit'); addRec();
      say('Block. The record is signed and chained.');
      await wait(900, g);
    }
    var cv = retCurve(), pts = [];
    for (var t = 0; t <= 1.0001; t += 0.1) pts.push(bez(cv, t));
    pts.push(c(N.plat));
    paths.ret.classList.add('lit');
    if (r.d === 'block') tokT.textContent = 'Blocked by Agentic GUARDIANS';
    await move(pts, 1300, g);
    lit(N.plat, 1);
    if (r.d === 'block') {
      N.world.classList.add('no');
      say('The agent gets the reason back. Nothing reaches the world.');
      await wait(2000, g);
      return;
    }
    say('The answer goes back to the agent. Now the tool runs.');
    await wait(500, g);
    paths.pw.classList.add('lit');
    await move([c(N.plat), c(N.world)], 700, g);
    N.world.classList.add('ok');
    say(r.d === 'hold' ? 'Approved once, so it reaches the world.' : 'It reaches the world.');
    await wait(1200, g);
  }
  async function loop() {
    var g = ++gen;
    try {
      while (true) {
        for (var i = 0; i < RUNS.length; i++) await run(RUNS[i], i, g);
        reset();
        paths.fb.classList.add('lit'); learn.classList.add('on'); N.person.classList.add('on'); N.eng.classList.add('lit');
        say('A person can mark any block right or wrong. That agent’s baseline learns.');
        await wait(2400, g);
        reset(); foot.classList.add('on');
        say('If we can’t check an action, it doesn’t run.');
        await wait(2400, g);
      }
    } catch (e) { if (!(e instanceof Abort)) throw e; }
  }
  function stopCur() { if (cur) { try { cur.cancel(); } catch (e) {} cur = null; } }
  btnP.addEventListener('click', function () {
    userPaused = !userPaused;
    btnP.textContent = userPaused ? 'Play' : 'Pause';
    btnP.setAttribute('aria-pressed', String(userPaused));
    sync();
  });
  btnR.addEventListener('click', function () {
    gen++; stopCur(); reset();
    userPaused = false; btnP.textContent = 'Pause'; btnP.setAttribute('aria-pressed', 'false');
    loop();
  });
  document.addEventListener('visibilitychange', sync);
  var started = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (ents) {
      inView = ents[0].isIntersecting;
      if (inView && !started) { started = true; loop(); }
      sync();
    }, { threshold: 0.25 }).observe(stage);
  } else { inView = true; started = true; loop(); }
})();

/* sub-nav: keep the current page tab in view on narrow screens */
(function () {
  var c = document.querySelector('.h-subnav-in'), a = c && c.querySelector('[aria-current="page"]');
  if (c && a && c.scrollWidth > c.clientWidth) c.scrollLeft = a.offsetLeft - (c.clientWidth - a.offsetWidth) / 2;
})();
