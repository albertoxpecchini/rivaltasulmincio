/* ═══════════════════════════════════════════════════════════════════════════
   Comportamenti del sito. Tre cose e basta, tutte reversibili senza JS:
   la voce attiva, il bordo della nav allo scroll, il menu su schermo stretto.

   Il tema NON è più qui: sta in controlbar.js insieme al sensore orario e alla
   barra che li ospita. Averlo lasciato qui avrebbe voluto dire due padroni per
   la stessa classe su <html>.

   Quello che NON c'è, deliberatamente: reveal allo scroll, fade-in a cascata,
   contatori che partono quando la sezione entra in viewport. Scorrere una
   pagina non è un evento da annunciare — il contenuto compare e basta.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── "Sei qui" ───────────────────────────────────────────────────────────
     L'evidenza della voce attiva la mette il JS confrontando gli href con la
     pagina aperta, invece di scriverla a mano in nove file: una voce
     rinominata in un posto solo non può più restare fuori sincrono. Senza JS
     si perde il filo verde sotto la voce, non la navigazione.

     Confrontare le due stringhe così come sono non funziona: gli indirizzi
     pubblici non hanno estensione (/paese) ma il file su disco sì, e chi
     arriva da un vecchio link vede /paese.html finché il redirect non è
     scattato. Si riducono entrambi al nome della pagina — la home al posto
     vuoto — e poi si confrontano. */
  var pagina = function (u) {
    return (u || "")
      .split("#")[0]
      .split("?")[0]
      .replace(/^\.?\//, "")
      .replace(/\.html$/, "")
      .replace(/^index$/, "");
  };
  var here = pagina(location.pathname);
  document.querySelectorAll(".sb-nav-link, .sb-menu-nav a").forEach(function (a) {
    if (pagina(a.getAttribute("href")) === here) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* ── Bordo della nav ─────────────────────────────────────────────────────
     In cima alla pagina la nav non ha bordo: nessuna riga a tagliare la
     testata. Compare solo quando c'è del contenuto che le scorre sotto.
     rAF perché lo scroll non deve pagare un layout per frame. */
  var nav = document.querySelector(".sb-nav");
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle("sb-nav--scrolled", window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Menu su schermo stretto ─────────────────────────────────────────── */
  var burger = document.querySelector("[data-menu-toggle]");
  var sheet = document.getElementById("menu-sheet");
  if (burger && sheet) {
    var setOpen = function (open) {
      sheet.classList.toggle("sb-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    burger.addEventListener("click", function () {
      setOpen(!sheet.classList.contains("sb-open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("sb-open")) {
        setOpen(false);
        burger.focus();
      }
    });
    // Tornando al layout largo il foglio non deve restare "aperto" e riaprirsi
    // da solo la volta dopo che si stringe la finestra.
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1080) setOpen(false);
    });
  }

  /* ── Anno corrente nel footer ────────────────────────────────────────────
     Il © è l'anno di oggi, non quello della build: un sito fermo da dicembre
     non deve mostrare l'anno vecchio a gennaio. */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
