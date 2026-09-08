/* ═══════════════════════════════════════════════════════════════════════════
   STAGIONI — quello che scende sul fondale.

   Il colore, il festone e la nota in fondo alla pagina sono CSS e HTML
   (assets/stagioni.css, build.mjs): arrivano senza questo file. Qui si
   riempie solo lo strato che fluttua, ed è l'unica cosa del tema che ha
   bisogno di JavaScript.

   build.mjs lo appende alle sole pagine di stagione — quelle con
   data-stagione su <html> — e mai alle tre della Color Walk. Senza
   quell'attributo questo file si tira indietro alla terza riga.

   ── Non tutto cade allo stesso modo ──────────────────────────────────────
   Una foglia e un acino non scendono uguale, e disegnarli uguali si vede
   subito. La foglia è larga e leggera: ondeggia molto, gira, e ogni tanto si
   volta e mostra il rovescio. L'acino è tondo e pesante: scende quasi
   diritto, più svelto, e non si volta perché da qualunque parte lo guardi è
   lo stesso. Sono due righe di differenza nei parametri, e sono quelle che
   fanno la differenza fra «foglie che scendono» e «forme che scorrono».

   Anche il colore segue la cosa: le foglie sono verdi o già girate all'oro,
   gli acini e i grappoli hanno le tinte del vino. Un acino verde non esiste
   a settembre.

   ── Tre piani ────────────────────────────────────────────────────────────
   Lontano piccolo, pallido e lento; vicino grande, più netto e svelto. È
   parallasse ottenuta con tre numeri invece che con tre strati veri, e basta
   perché il fondale abbia una profondità.

   ── Movimento ────────────────────────────────────────────────────────────
   Con prefers-reduced-motion o col tasto «ferma il movimento» non scende
   niente: restano sei cose posate dove sono, ferme. Se l'impostazione cambia
   a pagina aperta, un osservatore sulla classe di <html> rifà lo strato.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;
  if (!de.getAttribute("data-stagione")) return;

  var host = document.querySelector("body > .sb-home");
  if (!host) return;

  /* Stesso criterio del resto del sito: la classe scritta col tasto vince,
     poi comanda l'impostazione di sistema. */
  function fermo() {
    if (de.classList.contains("rsm-motion")) return false;
    if (de.classList.contains("rsm-still")) return true;
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  /* ── Il disegno ─────────────────────────────────────────────────────────
     La foglia è quella della vite: cinque lobi, seni profondi, e le
     nervature che partono tutte dal picciolo. È lo stesso lembo del festone,
     perché due foglie di vite diverse nella stessa pagina si notano. */
  var FOGLIA =
    "<svg viewBox='-13 0 26 27' aria-hidden='true'>" +
    "<path d='M0 2C4 2 8 3 10 5.6 11 7.5 8.5 8.5 6.6 10.2 9.6 10.6 12 12 12.2 14.4 12.4 16.4 8 16.8 5.2 17.8 4.4 21 2.6 23 0 25.4-2.6 23-4.4 21-5.2 17.8-8 16.8-12.4 16.4-12.2 14.4-12 12-9.6 10.6-6.6 10.2-8.5 8.5-11 7.5-10 5.6-8 3-4 2 0 2Z'/>" +
    "<path d='M0 4V23M0 4.4L9.4 5.8M0 4.4L10.8 13.6M0 4.4L-9.4 5.8M0 4.4L-10.8 13.6' fill='none' stroke='#fff' stroke-width='.8' opacity='.32'/>" +
    "</svg>";

  var ACINO =
    "<svg viewBox='0 0 24 24' aria-hidden='true'>" +
    "<circle cx='12' cy='12' r='10'/>" +
    "<circle cx='8.6' cy='8.6' r='2.1' fill='#fff' opacity='.22'/>" +
    "</svg>";

  var GRAPPOLINO =
    "<svg viewBox='-10 0 20 24' aria-hidden='true'>" +
    "<circle cx='-4.4' cy='6' r='4.1'/><circle cx='4.4' cy='6' r='4.1'/>" +
    "<circle cx='0' cy='12.4' r='4.1'/><circle cx='-6.2' cy='13.4' r='3.4'/>" +
    "<circle cx='0.4' cy='19' r='3.6'/>" +
    "</svg>";

  var VITICCIO =
    "<svg viewBox='-8 0 16 24' aria-hidden='true'>" +
    "<path d='M0 0c0 5-6 5-6 9.5s8 4.5 8 9-5.5 5-6.2 2.1 3.5-2.6 3.3 0' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round'/>" +
    "</svg>";

  /* ── Chi cade, e come ───────────────────────────────────────────────────
     `peso` è la probabilità che esca quella specie. `sventola` è quanto
     ondeggia di lato e quanto svelto si volta: alto per ciò che è largo e
     leggero, basso per ciò che è tondo e pieno. `zavorra` moltiplica la
     durata della caduta — sotto 1 vuol dire «scende più in fretta».
     `tinte` sono le variabili del foglio, e non si mescolano fra specie. */
  var SPECIE = [
    { n: "foglia", peso: 0.46, svg: FOGLIA, sventola: 1, zavorra: 1.12, volta: true, tinte: ["vite", "vite", "vite-oro", "vite-oro", "paglierino"] },
    /* Un acino solo è un cerchio, e un cerchio pallido che scende sembra
       una bolla di sapone. Ne cade qualcuno, ma la parte del leone la fa il
       grappolino, che una forma ce l'ha. E il rosato — che è il colore del
       chiaretto, non di un acino — resta ai grappoli. */
    { n: "acino", peso: 0.16, svg: ACINO, sventola: 0.22, zavorra: 0.74, volta: false, tinte: ["granato", "rubino", "viola", "cerasuolo"] },
    { n: "grappolino", peso: 0.25, svg: GRAPPOLINO, sventola: 0.34, zavorra: 0.82, volta: false, tinte: ["granato", "rubino", "viola", "rosato", "cerasuolo"] },
    { n: "viticcio", peso: 0.13, svg: VITICCIO, sventola: 0.86, zavorra: 1.04, volta: false, tinte: ["vite", "vite-oro"] },
  ];

  /* Tre piani di profondità: [dimensione], [opacità], [secondi di caduta].
     `quota` è quanto spesso esce quel piano — il fondo è più popolato del
     davanti, come in qualunque cosa vista in prospettiva. */
  var PIANI = [
    { quota: 0.42, dim: [12, 18], op: [0.12, 0.19], cad: [34, 48] },
    { quota: 0.35, dim: [18, 26], op: [0.17, 0.25], cad: [25, 35] },
    { quota: 0.23, dim: [26, 38], op: [0.21, 0.32], cad: [18, 26] },
  ];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function fra(v) { return rnd(v[0], v[1]); }
  function una(l) { return l[(Math.random() * l.length) | 0]; }
  function pesata(l) {
    var r = Math.random(), s = 0;
    for (var i = 0; i < l.length; i++) { s += l[i].peso !== undefined ? l[i].peso : l[i].quota; if (r <= s) return l[i]; }
    return l[l.length - 1];
  }

  var cielo = null;

  function svuota() {
    if (cielo && cielo.parentNode) cielo.parentNode.removeChild(cielo);
    cielo = null;
  }

  function popola() {
    svuota();
    var still = fermo();
    /* Ogni particella sono quattro nodi animati: su uno schermo piccolo —
       che quasi sempre vuol dire un telefono, e una batteria — quattordici
       diventano cinquantasei trasformazioni per fotogramma per un ornamento.
       Su stretto se ne fanno meno, e non si vede la differenza perché la
       finestra è meno di un terzo. */
    var stretto = (window.innerWidth || 1024) < 700;
    var n = still ? 6 : stretto ? 8 : 14;

    cielo = document.createElement("div");
    cielo.className = "sb-stag-cielo";
    cielo.setAttribute("aria-hidden", "true");

    for (var i = 0; i < n; i++) {
      var sp = pesata(SPECIE);
      var pi = pesata(PIANI);

      /* Tre gusci annidati: uno cade, uno ondeggia di lato, uno gira. Tre
         movimenti diversi non stanno in una trasformazione sola, e sommarli
         a mano frame per frame vorrebbe dire tenere un ciclo di animazione
         acceso per un ornamento. Così li fa il compositore, gratis. */
      var p = document.createElement("div");
      p.className = "sb-stag-p sb-stag-p--" + sp.n;
      var x = document.createElement("span");
      x.className = "sb-stag-x";
      var r = document.createElement("span");
      r.className = "sb-stag-r";
      r.innerHTML = sp.svg;
      x.appendChild(r);
      p.appendChild(x);

      p.style.setProperty("--sw", fra(pi.dim).toFixed(1) + "px");
      p.style.setProperty("--so", fra(pi.op).toFixed(3));
      p.style.setProperty("--sc", "var(--stag-" + una(sp.tinte) + ")");

      if (still) {
        /* Posate: sparse per la finestra e ferme. Non si congela una
           caduta a metà — una foglia sospesa a mezz'aria è più strana di
           una foglia per terra. */
        p.style.top = rnd(8, 86).toFixed(1) + "vh";
        p.style.left = rnd(4, 92).toFixed(1) + "vw";
        p.style.transform = "rotate(" + (rnd(-50, 50) | 0) + "deg)";
        p.style.animation = "none";
      } else {
        var cad = fra(pi.cad) * sp.zavorra;
        p.style.setProperty("--sl", rnd(1, 95).toFixed(1) + "vw");
        p.style.setProperty("--sd", cad.toFixed(1) + "s");
        /* Ritardo negativo: al primo istante la finestra è già popolata a
           metà caduta, invece di partire da un cielo vuoto che si riempie. */
        p.style.setProperty("--sdl", (-rnd(0, cad)).toFixed(1) + "s");
        p.style.setProperty("--sx", (rnd(14, 54) * sp.sventola).toFixed(0) + "px");
        p.style.setProperty("--sxd", rnd(4.5, 9.5).toFixed(1) + "s");
        p.style.setProperty("--sxdl", (-rnd(0, 9)).toFixed(1) + "s");
        p.style.setProperty("--srr", ((Math.random() < 0.5 ? -1 : 1) * rnd(150, 520)).toFixed(0) + "deg");
        p.style.setProperty("--srd", rnd(18, 42).toFixed(1) + "s");
        if (sp.volta) p.style.setProperty("--svd", rnd(3.4, 6.4).toFixed(1) + "s");
      }
      cielo.appendChild(p);
    }
    host.insertBefore(cielo, host.firstChild);
  }

  popola();

  /* Se il tasto del movimento cambia la classe di <html> a pagina aperta, lo
     strato si rifà con l'altra logica. Il foglio di stile da solo spegnerebbe
     le animazioni, ma lascerebbe le foglie tutte in cima: qui si rimette
     tutto al suo posto. */
  var atteso = de.className;
  new MutationObserver(function () {
    if (de.className === atteso) return;
    atteso = de.className;
    popola();
  }).observe(de, { attributes: true, attributeFilter: ["class"] });
})();
