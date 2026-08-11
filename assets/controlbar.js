/* ═══════════════════════════════════════════════════════════════════════════
   BARRA DI CONTROLLO — tema, sensore orario, onda, prossimità.

   Portata da albertopecchini.it (theme/themeCore.ts + ThemeWidget.tsx +
   ControlBar.tsx). Lì sono tre moduli React con hook e stato; qui è un file
   solo e lo stato sta nel DOM, ma le regole sono le stesse identiche:

   · mode "auto"   → il tema lo decide l'orologio: 08:00–19:59 chiaro, il resto
                     scuro. Allo scoccare di 08:00 e 20:00 cambia DA SOLO, con
                     l'onda che parte un secondo prima — alle :59:59 — così il
                     cambio si vede arrivare senza che nessuno prema niente;
   · mode "manual" → vince il tasto, fino al confine orario successivo: lì il
                     sensore si riprende il comando. Non è una svista, è il
                     patto: "sempre e ovunque" vuol dire che il sito di notte è
                     scuro anche se stamattina qualcuno l'aveva schiarito.

   Il primo tema, prima del primo paint, lo calcola l'inline nell'<head> con
   queste stesse due chiavi: qui non si ricomincia da capo, si continua.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var de = document.documentElement;

  /* ── Preferenze ────────────────────────────────────────────────────────── */
  var KEY_MODE = "rsm-theme-mode";
  var KEY_MANUAL = "rsm-theme-manual";

  function get(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* storage negato: pazienza */ }
  }

  /* ── Il tema ───────────────────────────────────────────────────────────── */
  // Sono ESATTAMENTE i --sb-bg dei due blocchi di token in sb.css. Servono qui
  // perché li usano tre cose che il CSS non può raggiungere: lo sfondo del
  // primo paint, la <meta theme-color> della barra del browser e il colore
  // dell'onda. Se cambia --sb-bg, cambia qui.
  var BG = { light: "#fcfcfc", dark: "#141414" };
  var LIGHT_START_HOUR = 8;
  var LIGHT_END_HOUR = 20;

  function timeTheme(d) {
    var h = (d || new Date()).getHours();
    return h >= LIGHT_START_HOUR && h < LIGHT_END_HOUR ? "light" : "dark";
  }
  function isAuto() {
    return get(KEY_MODE) !== "manual";
  }
  function resolveTheme() {
    return isAuto() ? timeTheme() : (get(KEY_MANUAL) === "dark" ? "dark" : "light");
  }

  var corrente = null;
  function currentTheme() {
    return corrente || resolveTheme();
  }

  /** Scrive il tema. Nessuna animazione: quella è affare di transitionTo(). */
  function applyTheme(theme) {
    corrente = theme;
    de.classList.toggle("dark", theme === "dark");
    de.setAttribute("data-rsm-theme", theme);
    // Basta la custom property: in sb.css il fondo del body è var(--ap-boot-bg),
    // quindi scrivendo qui si tinge anche il body senza uno stile inline che
    // poi resterebbe a litigare con il foglio.
    de.style.setProperty("--ap-boot-bg", BG[theme]);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", BG[theme]);
    render();
  }

  function setManualTheme(theme) {
    set(KEY_MODE, "manual");
    set(KEY_MANUAL, theme);
  }
  function setAutoMode() {
    set(KEY_MODE, "auto");
  }

  /** Istante del prossimo confine (08:00 o 20:00) e tema che varrà da lì. */
  function nextBoundary(from) {
    from = from || new Date();
    for (var giorno = 0; giorno <= 1; giorno++) {
      for (var i = 0; i < 2; i++) {
        var b = new Date(from);
        b.setDate(from.getDate() + giorno);
        b.setHours(i === 0 ? LIGHT_START_HOUR : LIGHT_END_HOUR, 0, 0, 0);
        if (b.getTime() > from.getTime()) return { at: b.getTime(), theme: timeTheme(b) };
      }
    }
    var f = new Date(from);
    f.setHours(f.getHours() + 1, 0, 0, 0);
    return { at: f.getTime(), theme: timeTheme(f) };
  }

  /* ── L'onda ────────────────────────────────────────────────────────────────
     Un cerchio che si apre dal tasto premuto e copre lo schermo, già tinto del
     tema in ARRIVO; il tema vero si commuta a corsa quasi finita, sotto la
     copertura, e poi il velo si dissolve rivelando la pagina già cambiata.
     Cambiare i colori a vista, tutti insieme, è la cosa che fa sembrare rotto
     un sito che invece sta solo cambiando tema. */
  var WIPE_MS = 620;
  var velo = null;
  var animando = false;

  function ridotto() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  function transitionTo(next, origine) {
    if (next === currentTheme()) return applyTheme(next);
    // Senza velo, con meno movimento richiesto, o se un'onda è già in corso:
    // si cambia e basta. Due cerchi sovrapposti non sono un effetto migliore.
    if (!velo || ridotto() || animando) return applyTheme(next);

    animando = true;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var x = origine ? origine.x : w / 2;
    var y = origine ? origine.y : h / 2;
    // Raggio: l'angolo più lontano dall'origine, più un pelo. Meno di così e
    // in un angolo resterebbe una fetta di tema vecchio.
    var r = Math.sqrt(Math.pow(Math.max(x, w - x), 2) + Math.pow(Math.max(y, h - y), 2)) + 4;

    velo.style.background = BG[next];
    velo.style.transition = "none";
    velo.style.opacity = "1";
    velo.style.clipPath = "circle(0px at " + x + "px " + y + "px)";
    void velo.offsetWidth; // forza un reflow: la transizione deve partire da 0
    velo.style.transition = "clip-path " + WIPE_MS + "ms cubic-bezier(0.4, 0, 0.2, 1)";
    velo.style.clipPath = "circle(" + r + "px at " + x + "px " + y + "px)";

    setTimeout(function () { applyTheme(next); }, Math.round(WIPE_MS * 0.6));
    setTimeout(function () {
      velo.style.transition = "opacity 240ms ease";
      velo.style.opacity = "0";
    }, WIPE_MS);
    setTimeout(function () {
      velo.style.transition = "none";
      velo.style.clipPath = "circle(0px at " + x + "px " + y + "px)";
      animando = false;
    }, WIPE_MS + 280);
  }

  /* ── I due segmenti del tema ───────────────────────────────────────────── */
  var tastoTema = document.querySelector("[data-theme-toggle]");
  var tastoAuto = document.querySelector("[data-auto-toggle]");

  function centro(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /** Rimette a posto icone e stati. Chiamata a ogni cambio, da qualunque parte
      arrivi — tasto, sensore, o un'altra scheda. */
  function render() {
    var scuro = currentTheme() === "dark";
    if (tastoTema) {
      tastoTema.setAttribute("aria-label", scuro ? "Passa al tema chiaro" : "Passa al tema scuro");
      tastoTema.setAttribute("title", scuro ? "Tema chiaro" : "Tema scuro");
      var sole = tastoTema.querySelector("[data-icon-sun]");
      var luna = tastoTema.querySelector("[data-icon-moon]");
      if (sole) sole.style.display = scuro ? "" : "none";
      if (luna) luna.style.display = scuro ? "none" : "";
      // L'animazione dell'icona riparte solo se la classe viene ritolta e
      // rimessa con un reflow in mezzo.
      var ico = tastoTema.querySelector(".sb-ctl-ico");
      if (ico) {
        ico.classList.remove("sb-pop");
        void ico.offsetWidth;
        ico.classList.add("sb-pop");
      }
    }
    if (tastoAuto) {
      var auto = isAuto();
      tastoAuto.classList.toggle("is-on", auto);
      tastoAuto.setAttribute("aria-pressed", auto ? "true" : "false");
      tastoAuto.setAttribute(
        "title",
        auto ? "Sensore orario attivo (08–20 chiaro, resto scuro)" : "Riattiva il sensore orario"
      );
    }
  }

  if (tastoTema) {
    tastoTema.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      setManualTheme(next);
      transitionTo(next, centro(tastoTema));
    });
  }
  if (tastoAuto) {
    tastoAuto.addEventListener("click", function () {
      setAutoMode();
      var next = timeTheme();
      if (next !== currentTheme()) transitionTo(next, centro(tastoAuto));
      else render();
    });
  }

  /* ── Il sensore orario ─────────────────────────────────────────────────── */
  var preTimer = 0;
  var fireTimer = 0;

  function pianifica() {
    clearTimeout(preTimer);
    clearTimeout(fireTimer);

    var b = nextBoundary(new Date());
    var ora = Date.now();

    // Un secondo prima del confine: il sensore si riprende il comando e parte
    // l'onda. È il momento in cui il cambio "succede da solo".
    preTimer = setTimeout(function () {
      setAutoMode();
      if (b.theme !== currentTheme()) transitionTo(b.theme);
      else render();
    }, Math.max(0, b.at - 1000 - ora));

    // Rete di sicurezza al confine esatto: se per qualsiasi motivo l'onda non
    // è arrivata in fondo, il tema giusto lo mettiamo comunque.
    fireTimer = setTimeout(function () {
      if (currentTheme() !== b.theme) {
        setAutoMode();
        applyTheme(b.theme);
      }
      pianifica();
    }, Math.max(0, b.at - ora) + 50);
  }

  // I timer di una scheda in secondo piano vengono strozzati o sospesi: al
  // risveglio non ci si fida di loro, si riguarda l'orologio.
  function risveglio() {
    if (isAuto() && currentTheme() !== timeTheme()) applyTheme(timeTheme());
    pianifica();
  }
  document.addEventListener("visibilitychange", risveglio);
  window.addEventListener("focus", risveglio);

  /* ── La barra ──────────────────────────────────────────────────────────────
     Sta fuori dal bordo sinistro con la sola linguetta a vista, ed esce quando
     il puntatore le si avvicina. La zona di prossimità si misura sul
     contenitore, che non si muove mai: misurarla sulla barra che scivola
     vorrebbe dire inseguire un bersaglio che si sposta perché lo si è colpito. */
  var PROX = 130;   // px di avvicinamento perché esca
  var HIDE_MS = 620; // pausa prima di rientrare
  var HINT_MS = 2400; // all'avvio si mostra un attimo, così si sa che c'è

  var zona = document.querySelector(".sb-ctl");
  var slitta = zona && zona.querySelector(".sb-ctl-slide");
  var grip = zona && zona.querySelector(".sb-ctl-grip");
  var fissata = false;
  var hideTimer = 0;

  // Motivi per restare fuori: fissata a mano, il fuoco è dentro, il puntatore
  // ci sta sopra. Rientrare in uno di questi casi vuol dire sfilarsi da sotto
  // le dita di chi la sta usando.
  function occupata() {
    if (!slitta) return false;
    if (fissata) return true;
    if (slitta.contains(document.activeElement)) return true;
    try { return slitta.matches(":hover"); } catch (e) { return false; }
  }

  function mostra() {
    clearTimeout(hideTimer);
    if (zona) zona.classList.add("is-out");
    aggiornaGrip();
  }

  function nascondiFra(ms) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (occupata()) return nascondiFra(HIDE_MS);
      if (zona) zona.classList.remove("is-out");
      aggiornaGrip();
    }, ms === undefined ? HIDE_MS : ms);
  }

  function aggiornaGrip() {
    if (!grip || !zona) return;
    var fuori = zona.classList.contains("is-out");
    var testo = fuori ? "Nascondi le preferenze" : "Mostra le preferenze";
    grip.setAttribute("aria-label", testo);
    grip.setAttribute("title", testo);
    grip.setAttribute("aria-expanded", fuori ? "true" : "false");
    var sx = grip.querySelector("[data-icon-left]");
    var dx = grip.querySelector("[data-icon-right]");
    if (sx) sx.style.display = fuori ? "" : "none";
    if (dx) dx.style.display = fuori ? "none" : "";
  }

  if (zona && slitta) {
    var frame = 0;
    var px = 0;
    var py = 0;

    function controlla() {
      frame = 0;
      var r = zona.getBoundingClientRect();
      var vicino =
        px >= r.left - PROX && px <= r.right + PROX &&
        py >= r.top - PROX && py <= r.bottom + PROX;
      if (vicino) mostra();
      else if (!occupata()) nascondiFra();
    }

    window.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType === "touch") return; // sul touch comanda la linguetta
        px = e.clientX;
        py = e.clientY;
        if (!frame) frame = requestAnimationFrame(controlla);
      },
      { passive: true }
    );

    // Tastiera: entrando con il Tab la barra deve uscire da sé, o si darebbe il
    // fuoco a tre tasti invisibili.
    slitta.addEventListener("focusin", mostra);
    slitta.addEventListener("focusout", function () { nascondiFra(); });
    slitta.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "touch") mostra();
    });
    slitta.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "touch") nascondiFra();
    });

    // Toccare fuori la sfissa e la fa rientrare: sul touch è l'unico modo di
    // dire "ho finito".
    document.addEventListener("pointerdown", function (e) {
      if (slitta.contains(e.target)) return;
      fissata = false;
      nascondiFra(120);
    });

    if (grip) {
      grip.addEventListener("click", function () {
        if (zona.classList.contains("is-out") && fissata) {
          fissata = false;
          zona.classList.remove("is-out");
          aggiornaGrip();
          return;
        }
        fissata = true;
        mostra();
      });
    }

    velo = document.querySelector(".sb-theme-wipe");
    mostra();
    nascondiFra(HINT_MS);
  }

  /* ── Avvio ─────────────────────────────────────────────────────────────── */
  applyTheme(resolveTheme());
  pianifica();
})();
