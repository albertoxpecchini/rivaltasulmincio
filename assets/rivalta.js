/* ═══════════════════════════════════════════════════════════════════════════
   Comportamenti del sito. Tre cose e basta, tutte reversibili senza JS:
   il tema, il bordo della nav allo scroll, il menu su schermo stretto.

   Quello che NON c'è, deliberatamente: reveal allo scroll, fade-in a cascata,
   contatori che partono quando la sezione entra in viewport. Scorrere una
   pagina non è un evento da annunciare — il contenuto compare e basta.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;

  /* ── Tema ────────────────────────────────────────────────────────────────
     Stessa regola di albertopecchini.it: se non c'è una scelta manuale, il
     tema lo decide l'ora (08:00–19:59 chiaro, il resto scuro). La scelta
     manuale vince e resta. Il calcolo iniziale sta inline nell'<head> di ogni
     pagina, PRIMA del primo paint: qui c'è solo l'interruttore. */
  var KEY_MODE = "rsm-theme-mode";
  var KEY_MANUAL = "rsm-theme-manual";
  var BG = { light: "#fcfcfc", dark: "#141414" };

  function currentTheme() {
    return de.classList.contains("dark") ? "dark" : "light";
  }

  function applyTheme(theme) {
    de.classList.toggle("dark", theme === "dark");
    de.setAttribute("data-rsm-theme", theme);
    de.style.setProperty("--ap-boot-bg", BG[theme]);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", BG[theme]);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"
      );
      var sun = btn.querySelector("[data-icon-sun]");
      var moon = btn.querySelector("[data-icon-moon]");
      if (sun) sun.style.display = theme === "dark" ? "" : "none";
      if (moon) moon.style.display = theme === "dark" ? "none" : "";
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY_MODE, "manual");
        localStorage.setItem(KEY_MANUAL, next);
      } catch (e) {}
      applyTheme(next);
    });
  });
  applyTheme(currentTheme());

  /* ── "Sei qui" ───────────────────────────────────────────────────────────
     L'evidenza della voce attiva la mette il JS confrontando gli href con la
     pagina aperta, invece di scriverla a mano in nove file: una voce
     rinominata in un posto solo non può più restare fuori sincrono. Senza JS
     si perde il filo verde sotto la voce, non la navigazione. */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".sb-nav-link, .sb-menu-nav a").forEach(function (a) {
    if ((a.getAttribute("href") || "").split("#")[0] === here) {
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
