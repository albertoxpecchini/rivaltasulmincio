/* ═══════════════════════════════════════════════════════════════════════════
   Aperto adesso, o chiuso.

   Il build scrive accanto a ogni orario la riga leggibile — «ma–do
   19:00–22:30» — e ci lascia attaccata la stringa originale in sintassi
   OpenStreetMap. Qui la si legge e si risponde all'unica domanda che uno si
   fa davvero prima di uscire di casa: adesso è aperto?

   Il conto si fa nel browser, sull'ora di chi guarda, e non nel build: un
   «aperto» stampato dentro l'HTML sarebbe vero solo nell'istante in cui il
   sito è stato pubblicato, e falso tutte le altre ore del giorno.

   Se una stringa non si capisce, il pallino non compare: resta la riga degli
   orari, che è quello che c'era prima. Meglio non dire niente che dire
   «aperto» a chi poi trova la porta chiusa.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var GG = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  var NOMI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];

  var minuti = function (hhmm) {
    var p = hhmm.split(":");
    return +p[0] * 60 + +p[1];
  };

  var orologio = function (m) {
    m = ((m % 1440) + 1440) % 1440;
    return (m < 600 ? "0" : "") + Math.floor(m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60);
  };

  /* «Tu-Su», «Sa,Su», «Mo» → gli indici dei giorni, lunedì = 0. */
  var giorniDi = function (spec) {
    var out = [];
    spec.split(",").forEach(function (pezzo) {
      var estremi = pezzo.trim().split("-");
      var i = GG.indexOf(estremi[0]);
      if (i < 0) throw new Error("giorno");
      if (estremi.length === 1) {
        out.push(i);
        return;
      }
      var j = GG.indexOf(estremi[1]);
      if (j < 0) throw new Error("giorno");
      for (var k = i; ; k = (k + 1) % 7) {
        out.push(k);
        if (k === j) break;
      }
    });
    return out;
  };

  /* La settimana in sette caselle, ognuna con le sue fasce in minuti dalla
     mezzanotte. Una fascia che scavalca la mezzanotte si spezza in due: la
     coda finisce nel giorno dopo, o alle 00:30 di sabato il locale
     risulterebbe chiuso mentre è ancora pieno. */
  var settimana = function (oh) {
    var g = [[], [], [], [], [], [], []];
    if (oh.trim() === "24/7") {
      for (var i = 0; i < 7; i++) g[i].push([0, 1440]);
      return g;
    }
    oh.split(";").forEach(function (regola) {
      var m = /^\s*([A-Za-z,\-\s]+?)\s+([\d:,\-\s]+)\s*$/.exec(regola);
      if (!m) throw new Error("regola");
      var gg = giorniDi(m[1].trim());
      m[2].split(",").forEach(function (fascia) {
        var t = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(fascia);
        if (!t) throw new Error("fascia");
        var da = minuti(t[1]);
        var a = minuti(t[2]);
        if (a <= da) a += 1440;
        gg.forEach(function (d) {
          if (a <= 1440) {
            g[d].push([da, a]);
          } else {
            g[d].push([da, 1440]);
            g[(d + 1) % 7].push([0, a - 1440]);
          }
        });
      });
    });
    return g;
  };

  var stato = function (g, adesso) {
    var giorno = (adesso.getDay() + 6) % 7; // JS parte dalla domenica, noi dal lunedì
    var ora = adesso.getHours() * 60 + adesso.getMinutes();

    for (var i = 0; i < g[giorno].length; i++) {
      if (g[giorno][i][0] <= ora && ora < g[giorno][i][1]) {
        return { aperto: true, fino: g[giorno][i][1], sempre: g[giorno][i][0] === 0 && g[giorno][i][1] >= 1440 };
      }
    }

    // Chiuso: la prossima apertura è la prima fascia che comincia dopo adesso,
    // cercata da oggi in avanti per una settimana intera.
    for (var d = 0; d < 8; d++) {
      var q = (giorno + d) % 7;
      var candidate = g[q]
        .map(function (f) { return f[0]; })
        .filter(function (s) { return d > 0 || s > ora; })
        .sort(function (a, b) { return a - b; });
      if (candidate.length) return { aperto: false, fra: d, alle: candidate[0], giorno: q };
    }
    return null;
  };

  var frase = function (s) {
    if (!s) return null;
    if (s.aperto) {
      if (s.sempre) return "Aperto ora";
      // Le 24:00 in sintassi OSM sono la mezzanotte di stanotte: scriverlo
      // così evita il «chiude alle 00:00» che si legge come stamattina.
      if (s.fino >= 1440) return "Aperto ora · chiude a mezzanotte";
      return "Aperto ora · chiude alle " + orologio(s.fino);
    }
    var quando =
      s.fra === 0 ? "oggi" :
      s.fra === 1 ? "domani" :
      NOMI[s.giorno];
    return "Chiuso · apre " + quando + " alle " + orologio(s.alle);
  };

  var caselle = [].slice.call(document.querySelectorAll(".sb-riv-ap[data-oh]"));
  if (!caselle.length) return;

  var pronte = [];
  caselle.forEach(function (el) {
    var tabella;
    try {
      tabella = settimana(el.getAttribute("data-oh") || "");
    } catch (e) {
      return; // orario che non si capisce: resta solo la riga scritta
    }
    var box = el.querySelector(".sb-riv-ap-stato");
    if (box) pronte.push({ box: box, gruppo: el, tabella: tabella });
  });

  var aggiorna = function () {
    var adesso = new Date();
    pronte.forEach(function (p) {
      var s = stato(p.tabella, adesso);
      var testo = frase(s);
      if (!testo) return;
      p.box.className = "sb-riv-ap-stato" + (s.aperto ? " sb-riv-ap-stato--aperto" : "");
      p.box.textContent = testo;
      p.box.hidden = false;
      // Da qui in poi la riga è «Aperto ora · ma–do 19:00–22:30»: il punto lo
      // mette il foglio di stile, e solo adesso che c'è qualcosa da separare.
      p.gruppo.classList.add("sb-riv-ap--vivo");
    });
  };

  aggiorna();
  // Una pagina lasciata aperta deve girare da sé quando il locale chiude.
  setInterval(aggiorna, 60000);
})();
