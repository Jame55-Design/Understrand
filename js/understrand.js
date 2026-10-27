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
  var IS_SAFARI = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
  var LOGO_SRC = LOGO_BASE + (IS_SAFARI ? 'understrand-chrome-logo-hevc.mov' : 'understrand-chrome-logo.webm');
  var XRAY_KEY = 'us-xray';
  var XRAY_SCOPE = '.us-hero,.us-section,.us-videos,.us-footer,.us-logo-fly';

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
    '.xr:hover .inv,.xr:focus-visible .inv,.xr[aria-pressed="true"] .inv{transform:scaleY(1);transform-origin:top}',
    '.xr:hover .scan,.xr:focus-visible .scan{animation:xr-scan .34s cubic-bezier(.75,0,.2,1) forwards}',
    '.xr:focus-visible{outline:2px solid var(--accent);outline-offset:4px}',
    '.xr:hover .g1,.xr:focus-visible .g1{animation:xr-g1 2.8s steps(1,end) .12s infinite}',
    '.xr:hover .g2,.xr:focus-visible .g2{animation:xr-g2 2.8s steps(1,end) .12s infinite}',
    '.xr:hover .lbl,.xr:focus-visible .lbl{animation:xr-jit 2.8s steps(1,end) .12s infinite}',
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
    '.progressive-blur{z-index:40;pointer-events:none;isolation:isolate;contain:paint;width:100%;height:8em;position:fixed;top:0;left:0;overflow:hidden;transform:translateZ(0)}',
    '.progressive-blur__layer{position:absolute;inset:0}',
    '.progressive-blur__layer.is--1{-webkit-backdrop-filter:blur(.09375em);backdrop-filter:blur(.09375em);-webkit-mask:linear-gradient(to top,#0000 50%,#000 62.5% 75%,#0000 87.5%);mask:linear-gradient(to top,#0000 50%,#000 62.5% 75%,#0000 87.5%)}',
    '.progressive-blur__layer.is--2{-webkit-backdrop-filter:blur(.1875em);backdrop-filter:blur(.1875em);-webkit-mask:linear-gradient(to top,#0000 62.5%,#000 75% 87.5%,#0000 100%);mask:linear-gradient(to top,#0000 62.5%,#000 75% 87.5%,#0000 100%)}',
    '.progressive-blur__layer.is--3{-webkit-backdrop-filter:blur(.375em);backdrop-filter:blur(.375em);-webkit-mask:linear-gradient(to top,#0000 75%,#000 87.5% 100%);mask:linear-gradient(to top,#0000 75%,#000 87.5% 100%)}',
    '.progressive-blur__layer.is--4{-webkit-backdrop-filter:blur(.75em);backdrop-filter:blur(.75em);-webkit-mask:linear-gradient(to top,#0000 82%,#000 92% 100%);mask:linear-gradient(to top,#0000 82%,#000 92% 100%)}',
    '.progressive-blur__layer.is--5{-webkit-backdrop-filter:blur(1.5em);backdrop-filter:blur(1.5em);-webkit-mask:linear-gradient(to top,#0000 88%,#000 100%);mask:linear-gradient(to top,#0000 88%,#000 100%)}',

    /* Flick cards: states set by the script */
    '[data-flick-cards-dragger]{position:absolute;inset:0;z-index:1;pointer-events:auto;touch-action:pan-y}',
    '[data-flick-drag-status="grab"] [data-flick-cards-dragger]{cursor:grab}',
    '[data-flick-drag-status="grabbing"] [data-flick-cards-dragger]{cursor:grabbing}',
    '[data-flick-cards-item-status] .flick-card__media{transition:opacity .2s ease;opacity:.5}',
    '[data-flick-cards-item-status="2-before"] .flick-card__media,[data-flick-cards-item-status="2-after"] .flick-card__media{opacity:.75}',
    '[data-flick-cards-item-status="active"] .flick-card__media{opacity:1}',

    '@media (prefers-reduced-motion:reduce){.xr .inv,.us-xray-scope{transition:none}.xr:hover .g1,.xr:hover .g2,.xr:hover .lbl,.xr:hover .scan,.xr:focus-visible .g1,.xr:focus-visible .g2,.xr:focus-visible .lbl,.xr:focus-visible .scan{animation:none}.us-xray-flash{display:none}}'
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
    initLogoVideos();
    initFlickCards();
    initPlayPause();
  });

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

  /* ---------- Spinning logo video in any [data-us-logo-video] box ---------- */
  function initLogoVideos() {
    var boxes = document.querySelectorAll('[data-us-logo-video]');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].querySelector('video')) continue;
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto';
      v.style.display = 'block'; v.style.width = '100%'; v.style.height = 'auto';
      v.src = LOGO_SRC;
      boxes[i].appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
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
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.15 });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
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
          if (i === activeIndex && slider.getAttribute('data-us-in-view') !== 'false') { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
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
