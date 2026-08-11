/* ═══════════════════════════════════════════════════════════════════════════
   Il movimento del vetro. Tre cose, tutte facoltative:
   l'inclinazione delle card, la parallasse del fondale, la pillola della nav.

   Sta in un file suo e non dentro rivalta.js perché la differenza è netta:
   rivalta.js fa funzionare il sito (tema, menu, voce attiva), questo lo fa
   sembrare fatto di vetro. Se questo file non arriva — rete lenta, script
   bloccati, JS spento — non manca niente di leggibile né di navigabile: le
   card restano dritte, il fondale fermo, la nav con il suo hover di sempre.
   Ogni custom property che scriviamo qui ha un valore di ripiego nel CSS.

   Tutte e tre si accendono e si spengono con il tasto nella nav, e la scelta
   resta fra una visita e l'altra.

   Regole che valgono per tutto il file:
   · niente lettura di geometria dentro un gestore di evento — misurare forza
     il browser a ricalcolare il layout, e su pointermove vuol dire una volta
     per frame. Si misura all'ingresso, poi si usa quel numero;
   · si scrive nello stile solo dentro un requestAnimationFrame;
   · chi ha chiesto meno movimento non entra: senza una pressione del tasto non
     si attacca nemmeno un ascoltatore.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Il touch è escluso da tutto: lì "hover" è il dito appoggiato un istante
  // prima del tap, e una card che si inclina mentre si scorre è un difetto.
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ── Acceso o spento ───────────────────────────────────────────────────────
     Tre stati, non due, esattamente come il tema: la scelta fatta con il tasto
     vince e resta, e se non è mai stata fatta decide l'impostazione di sistema.

     Le due classi le scrive già l'inline nell'<head>, prima del primo paint —
     qui si leggono e basta. Chi ha prefers-reduced-motion attivo ma preme
     "muovi" su questo sito ha espresso una preferenza più recente e più
     specifica di quella del sistema operativo: gliela diamo vinta, ed è il
     motivo per cui il blocco @media nel CSS è appeso a :not(.rsm-motion). */
  var KEY_MODE = "rsm-motion-mode";
  var KEY_MANUAL = "rsm-motion-manual";

  function attivo() {
    if (de.classList.contains("rsm-motion")) return true;
    if (de.classList.contains("rsm-still")) return false;
    return !reduced.matches;
  }

  /* ── Inclinazione delle card ───────────────────────────────────────────────
     UN solo ascoltatore sul documento, non uno per card: le card sono qualche
     decina per pagina, e la rassegna stampa le genera in build — con gli
     ascoltatori attaccati a mano una card nuova nascerebbe morta.

     Due valori per card sotto il puntatore:
     · l'inclinazione (--sb-tilt-x/y), pochi gradi, la lastra segue il dito;
     · l'angolo del rim (--rim-angle), che decide da che parte è illuminato il
       bordo. È la ragione per cui il bordo di .sb-panel è un gradiente e non
       una riga: il filo di luce si sposta con la sorgente, come su una lastra
       vera. Senza questo l'inclinazione da sola sembra un cartoncino che si
       piega.                                                                */
  var CARDS = "a.sb-card, a.sb-page-card, .sb-panel--hover";
  var TILT = 4.5; // gradi al massimo, agli angoli

  function tilt() {
    var card = null; // la card sotto il puntatore adesso
    var panel = null; // la sua lastra (.sb-panel)
    var box = null; // la geometria, misurata UNA volta all'ingresso
    var pending = null; // ultime coordinate viste, in attesa del frame
    var frame = 0;

    function paint() {
      frame = 0;
      if (!panel || !pending) return;

      // Coordinate normalizzate nel riquadro della card: -1 a sinistra/in
      // alto, +1 a destra/in basso, 0 al centro.
      var dx = (pending.x - box.left) / box.width * 2 - 1;
      var dy = (pending.y - box.top) / box.height * 2 - 1;

      panel.style.setProperty("--sb-tilt-y", (dx * TILT).toFixed(2) + "deg");
      panel.style.setProperty("--sb-tilt-x", (-dy * TILT).toFixed(2) + "deg");

      /* L'angolo di un gradiente CSS punta dove il gradiente FINISCE, mentre a
         noi interessa dove comincia — lì c'è il colore acceso del rim. Il
         punto d'inizio sta dalla parte opposta rispetto alla direzione, quindi
         l'angolo che porta l'inizio sotto il puntatore è atan2(-dx, dy).
         Verifica veloce: puntatore in alto a sinistra → circa 160°, cioè
         esattamente il valore di ripiego scritto nel CSS. */
      var angle = Math.atan2(-dx, dy) * 180 / Math.PI;
      panel.style.setProperty("--rim-angle", angle.toFixed(1) + "deg");
    }

    function leave() {
      if (!panel) return;
      // Si tolgono le proprietà invece di riportarle a zero: così il valore
      // torna a essere quello del CSS, e il ripiego resta uno solo, lì.
      panel.classList.remove("sb-panel--tilting");
      panel.style.removeProperty("--sb-tilt-x");
      panel.style.removeProperty("--sb-tilt-y");
      panel.style.removeProperty("--rim-angle");
      card = panel = box = pending = null;
    }

    document.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType !== "mouse") return;
        // Spento a metà passaggio: la lastra torna dritta e non si tocca più
        // niente finché non si riaccende.
        if (!attivo()) return leave();

        var over = e.target.closest ? e.target.closest(CARDS) : null;
        if (over !== card) {
          leave();
          if (!over) return;
          card = over;
          panel = over.classList.contains("sb-panel--hover")
            ? over
            : over.querySelector(".sb-panel");
          if (!panel) {
            card = null;
            return;
          }
          // Una misurazione sola, all'ingresso. La card non cambia dimensione
          // mentre ci si passa sopra, e getBoundingClientRect() a ogni
          // movimento costerebbe un ricalcolo di layout per frame.
          box = card.getBoundingClientRect();
          panel.classList.add("sb-panel--tilting");
        }

        pending = { x: e.clientX, y: e.clientY };
        if (!frame) frame = requestAnimationFrame(paint);
      },
      { passive: true }
    );

    // La card può sparire da sotto il puntatore senza che il puntatore si
    // muova: la pagina scorre, la finestra cambia taglia. In tutti e tre i
    // casi la geometria misurata non vale più.
    window.addEventListener("scroll", leave, { passive: true });
    window.addEventListener("resize", leave, { passive: true });
    document.addEventListener("pointerleave", leave);

    // Accendere non ha niente da fare: la prima inclinazione arriva con il
    // primo movimento del mouse.
    return { on: function () {}, off: leave };
  }

  /* ── Parallasse del fondale ────────────────────────────────────────────────
     La griglia sale di un dodicesimo di quanto sale il contenuto. Non si deve
     notare: se qualcuno la nota è troppa. Serve solo a togliere al fondale
     l'immobilità perfetta del position:fixed, quella che lo fa leggere come
     una texture attaccata allo schermo invece che come spazio dietro il vetro.

     Il resto (i due aloni verdi) continua a muoversi per conto suo con le
     animazioni CSS: sono su transform, e sovrascriverle da qui vorrebbe dire
     riscrivere in JS una deriva di settantaquattro secondi che il compositore
     sta già facendo gratis, fuori dal thread principale.                    */
  function parallax() {
    var grid = document.querySelector(".sb-bg-grid");
    if (!grid) return;

    function ferma() {
      grid.style.removeProperty("--sb-par");
    }

    var frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (!attivo()) return ferma();
        // Il resto della divisione per 64 (il passo della griglia): lo
        // spostamento resta un numero piccolo comunque si scorra, e siccome la
        // griglia si ripete ogni 64px il salto quando il resto si azzera è
        // invisibile.
        var y = -((window.scrollY * 0.08) % 64);
        grid.style.setProperty("--sb-par", y.toFixed(1) + "px");
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return { on: onScroll, off: ferma };
  }

  /* ── Pillola della nav ─────────────────────────────────────────────────────
     Un fondo solo che scivola da una voce all'altra invece di otto fondi che
     si accendono e si spengono: il movimento continuo dice che le voci sono
     una fila sola, otto accensioni indipendenti no.

     Riposa sotto la pagina aperta. Segue il mouse e anche il focus da
     tastiera — chi naviga con il Tab vede la stessa cosa di chi usa il mouse,
     e non è un dettaglio: è l'unico indicatore di posizione che si muove.   */
  function pill() {
    var links = document.querySelector(".sb-nav-links");
    if (!links) return;

    var pillEl = links.querySelector(".sb-nav-pill");
    if (!pillEl) return;

    var items = links.querySelectorAll(".sb-nav-link");

    // Spegnendo il movimento la pillola non resta ferma: se ne va. È un
    // indicatore che vive dello scivolamento — immobile sotto una voce sarebbe
    // solo un secondo modo di dire "sei qui", accanto al filo verde che già lo
    // dice. Tolta la classe, torna il rettangolo dell'hover di sempre.
    function ferma() {
      links.classList.remove("sb-nav-links--pill");
      pillEl.classList.remove("sb-on");
    }

    function moveTo(el) {
      if (!attivo()) return ferma();
      // Da qui in poi la pillola c'è davvero: il CSS può spegnere il
      // rettangolo dell'hover, che senza script resta l'unico segnale.
      links.classList.add("sb-nav-links--pill");
      if (!el) {
        pillEl.classList.remove("sb-on");
        return;
      }
      // offsetLeft/offsetWidth e non getBoundingClientRect(): servono le
      // coordinate dentro .sb-nav-links (che è position:relative), non quelle
      // rispetto alla finestra. Una nav sticky le vedrebbe cambiare a ogni
      // scroll.
      pillEl.style.setProperty("--sb-pill-x", el.offsetLeft + "px");
      pillEl.style.setProperty("--sb-pill-w", el.offsetWidth + "px");
      pillEl.classList.add("sb-on");
    }

    // La voce a riposo è quella della pagina aperta. L'attributo lo scrive
    // rivalta.js, che è caricato prima: se un giorno l'ordine dei due <script>
    // si invertisse, qui non ci sarebbe ancora nulla da trovare e la pillola
    // resterebbe semplicemente nascosta finché non si passa con il mouse.
    function home() {
      return links.querySelector('.sb-nav-link[aria-current="page"]');
    }
    function rest() {
      moveTo(home());
    }

    items.forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        moveTo(a);
      });
      a.addEventListener("focus", function () {
        moveTo(a);
      });
      a.addEventListener("blur", rest);
    });
    links.addEventListener("mouseleave", rest);

    // Le etichette cambiano posizione quando cambia la larghezza della
    // finestra, e sotto i 1080px la fila non è nemmeno visibile.
    window.addEventListener("resize", rest, { passive: true });

    // I caratteri arrivano da Google Fonts: misurare prima che siano
    // sostituiti vuol dire misurare il ripiego di sistema, e la pillola
    // resterebbe larga quanto la parola scritta in Tahoma.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
    rest();

    return { on: rest, off: ferma };
  }

  /* ── Il tasto ──────────────────────────────────────────────────────────────
     Accende e spegne le tre cose qui sopra, e la scelta resta: è nella nav
     accanto a quello del tema, e funziona allo stesso modo.

     I moduli si attaccano una volta sola, alla prima accensione, e da lì in poi
     restano attaccati: spegnere non stacca gli ascoltatori, li fa uscire subito
     (controllano attivo() in cima). Costa qualche confronto per frame di
     scroll, e in cambio riaccendere è immediato e non c'è mezzo stato da
     ricostruire. Chi non accende mai — perché ha prefers-reduced-motion e non
     tocca il tasto — non paga niente: qui sotto non si attacca proprio nulla. */
  var moduli = null;

  function attacca() {
    if (moduli) return;
    moduli = [];
    // L'inclinazione richiede un puntatore vero; la pillola no — a riposo è
    // ferma sotto la pagina aperta, e lì fa da "sei qui" anche senza mouse.
    if (fine.matches) moduli.push(tilt());
    moduli.push(pill());
    moduli.push(parallax());
    moduli = moduli.filter(Boolean); // pill() e parallax() tornano vuoti se la
                                     // pagina non ha nav o fondale
  }

  function applica() {
    var acceso = attivo();
    if (acceso) attacca();
    if (moduli) {
      moduli.forEach(function (m) {
        (acceso ? m.on : m.off)();
      });
    }
    document.querySelectorAll("[data-motion-toggle]").forEach(function (btn) {
      btn.classList.add("sb-ready");
      btn.setAttribute("aria-pressed", acceso ? "true" : "false");
      btn.setAttribute("aria-label", acceso ? "Ferma il movimento" : "Rimetti il movimento");
      var m = btn.querySelector("[data-icon-motion]");
      var s = btn.querySelector("[data-icon-still]");
      if (m) m.style.display = acceso ? "" : "none";
      if (s) s.style.display = acceso ? "none" : "";
    });
  }

  document.querySelectorAll("[data-motion-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var prossimo = attivo() ? "off" : "on";
      try {
        localStorage.setItem(KEY_MODE, "manual");
        localStorage.setItem(KEY_MANUAL, prossimo);
      } catch (e) {}
      de.classList.toggle("rsm-motion", prossimo === "on");
      de.classList.toggle("rsm-still", prossimo === "off");
      applica();
    });
  });

  // Se l'impostazione di sistema cambia a pagina aperta e nessuno ha ancora
  // premuto il tasto, il sito la segue.
  if (reduced.addEventListener) reduced.addEventListener("change", applica);

  applica();
})();
