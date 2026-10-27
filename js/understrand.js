/* Understrand site bundle
   - X-ray toggle (two-state page invert, remembered per visitor)
   - X-ray glitch button animation
   - Progressive blur behind the nav
   - Spinning chrome logo video anywhere with [data-us-logo-video]
   - Flick cards slider (needs GSAP + Draggable on the page)
   - Play / pause videos on scroll ([data-video="playpause"])
   Served from github.com/Jame55-Design/Understrand via jsDelivr, pinned by commit. */
(function () {
  'use strict';

  var ACCENT = '#1986DE';
  var LOGO_BASE = 'https://cdn.jsdelivr.net/gh/Jame55-Design/Understrand@345045853cd96b34279bb624efbf0bfa7b1723ff/logo/';
  /* Safari and every iPhone/iPad browser (all WebKit) can't show a transparent WebM, so they get the
     transparent animated WebP instead; everything else gets the lighter WebM video. */
  var UA = navigator.userAgent;
  var IS_IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var IS_SAFARI = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(UA);
  var LOGO_AS_IMAGE = IS_IOS || IS_SAFARI;
  var LOGO_SRC = LOGO_BASE + 'understrand-chrome-logo.webm';
  var LOGO_WEBP = 'https://cdn.jsdelivr.net/gh/Jame55-Design/Understrand@57dcd0dc303f308380711c7c80718b4f2bd98f1c/logo/understrand-chrome-logo-smooth.webp';

  /* One spinning logo element: an animated WebP <img> on Safari/iPhone, a looping <video> elsewhere.
     onReady fires once it has something to show. */
  function makeLogo(cls, width, onReady) {
    var el;
    if (LOGO_AS_IMAGE) {
      el = document.createElement('img');
      el.alt = ''; el.decoding = 'async';
      el.addEventListener('load', function () { onReady && onReady(el); }, { once: true });
      el.src = LOGO_WEBP;
    } else {
      el = document.createElement('video');
      el.muted = true; el.loop = true; el.autoplay = !REDUCED; el.playsInline = true;
      el.setAttribute('muted', ''); el.setAttribute('playsinline', '');
      el.preload = 'auto';
      el.addEventListener('loadeddata', function () {
        onReady && onReady(el);
        if (!REDUCED) { var pl = el.play(); if (pl && pl.catch) pl.catch(function () {}); }
      }, { once: true });
      el.src = LOGO_SRC; el.load();
    }
    if (cls) el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    el.style.display = 'block'; el.style.width = width || '100%'; el.style.height = 'auto';
    return el;
  }
  var VIDEO_BASE = 'https://cdn.jsdelivr.net/gh/Jame55-Design/Understrand@3b86d14557d73e2a93de46681e0f60b8fe80644d/videos/understrand-';
  var XRAY_KEY = 'us-xray';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);
  var AUTOPLAY = !REDUCED && !SAVE_DATA;
  var XRAY_SCOPE = '.us-hero,.us-section,.us-reviews,.us-footer,.us-logo-fly'  /* films section (.us-videos) deliberately left out */;

  /* ---------- Styles Webflow's designer can't hold (keyframes, states, masks) ---------- */
  var css = [
    /* X-ray glitch button */
    '.xr{--accent:' + ACCENT + ';position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:.75em;box-sizing:border-box;font-family:"Space Grotesk",Arial,sans-serif;font-weight:500;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}',
    '.xr svg{width:1.1em;height:1.1em;flex:none}',
    '.xr .lbl{position:relative;z-index:1;display:inline-flex;align-items:center;gap:inherit}',
    '.xr .g{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;gap:inherit;opacity:0;pointer-events:none}',
    '.xr .g1{color:var(--accent)}',
    '.xr .g2{color:#000}',
    '.xr.light .g2{color:#fff}',
    '.xr .inv{position:absolute;inset:0;z-index:3;background:#fff;mix-blend-mode:difference;pointer-events:none;transform:scaleY(0);transform-origin:bottom;transition:transform .34s cubic-bezier(.75,0,.2,1)}',
    '.xr .scan{position:absolute;left:0;right:0;top:0;height:2px;z-index:5;background:var(--accent);opacity:0;pointer-events:none}',
    '.xr:focus-visible .inv,.xr[aria-pressed="true"] .inv{transform:scaleY(1);transform-origin:top}',
    '.xr:focus-visible .scan{animation:xr-scan .34s cubic-bezier(.75,0,.2,1) forwards}',
    '.xr:focus-visible{outline:2px solid var(--accent);outline-offset:4px}',
    '.xr:focus-visible .g1{animation:xr-g1 2.8s steps(1,end) .12s infinite}',
    '.xr:focus-visible .g2{animation:xr-g2 2.8s steps(1,end) .12s infinite}',
    '.xr:focus-visible .lbl{animation:xr-jit 2.8s steps(1,end) .12s infinite}',
    /* Hover effects only where there is a real pointer, so taps on phones don't leave buttons stuck mid-effect */
    '@media (hover:hover) and (pointer:fine){.xr:hover .inv{transform:scaleY(1);transform-origin:top}.xr:hover .scan{animation:xr-scan .34s cubic-bezier(.75,0,.2,1) forwards}.xr:hover .g1{animation:xr-g1 2.8s steps(1,end) .12s infinite}.xr:hover .g2{animation:xr-g2 2.8s steps(1,end) .12s infinite}.xr:hover .lbl{animation:xr-jit 2.8s steps(1,end) .12s infinite}}',
    /* Tap feedback on touch screens */
    '@media (hover:none){.xr:active .inv{transform:scaleY(1);transition-duration:.12s}}',
    '.xr,[data-us-xray-toggle]{touch-action:manipulation}',
    /* Hero fills the visible screen on phones without jumping as the address bar hides */
    '.us-hero{min-height:100vh;min-height:100svh}',
    /* Card video tap-to-play hint */
    '.flick-card__video{cursor:pointer}',
    /* Flying logo: hidden and click-through until placed (keeps it out of the way in the Webflow Designer) */
    '.us-logo-fly.is-ready{opacity:1;pointer-events:auto}',
    '@keyframes xr-scan{0%{opacity:1;top:0}88%{opacity:1;top:calc(100% - 2px)}100%{opacity:0;top:calc(100% - 2px)}}',
    '@keyframes xr-g1{0%{opacity:1;clip-path:inset(12% 0 66% 0);transform:translateX(-7px)}3%{opacity:1;clip-path:inset(58% 0 22% 0);transform:translateX(6px)}6%{opacity:1;clip-path:inset(30% 0 48% 0);transform:translateX(-3px)}9%{opacity:1;clip-path:inset(74% 0 6% 0);transform:translateX(9px)}12%{opacity:1;clip-path:inset(42% 0 40% 0);transform:translateX(-2px)}15%,100%{opacity:0;clip-path:inset(0 0 100% 0);transform:none}}',
    '@keyframes xr-g2{0%{opacity:1;clip-path:inset(62% 0 18% 0);transform:translateX(5px)}3%{opacity:1;clip-path:inset(8% 0 76% 0);transform:translateX(-6px)}6%{opacity:1;clip-path:inset(48% 0 34% 0);transform:translateX(4px)}9%{opacity:1;clip-path:inset(22% 0 60% 0);transform:translateX(-8px)}12%{opacity:0}15%,100%{opacity:0;clip-path:inset(0 0 100% 0);transform:none}}',
    '@keyframes xr-jit{0%{transform:translateX(2px)}3%{transform:translateX(-2px)}6%{transform:translateX(1px)}9%{transform:translateX(-1px)}12%,100%{transform:none}}',

    /* X-ray toggle: indicator dot inside the nav button */
    '.us-xray-btn .us-xray-dot{width:.5em;height:.5em;border-radius:50%;border:1px solid currentColor;box-sizing:border-box;transition:background-color .2s ease}',
    '.us-xray-btn[aria-pressed="true"] .us-xray-dot{background-color:currentColor}',

    /* X-ray state: page content inverts, nav stays readable */
    '.us-xray-scope{transition:filter .6s cubic-bezier(.625,.05,0,1)}',
    'html.is-xray .us-xray-scope{filter:invert(1) hue-rotate(180deg)}',
    'html.is-xray .us-xray-scope img,html.is-xray .us-xray-scope video{filter:grayscale(1) contrast(1.25)}',
    '.us-xray-flash{position:fixed;left:0;right:0;top:0;height:2px;z-index:200;background:' + ACCENT + ';pointer-events:none;animation:us-xray-sweep .6s cubic-bezier(.625,.05,0,1) forwards}',
    '@keyframes us-xray-sweep{0%{top:0;opacity:1}90%{top:calc(100vh - 2px);opacity:1}100%{top:calc(100vh - 2px);opacity:0}}',

    /* Progressive blur along the top, under the nav */
    /* Progressive blur along the bottom of the screen; clears the iPhone home bar and hides over the footer */
    '.progressive-blur{z-index:40;pointer-events:none;isolation:isolate;contain:paint;width:100%;height:calc(7em + env(safe-area-inset-bottom,0px));position:fixed;top:auto;bottom:0;left:0;overflow:hidden;transform:translateZ(0);transition:opacity .4s ease}',
    '.progressive-blur.is-hidden{opacity:0}',
    '.progressive-blur__layer{position:absolute;inset:0}',
    '.progressive-blur__layer.is--1{-webkit-backdrop-filter:blur(.09375em);backdrop-filter:blur(.09375em);-webkit-mask:linear-gradient(#0000 50%,#000 62.5% 75%,#0000 87.5%);mask:linear-gradient(#0000 50%,#000 62.5% 75%,#0000 87.5%)}',
    '.progressive-blur__layer.is--2{-webkit-backdrop-filter:blur(.1875em);backdrop-filter:blur(.1875em);-webkit-mask:linear-gradient(#0000 62.5%,#000 75% 87.5%,#0000 100%);mask:linear-gradient(#0000 62.5%,#000 75% 87.5%,#0000 100%)}',
    '.progressive-blur__layer.is--3{-webkit-backdrop-filter:blur(.375em);backdrop-filter:blur(.375em);-webkit-mask:linear-gradient(#0000 75%,#000 87.5% 100%);mask:linear-gradient(#0000 75%,#000 87.5% 100%)}',
    '.progressive-blur__layer.is--4{-webkit-backdrop-filter:blur(.75em);backdrop-filter:blur(.75em);-webkit-mask:linear-gradient(#0000 82%,#000 92% 100%);mask:linear-gradient(#0000 82%,#000 92% 100%)}',
    '.progressive-blur__layer.is--5{-webkit-backdrop-filter:blur(1.5em);backdrop-filter:blur(1.5em);-webkit-mask:linear-gradient(#0000 88%,#000 100%);mask:linear-gradient(#0000 88%,#000 100%)}',

    /* Review slider: keep its card stacking inside the section so cards never slide over the nav */
    '.overlapping-slider__wrap{position:relative;isolation:isolate;z-index:0}',

    /* Flick cards: states set by the script */
    '[data-flick-cards-dragger]{position:absolute;inset:0;z-index:1;pointer-events:auto;touch-action:pan-y}',
    '[data-flick-drag-status="grab"] [data-flick-cards-dragger]{cursor:grab}',
    '[data-flick-drag-status="grabbing"] [data-flick-cards-dragger]{cursor:grabbing}',
    '[data-flick-cards-item-status] .flick-card__media{transition:opacity .2s ease;opacity:.5}',
    '[data-flick-cards-item-status="2-before"] .flick-card__media,[data-flick-cards-item-status="2-after"] .flick-card__media{opacity:.75}',
    '[data-flick-cards-item-status="active"] .flick-card__media{opacity:1}',

    '@media (prefers-reduced-motion:reduce){.xr .inv,.us-xray-scope{transition:none}.xr .g1,.xr .g2,.xr .lbl,.xr .scan{animation:none!important}.us-xray-flash{display:none}}'
  ].join('');
  var style = document.createElement('style');
  style.setAttribute('data-us-bundle', '');
  style.textContent = css;
  document.head.appendChild(style);

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initXray();
    initLogoFly();
    initLogoVideos();
    initCardVideos();
    initFlickCards();
    initOverlapSlider();
    initPlayPause();
    initBlur();
  });

  /* ---------- Progressive blur: fade out once the footer is on screen ---------- */
  function initBlur() {
    var blur = document.querySelector('.progressive-blur'), foot = document.querySelector('.us-footer');
    if (!blur || !foot || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (e) { blur.classList.toggle('is-hidden', e[0].isIntersecting); }, { threshold: 0 }).observe(foot);
  }

  /* ---------- X-ray toggle ---------- */
  function initXray() {
    var root = document.documentElement;
    var scopes = document.querySelectorAll(XRAY_SCOPE);
    for (var i = 0; i < scopes.length; i++) scopes[i].classList.add('us-xray-scope');
    var buttons = document.querySelectorAll('[data-us-xray-toggle]');
    if (!buttons.length) return;

    function set(on, flash) {
      root.classList.toggle('is-xray', on);
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].setAttribute('aria-pressed', on ? 'true' : 'false');
        buttons[j].setAttribute('aria-label', on ? 'Turn x-ray off' : 'Turn x-ray on');
      }
      try { localStorage.setItem(XRAY_KEY, on ? '1' : '0'); } catch (e) {}
      if (flash) {
        var f = document.createElement('div');
        f.className = 'us-xray-flash';
        document.body.appendChild(f);
        setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 700);
      }
    }

    var saved = false;
    try { saved = localStorage.getItem(XRAY_KEY) === '1'; } catch (e) {}
    set(saved, false);

    for (var k = 0; k < buttons.length; k++) {
      buttons[k].addEventListener('click', function (e) {
        e.preventDefault();
        set(!root.classList.contains('is-xray'), true);
      });
    }
  }

  /* ---------- Chrome logo: big in the hero, glides into the nav on scroll ----------
     Runs only while something is changing (scroll, resize, menu animating), then idles to save battery. */
  function initLogoFly() {
    var fly = document.querySelector('.us-logo-fly');
    var slot = document.querySelector('.twostep-nav__logo');
    var nav = document.querySelector('[data-nav-status]');
    if (!fly || !slot) return;
    var img = fly.querySelector('img');
    if (img) { img.removeAttribute('srcset'); img.removeAttribute('sizes'); }

    function swapVideo(cls, target, width) {
      makeLogo(cls, width, function (el) { if (target && target.parentNode) target.parentNode.replaceChild(el, target); });
    }
    if (img) swapVideo('us-logo-fly__img', img);
    var visual = document.querySelector('.twostep-nav__visual');
    if (visual && !visual.querySelector('img,video')) {
      var ph = document.createElement('span'); visual.appendChild(ph);
      swapVideo('twostep-nav__visual-img', ph, '80%');
    }

    var hero = document.querySelector('.us-hero'), spot = document.querySelector('.us-hero__logo-spot');
    var AR = 632 / 960, p = null, running = false, still = 0, last = '';
    function clamp(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function tick() {
      var s = slot.getBoundingClientRect();
      var endW = Math.min(s.width, s.height / AR), endX = s.left, endY = s.top + (s.height - endW * AR) / 2;
      var startW = endW, startX = endX, startY = endY, target = 1;
      if (spot && hero) {
        var r = spot.getBoundingClientRect();
        startW = r.width; startX = r.left; startY = r.top + window.scrollY;
        target = clamp(window.scrollY / (hero.offsetHeight * 0.55));
      }
      if (nav && nav.getAttribute('data-nav-status') === 'active') target = 1;
      if (p === null) { p = target; fly.classList.add('is-ready'); }
      else if (REDUCED) p = target;
      else { p += (target - p) * 0.2; if (Math.abs(target - p) < 0.001) p = target; }
      var e = ease(p), w = startW + (endW - startW) * e, x = startX + (endX - startX) * e, y = startY + (endY - startY) * e;
      var key = Math.round(x * 10) + ',' + Math.round(y * 10) + ',' + Math.round(w * 10);
      if (key !== last) {
        fly.style.width = startW + 'px';
        fly.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + (w / startW) + ')';
        last = key; still = 0;
      } else still++;
      if (still > 30) { running = false; return; }
      requestAnimationFrame(tick);
    }
    function wake() { still = 0; if (!running) { running = true; requestAnimationFrame(tick); } }
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    window.addEventListener('orientationchange', wake);
    document.addEventListener('click', wake, true);
    document.addEventListener('keydown', wake);
    if (nav && 'MutationObserver' in window) new MutationObserver(wake).observe(nav, { attributes: true, attributeFilter: ['data-nav-status'] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(wake);
    window.addEventListener('load', wake);
    wake();
  }

  /* ---------- Spinning logo video in any [data-us-logo-video] box ---------- */
  function initLogoVideos() {
    var boxes = document.querySelectorAll('[data-us-logo-video]');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].querySelector('video,img')) continue;
      boxes[i].appendChild(makeLogo('', '100%'));
    }
  }

  /* ---------- Card videos: <div data-us-video="cam"> becomes a muted looping video ---------- */
  function initCardVideos() {
    var boxes = document.querySelectorAll('[data-us-video]');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].querySelector('video')) continue;
      var name = boxes[i].getAttribute('data-us-video');
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      v.preload = SAVE_DATA ? 'none' : 'metadata';
      v.poster = VIDEO_BASE + name + '-poster.jpg';
      v.src = VIDEO_BASE + name + '.mp4';
      v.setAttribute('aria-label', name + ' video');
      v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none';
      boxes[i].appendChild(v);
      boxes[i].addEventListener('click', function () {
        var vid = this.querySelector('video');
        if (!vid) return;
        var card = this.closest('[data-flick-cards-item]');
        if (card && card.getAttribute('data-flick-cards-item-status') !== 'active') return;
        /* touch screens can fire a tap twice (Draggable + the browser); count it once */
        var now = Date.now(), lastTap = +(vid.getAttribute('data-us-tap') || 0);
        if (now - lastTap < 400) return;
        vid.setAttribute('data-us-tap', now);
        if (vid.paused) { vid.setAttribute('data-us-user-play', '1'); vid.removeAttribute('data-us-user-paused'); var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
        else { vid.removeAttribute('data-us-user-play'); vid.setAttribute('data-us-user-paused', '1'); vid.pause(); }
      });
    }
  }

  /* ---------- Play / pause videos on scroll ---------- */
  function initPlayPause() {
    var els = document.querySelectorAll('[data-video="playpause"]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target.querySelector('video');
        if (!v) return;
        if (en.isIntersecting && AUTOPLAY) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.15 });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  /* ---------- Overlapping slider (Osmo), for reviews. Needs GSAP + Draggable + InertiaPlugin ----------
     Add data-loop to the init element for an endless loop: the cards are copied a few times and the
     slider quietly jumps back by a whole set when you near either end, so it never runs out. */
  function initOverlapSlider() {
    var inits = document.querySelectorAll('[data-overlap-slider-init]');
    if (!inits.length || !window.gsap || !window.Draggable) return;
    if (window.InertiaPlugin) gsap.registerPlugin(Draggable, InertiaPlugin); else gsap.registerPlugin(Draggable);

    inits.forEach(function (init) {
      var minScale = parseFloat(init.getAttribute('data-scale') || '0.45');
      var maxRotation = parseFloat(init.getAttribute('data-rotate') || '-8');
      var wrap = init.querySelector('[data-overlap-slider-collection]');
      var slider = init.querySelector('[data-overlap-slider-list]');
      var originals = Array.prototype.slice.call(init.querySelectorAll('[data-overlap-slider-item]'));
      if (!wrap || !slider || !originals.length) return;

      var LOOP = init.hasAttribute('data-loop') && originals.length > 1;
      var base = originals.length, SETS = 6;
      if (LOOP) {
        for (var k = 1; k < SETS; k++) {
          originals.forEach(function (o) {
            var c = o.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.setAttribute('data-us-clone', '');
            slider.appendChild(c);
          });
        }
      }
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-overlap-slider-item]'));

      wrap.style.touchAction = 'pan-y';
      wrap.style.userSelect = 'none';
      var spacing = 0, slideW = 0, rightLimit = 0, offset = 0, maxDrag = 0, dragX = 0, draggable, current = LOOP ? base * 2 : 0, inView = false, tween = null;

      function clamp(v) { return maxDrag <= 0 ? 0 : Math.min(Math.max(v, 0), maxDrag); }
      function update() {
        gsap.set(slider, { x: offset - dragX });
        slides.forEach(function (slide, i) {
          var pos = i * spacing - dragX;                       /* where the card would sit, from the left edge */
          var left = Math.max(0, -pos);                        /* how far it has gone past the left edge */
          var right = Math.max(0, pos - rightLimit);           /* how far it would run past the right edge */
          var tl = spacing > 0 ? Math.min(left / spacing, 1) : 0;
          var tr = spacing > 0 ? Math.min(right / spacing, 1) : 0;
          if (right > 0) {
            /* mirror of the left stack: pinned to the right edge, shrinking and tilting the other way */
            gsap.set(slide, { x: -right, scale: 1 - (1 - minScale) * tr, rotation: -maxRotation * tr, transformOrigin: '25% center', zIndex: 500 - i });
          } else {
            gsap.set(slide, { x: left, scale: 1 - (1 - minScale) * tl, rotation: maxRotation * tl, transformOrigin: '75% center', zIndex: left > 0 ? i : 1000 + i });
          }
        });
        current = spacing > 0 ? Math.round(dragX / spacing) : 0;
      }
      function label() {
        wrap.setAttribute('aria-label', 'Review ' + ((current % base) + 1) + ' of ' + base);
      }
      /* Loop: keep the front card inside the middle sets; jumping by whole sets looks identical */
      function normalize() {
        if (!LOOP || !spacing) { label(); return; }
        var idx = Math.round(dragX / spacing), shift = 0;
        if (idx < base * 2) shift = base * 2;
        else if (idx >= base * 4) shift = -base * 2;
        if (shift) { dragX += shift * spacing; update(); if (draggable) draggable.update(); }
        label();
      }
      function recalc() {
        var gap = parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
        slideW = slides[0].offsetWidth;
        spacing = slideW + gap;
        if (window.matchMedia('(max-width: 767px)').matches) {
          /* phones: one card and part of the next showing, cards run off to the right as before */
          rightLimit = Infinity; offset = 0;
        } else {
          /* desktop/tablet: up to data-visible (default 3) whole cards, centred, even stacks either side */
          var maxVis = parseInt(init.getAttribute('data-visible') || '3', 10);
          var fit = Math.floor((wrap.offsetWidth - slideW) / spacing) + 1;
          var vis = Math.max(1, Math.min(maxVis, fit));
          rightLimit = (vis - 1) * spacing;
          offset = Math.max(0, (wrap.offsetWidth - (rightLimit + slideW)) / 2);
        }
        maxDrag = spacing * (slides.length - 1);
        dragX = clamp(current * spacing);
        update();
        if (draggable) { draggable.applyBounds({ minX: offset - maxDrag, maxX: offset }); draggable.update(); }
      }

      draggable = Draggable.create(slider, {
        type: 'x',
        bounds: { minX: -maxDrag, maxX: 0 },
        inertia: !!window.InertiaPlugin,
        maxDuration: 1,
        snap: function (raw) { var d = clamp(offset - raw); return offset - (spacing > 0 ? Math.round(d / spacing) : 0) * spacing; },
        onPress: function () { if (tween) { tween.kill(); tween = null; } },
        onDrag: function () { dragX = clamp(offset - this.x); update(); },
        onThrowUpdate: function () { dragX = clamp(offset - this.x); update(); },
        onThrowComplete: normalize,
        onRelease: function () {
          if (!window.InertiaPlugin) goTo(Math.round(clamp(offset - this.x) / spacing));
          else if (!this.tween || !this.tween.isActive()) normalize();
        }
      })[0];

      function goTo(idx) {
        idx = Math.max(0, Math.min(idx, slides.length - 1));
        if (tween) tween.kill();
        var o = { v: dragX };
        tween = gsap.to(o, { v: idx * spacing, duration: 0.45, ease: 'power4.out',
          onUpdate: function () { dragX = o.v; update(); draggable.update(); },
          onComplete: function () { tween = null; normalize(); } });
      }

      if ('ResizeObserver' in window) new ResizeObserver(recalc).observe(init);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.25 }).observe(init);
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-roledescription', 'carousel');
      window.addEventListener('keydown', function (e) {
        if (!inView) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      });
      var prev = init.parentNode.querySelector('[data-overlap-prev]'), next = init.parentNode.querySelector('[data-overlap-next]');
      if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); goTo(current - 1); });
      if (next) next.addEventListener('click', function (e) { e.preventDefault(); goTo(current + 1); });
      recalc();
      label();
    });
  }

  /* ---------- Flick cards slider (Osmo), needs GSAP + Draggable ---------- */
  function initFlickCards() {
    var sliders = document.querySelectorAll('[data-flick-cards-init]');
    if (!sliders.length || !window.gsap) return;
    if (window.Draggable) gsap.registerPlugin(Draggable);

    sliders.forEach(function (slider) {
      var list = slider.querySelector('[data-flick-cards-list]');
      if (!list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-flick-cards-item]'));
      var total = cards.length;
      var activeIndex = 0;
      var threshold = 0.1;

      var draggers = cards.map(function (card) {
        var d = document.createElement('div');
        d.setAttribute('data-flick-cards-dragger', '');
        card.appendChild(d);
        return d;
      });
      slider.setAttribute('data-flick-drag-status', 'grab');

      function cfg(i, current) {
        var diff = i - current;
        if (diff > total / 2) diff -= total;
        else if (diff < -total / 2) diff += total;
        switch (diff) {
          case 0: return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
          case 1: return { x: 25, y: 1, rot: 10, s: 0.9, o: 1, z: 4 };
          case -1: return { x: -25, y: 1, rot: -10, s: 0.9, o: 1, z: 4 };
          case 2: return { x: 45, y: 5, rot: 15, s: 0.8, o: 1, z: 3 };
          case -2: return { x: -45, y: 5, rot: -15, s: 0.8, o: 1, z: 3 };
          default:
            var dir = diff > 0 ? 1 : -1;
            return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
        }
      }

      /* The front card plays, the others pause (saves the browser decoding every video at once) */
      function syncVideos() {
        cards.forEach(function (card, i) {
          var v = card.querySelector('video');
          if (!v) return;
          var front = i === activeIndex && slider.getAttribute('data-us-in-view') !== 'false';
          var wanted = !v.hasAttribute('data-us-user-paused') && (AUTOPLAY || v.hasAttribute('data-us-user-play'));
          if (front && wanted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else {
            v.pause();
            if (i !== activeIndex) { v.removeAttribute('data-us-user-play'); v.removeAttribute('data-us-user-paused'); }
          }
        });
      }

      function render(current) {
        cards.forEach(function (card, i) {
          var c = cfg(i, current);
          var status = c.x === 0 ? 'active' : c.x === 25 ? '2-after' : c.x === -25 ? '2-before' : c.x === 45 ? '3-after' : c.x === -45 ? '3-before' : 'hidden';
          card.setAttribute('data-flick-cards-item-status', status);
          card.style.zIndex = c.z;
          gsap.to(card, { duration: 0.6, ease: 'elastic.out(1.2, 1)', xPercent: c.x, yPercent: c.y, rotation: c.rot, scale: c.s, opacity: c.o });
        });
        syncVideos();
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          slider.setAttribute('data-us-in-view', entries[0].isIntersecting ? 'true' : 'false');
          syncVideos();
        }, { threshold: 0.15 }).observe(slider);
      }

      render(activeIndex);
      if (total < 3 || !window.Draggable) return;

      var pressX = 0, pressY = 0;
      Draggable.create(draggers, {
        type: 'x',
        edgeResistance: 0.8,
        bounds: { minX: -slider.offsetWidth / 2, maxX: slider.offsetWidth / 2 },
        inertia: false,
        onPress: function () {
          pressX = this.pointerEvent.clientX; pressY = this.pointerEvent.clientY;
          slider.setAttribute('data-flick-drag-status', 'grabbing');
        },
        onDrag: function () {
          var w = slider.offsetWidth;
          var raw = this.x / w;
          var progress = Math.min(1, Math.abs(raw));
          var next = (activeIndex + (raw > 0 ? -1 : 1) + total) % total;
          cards.forEach(function (card, i) {
            var a = cfg(i, activeIndex), b = cfg(i, next);
            function mix(k) { return a[k] + (b[k] - a[k]) * progress; }
            gsap.set(card, { xPercent: mix('x'), yPercent: mix('y'), rotation: mix('rot'), scale: mix('s'), opacity: mix('o') });
          });
        },
        onRelease: function () {
          slider.setAttribute('data-flick-drag-status', 'grab');
          var rx = this.pointerEvent.clientX, ry = this.pointerEvent.clientY;
          var dist = Math.hypot(rx - pressX, ry - pressY);
          var raw = this.x / slider.offsetWidth;
          var shift = raw > threshold ? -1 : raw < -threshold ? 1 : 0;
          if (shift !== 0) { activeIndex = (activeIndex + shift + total) % total; render(activeIndex); }
          else render(activeIndex);
          gsap.to(this.target, { x: 0, duration: 0.3, ease: 'power1.out' });
          if (dist < 4) {
            var t = this.target;
            t.style.pointerEvents = 'none';
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var el = document.elementFromPoint(rx, ry);
                if (el) el.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true }));
                t.style.pointerEvents = 'auto';
              });
            });
          }
        }
      });
    });
  }
})();
