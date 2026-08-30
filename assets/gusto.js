/* ═══════════════════════════════════════════════════════════════════════════
   I tasti delle voglie di /mangiare.

   La pagina esce dal build già intera: tutte le schede sono nel documento, e
   chi non ha JavaScript le legge tutte. Questo file fa una cosa sola —
   nascondere quelle che non rispondono alla voglia scelta — e la fa in modo
   reversibile: il tasto «Tutto» rimette la pagina com'era.

   Niente animazioni d'ingresso: una scheda che compare per un filtro non è un
   evento da annunciare, come non lo è scorrere.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var radice = document.querySelector(".sb-riv-mang");
  if (!radice) return;

  var tasti = [].slice.call(radice.querySelectorAll(".sb-riv-mang-voglia"));
  var piatti = [].slice.call(radice.querySelectorAll(".sb-riv-mang-piatto"));
  var conteggio = document.getElementById("mang-conteggio");
  if (!tasti.length || !piatti.length) return;

  /* Il conteggio scritto dal build dice anche che senza JavaScript i tasti non
     filtrano. Se siamo qui, JavaScript c'è: quella riga può diventare la
     risposta al filtro, e va letta ad alta voce quando cambia. */
  if (conteggio) conteggio.setAttribute("aria-live", "polite");

  var plurale = function (n, uno, molti) {
    return n + " " + (n === 1 ? uno : molti);
  };

  var mostra = function (voglia) {
    var visti = 0;
    var locali = {};
    piatti.forEach(function (p) {
      var sue = (p.getAttribute("data-voglie") || "").split(" ");
      var dentro = voglia === "tutto" || sue.indexOf(voglia) !== -1;
      p.hidden = !dentro;
      if (!dentro) return;
      visti++;
      [].forEach.call(p.querySelectorAll(".sb-riv-mang-locale-t strong"), function (s) {
        locali[s.textContent] = true;
      });
    });

    tasti.forEach(function (t) {
      t.setAttribute("aria-pressed", t.getAttribute("data-voglia") === voglia ? "true" : "false");
    });

    if (conteggio) {
      conteggio.textContent =
        plurale(visti, "cosa da mangiare", "cose da mangiare") +
        ", in " +
        plurale(Object.keys(locali).length, "locale", "locali") +
        ".";
    }
  };

  var vale = function (voglia) {
    return (
      voglia === "tutto" ||
      tasti.some(function (t) {
        return t.getAttribute("data-voglia") === voglia;
      })
    );
  };

  tasti.forEach(function (t) {
    t.addEventListener("click", function () {
      var voglia = t.getAttribute("data-voglia");
      mostra(voglia);
      /* L'indirizzo tiene la scelta, così una voglia si può mandare a
         qualcuno: /mangiare#voglia-pesce. replaceState e non un hash scritto
         a mano, o il browser salterebbe al tasto a ogni click. */
      try {
        history.replaceState(null, "", voglia === "tutto" ? location.pathname : "#voglia-" + voglia);
      } catch (e) {}
    });
  });

  /* All'apertura: #voglia-<id> sceglie il filtro, qualsiasi altro frammento
     (il collegamento diretto a un piatto) lascia la pagina intera, o si
     atterrerebbe su una scheda nascosta. */
  var frammento = (location.hash || "").replace(/^#/, "");
  if (frammento.indexOf("voglia-") === 0 && vale(frammento.slice(7))) {
    mostra(frammento.slice(7));
  } else {
    mostra("tutto");
  }
})();
