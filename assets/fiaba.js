/* ═══════════════════════════════════════════════════════════════════════════
   LA FIABA AI LATI — i quadri che scorrono col testo.

   Scendendo una pagina di stagione, ai margini della colonna di lettura
   compaiono i disegni: le cassette d'uva della vendemmia, le zucche nel
   cortile, le castagne con la lumaca, i funghi sul tronco, i cachi, la
   tavola con i tortelli e il Lambrusco, il riccio, la lepre, il martin
   pescatore, la ragnatela con la rugiada, la libellula, la catasta di
   legna, il camino che fuma, la bicicletta sporca di fango con gli stivali,
   il mais secco e le noci, il melograno, il cesto di mele e pere, il
   tagliere col Grana e il salame, i germani. Uno ogni schermata circa, a
   destra e a sinistra del testo, e ognuno con un movimento solo, piccolo.

   build.mjs lo appende alle sole pagine di stagione, dopo stagioni.js.
   Senza data-stagione su <html> si ferma alla terza riga.

   ── Dove c'è posto ───────────────────────────────────────────────────────
   I quadri stanno FUORI dalla colonna di lettura, mai sotto il testo: a
   sinistra fra il bordo della finestra e l'inizio del testo, a destra fra
   la fine della misura (46rem) e il bordo — o l'indice a lato, dove c'è.
   Si misura, non si presume: un lato che ha meno di 150px non prende
   niente, e sotto i 1000px di larghezza non si posa nessun quadro. Lì la
   fiaba resta quella in fondo alla finestra, che è a tutta larghezza.

   E NIENTE SOTTO LE COSE LARGHE. Le tabelle, le fotografie a coppie, i
   banner degli eventi, le file di pillole si prendono tutta la fascia da
   72rem e passavano sopra ai quadri di destra. Prima di posare un quadro
   si guarda che cosa, in quella fascia, occupa quelle altezze: se c'è
   qualcosa, il quadro prova l'altro lato, e se anche lì c'è qualcosa
   scende sotto l'ingombro. Un quadro mezzo coperto da una tabella non è
   un quadro: è un errore di stampa.

   ── Come sono disegnati ──────────────────────────────────────────────────
   SVG in linea, forme piatte, quattro o cinque tinte per quadro. Il colore
   lo prendono dalle variabili della stagione (--stag-*), con uno stile in
   linea: così seguono il tema chiaro/scuro senza un foglio in più, e il
   quadro è tutto in un posto solo. Nessun tratto nero pieno: il tratto
   scuro è --stag-ink, che al buio diventa chiaro.

   Ogni pezzo che si muove — l'orecchio della lepre, le fronde, il becco,
   il fumo, il vapore, le anatre — è disegnato attorno alla propria origine
   e messo al suo posto da un <g> che porta SOLO la posizione: un attributo
   transform e un'animazione CSS su transform non convivono, e il perno
   dev'essere (0,0) del disegno (stagioni.css, transform-origin: 0 0).

   ── Movimento ────────────────────────────────────────────────────────────
   L'entrata segue lo scorrimento (stagioni.css, animation-timeline); i
   piccoli movimenti sono classi .sb-fb-* dello stesso foglio. Con il
   movimento fermo restano i disegni, fermi.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;
  if (!de.getAttribute("data-stagione")) return;
  var host = document.querySelector("body > .sb-home");
  if (!host) return;

  /* Tre modi di tingere: pieno, tratto, pieno con contorno. Ogni nome è
     una variabile --stag-* del foglio di stagione. */
  function f(t, o) { return 'style="fill:var(--stag-' + t + ')' + (o ? ";opacity:" + o : "") + '"'; }
  function s(t, w, o) { return 'style="fill:none;stroke:var(--stag-' + t + ");stroke-width:" + (w || 2) + ";stroke-linecap:round;stroke-linejoin:round" + (o ? ";opacity:" + o : "") + '"'; }
  function fs(t, st, w) { return 'style="fill:var(--stag-' + t + ");stroke:var(--stag-" + st + ");stroke-width:" + (w || 1.5) + ';stroke-linejoin:round"'; }
  function svg(vb, dentro) { return "<svg viewBox='" + vb + "' aria-hidden='true' focusable='false'>" + dentro + "</svg>"; }
  /* Il perno: un <g> che porta la posizione, dentro un <g> che porta il
     movimento, dentro il disegno centrato sull'origine. */
  function mosso(x, y, cls, dentro, stile) {
    return "<g transform='translate(" + x + " " + y + ")'><g class='" + cls + "'" + (stile ? " style='" + stile + "'" : "") + ">" + dentro + "</g></g>";
  }
  var ombra = "<ellipse cx='60' cy='106' rx='50' ry='6' " + f("terra", 0.14) + "/>";
  var fogliaTerra = function (x, y, t, o) {
    return "<g transform='translate(" + x + " " + y + ")'><path d='M0 0c6-8 16-8 22-2-8 4-14 6-22 2z' " + f(t, o || 0.75) + "/></g>";
  };
  var anatra = function (corpo, testa, x, y, sc, ritardo) {
    return "<g transform='translate(" + x + " " + y + ") scale(" + sc + ")'><g class='sb-fb-nuota' style='animation-delay:" + ritardo + "s'>" +
      "<path d='M-22 6c0-8 10-12 22-12 6 0 10 2 14 6l8-2-4 6c0 6-8 10-20 10-10 0-20-2-20-8z' " + f(corpo) + "/>" +
      "<path d='M-4 0c6 2 12 2 18 0-2 6-14 6-18 0z' " + f("platano", 0.9) + "/>" +
      "<path d='M12-4v-6' " + s(testa, 5) + "/><circle cx='14' cy='-12' r='7' " + f(testa) + "/>" +
      "<path d='M8-6c4 2 8 2 12 0' " + s("muro", 2) + "/><path d='M20-12l10 2-10 3z' " + f("zucca") + "/><circle cx='16' cy='-14' r='1.4' " + f("ink") + "/>" +
      "</g></g>";
  };

  /* ── I quadri, nell'ordine in cui si incontrano scendendo ──────────────
     È l'ordine di una giornata d'ottobre: prima la vendemmia e il cortile,
     poi il bosco e l'orto, il pranzo, gli animali del fiume e dei campi,
     e verso sera la legna, il camino, la bici lasciata al muro. `w` è la
     larghezza a cui il quadro sta bene; se il margine è più stretto si
     restringe fino a 150px. */
  var QUADRI = [
    { n: "cassette", w: 230, svg: svg("0 0 120 120",
      ombra +
      "<rect x='22' y='76' width='76' height='28' rx='2' " + f("legno") + "/>" +
      "<path d='M22 84h76M22 94h76' " + s("terra", 1.2, 0.5) + "/>" +
      "<rect x='22' y='76' width='4' height='28' " + f("terra", 0.4) + "/><rect x='94' y='76' width='4' height='28' " + f("terra", 0.4) + "/>" +
      "<g " + f("granato") + "><circle cx='42' cy='44' r='6'/><circle cx='54' cy='40' r='6'/><circle cx='66' cy='41' r='6'/><circle cx='78' cy='44' r='6'/><circle cx='90' cy='47' r='5.5'/><circle cx='48' cy='33' r='5.5'/><circle cx='60' cy='31' r='5.5'/><circle cx='72' cy='33' r='5.5'/><circle cx='84' cy='37' r='5.5'/></g>" +
      "<g " + f("viola") + "><circle cx='60' cy='45' r='5'/><circle cx='75' cy='49' r='5'/><circle cx='36' cy='47' r='4.5'/></g>" +
      "<g " + f("rosato", 0.55) + "><circle cx='40' cy='42' r='1.6'/><circle cx='52' cy='38' r='1.6'/><circle cx='70' cy='39' r='1.6'/><circle cx='58' cy='29' r='1.4'/></g>" +
      "<rect x='30' y='46' width='70' height='28' rx='2' " + f("legno") + "/>" +
      "<path d='M30 54h70M30 64h70' " + s("terra", 1.2, 0.5) + "/>" +
      "<rect x='30' y='46' width='4' height='28' " + f("terra", 0.4) + "/><rect x='96' y='46' width='4' height='28' " + f("terra", 0.4) + "/>" +
      "<path d='M28 44c-8-8-4-20 8-18-2 8-2 12-8 18z' " + f("vite") + "/>" +
      "<path d='M100 40c2-8 10-10 14-6-4 4-8 8-14 6z' " + f("vite-oro") + "/>"
    ) },
    { n: "zucche", w: 240, svg: svg("0 0 120 120",
      ombra +
      fogliaTerra(6, 92, "platano") +
      "<ellipse cx='46' cy='82' rx='30' ry='22' " + f("zucca") + "/>" +
      "<path d='M34 62c-6 12-6 28 0 40M46 60v44M58 62c6 12 6 28 0 40M24 66c-3 10-3 22 0 32M68 66c3 10 3 22 0 32' " + s("tetto", 1.6, 0.5) + "/>" +
      "<path d='M46 60c-1-6 2-9 6-10' " + s("vite", 3.2) + "/>" +
      "<ellipse cx='92' cy='90' rx='20' ry='15' " + f("zucca") + "/>" +
      "<path d='M84 77c-4 8-4 18 0 26M92 75v30M100 77c4 8 4 18 0 26' " + s("tetto", 1.4, 0.5) + "/>" +
      "<path d='M92 75c0-4 2-6 5-7' " + s("vite", 2.6) + "/>" +
      "<ellipse cx='18' cy='96' rx='11' ry='8' " + f("paglia") + "/>" +
      "<path d='M12 89c-2 4-2 10 0 14M18 88v16M24 89c2 4 2 10 0 14' " + s("vite", 1.4, 0.7) + "/>" +
      "<path d='M70 102c8-10 20-8 26-2-8 4-16 6-26 2z' " + f("vite", 0.85) + "/>" +
      "<path d='M60 58c4-6 10-4 8 2' " + s("vite", 1.4) + "/>"
    ) },
    { n: "castagne", w: 220, svg: svg("0 0 120 120",
      ombra +
      fogliaTerra(12, 92, "platano") + fogliaTerra(84, 96, "legno", 0.6) +
      "<path d='M34 70l6-10 4 8 6-10 4 8 6-10 4 10 6-6-2 10 8-2-6 8 8 4-9 2 6 8-9-3 2 9-7-6-2 9-5-7-5 8-2-9-8 6 2-9-9 2 6-8-8-4 8-4-6-8 8 2-2-9z' " + f("paglia", 0.9) + "/>" +
      "<ellipse cx='55' cy='74' rx='14' ry='10' " + f("muro", 0.9) + "/>" +
      "<path d='M45 82c-2-10 4-16 10-16s12 6 10 16z' " + f("legno") + "/>" +
      "<path d='M56 82c-2-8 4-14 9-13s9 6 8 13z' " + f("terra") + "/>" +
      "<path d='M49 70c2-3 5-4 8-4' " + s("muro", 1.6, 0.6) + "/>" +
      "<path d='M80 90c-2-9 4-14 9-14s11 6 9 14z' " + f("legno") + "/>" +
      "<path d='M20 86c-2-9 4-14 9-14s11 6 9 14z' " + f("terra") + "/>" +
      "<g class='sb-fb-lumaca'><path d='M62 102c-8 0-12-6-8-9 4-2 10 0 16 3 4 2 8 6 6 6z' " + f("legno", 0.9) + "/><circle cx='62' cy='92' r='7' " + f("paglia") + "/><path d='M58 92a4 4 0 1 0 8 0a2 2 0 1 0-4 0' " + s("legno", 1.2, 0.7) + "/><path d='M76 98l3-5M79 99l4-4' " + s("legno", 1.2) + "/><circle cx='79' cy='93' r='1.2' " + f("ink") + "/><circle cx='83' cy='95' r='1.2' " + f("ink") + "/></g>"
    ) },
    { n: "funghi", w: 230, svg: svg("0 0 120 120",
      ombra +
      "<path d='M10 92c0-10 10-16 30-16h60c8 0 10 6 10 12v8H14c-3 0-4-2-4-4z' " + f("legno") + "/>" +
      "<ellipse cx='100' cy='86' rx='8' ry='11' " + f("paglia") + "/><ellipse cx='100' cy='86' rx='4' ry='6' " + s("legno", 1.2, 0.6) + "/>" +
      "<path d='M20 84h30M40 90h36' " + s("terra", 1.4, 0.4) + "/>" +
      "<path d='M14 78c8-4 16-2 22 2-8 2-16 2-22-2z' " + f("vite", 0.7) + "/>" +
      "<path d='M40 76v-14M48 76v-18M56 76v-13' " + s("muro", 3) + "/>" +
      "<path d='M32 62c2-8 14-8 16 0z' " + f("legno") + "/><path d='M40 58c2-9 14-9 16 0z' " + f("terra") + "/><path d='M49 63c2-7 12-7 14 0z' " + f("legno") + "/>" +
      "<path d='M72 74v-12M78 74v-10' " + s("muro", 2.5) + "/>" +
      "<path d='M65 62c2-7 12-7 14 0z' " + f("terra") + "/><path d='M72 64c2-6 10-6 12 0z' " + f("legno") + "/>" +
      "<g><circle class='sb-fb-goccia' cx='30' cy='80' r='1.5' " + f("nebbia") + "/><circle class='sb-fb-goccia' cx='86' cy='80' r='1.5' " + f("nebbia") + "/><circle class='sb-fb-goccia' cx='60' cy='86' r='1.2' " + f("nebbia") + "/></g>" +
      fogliaTerra(84, 100, "gelso", 0.8)
    ) },
    { n: "cachi", w: 220, svg: svg("0 0 120 120",
      "<path d='M4 10c20 6 40 10 60 22M40 28c8-8 14-10 26-12M70 40c10 0 18 6 30 6' " + s("spoglio", 3) + "/>" +
      "<g " + f("zucca") + "><circle cx='30' cy='36' r='11'/><circle cx='66' cy='50' r='12'/><circle cx='96' cy='60' r='10'/><circle cx='52' cy='72' r='9'/></g>" +
      "<g " + f("rosato", 0.5) + "><circle cx='26' cy='32' r='2.5'/><circle cx='62' cy='45' r='2.5'/><circle cx='93' cy='56' r='2'/><circle cx='49' cy='69' r='2'/></g>" +
      "<g " + f("vite") + "><path d='M24 28l6-4 6 4-6 2z'/><path d='M60 41l6-4 6 4-6 2z'/><path d='M91 53l5-4 5 4-5 2z'/><path d='M47 66l5-4 5 4-5 2z'/></g>" +
      mosso(44, 24, "sb-fb-fronda", "<path d='M0 0c10-14 26-14 30-4-10 2-20 6-30 4z' " + f("platano") + "/>") +
      mosso(78, 44, "sb-fb-fronda", "<path d='M0 0c10-12 26-10 30-2-10 4-20 6-30 2z' " + f("vite") + "/>", "animation-delay:-2.4s;animation-duration:5.6s")
    ) },
    { n: "tavola", w: 250, svg: svg("0 0 120 120",
      "<rect x='6' y='70' width='108' height='8' rx='2' " + f("legno") + "/>" +
      "<path d='M14 78v30M106 78v30' " + s("legno", 4) + "/>" +
      "<path d='M14 70v-14c0-3 3-6 8-6h16c5 0 8 3 8 6v14z' " + f("ink", 0.7) + "/>" +
      "<ellipse cx='30' cy='50' rx='16' ry='4' " + f("zucca") + "/>" +
      "<path d='M12 58h-4M48 58h4' " + s("ink", 2) + "/>" +
      mosso(22, 44, "sb-fb-vapore", "<path d='M0 0c-2-4 2-6 0-10' " + s("nebbia", 2) + "/>") +
      mosso(30, 42, "sb-fb-vapore", "<path d='M0 0c-2-4 2-6 0-10' " + s("nebbia", 2) + "/>", "animation-delay:-1.1s") +
      mosso(38, 44, "sb-fb-vapore", "<path d='M0 0c-2-4 2-6 0-10' " + s("nebbia", 2) + "/>", "animation-delay:-2.2s") +
      "<ellipse cx='60' cy='70' rx='24' ry='8' " + f("muro") + "/><ellipse cx='60' cy='69' rx='20' ry='6' " + f("nebbia", 0.6) + "/>" +
      "<path d='M46 66c2-6 10-6 12 0-4 2-8 2-12 0z' " + f("paglia") + "/><path d='M58 64c2-6 10-6 12 0-4 2-8 2-12 0z' " + f("paglia") + "/><path d='M54 70c2-5 8-5 10 0-3 2-7 2-10 0z' " + f("zucca", 0.7) + "/>" +
      "<path d='M50 62l3-3M68 62l3-3' " + s("vite", 1.4) + "/>" +
      "<path d='M84 40h16l-2 22h-12z' " + f("rubino") + "/><path d='M82 36h20l-3 28h-14z' " + s("nebbia", 1.4, 0.8) + "/><ellipse cx='92' cy='42' rx='7' ry='2.5' " + f("rosato", 0.8) + "/>" +
      "<path d='M92 64v6M86 70h12' " + s("muro", 2) + "/>" +
      "<path d='M100 70l14-16 4 16z' " + f("paglia") + "/><circle cx='104' cy='66' r='1' " + f("legno") + "/><circle cx='110' cy='62' r='1' " + f("legno") + "/>"
    ) },
    { n: "riccio", w: 210, svg: svg("0 0 120 120",
      fogliaTerra(6, 96, "platano") + fogliaTerra(88, 98, "gelso") +
      "<path d='M40 92c-10-2-14-14-8-24 6-12 22-18 38-14 12 4 20 14 18 26-2 8-8 12-16 12z' " + f("spoglio") + "/>" +
      "<path d='M44 66l-4-8M54 60l-2-8M64 58v-9M74 60l3-8M82 66l5-6M88 74l7-3M36 76l-8-4M49 62l-3-8M69 58l2-9M79 62l5-7' " + s("ink", 2, 0.5) + "/>" +
      "<g class='sb-fb-fiuta'><path d='M70 92c-2-6 2-12 10-13 6 0 12 4 16 10 1 2-2 4-4 3z' " + f("muro") + "/><circle cx='82' cy='84' r='1.8' " + f("ink") + "/><circle cx='95' cy='90' r='2.4' " + f("ink") + "/></g>" +
      "<path d='M46 94l-2 6M60 94v6M76 96l2 5' " + s("ink", 2) + "/>"
    ) },
    { n: "lepre", w: 220, svg: svg("0 0 120 120",
      "<path d='M6 100v-8M14 100v-6M22 100v-9M96 100v-7M104 100v-9M112 100v-6M30 100v-5' " + s("paglia", 2) + "/>" +
      "<path d='M34 98c-8-10-4-30 12-34 10-3 24-2 34 2 10 4 14 14 12 24 0 4-2 8-6 8z' " + f("legno") + "/>" +
      "<path d='M56 98c-4-8 2-18 14-18 6 0 10 6 10 12l-2 6z' " + f("muro", 0.6) + "/>" +
      "<path d='M94 54c0-14 4-28 10-28 2 4 0 18-6 28z' " + f("legno") + "/>" +
      "<path d='M78 66c-4-8 0-16 8-16 8 0 14 8 12 16-2 6-8 8-12 8s-8-4-8-8z' " + f("legno") + "/>" +
      mosso(88, 52, "sb-fb-orecchio", "<path d='M-4 0c-4-14-2-30 4-32 4 2 6 18 2 32z' " + f("legno") + "/>") +
      "<circle cx='90' cy='64' r='2' " + f("ink") + "/><circle cx='98' cy='70' r='1.5' " + f("ink") + "/>" +
      "<path d='M98 72l8 2M98 73l8 5' " + s("ink", 1, 0.6) + "/>" +
      "<circle cx='34' cy='86' r='5' " + f("muro") + "/>"
    ) },
    { n: "martin", w: 220, svg: svg("0 0 120 120",
      "<path d='M0 96c20-4 40 4 60 0s40-4 60 0v24H0z' " + f("acqua", 0.35) + "/>" +
      "<path d='M20 102c10-3 20 3 30 0M70 106c10-3 20 3 30 0' " + s("nebbia", 1.6, 0.8) + "/>" +
      "<path d='M0 40c20 4 40 2 60 10' " + s("spoglio", 4) + "/><path d='M40 46c-4-6-10-8-16-8' " + s("spoglio", 2) + "/>" +
      "<path d='M56 50l-10 8 6-12z' " + f("acqua") + "/>" +
      "<path d='M58 46c-6-8-2-20 10-22 10-2 18 6 18 16 0 8-6 14-14 14-8 0-14-4-14-8z' " + f("acqua") + "/>" +
      "<path d='M60 50c4 6 12 8 18 4 2-6-2-12-8-14-4 4-8 6-10 10z' " + f("zucca") + "/>" +
      "<path d='M58 40c6-6 16-8 22-4-4 6-12 10-22 4z' " + f("viola", 0.8) + "/>" +
      mosso(76, 38, "sb-fb-becca", "<circle cx='6' cy='-8' r='9' " + f("acqua") + "/><path d='M0-4c4 4 10 4 14 0' " + f("muro", 0.9) + "/><path d='M14-8l20 2-20 4z' " + f("ink") + "/><circle cx='8' cy='-10' r='1.8' " + f("ink") + "/>") +
      "<path d='M66 58v4M72 58v4' " + s("zucca", 2) + "/>"
    ) },
    { n: "ragnatela", w: 200, svg: svg("0 0 120 120",
      "<path d='M10 10L110 30M10 10L100 70M10 10L60 106M10 10L20 112M10 10L110 8' " + s("spoglio", 1, 0.55) + "/>" +
      "<path d='M30 12A20 20 0 0 1 12 30M50 14A40 40 0 0 1 14 50M70 16A60 60 0 0 1 16 70M90 18A80 80 0 0 1 18 90M110 20A100 100 0 0 1 20 110' " + s("spoglio", 1, 0.5) + "/>" +
      "<g " + fs("nebbia", "acqua", 0.6) + ">" +
      [[30, 12], [12, 30], [50, 14], [14, 50], [44, 31], [31, 44], [70, 16], [16, 70], [61, 44], [44, 61], [90, 18], [18, 90], [78, 56], [56, 78], [64, 92], [92, 64], [110, 20], [20, 110]]
        .map(function (p) { return "<circle class='sb-fb-goccia' cx='" + p[0] + "' cy='" + p[1] + "' r='1.9'/>"; }).join("") +
      "</g>" +
      "<circle cx='66' cy='54' r='3.5' " + f("ink", 0.8) + "/><circle cx='66' cy='49' r='2' " + f("ink", 0.8) + "/>" +
      "<path d='M62 52l-6-4M62 55l-7 1M70 52l6-4M70 55l7 1M63 58l-5 5M69 58l5 5' " + s("ink", 1.2, 0.7) + "/>" +
      "<path d='M96 82c8-8 18-6 20 2-6 4-14 4-20-2z' " + f("platano", 0.8) + "/>"
    ) },
    { n: "libellula", w: 220, svg: svg("0 0 120 120",
      "<path d='M0 110c20-4 40 4 60 0s40-4 60 0v10H0z' " + f("acqua", 0.3) + "/>" +
      "<path d='M30 116V50' " + s("oro", 3) + "/><path d='M30 60c8-4 14-12 16-22' " + s("oro", 2) + "/><ellipse cx='30' cy='46' rx='4' ry='12' " + f("legno") + "/>" +
      "<g class='sb-fb-libra'>" +
      "<g class='sb-fb-frulla'><path d='M70 62c-4-16 2-30 12-30 6 0 6 14-6 30z' " + f("nebbia", 0.75) + "/><path d='M76 64c-2-14 6-26 16-26 6 2 2 16-12 28z' " + f("nebbia", 0.75) + "/><path d='M68 66c-14 4-26 0-30-8 2-6 16-4 30 8z' " + f("nebbia", 0.75) + "/><path d='M74 68c-14 8-28 6-34-2 4-6 18-4 34 2z' " + f("nebbia", 0.75) + "/></g>" +
      "<path d='M56 58l44 18' " + s("acqua", 4) + "/><path d='M64 61l4 2M72 64l4 2M80 67l4 2M88 70l4 2' " + s("ink", 1, 0.4) + "/>" +
      "<circle cx='54' cy='57' r='4.5' " + f("vite") + "/><circle cx='52' cy='55' r='1.5' " + f("ink") + "/>" +
      "</g>"
    ) },
    { n: "legna", w: 230, svg: svg("0 0 120 120",
      ombra +
      "<rect x='4' y='70' width='18' height='34' rx='3' " + f("terra") + "/>" +
      "<path d='M14 70l14-40' " + s("legno", 3.5) + "/><path d='M24 34l10-4 2 10-10 2z' " + f("ink", 0.8) + "/>" +
      (function () {
        var righe = [[96, [30, 50, 70, 90, 110]], [80, [40, 60, 80, 100]], [64, [50, 70, 90]], [48, [60, 80]]];
        return righe.map(function (r) {
          return r[1].map(function (x) {
            return "<g transform='translate(" + x + " " + r[0] + ")'><circle r='10' " + f("legno") + "/><circle r='6' " + s("terra", 1, 0.5) + "/><circle r='2.5' " + f("paglia", 0.8) + "/></g>";
          }).join("");
        }).join("");
      })()
    ) },
    { n: "camino", w: 230, svg: svg("0 0 120 120",
      "<rect x='0' y='70' width='120' height='50' " + f("muro") + "/>" +
      "<path d='M0 70L60 30l60 40v4L60 36 0 74z' " + f("tetto") + "/>" +
      "<path d='M4 72L60 34l56 38' " + s("tetto", 6) + "/>" +
      "<path d='M22 58l38-26M98 58L60 32M12 65l48-32M108 65L60 34' " + s("terra", 1, 0.3) + "/>" +
      "<rect x='80' y='26' width='12' height='24' " + f("tetto") + "/><rect x='78' y='24' width='16' height='4' " + f("terra") + "/>" +
      mosso(86, 20, "sb-fb-fumo", "<circle r='4' " + f("nebbia") + "/><circle r='3.5' " + f("nebbia") + "/><circle r='4.5' " + f("nebbia") + "/>") +
      "<rect x='40' y='76' width='34' height='30' rx='2' " + f("finestra", 0.9) + "/><rect x='40' y='76' width='34' height='30' rx='2' " + f("nebbia", 0.5) + "/>" +
      "<path d='M57 76v30M40 91h34' " + s("legno", 2) + "/><rect x='38' y='74' width='38' height='34' rx='2' " + s("legno", 3) + "/>" +
      "<path d='M66 80c0 6-1 10 0 16' " + s("acqua", 1.6, 0.6) + "/><circle cx='66' cy='97' r='2' " + f("acqua", 0.6) + "/>" +
      "<g " + f("legno", 0.9) + "><circle cx='10' cy='114' r='4'/><circle cx='18' cy='114' r='4'/><circle cx='26' cy='114' r='4'/><circle cx='14' cy='107' r='4'/><circle cx='22' cy='107' r='4'/></g>"
    ) },
    { n: "bici", w: 240, svg: svg("0 0 120 120",
      "<rect x='0' y='0' width='120' height='100' " + f("muro", 0.45) + "/><rect x='0' y='100' width='120' height='20' " + f("terra", 0.25) + "/>" +
      "<circle cx='30' cy='88' r='16' " + s("spoglio", 2.2) + "/><circle cx='86' cy='88' r='16' " + s("spoglio", 2.2) + "/>" +
      "<path d='M30 72v32M14 88h32M86 72v32M70 88h32M19 77l22 22M41 77L19 99M75 77l22 22M97 77L75 99' " + s("spoglio", 0.8, 0.6) + "/>" +
      "<path d='M30 88l18-30h28l10 30M48 58l10 30h-28M76 58l-6-10h8M58 88l18-30' " + s("vigna", 2.4) + "/>" +
      "<path d='M50 54h12' " + s("ink", 3) + "/><path d='M76 48l-6 2 4-6' " + s("ink", 2) + "/>" +
      "<circle cx='24' cy='102' r='3' " + f("terra", 0.7) + "/><circle cx='92' cy='103' r='4' " + f("terra", 0.7) + "/><circle cx='40' cy='98' r='2' " + f("terra", 0.6) + "/><circle cx='36' cy='92' r='1.5' " + f("terra", 0.6) + "/>" +
      "<path d='M96 100v-20c0-2 2-3 4-3h2v23z' " + f("terra", 0.9) + "/>" +
      "<path d='M100 100v-22c0-3 2-4 5-4h4c3 0 5 1 5 4v14l6 4v4z' " + f("legno") + "/><path d='M110 100v-22' " + s("terra", 1, 0.5) + "/>"
    ) },
    { n: "mais", w: 220, svg: svg("0 0 120 120",
      "<path d='M30 0v16M60 0v12M90 0v18' " + s("spoglio", 1.4) + "/>" +
      (function () {
        var pann = function (x, y) {
          return "<g transform='translate(" + x + " " + y + ")'>" +
            "<path d='M-8 0c-6 20-2 36 8 44 10-8 14-24 8-44z' " + f("paglia") + "/>" +
            "<rect x='-5' y='4' width='10' height='34' rx='5' " + f("gelso") + "/>" +
            "<path d='M-3 8v26M0 6v30M3 8v26' " + s("zucca", 1, 0.6) + "/>" +
            "<path d='M-8 0c-6-4-10-10-12-16 6 2 10 8 12 16zM8 0c6-4 10-10 12-16-6 2-10 8-12 16z' " + f("paglia", 0.8) + "/>" +
            "</g>";
        };
        return pann(30, 16) + pann(60, 12) + pann(90, 18);
      })() +
      "<path d='M20 90h80l-8 26H28z' " + f("legno") + "/><path d='M24 100h72M26 108h68M28 116h64' " + s("terra", 1.2, 0.5) + "/>" +
      "<g " + f("legno") + "><circle cx='36' cy='88' r='6'/><circle cx='52' cy='84' r='6'/><circle cx='68' cy='86' r='6'/><circle cx='84' cy='88' r='6'/></g>" +
      "<path d='M36 82v12M52 78v12M68 80v12M84 82v12' " + s("terra", 1, 0.5) + "/>" +
      "<g " + f("platano") + "><circle cx='44' cy='92' r='3.5'/><circle cx='60' cy='92' r='3.5'/><circle cx='76' cy='93' r='3.5'/></g>"
    ) },
    { n: "melograno", w: 220, svg: svg("0 0 120 120",
      "<path d='M120 10c-30 6-50 20-70 44' " + s("spoglio", 3) + "/><path d='M70 42c-10-2-20 0-26 8' " + s("spoglio", 2) + "/>" +
      mosso(90, 26, "sb-fb-fronda", "<path d='M0 0c-2-10 6-16 14-14-2 8-6 12-14 14z' " + f("vite") + "/>") +
      mosso(60, 50, "sb-fb-fronda", "<path d='M0 0c-2-10 6-16 14-14-2 8-6 12-14 14z' " + f("vite") + "/>", "animation-delay:-2.4s;animation-duration:5.6s") +
      "<circle cx='88' cy='62' r='18' " + f("rubino") + "/><path d='M84 46l2-6 3 4 3-4 2 6z' " + f("granato") + "/><circle cx='80' cy='56' r='3' " + f("rosato", 0.5) + "/>" +
      "<circle cx='40' cy='84' r='20' " + f("granato") + "/>" +
      "<path d='M26 74c6 14 22 20 32 12-8-4-18-8-32-12z' " + f("muro", 0.9) + "/>" +
      "<g " + f("cerasuolo") + "><circle cx='34' cy='80' r='2.4'/><circle cx='40' cy='84' r='2.4'/><circle cx='46' cy='82' r='2.4'/><circle cx='38' cy='88' r='2.4'/><circle cx='44' cy='88' r='2.4'/><circle cx='50' cy='86' r='2.4'/><circle cx='32' cy='86' r='2.4'/></g>" +
      "<path d='M36 66l2-6 3 4 3-4 2 6z' " + f("granato") + "/>"
    ) },
    { n: "cesto", w: 230, svg: svg("0 0 120 120",
      ombra +
      "<path d='M30 76c0-30 60-30 60 0' " + s("legno", 4) + "/>" +
      "<circle cx='40' cy='70' r='12' " + f("rubino") + "/><circle cx='66' cy='66' r='12' " + f("cerasuolo") + "/><circle cx='88' cy='72' r='10' " + f("gelso") + "/>" +
      "<path d='M40 58v-5M66 54v-5' " + s("spoglio", 1.6) + "/><path d='M42 54c4-4 8-4 10 0-4 2-8 2-10 0z' " + f("vite") + "/>" +
      "<circle cx='35' cy='65' r='2.5' " + f("rosato", 0.6) + "/><circle cx='61' cy='61' r='2.5' " + f("rosato", 0.6) + "/>" +
      "<path d='M20 78c-8-6-6-18 2-22 2-6 4-10 6-10s4 4 6 10c8 4 10 16 2 22z' " + f("gelso") + "/>" +
      "<path d='M100 78c-8-6-6-18 2-22 2-6 4-10 6-10s4 4 6 10c8 4 10 16 2 22z' " + f("grano") + "/>" +
      "<path d='M14 76h92l-10 34H24z' " + f("legno") + "/><path d='M18 88h84M22 100h76M26 110h68' " + s("terra", 1.4, 0.5) + "/>"
    ) },
    { n: "tagliere", w: 240, svg: svg("0 0 120 120",
      "<rect x='36' y='20' width='26' height='36' rx='4' " + f("gelso", 0.75) + "/><rect x='34' y='16' width='30' height='6' rx='2' " + f("legno") + "/>" +
      "<circle cx='44' cy='40' r='5' " + f("zucca", 0.9) + "/><circle cx='54' cy='46' r='4' " + f("rubino", 0.8) + "/><circle cx='52' cy='32' r='4' " + f("vite", 0.8) + "/>" +
      "<rect x='40' y='44' width='18' height='8' " + f("muro", 0.8) + "/>" +
      "<path d='M8 60h96c6 0 10 4 10 10v30c0 6-4 10-10 10H8z' " + f("legno") + "/><circle cx='16' cy='85' r='4' " + f("muro") + "/>" +
      "<path d='M26 92l20-30 30 12-6 20z' " + f("paglia") + "/><path d='M46 62l30 12' " + s("terra", 4, 0.8) + "/><circle cx='30' cy='96' r='1.5' " + f("paglia") + "/><circle cx='36' cy='98' r='1' " + f("paglia") + "/>" +
      "<path d='M70 66h34c4 0 6 2 6 6s-2 6-6 6H70c-4 0-6-2-6-6s2-6 6-6z' " + f("granato") + "/><path d='M78 66v12M90 66v12' " + s("nebbia", 1, 0.7) + "/>" +
      "<g><circle cx='86' cy='90' r='8' " + f("granato") + "/><circle cx='98' cy='98' r='8' " + f("granato") + "/><circle cx='76' cy='100' r='8' " + f("granato") + "/></g>" +
      "<g " + f("rosato", 0.9) + "><circle cx='84' cy='88' r='1.2'/><circle cx='89' cy='92' r='1.2'/><circle cx='96' cy='96' r='1.2'/><circle cx='101' cy='100' r='1.2'/><circle cx='74' cy='98' r='1.2'/><circle cx='79' cy='102' r='1.2'/></g>"
    ) },
    { n: "anatre", w: 230, svg: svg("0 0 120 120",
      "<path d='M0 70c20-6 40 6 60 0s40-6 60 0v50H0z' " + f("acqua", 0.3) + "/>" +
      "<path d='M10 90c10-3 20 3 30 0M70 100c10-3 20 3 30 0M40 108c10-3 20 3 30 0' " + s("nebbia", 1.6, 0.8) + "/>" +
      "<path d='M8 70V30M16 72V38M4 70V44' " + s("oro", 2) + "/><ellipse cx='8' cy='27' rx='2.2' ry='6' " + f("legno") + "/><ellipse cx='16' cy='35' rx='2' ry='5' " + f("legno") + "/>" +
      anatra("spoglio", "vite", 52, 72, 1, 0) +
      anatra("legno", "legno", 82, 96, 0.8, -2.5)
    ) },
  ];

  var strato = null;

  function rem() { return parseFloat(getComputedStyle(de).fontSize) || 16; }

  /* ── Gli ingombri ───────────────────────────────────────────────────────
     Tutto quello che, nel contenuto, sporge oltre la colonna di lettura
     — a destra oltre la misura, a sinistra prima del suo inizio — con la
     fascia di altezze che occupa, in coordinate di pagina e con un po'
     d'aria attorno. Si guardano solo i blocchi (un <span> in mezzo alla
     prosa non sporge mai), e non ciò che è fisso: il tasto in basso a
     destra non sta in nessuna altezza in particolare. */
  var BLOCCHI = /^(DIV|SECTION|FIGURE|FIGCAPTION|TABLE|IMG|UL|OL|LI|PRE|BLOCKQUOTE|A|NAV|ASIDE|P|H[1-4]|BUTTON|svg|DL|DD|DT|FORM|IFRAME|VIDEO|PICTURE|ARTICLE|FOOTER|HEADER|SPAN|TD|TH|CANVAS)$/;
  var DISEGNO = /^(IMG|svg|VIDEO|IFRAME|PICTURE|TABLE|CANVAS)$/;
  /* Un contenitore largo quanto la fascia — .sb-container, una sezione —
     copre geometricamente tutto, ma non si vede: è aria. Conta solo chi
     si vede davvero: un'immagine, un fondo, un bordo, o del testo suo. */
  function siVede(el) {
    if (DISEGNO.test(el.tagName)) return true;
    var cs = getComputedStyle(el);
    if (cs.backgroundImage !== "none") return true;
    var bg = cs.backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) return true;
    if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0) return true;
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    }
    return false;
  }
  function ingombri(main, contSx, contDx, testoSx, testoDx, limiteDx) {
    var sx = [], dx = [];
    var y0 = window.pageYOffset || 0;
    var tutti = main.querySelectorAll("*");
    for (var i = 0; i < tutti.length; i++) {
      var el = tutti[i];
      if (!BLOCCHI.test(el.tagName)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 16) continue;
      var aDx = r.right > testoDx + 8 && r.left < limiteDx;
      var aSx = r.left < testoSx - 8 && r.right > 0;
      if (!aDx && !aSx) continue;
      if (el.closest(".sb-riv-rail")) continue;
      if (!siVede(el)) continue;
      if (getComputedStyle(el).position === "fixed") continue;
      var fascia = [r.top + y0 - 24, r.bottom + y0 + 24];
      if (aDx) dx.push(fascia);
      if (aSx) sx.push(fascia);
    }
    return { sx: sx, dx: dx };
  }
  /* Il fondo dell'ingombro che copre [top, bottom], o -1 se è libero. */
  function coperto(fasce, top, bottom) {
    var giu = -1;
    for (var i = 0; i < fasce.length; i++) {
      if (top < fasce[i][1] && bottom > fasce[i][0] && fasce[i][1] > giu) giu = fasce[i][1];
    }
    return giu;
  }

  /* ── Posare i quadri ────────────────────────────────────────────────────
     Tutto si misura sul documento com'è adesso: dove comincia e finisce il
     testo, se c'è l'indice a lato, quanto è alta la pagina, cosa sporge.
     Si rifà da capo a ogni cambio di larghezza e ogni volta che la pagina
     si allunga — le fotografie che arrivano, una sezione che si apre. */
  function posa() {
    if (strato && strato.parentNode) strato.parentNode.removeChild(strato);
    strato = null;

    var vw = window.innerWidth || 0;
    var vh = window.innerHeight || 800;
    if (vw < 1000) return;
    var main = document.querySelector(".sb-main");
    var cont = main && main.querySelector(".sb-container");
    if (!cont) return;
    var r = cont.getBoundingClientRect();
    var cs = getComputedStyle(cont);
    var testoSx = r.left + (parseFloat(cs.paddingLeft) || 0);
    var testoDx = testoSx + 46 * rem();
    var limiteDx = vw;
    var rail = document.querySelector(".sb-riv-rail");
    if (rail && getComputedStyle(rail).display !== "none") limiteDx = rail.getBoundingClientRect().left;
    var largo = { sx: testoSx - 36, dx: limiteDx - testoDx - 44 };
    if (largo.sx < 150 && largo.dx < 150) return;

    var H = host.offsetHeight || document.documentElement.scrollHeight;
    var occupato = ingombri(main, r.left, r.right, testoSx, testoDx, limiteDx);

    strato = document.createElement("div");
    strato.className = "sb-fiaba";
    strato.setAttribute("aria-hidden", "true");

    /* Uno ogni schermata scarsa, e il primo sotto la testata: la hero è
       già piena di suo. A destra e a sinistra alternati; il lato che non
       ha posto, o che a quell'altezza è occupato, passa la mano all'altro;
       se sono occupati tutti e due il quadro scende sotto l'ingombro. */
    var passo = Math.max(560, vh * 0.8);
    var y = Math.max(vh * 0.95, 700);
    var i = 0;
    var tentativi = 0;
    while (y < H - vh * 0.7 && i < 80 && tentativi < 400) {
      tentativi++;
      var q = QUADRI[i % QUADRI.length];
      var lato = i % 2 === 0 ? "dx" : "sx";
      var altro = lato === "dx" ? "sx" : "dx";
      var scelto = null;
      var giu = -1;
      var w, h, c;
      if (largo[lato] >= 150) {
        w = Math.min(q.w, largo[lato]); h = w;
        c = coperto(occupato[lato], y, y + h);
        if (c < 0) scelto = lato; else giu = c;
      }
      if (!scelto && largo[altro] >= 150) {
        w = Math.min(q.w, largo[altro]); h = w;
        c = coperto(occupato[altro], y, y + h);
        if (c < 0) scelto = altro; else giu = giu < 0 ? c : Math.min(giu, c);
      }
      if (!scelto) {
        /* Tutti e due occupati: si scende appena sotto l'ingombro più
           vicino e si riprova con lo stesso quadro. */
        y = (giu > y ? giu : y + 120) + 8;
        continue;
      }
      var div = document.createElement("div");
      div.className = "sb-fiaba-q sb-fiaba-q--" + q.n;
      div.style.setProperty("--qw", w + "px");
      div.style.top = Math.round(y) + "px";
      div.style.left = Math.round(scelto === "dx" ? testoDx + 44 + Math.max(0, (largo.dx - w) * 0.3) : Math.max(12, testoSx - 36 - w)) + "px";
      div.innerHTML = q.svg;
      strato.appendChild(div);
      y += passo;
      i++;
    }

    /* Dopo l'orizzonte e il cielo, prima delle foglie: a parità di livello
       vince chi viene dopo, e le foglie devono scendere davanti ai quadri.
       stagioni.js, quando rifà le foglie, sa cercare .sb-fiaba. */
    var prima = host.querySelector(":scope > .sb-stag-volo") || host.querySelector(":scope > .sb-stag-orizzonte");
    host.insertBefore(strato, prima ? prima.nextSibling : host.firstChild);
  }

  posa();

  var attesa = null;
  function riposa() {
    clearTimeout(attesa);
    attesa = setTimeout(posa, 180);
  }
  window.addEventListener("resize", riposa);
  window.addEventListener("load", riposa);
  /* La pagina cambia altezza quando arrivano le fotografie o si apre una
     tabella: l'osservatore lo vede e i quadri si ridistribuiscono. Lo
     strato stesso non va osservato — è alto quanto la pagina e cambierebbe
     con lei, chiamandosi da solo. */
  if (window.ResizeObserver) {
    var altezza = host.offsetHeight;
    new ResizeObserver(function () {
      if (host.offsetHeight !== altezza) { altezza = host.offsetHeight; riposa(); }
    }).observe(host);
  }
})();
