/* ═══════════════════════════════════════════════════════════════════════════
   Comportamenti del sito, tutti reversibili senza JS: la voce attiva, il
   bordo della nav allo scroll, il menu su schermo stretto, il § che copia
   il collegamento a un titolo e il tasto per tornare in cima.

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
     pagina aperta, invece di scriverla a mano in quattordici file: una voce
     rinominata in un posto solo non può più restare fuori sincrono. Senza JS
     si perde il filo azzurro sotto la voce, non la navigazione.

     Confrontare le due stringhe così come sono non funziona: gli indirizzi
     pubblici non hanno estensione (/paese) ma il file su disco sì, e chi
     arriva da un vecchio link vede /paese.html finché il redirect non è
     scattato. Si riducono entrambi al nome della pagina — la home al posto
     vuoto — e poi si confrontano.

     Da quando in barra ci sono cinque tendine invece di tredici link, la
     voce da segnare non è più quella premuta: è il TASTO del gruppo che la
     contiene. Il tasto non ha un href da confrontare, quindi lo si trova
     risalendo dal link che ha vinto. */
  var pagina = function (u) {
    return (u || "")
      .split("#")[0]
      .split("?")[0]
      .replace(/^\.?\//, "")
      .replace(/\.html$/, "")
      .replace(/^index$/, "");
  };
  var here = pagina(location.pathname);
  document.querySelectorAll(".sb-riv-tendina a, .sb-menu-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    // Un indirizzo con l'ancora dentro (/#fatto-da) punta a un pezzo di
    // pagina, non a una pagina: sulla home segnerebbe "sei qui" a una voce
    // che porta da un'altra parte.
    if (href.indexOf("#") >= 0) return;
    if (pagina(href) !== here) return;
    a.setAttribute("aria-current", "page");
    var gruppo = a.closest(".sb-riv-nav-item");
    var tasto = gruppo && gruppo.querySelector(".sb-riv-nav-trigger");
    if (tasto) tasto.setAttribute("data-attiva", "");
  });

  /* ── Bordo della nav ─────────────────────────────────────────────────────
     In cima alla pagina la nav non ha bordo: nessuna riga a tagliare la
     testata. Compare solo quando c'è del contenuto che le scorre sotto.
     rAF perché lo scroll non deve pagare un layout per frame. */
  var tastoSu = document.querySelector("[data-top]");
  var nav = document.querySelector(".sb-nav");
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle("sb-nav--scrolled", window.scrollY > 8);
        // Il tasto per tornare in cima vive sulla stessa domanda: si
        // accende dopo due schermate, quando risalire a mano comincia a
        // costare.
        if (tastoSu) tastoSu.classList.toggle("sb-riv-top--visibile", window.scrollY > window.innerHeight * 1.5);
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
      if (window.innerWidth >= 1180) setOpen(false);
    });
  }

  /* ── Anno corrente nel footer ────────────────────────────────────────────
     Il © è l'anno di oggi, non quello della build: un sito fermo da dicembre
     non deve mostrare l'anno vecchio a gennaio. */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ── "Aggiornato" in forma relativa ─────────────────────────────────────
     La data esatta dell'ultimo commit è già scritta nel DOM dal build (ed è
     quella che resta a chi ha JavaScript spento). Qui, se c'è JS, diventa
     "oggi" / "ieri" / "3 giorni fa": in testata è più corta e dice subito se
     il sito è fresco. La data per esteso si sposta nel title. */
  document.querySelectorAll("time[data-updated]").forEach(function (el) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(el.getAttribute("data-updated") || "");
    if (!m) return;
    var quando = new Date(+m[1], +m[2] - 1, +m[3]);
    var oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    var giorni = Math.round((oggi - quando) / 86400000);
    var rel =
      giorni <= 0 ? "oggi" :
      giorni === 1 ? "ieri" :
      giorni < 7 ? giorni + " giorni fa" :
      giorni < 14 ? "una settimana fa" :
      giorni < 60 ? Math.round(giorni / 7) + " settimane fa" :
      null;
    if (!rel) return;
    if (!el.title) el.title = el.textContent.trim();
    el.textContent = rel;
  });

  /* ── Il § accanto ai titoli ───────────────────────────────────────────────
     Le pagine sono lunghe e finora l'unica cosa condivisibile era la pagina
     intera. Ogni titolo si porta dietro un § che è due cose insieme: un
     collegamento vero (ci si clicca, la barra dell'indirizzo cambia) e, se il
     browser lo permette, l'indirizzo copiato negli appunti.

     Gli id non li inventa qui: li scrive il build. Un'ancora che esiste solo
     dove il JavaScript è arrivato si romperebbe proprio nel momento che
     conta, cioè quando il collegamento viene aperto da qualcun altro. */
  var main = document.getElementById("main");
  if (main) {
    main.querySelectorAll("h2, h3").forEach(function (h) {
      // L'h2 non ha un id suo: il suo bersaglio è la sezione che lo contiene,
      // che ce l'ha già. Due ancore a un dito di distanza sarebbero due
      // indirizzi per lo stesso posto.
      // L'h3 vale solo con un id suo — glielo scrive il build, e dove non
      // gliel'ha scritto è perché lì un'ancora non la vogliamo. L'h2 invece
      // eredita il bersaglio della sezione che lo contiene.
      var sezione = h.closest("section[id]");
      var id = h.id || (h.tagName === "H2" && sezione ? sezione.id : "");
      if (!id) return;

      var a = document.createElement("a");
      a.className = "sb-riv-anchor";
      a.href = "#" + id;
      a.textContent = "§";
      // L'etichetta dice cosa fa di sicuro — portare lì. Copiare è il di più
      // che il browser concede o no, e prometterlo in un aria-label
      // vorrebbe dire mentire dove il clipboard non c'è.
      a.setAttribute("aria-label", "Collegamento a « " + (h.textContent || "").trim() + " »");

      a.addEventListener("click", function () {
        // Niente preventDefault: il salto e l'indirizzo nella barra sono il
        // comportamento normale di un collegamento, e devono restare anche
        // se copiare fallisce.
        var url = location.origin + location.pathname + "#" + id;
        if (!navigator.clipboard || !navigator.clipboard.writeText) return;
        navigator.clipboard.writeText(url).then(function () {
          a.classList.add("sb-riv-anchor--fatto");
          setTimeout(function () { a.classList.remove("sb-riv-anchor--fatto"); }, 1400);
        }, function () {});
      });

      h.appendChild(a);
    });
  }

  /* ── Torna in cima ────────────────────────────────────────────────────────
     Compare solo dopo un paio di schermate: in cima alla pagina un tasto per
     tornare in cima è arredamento. Lo scorrimento è morbido, ma non per chi
     ha chiesto di fermare il movimento — lì è un salto secco.

     Dopo il salto il fuoco va sul marchio in testata: chi naviga da tastiera
     deve ripartire da lì, non dal punto della pagina che ha appena lasciato. */
  if (tastoSu) {
    tastoSu.addEventListener("click", function () {
      var fermo =
        document.documentElement.classList.contains("rsm-still") ||
        (!document.documentElement.classList.contains("rsm-motion") &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      window.scrollTo({ top: 0, behavior: fermo ? "auto" : "smooth" });
      var marchio = document.querySelector(".sb-nav-brand");
      if (marchio) marchio.focus({ preventScroll: true });
    });
  }


  /* ── Le tendine della barra ───────────────────────────────────────────────
     Aprirle è compito del CSS: :hover e :focus-within bastano, e bastano
     anche senza JavaScript — chi arriva con gli script spenti trova le
     tendine funzionanti, che è il motivo per cui non sono fatte in JS.

     Qui si aggiunge quello che il CSS non sa fare:
       · il clic, per chi ha un dito e non un puntatore;
       · Esc, che chiude e riporta il fuoco sul tasto;
       · il clic fuori, che chiude tutto;
       · aria-expanded tenuto in fase con quello che si vede davvero, anche
         quando ad aprire è stato il passaggio del mouse. */
  var gruppi = [].slice.call(document.querySelectorAll(".sb-riv-nav-item"));
  if (gruppi.length) {
    var chiudiTutte = function (tranne) {
      gruppi.forEach(function (g) {
        if (g === tranne) return;
        g.classList.remove("sb-open");
        var t = g.querySelector(".sb-riv-nav-trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    };

    gruppi.forEach(function (g) {
      var tasto = g.querySelector("[data-tendina]");
      if (!tasto) return;
      var segna = function (aperta) {
        tasto.setAttribute("aria-expanded", aperta ? "true" : "false");
      };

      tasto.addEventListener("click", function (e) {
        e.stopPropagation();
        var era = g.classList.contains("sb-open");
        chiudiTutte(g);
        g.classList.toggle("sb-open", !era);
        segna(!era);
      });

      // Il mouse e il fuoco aprono da soli (è CSS): qui si scrive solo che è
      // successo, o un lettore di schermo annuncerebbe «chiusa» una tendina
      // aperta sotto agli occhi di tutti.
      g.addEventListener("mouseenter", function () { segna(true); });
      g.addEventListener("mouseleave", function () {
        if (!g.classList.contains("sb-open")) segna(false);
      });
      g.addEventListener("focusin", function () { segna(true); });
      g.addEventListener("focusout", function (e) {
        if (g.contains(e.relatedTarget)) return;
        if (!g.classList.contains("sb-open")) segna(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".sb-riv-nav-item")) return;
      chiudiTutte();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var aperta = document.querySelector(".sb-riv-nav-item.sb-open");
      if (!aperta) return;
      chiudiTutte();
      var t = aperta.querySelector(".sb-riv-nav-trigger");
      if (t) t.focus();
    });
  }

})();
