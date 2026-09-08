/* ═══════════════════════════════════════════════════════════════════════════
   STAGIONI — le foglie che scendono sul fondale.

   Il colore di stagione e il festone sono CSS puro (assets/stagioni.css):
   arrivano senza questo file. Qui si riempie solo lo strato che fluttua —
   otto-dodici particelle fra foglie di vite e acini, dietro al contenuto,
   mai sopra il testo, pointer-events:none.

   build.mjs lo appende solo alle pagine di stagione (quelle con
   data-stagione su <html>) e mai a quelle della Color Walk. Se l'attributo
   non c'è, questo file non fa niente.

   Il movimento segue le regole del sito: con prefers-reduced-motion o col
   tasto «ferma il movimento» (html.rsm-still) le foglie non scendono —
   restano poche, sparse e ferme. Se l'impostazione cambia a pagina aperta,
   un osservatore sulla classe di <html> rifà lo strato.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;
  var stagione = de.getAttribute("data-stagione");
  if (!stagione) return;

  var host = document.querySelector("body > .sb-home");
  if (!host) return;

  /* Stesso criterio del resto del sito: la classe scritta a mano vince, poi
     l'impostazione di sistema. */
  function fermo() {
    if (de.classList.contains("rsm-motion")) return false;
    if (de.classList.contains("rsm-still")) return true;
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  var FOGLIA =
    "<svg viewBox='0 0 48 48' fill='none' aria-hidden='true'>" +
    "<path d='M24 6c-3 5-9 7-15 7 2 4 2 7 0 11 5 0 9 2 12 7 3-5 7-7 12-7-2-4-2-7 0-11-6 0-12-2-15-7Z' fill='currentColor'/>" +
    "</svg>";
  var ACINO = "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='10' fill='currentColor'/></svg>";

  function rnd(a, b) { return a + Math.random() * (b - a); }

  var cielo = null;

  function svuota() {
    if (cielo && cielo.parentNode) cielo.parentNode.removeChild(cielo);
    cielo = null;
  }

  function popola() {
    svuota();
    var still = fermo();
    var n = still ? 5 : rnd(9, 12) | 0;

    cielo = document.createElement("div");
    cielo.className = "sb-stag-cielo";
    cielo.setAttribute("aria-hidden", "true");

    for (var i = 0; i < n; i++) {
      var p = document.createElement("div");
      p.className = "sb-stag-p";

      var foglia = Math.random() < 0.62;
      p.innerHTML = foglia ? FOGLIA : ACINO;

      var dim = foglia ? rnd(16, 30) : rnd(8, 14);
      p.style.setProperty("--sw", dim.toFixed(1) + "px");
      p.style.setProperty("--so", rnd(0.14, 0.28).toFixed(2));

      // Tre tinte: viola, ambra, foglia. La CSS dà il default (accento).
      var t = Math.random();
      if (t < 0.34) p.style.setProperty("--sc", "var(--sb-stag-warm)");
      else if (t < 0.6) p.style.setProperty("--sc", "var(--sb-stag-leaf)");

      if (still) {
        // Posate dove sono, senza deriva.
        p.style.top = rnd(6, 88).toFixed(1) + "vh";
        p.style.left = rnd(3, 93).toFixed(1) + "vw";
        p.style.transform = "rotate(" + (rnd(-40, 40) | 0) + "deg)";
        p.style.animation = "none";
      } else {
        p.style.setProperty("--sl", rnd(2, 94).toFixed(1) + "vw");
        p.style.setProperty("--sx", (rnd(-60, 60) | 0) + "px");
        p.style.setProperty("--sr", (rnd(140, 340) | 0) + "deg");
        p.style.setProperty("--sd", rnd(18, 34).toFixed(1) + "s");
        p.style.setProperty("--sdl", (-rnd(0, 34)).toFixed(1) + "s");
      }
      cielo.appendChild(p);
    }
    host.insertBefore(cielo, host.firstChild);
  }

  popola();

  /* Se il tasto del movimento cambia la classe di <html> a pagina aperta,
     rifà lo strato con l'altra logica. Solo su quelle due classi. */
  var atteso = de.className;
  new MutationObserver(function () {
    if (de.className === atteso) return;
    atteso = de.className;
    popola();
  }).observe(de, { attributes: true, attributeFilter: ["class"] });
})();
