(function(){
  'use strict';
  var root=document.documentElement;
  var INSTANT=root.classList.contains('instant');   // ?static=1 or prefers-reduced-motion
  var FIXED=root.classList.contains('fixed');       // ?t=<ms>
  var Q=new URLSearchParams(location.search);
  var FLIP=root.getAttribute('data-flip');          // 'blocked' (default) | 'why'
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function navH(){return window.innerWidth<=760?56:64}

  /* ---------- 1a · the envelope: the terminal types, then holds still ---------- */
  var hero=$('#heroTerm'), hLead=$('#heroLead'), hQ=$('#heroQ');
  var done=function(){if(!root.hasAttribute('data-hero-done'))root.setAttribute('data-hero-done','1')};
  var showQ=function(){[hLead,hQ].forEach(function(e){if(e)e.classList.add('show')})};
  if(hero){
    var lines=$$('.ln',hero);
    if(INSTANT||FIXED){lines.forEach(function(l){l.classList.add('on')});showQ();done()}
    else{
      // every element holds its final place from the start; things only fade/type in, one at a time
      var skip=false;
      // type a line's visible text quickly, then restore its markup (spans, line breaks)
      var typeLine=async function(el,msPer){
        var html=el.innerHTML, text=el.textContent;
        el.textContent='';el.classList.add('on');
        var cur=document.createElement('span');cur.className='cursor';cur.setAttribute('aria-hidden','true');
        var t=document.createTextNode('');el.appendChild(t);el.appendChild(cur);
        for(var i=1;i<=text.length&&!skip;i++){t.nodeValue=text.slice(0,i);await wait(msPer+Math.random()*msPer*.6)}
        el.innerHTML=html;
      };
      (async function(){
        // the prompt types at a human pace; the agent's output streams in fast, line by line
        var first=lines[0], tx=$('.tx',first), cmd=tx.textContent;
        tx.textContent='';first.classList.add('on');
        var cur=document.createElement('span');cur.className='cursor';cur.setAttribute('aria-hidden','true');first.appendChild(cur);
        await wait(700);
        for(var i=1;i<=cmd.length&&!skip;i++){tx.textContent=cmd.slice(0,i);await wait(20+Math.random()*14)}
        first.removeChild(cur);tx.textContent=cmd;
        await wait(450);
        for(var n=1;n<=6&&!skip;n++){await typeLine(lines[n],4);await wait(n===3?650:420)}   // the note in inv_0419 gets a beat
        await wait(300);
        if(hLead)hLead.classList.add('show');           // line 1, above the terminal
        await wait(1500);
        if(!skip)await typeLine(lines[7],14);           // ● Done. Reconciled 12 invoices.
        lines.forEach(function(l){l.classList.add('on')});
        await wait(1700);                               // a few beats
        if(hQ)hQ.classList.add('show');                 // the question, below the terminal
        await wait(1600);                               // stillness
        done();
      })();
      window.addEventListener('scroll',function s(){if(window.scrollY>40){skip=true;lines.forEach(function(l){l.classList.add('on')});showQ();done();window.removeEventListener('scroll',s)}},{passive:true});
    }
  }

  /* ---------- 1b · the reality: one line per beat once the section is in view ----------
     Timed beats; any line already scrolled near the top of the screen shows at once
     (with everything before it), so a fast scroll never lands on an empty screen. */
  var real=$('#reality');
  if(real){
    var ris=$$('.ri',real), BEATS=[0,1350,2750,4150,5850,7550,9450,10950];   // label, 4 phrases, the hinge, a longer pause, the punchline, the coda
    var showTo=function(n){for(var i=0;i<=n&&i<ris.length;i++)ris[i].classList.add('on')};
    if(INSTANT||FIXED)showTo(ris.length);
    else{
      var started=false, rq=false, rtick=function(){
        rq=false;var vh=window.innerHeight, r=real.getBoundingClientRect();
        if(!started&&r.top<vh*.6){started=true;ris.forEach(function(el,i){setTimeout(function(){showTo(i)},BEATS[i]||0)})}
        for(var i=ris.length-1;i>=0;i--){if(ris[i].getBoundingClientRect().top<vh*.25){showTo(i);break}}
        if(ris[ris.length-1].classList.contains('on'))window.removeEventListener('scroll',rreq);
      }, rreq=function(){if(!rq){rq=true;requestAnimationFrame(rtick)}};
      window.addEventListener('scroll',rreq,{passive:true});rtick();
    }
  }


  /* setup line: if it ever outgrows the screen on one line at desktop, break it after the first "?" */
  (function(){
    var l=$('#askEnd'), s=$('#ask');if(!l||!s)return;
    var fit=function(){l.classList.remove('ask-2l');var cs=getComputedStyle(s), box=s.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
      if(l.getBoundingClientRect().width>box+.5)l.classList.add('ask-2l')};
    fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  })();
  /* safety net for the one-line reality lines: if font metrics ever make one wider than its box, shrink it to fit */
  (function(){
    var real2=$('#reality'), nv=$('.r-never',real2||document), dm=$('.r-dim',real2||document), lt=$('.r-late',real2||document);
    if(!real2||!nv||!dm)return;
    var inner=function(){var cs=getComputedStyle(real2);return real2.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)};
    var fit=function(el,min){el.style.fontSize='';var cs=getComputedStyle(el), box=inner();
      if(el.scrollWidth>box){var fs=Math.max(min,parseFloat(cs.fontSize)*box/el.scrollWidth*.98);el.style.fontSize=fs+'px';return fs}return 0};
    var fitAll=function(){
      if(getComputedStyle(nv).whiteSpace==='nowrap')fit(nv,24);else nv.style.fontSize='';
      // line 1 is either one line (desktop) or two lines whose longest piece is "It gets weaponized. Then it acts."
      var fs=0;
      if(getComputedStyle(dm).whiteSpace==='nowrap')fs=fit(dm,18);
      else{dm.style.fontSize='';var piece=$('.r-dim > .nw:last-child',real2), box=inner();
        if(piece&&piece.offsetWidth>box){fs=Math.max(18,parseFloat(getComputedStyle(dm).fontSize)*box/piece.offsetWidth*.98);dm.style.fontSize=fs+'px'}}
    };
    fitAll();window.addEventListener('resize',fitAll);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAll);
  })();

  /* ---------- reveals (single elements .rv, staggered groups .grp) ---------- */
  var rvs=$$('.rv').concat($$('.grp'));
  if(INSTANT||FIXED||!('IntersectionObserver' in window)){rvs.forEach(function(e){e.classList.add('in')})}
  else{
    var io=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -14% 0px',threshold:.12});
    rvs.forEach(function(e){io.observe(e)});
  }

  /* ---------- 3 · the proof ----------
     Steps 1-5 live on a pinned stage over developer-v7's callback components, each step
     owning a fifth of the pinned scroll. The stage only appears once the reality screen has
     fully left (under the nav). Step 5 (BLOCKED) flips the page to the light world.
     Step 6 ("And it leaves proof." + v7's compact Detection Certificate) follows in flow.
     ?static=1 / reduced motion: stacked steps with captions, each band in its own world.
     ?t=<ms>: frozen frame, step = 1 + floor(t / 2200); t >= 11000 shows step 6. */
  var track=$('#track'), stage=$('#stage'), si=$('#stageIn'), cert=$('#cert'), proofEnd=$('#proofEnd'), proof=$('#proof'), realityEnd=$('#askEnd')||$('#realityEnd'), why=$('#why');
  var STEP_MS=2200, N=4;   // 4 captioned steps (the first two captions merged)
  function placeWatcher(el){
    var w=$('.watcher',el); if(!w)return;
    var on=$$('.term-body .ln',el).filter(function(l){return l.offsetParent!==null&&!l.classList.contains('ln-cur')});
    var l=on[on.length-1]; if(!l)return;
    var lh=parseFloat(getComputedStyle(l).lineHeight)||24;
    w.style.top=(l.offsetTop+lh/2-4)+'px';
  }
  function setStep(el,n){
    var s=String(n+1);   // visual state: steps 1-4 reuse the phase styles written for 2-5
    if(el.getAttribute('data-step')!==s)el.setAttribute('data-step',s);
    $$('.caps .cap',el).forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===n)});
    $$('.step-k .pips i',el).forEach(function(p,i){p.classList.toggle('on',i<n)});
    var st=$('.term-state',el); if(st){st.classList.toggle('guarded',n<5);st.classList.toggle('dev',n>=5)}
    var stt=$('.st-t',el);if(stt)stt.textContent=n<5?'guarded':'deviation';
    placeWatcher(el);
  }
  var meta=$('meta[name="theme-color"]');
  function world(light){
    var w=light?'light':'dark';
    if(root.getAttribute('data-world')!==w){root.setAttribute('data-world',w);if(meta)meta.setAttribute('content',light?'#F5F5F3':'#0a0a0a')}
  }
  function band(el,light){el.classList.toggle('lw',light);el.classList.toggle('dw',!light)}

  if(track&&si){
    if(INSTANT){
      var box=document.createElement('div'), clones=[];box.className='static-steps';
      for(var n=1;n<=N;n++){
        if(n===N&&FLIP==='blocked'){var dz=document.createElement('div');dz.className='sdawn';dz.setAttribute('aria-hidden','true');box.appendChild(dz)}
        var b=document.createElement('div');b.className='sband';
        band(b,n===N&&FLIP==='blocked');
        var c=si.cloneNode(true);c.removeAttribute('id');c.classList.add('live');
        b.appendChild(c);box.appendChild(b);clones.push([c,n]);
      }
      track.parentNode.replaceChild(box,track);
      var redo=function(){clones.forEach(function(x){setStep(x[0],x[1])})};
      redo();window.addEventListener('load',redo);window.addEventListener('resize',redo);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(redo);
      band(proofEnd,FLIP==='blocked');
      if(cert)cert.classList.add('in');
    }else if(FIXED){
      var t=+Q.get('t')||0, k=Math.max(1,Math.min(N+1,1+Math.floor(t/STEP_MS)));
      si.classList.add('live');
      var fx=function(){setStep(si,Math.min(k,N))};fx();
      window.addEventListener('load',fx);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fx);
      if(cert)cert.classList.toggle('in',k>N);
      band(proof,k>=N&&FLIP==='blocked');
      root.setAttribute('data-step',String(k));
    }else{
      setStep(si,1);
      var fit=function(){
        var nh=navH();
        proofEnd.style.marginTop='0px';
        // measure with the tallest (final) step laid out, then restore
        var was=si.getAttribute('data-step');si.setAttribute('data-step',String(N+1));
        var sr=stage.getBoundingClientRect(), ir=si.getBoundingClientRect();
        si.setAttribute('data-step',was);
        // step 6 sits ~56px under the stage content as the stage unpins (no dead scroll)
        proofEnd.style.marginTop=Math.round((nh<64?40:56)-(sr.bottom-ir.bottom))+'px';
        placeWatcher(si);
      };
      fit();
      window.addEventListener('load',fit);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
      var cur=0, queued=false;
      var tick=function(){
        queued=false;
        var nh=navH(), vh=window.innerHeight;
        // very short phones: if the stage is taller than the space under the nav, let it ride up so its bottom stays visible
        var sh=stage.offsetHeight, stick=Math.min(nh,vh-sh);
        if(stage.style.top!==stick+'px')stage.style.top=stick+'px';
        var r=track.getBoundingClientRect(), total=track.offsetHeight-sh;
        var p=total>0?(stick-r.top)/total:0;
        var k=Math.max(1,Math.min(N,1+Math.floor(p*N)));
        // the stage appears only once the setup line (after the reality screen) is fully gone (above the nav)
        var gone=!realityEnd||realityEnd.getBoundingClientRect().bottom<nh+2;
        si.classList.toggle('live',gone);
        if(!gone)k=1;
        if(k!==cur){cur=k;setStep(si,k);req()}
        var er=proofEnd.getBoundingClientRect();
        root.setAttribute('data-step',String(er.top<vh*.5?N+1:k));
        var light=FLIP==='why'?(why.getBoundingClientRect().top<vh*.6):(gone&&k>=N);
        world(light);
      };
      var req=function(){if(!queued){queued=true;requestAnimationFrame(tick)}};
      window.addEventListener('scroll',req,{passive:true});
      window.addEventListener('resize',function(){fit();req()});
      tick();
      if(cert){
        if('IntersectionObserver' in window){
          var io3=new IntersectionObserver(function(en){if(en[0].isIntersecting){cert.classList.add('in');io3.disconnect()}},{threshold:.18});
          io3.observe(cert);
        }else cert.classList.add('in');
      }
    }
  }

  /* ---------- request access (client-side only) ---------- */
  var f=$('#accessForm');
  if(f){
    var em=$('#email',f), err=$('#formErr',f), ok=$('#formOk',f);
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var v=(em.value||'').trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){em.classList.add('bad');err.textContent='enter a valid email';em.focus();return}
      em.classList.remove('bad');err.textContent='';f.classList.add('done');ok.hidden=false;
    });
    em.addEventListener('input',function(){em.classList.remove('bad');err.textContent=''});
  }
})();

/* paradigm table: rows reveal one at a time (grey value, then ours). Off for ?static=1, ?t= and reduced motion. */
(function(){
  var root=document.documentElement, t=document.querySelector('.ptab');
  if(!t) return;
  var still=root.classList.contains('instant')||root.classList.contains('fixed')||
    (window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||!('IntersectionObserver' in window);
  if(still) return;
  root.classList.add('ptab-anim');
  var rows=[].slice.call(t.querySelectorAll('tbody tr'));
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      rows.forEach(function(tr,i){ setTimeout(function(){ tr.classList.add('in'); }, i*260); });
    });
  },{threshold:.35});
  io.observe(t);
})();
