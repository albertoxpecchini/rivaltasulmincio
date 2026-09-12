/* ── Il paese disegnato a caratteri ───────────────────────────────────────
   In testata alla home: Rivalta vista dall'acqua — i pioppi verso le valli,
   la torre del castello, il corpo del castello, le case del borgo che
   digradano, e il Mincio davanti con dentro il riflesso — disegnata con i
   segni che una tastiera ha già.

   Non è un'immagine e non è un <canvas>: è una griglia di lettere che si
   riscrive sessanta volte al secondo. Restano lettere, quindi si selezionano,
   si copiano, scalano col resto del testo e non pesano niente da scaricare.

   COME NASCE IL MOVIMENTO. Ogni cella ha un valore da 0 a 1 — quanto è piena
   — e da quel valore si sceglie il carattere su una rampa che va dal più
   rado al più fitto:

       . , : ; * % 8 & # @

   I caratteri non si spostano mai: cambia il valore sotto, e quindi il segno
   che lo rappresenta. È il motivo per cui sembra che sia la materia a
   muoversi, l'acqua a scorrere, e non un disegno a scivolare di lato.

   CHI NON VUOLE MOVIMENTO. prefers-reduced-motion, o il tasto «ferma il
   movimento» del sito (html.rsm-still): il disegno si compone una volta e
   resta fermo. Il profilo del paese si legge uguale, semplicemente non
   respira, e non parte nessun ciclo. */

(function () {
  "use strict";

  var nodo = document.querySelector("[data-ascii-paese]");
  if (!nodo) return;

  /* La rampa. Conta l'ordine — dal segno che lascia meno inchiostro a quello
     che ne lascia di più — non quali caratteri siano: l'occhio legge la
     densità, non il disegno della singola lettera. */
  var RAMPA = " .,:;*%8&#@";

  var COL = 96;
  var RIG = 22;

  /* Una gobba morbida: centro «c», larghezza «w», altezza «a». Tutto il
     profilo è fatto di queste — campane sommate, mai rettangoli, perché un
     rettangolo in ASCII si vede che è un rettangolo. */
  function gobba(x, c, w, a) {
    var d = (x - c) / w;
    return a * Math.exp(-d * d);
  }

  /* Un blocco squadrato con gli angoli appena ammorbiditi: serve al castello,
     che è l'unica cosa nel profilo che DEVE leggersi come costruita e non
     come cresciuta. */
  function blocco(x, da, a, alt) {
    if (x < da || x > a) return 0;
    var b = Math.min(x - da, a - x);
    return alt * Math.min(1, b / 0.012);
  }

  /* ── Il profilo di Rivalta ───────────────────────────────────────────────
     Data una x da 0 a 1, quanto è alto il paese lì (0 = pelo dell'acqua,
     1 = cima del blocco). Da sinistra: le valli con i pioppi, poi il
     castello con la sua torre, poi il borgo che digrada verso destra. */
  function profilo(x) {
    var h = 0.012; // la riva: un filo, non una fascia

    /* Le valli, a sinistra: canneto basso e irregolare. */
    h = Math.max(h, gobba(x, 0.05, 0.05, 0.13));
    h = Math.max(h, gobba(x, 0.14, 0.06, 0.11));

    /* I pioppi: sottili, alti, in fila sfalsata. Sono la firma del paesaggio
       delle valli del Mincio — senza, la sinistra è un campo vuoto. */
    h = Math.max(h, gobba(x, 0.085, 0.014, 0.50));
    h = Math.max(h, gobba(x, 0.125, 0.012, 0.41));
    h = Math.max(h, gobba(x, 0.165, 0.013, 0.47));
    h = Math.max(h, gobba(x, 0.205, 0.011, 0.36));

    /* IL CASTELLO. Il corpo squadrato, e la torre che è la cosa più alta di
       Rivalta: si vede da fuori paese prima di ogni altra cosa, e qui deve
       essere la prima che si riconosce. */
    h = Math.max(h, blocco(x, 0.30, 0.44, 0.52));   // il corpo
    h = Math.max(h, blocco(x, 0.325, 0.355, 0.82)); // la torre
    h = Math.max(h, blocco(x, 0.415, 0.435, 0.62)); // il torrino d'angolo

    /* IL BORGO. Le case in fila che scendono verso destra: tetti a due
       spioventi, sempre più bassi man mano che il paese finisce. */
    h = Math.max(h, blocco(x, 0.47, 0.53, 0.34));
    h = Math.max(h, gobba(x, 0.50, 0.028, 0.40));   // il tetto
    h = Math.max(h, blocco(x, 0.55, 0.61, 0.29));
    h = Math.max(h, gobba(x, 0.58, 0.026, 0.35));
    h = Math.max(h, blocco(x, 0.63, 0.69, 0.25));
    h = Math.max(h, gobba(x, 0.66, 0.024, 0.30));

    /* Il campanile, dietro le case: più alto dei tetti, più magro. */
    h = Math.max(h, blocco(x, 0.715, 0.735, 0.58));

    /* La coda del paese: le ultime case, poi gli alberi e la campagna. */
    h = Math.max(h, blocco(x, 0.76, 0.81, 0.21));
    h = Math.max(h, gobba(x, 0.86, 0.035, 0.24));
    h = Math.max(h, gobba(x, 0.93, 0.030, 0.19));
    h = Math.max(h, gobba(x, 0.975, 0.025, 0.15));

    return h;
  }

  /* ── Quanto è piena una cella ────────────────────────────────────────────
     x, y da 0 a 1 (y = 0 in alto), t in secondi. Torna 0–1.

     Le tre fasce sono scelte così: poco cielo, perché il cielo vuoto è spazio
     sprecato in un blocco alto venti righe; il paese al centro, che è il
     soggetto; e sotto il fiume, che è la metà che si muove di più. */
  function densita(x, y, t) {
    var v = 0;
    var ACQUA = 0.62;               // il pelo dell'acqua
    var alt = profilo(x);
    var suolo = ACQUA - alt * ACQUA; // dove comincia la sagoma

    if (y > ACQUA) {
      /* IL MINCIO. Tre onde con passo e velocità diversi: una sola sarebbe un
         pettine che si ripete, tre insieme non tornano mai in fase e l'acqua
         non si ripete. Più in basso è più densa — è più vicina a chi guarda. */
      var prof = (y - ACQUA) / (1 - ACQUA);
      v += 0.26 + 0.40 * prof;
      v += 0.17 * Math.sin(x * 26 - t * 1.9 + y * 3);
      v += 0.12 * Math.sin(x * 11 + t * 1.1 - y * 6);
      v += 0.07 * Math.sin(x * 47 - t * 2.7);

      /* IL RIFLESSO. Il paese rovesciato nell'acqua, ma spostato da un'onda:
         un riflesso che sta fermo mentre l'acqua si muove è la cosa che più
         fa sembrare finto un disegno d'acqua. Si sfalda scendendo, perché
         più lontano dalla riva l'increspatura lo rompe. */
      var sposta = 0.018 * Math.sin(t * 1.1 + y * 9);
      var rifl = profilo(x + sposta);
      v += rifl * 0.75 * (1 - prof) * (1 - prof);

    } else if (y > suolo) {
      /* IL PAESE. Pieno e scuro, con una grana lentissima addosso: una
         campitura uniforme sembrerebbe una macchia, questa sembra muratura.
         Il bordo alto è sfumato di mezza riga, così la sagoma non ha il
         gradino della griglia. */
      var dentro = (y - suolo) / Math.max(0.001, ACQUA - suolo);
      /* Quanto e alto qui: una riva alta due centesimi non puo avere la
         stessa densita della torre, o il fondo del disegno diventa una
         fascia nera continua da un bordo all altro. */
      var corpo = Math.min(1, alt / 0.22);
      v += (0.30 + 0.62 * corpo) + 0.22 * dentro * corpo;
      v += 0.09 * Math.sin(x * 34 + t * 0.4);
      v += 0.07 * Math.sin(y * 30 - t * 0.3 + x * 15);

    } else {
      /* IL CIELO. Quasi vuoto — deve esserlo, o il paese non stacca — ma non
         del tutto: una foschia che si addensa vicino all'orizzonte e si dirada
         salendo, e che si muove piano. Senza, la parte alta è un buco bianco
         e il disegno sembra incollato sulla pagina invece che esserci dentro. */
      var q = (suolo - y) / Math.max(0.001, suolo);
      v += 0.13 * (1 - q) * (1 - q) * (1 - q);
      v += 0.055 * Math.sin(x * 5 + t * 0.25);
      v += 0.04 * Math.sin(x * 8.5 - t * 0.17 + y * 4);
      v -= 0.055;
    }

    return v;
  }

  /* ── Il disegno ──────────────────────────────────────────────────────────
     Una stringa sola, assegnata una volta per fotogramma. Toccare il DOM una
     volta invece di duemila è la differenza fra un'animazione e una ventola
     che parte. */
  function disegna(t) {
    var out = "";
    for (var r = 0; r < RIG; r++) {
      var y = r / (RIG - 1);
      for (var c = 0; c < COL; c++) {
        var d = densita(c / (COL - 1), y, t);
        if (d < 0) d = 0; else if (d > 1) d = 1;
        out += RAMPA.charAt(Math.round(d * (RAMPA.length - 1)));
      }
      if (r < RIG - 1) out += "\n";
    }
    nodo.textContent = out;
  }

  /* Le colonne si prendono dalla larghezza vera del blocco, misurando quanto
     è largo un carattere del monospaziato. Sotto le 44 colonne la torre e il
     campanile diventano lo stesso segno e il profilo non si legge più: lì si
     tiene 44 e si lascia che il CSS rimpicciolisca il corpo. */
  function misura() {
    var prova = document.createElement("span");
    prova.textContent = "00000000000000000000";
    prova.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:inherit";
    nodo.appendChild(prova);
    var w = (prova.getBoundingClientRect().width || 80) / 20;
    nodo.removeChild(prova);

    var largo = nodo.clientWidth || 600;
    COL = Math.max(44, Math.min(150, Math.floor(largo / w)));
    /* L'altezza segue la larghezza, o su un monitor largo il blocco
       diventerebbe una striscia e su un telefono un quadrato. */
    RIG = Math.max(14, Math.min(24, Math.round(COL * 0.23)));
  }

  function fermo() {
    var d = document.documentElement;
    if (d.classList.contains("rsm-motion")) return false;
    if (d.classList.contains("rsm-still")) return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var giro = null, avvio = 0, visibile = true;

  function ciclo(ora) {
    if (!avvio) avvio = ora;
    disegna((ora - avvio) / 1000);
    giro = requestAnimationFrame(ciclo);
  }

  function ferma() {
    if (giro) { cancelAnimationFrame(giro); giro = null; }
  }

  function parti() {
    ferma();
    misura();
    if (fermo()) { disegna(0); return; }
    if (!visibile) { disegna(0); return; }
    avvio = 0;
    giro = requestAnimationFrame(ciclo);
  }

  /* Fuori dallo schermo non si disegna: chi ha già fatto scorrere la pagina
     oltre la testata non deve pagare un fotogramma al sessantesimo per
     qualcosa che non sta guardando. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        visibile = v.isIntersecting;
        if (visibile) { if (!giro) parti(); } else ferma();
      });
    }, { rootMargin: "150px" }).observe(nodo);
  }

  /* Stessa cosa con la scheda in secondo piano. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) ferma(); else if (visibile) parti();
  });

  var attesa;
  window.addEventListener("resize", function () {
    clearTimeout(attesa);
    attesa = setTimeout(parti, 160);
  });

  /* Il tasto «movimento» della barra cambia una classe su <html>: si guarda
     quella e si riparte o ci si ferma di conseguenza. */
  if ("MutationObserver" in window) {
    new MutationObserver(parti).observe(document.documentElement, {
      attributes: true, attributeFilter: ["class"]
    });
  }

  parti();
})();
