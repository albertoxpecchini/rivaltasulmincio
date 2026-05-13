/* ──────────────────────────────────────────────────────────────────────
   Rivalta sul Mincio · Glass Carousel
   File singolo: si applica a qualsiasi
     <div class="rsm-glass" data-rsm-carousel>...</div>
   I figli diretti (img / picture / video / a > img) diventano slide.
   Opzioni (attributi sul container):
     data-autoplay="4500"   ms tra slide (default 4500, 0 = disattivato)
     data-aspect="16/9"     aspect-ratio forzato (default: prende dal genitore)
     data-loop="true"       loop infinito (default true)
     data-pause-on-hover="true"  (default true)
   ────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (window.__rsmGlassCarouselLoaded__) return;
  window.__rsmGlassCarouselLoaded__ = true;

  /* ── CSS (iniettato una sola volta) ─────────────────────────────── */
  var CSS = [
    '.rsm-glass{',
    '  position:relative;width:100%;height:100%;',
    '  border-radius:14px;overflow:hidden;border:0;outline:0;',
    '  background:linear-gradient(180deg,rgba(244,247,252,.6),rgba(232,238,246,.4));',
    '  isolation:isolate;',
    '  -webkit-tap-highlight-color:transparent;',
    '}',
    '.rsm-glass[data-aspect]{height:auto;}',
    '.rsm-glass__track{',
    '  position:absolute;inset:0;display:flex;height:100%;width:100%;',
    '  will-change:transform;',
    '  transition:transform 720ms cubic-bezier(.22,.61,.36,1);',
    '  touch-action:pan-y;',
    '}',
    '.rsm-glass.is-grabbing .rsm-glass__track{transition:none;cursor:grabbing;}',
    '.rsm-glass.is-static .rsm-glass__track{transition:none;}',
    '.rsm-glass__slide{',
    '  position:relative;flex:0 0 100%;min-width:100%;height:100%;',
    '  overflow:hidden;border-radius:inherit;',
    '  background:rgba(15,20,28,.04);',
    '}',
    '.rsm-glass__slide > img,',
    '.rsm-glass__slide > picture,',
    '.rsm-glass__slide > video,',
    '.rsm-glass__slide > a{',
    '  display:block;width:100%;height:100%;',
    '}',
    '.rsm-glass__slide img,',
    '.rsm-glass__slide video{',
    '  width:100%;height:100%;object-fit:cover;object-position:center;',
    '  border-radius:inherit;display:block;',
    '  -webkit-user-drag:none;user-select:none;',
    '}',
    '.rsm-glass__sheen{',
    '  position:absolute;inset:0;pointer-events:none;z-index:2;',
    '  border-radius:inherit;',
    '  background:',
    '    linear-gradient(180deg,rgba(255,255,255,.18) 0%,transparent 22%,transparent 70%,rgba(8,12,20,.18) 100%),',
    '    radial-gradient(120% 80% at 50% 0%,rgba(255,255,255,.10),transparent 55%);',
    '  mix-blend-mode:overlay;opacity:.9;',
    '}',
    '.rsm-glass__dots{',
    '  position:absolute;left:50%;bottom:14px;z-index:3;',
    '  transform:translateX(-50%);',
    '  display:inline-flex;align-items:center;gap:8px;',
    '  padding:7px 11px;border-radius:999px;',
    '  background:rgba(255,255,255,.32);',
    '  -webkit-backdrop-filter:blur(14px) saturate(140%);',
    '  backdrop-filter:blur(14px) saturate(140%);',
    '  box-shadow:0 6px 22px rgba(8,12,20,.18),inset 0 0 0 1px rgba(255,255,255,.42);',
    '}',
    '.rsm-glass__dots[hidden]{display:none;}',
    '.rsm-glass__dot{',
    '  appearance:none;border:0;padding:0;cursor:pointer;',
    '  width:7px;height:7px;border-radius:999px;',
    '  background:rgba(15,20,28,.42);',
    '  transition:width 320ms cubic-bezier(.22,.61,.36,1),background 320ms,opacity 200ms;',
    '  opacity:.85;',
    '}',
    '.rsm-glass__dot:hover{opacity:1;}',
    '.rsm-glass__dot.is-active{',
    '  width:22px;',
    '  background:linear-gradient(95deg,#1fbf7d,#4a9bff,#8b5cf6);',
    '  opacity:1;',
    '}',
    '.rsm-glass:focus-visible{outline:2px solid rgba(74,155,255,.55);outline-offset:2px;}',
    '/* dark theme tweak */',
    'html[data-theme="scuro"] .rsm-glass{',
    '  background:linear-gradient(180deg,rgba(20,26,36,.6),rgba(14,18,26,.4));',
    '}',
    'html[data-theme="scuro"] .rsm-glass__dots{',
    '  background:rgba(20,26,36,.42);',
    '  box-shadow:0 6px 22px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.14);',
    '}',
    'html[data-theme="scuro"] .rsm-glass__dot{background:rgba(230,238,250,.36);}',
    '/* parent containers: angoli piccoli, niente bordi (l\'oggetto vive dentro a vari frame) */',
    '.rsm-hero__media:has(.rsm-glass),',
    '.rsm-gallery__stage:has(.rsm-glass),',
    '.rsm-atlas-photo:has(.rsm-glass),',
    '.rsm-contact__map:has(.rsm-glass){border-radius:14px;border:0;}',
    '.rsm-hero__media:has(.rsm-glass)::after{display:none;}',
    /* reduced motion */
    '@media (prefers-reduced-motion:reduce){',
    '  .rsm-glass__track{transition:none;}',
    '  .rsm-glass__dot{transition:none;}',
    '}'
  ].join('');

  function injectCss() {
    if (document.getElementById('rsm-glass-carousel-css')) return;
    var s = document.createElement('style');
    s.id = 'rsm-glass-carousel-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function toNum(v, dflt) {
    var n = parseFloat(v);
    return isFinite(n) ? n : dflt;
  }

  function collectSlides(el) {
    // Prendi tutti i figli diretti che sono media o link a media.
    var out = [];
    for (var i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      if (c.classList && c.classList.contains('rsm-glass__track')) continue;
      if (c.classList && c.classList.contains('rsm-glass__dots')) continue;
      if (c.classList && c.classList.contains('rsm-glass__sheen')) continue;
      var tag = c.tagName;
      if (tag === 'IMG' || tag === 'PICTURE' || tag === 'VIDEO' || tag === 'A' || tag === 'FIGURE') {
        out.push(c);
      } else if (c.matches && c.matches('[data-slide]')) {
        out.push(c);
      }
    }
    return out;
  }

  /* ── Core ────────────────────────────────────────────────────────── */
  function build(el) {
    if (el.__rsmGlass) return;
    el.__rsmGlass = true;
    el.classList.add('rsm-glass');

    var aspect = el.getAttribute('data-aspect');
    if (aspect) el.style.aspectRatio = aspect.replace('/', ' / ');

    var media = collectSlides(el);
    if (!media.length) return;

    // Costruisci track + slides
    var track = document.createElement('div');
    track.className = 'rsm-glass__track';
    media.forEach(function (m) {
      var slide = document.createElement('div');
      slide.className = 'rsm-glass__slide';
      slide.appendChild(m);
      track.appendChild(slide);
    });

    // Sheen (riflesso vetro)
    var sheen = document.createElement('div');
    sheen.className = 'rsm-glass__sheen';
    sheen.setAttribute('aria-hidden', 'true');

    // Dots (pagination)
    var dots = document.createElement('div');
    dots.className = 'rsm-glass__dots';
    dots.setAttribute('role', 'tablist');

    el.innerHTML = '';
    el.appendChild(track);
    el.appendChild(sheen);
    el.appendChild(dots);

    var slides = track.children;
    var total = slides.length;
    var index = 0;
    var autoplay = toNum(el.getAttribute('data-autoplay'), 4500);
    var loop = el.getAttribute('data-loop') !== 'false';
    var pauseOnHover = el.getAttribute('data-pause-on-hover') !== 'false';
    var timer = null;
    var dotEls = [];

    if (total < 2) autoplay = 0;

    // Dots
    if (total > 1) {
      for (var i = 0; i < total; i++) {
        (function (idx) {
          var d = document.createElement('button');
          d.type = 'button';
          d.className = 'rsm-glass__dot';
          d.setAttribute('role', 'tab');
          d.setAttribute('aria-label', 'Vai alla slide ' + (idx + 1));
          d.addEventListener('click', function () { goTo(idx, true); });
          dots.appendChild(d);
          dotEls.push(d);
        })(i);
      }
    } else {
      dots.hidden = true;
    }

    function apply(noTransition) {
      if (noTransition) el.classList.add('is-static');
      track.style.transform = 'translate3d(' + (-index * 100) + '%,0,0)';
      for (var k = 0; k < total; k++) {
        slides[k].setAttribute('aria-hidden', k === index ? 'false' : 'true');
      }
      for (var j = 0; j < dotEls.length; j++) {
        dotEls[j].classList.toggle('is-active', j === index);
        dotEls[j].setAttribute('aria-selected', j === index ? 'true' : 'false');
      }
      if (noTransition) {
        // force reflow then remove
        void track.offsetWidth;
        el.classList.remove('is-static');
      }
    }

    function goTo(n, userInteracted) {
      if (total < 2) return;
      if (loop) {
        index = (n + total) % total;
      } else {
        index = Math.max(0, Math.min(total - 1, n));
      }
      apply(false);
      if (userInteracted) restart();
    }

    function start() {
      if (!autoplay) return;
      stop();
      timer = window.setInterval(function () { goTo(index + 1, false); }, autoplay);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    /* Pause su hover/focus/visibilità */
    if (pauseOnHover) {
      el.addEventListener('mouseenter', stop);
      el.addEventListener('mouseleave', start);
      el.addEventListener('focusin', stop);
      el.addEventListener('focusout', function (e) {
        if (!el.contains(e.relatedTarget)) start();
      });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    /* Tastiera */
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1, true); }
    });

    /* Swipe (pointer events) */
    if (total > 1) {
      var startX = 0, dx = 0, dragging = false, width = 0;
      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        startX = e.clientX;
        dx = 0;
        width = el.clientWidth || 1;
        el.classList.add('is-grabbing');
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        stop();
      });
      el.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        dx = e.clientX - startX;
        var pct = (dx / width) * 100;
        track.style.transform = 'translate3d(calc(' + (-index * 100) + '% + ' + pct + '%),0,0)';
      });
      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('is-grabbing');
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
        var threshold = Math.max(40, el.clientWidth * 0.12);
        if (dx <= -threshold)      goTo(index + 1, true);
        else if (dx >= threshold)  goTo(index - 1, true);
        else                       apply(false);
      }
      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);
      el.addEventListener('pointerleave', function (e) { if (dragging) endDrag(e); });
    }

    apply(true);
    start();
  }

  function initAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll('[data-rsm-carousel]');
    for (var i = 0; i < nodes.length; i++) build(nodes[i]);
  }

  function boot() {
    injectCss();
    initAll(document);
    // Auto-init di caroselli aggiunti dinamicamente (es. CMS)
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.matches && n.matches('[data-rsm-carousel]')) build(n);
            else if (n.querySelectorAll) initAll(n);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Espone API minimale per riusi futuri
  window.RsmGlassCarousel = { init: initAll, build: build };
})();
