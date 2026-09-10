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
    // da solo la volta dopo che si stringe la finestra. La misura è la stessa
    // a cui il CSS fa comparire la fila di voci e sparire l'hamburger: era
    // 1180, che non corrispondeva più a niente da quando le voci in barra
    // sono cinque e la soglia è scesa a 1024.
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) setOpen(false);
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


  /* ── Dove sono, su una pagina lunga ──────────────────────────────────────
     /paese sono settecento righe e sette sezioni: l'indice sta in cima, e da
     lì in poi non serve più a niente perché non si vede più.

     Da qui in avanti tre superfici dicono la stessa cosa, tutte alimentate da
     un elenco solo — le pillole dell'indice, che il build scrive e che ci
     sono anche a script spenti:
       · le pillole stesse, segnate mentre si scorre;
       · la colonna a lato (.sb-riv-rail), che su schermo largo sta ferma
         accanto al testo;
       · una scheda che si apre dal tasto in basso, che su telefono è l'unico
         posto dove un indice non costa spazio a nessuno.

     Questo NON è un «reveal allo scroll», che questo sito rifiuta e continua
     a rifiutare: non compare e non svanisce niente: si sposta un segno su una
     voce. È orientamento, non annuncio. */
  var pillole = [].slice.call(document.querySelectorAll(".sb-riv-toc a"));

  if (pillole.length > 2) {
    var voci = pillole
      .map(function (a) {
        var id = (a.getAttribute("href") || "").slice(1);
        return { id: id, nome: a.textContent, sez: document.getElementById(id), eco: [a] };
      })
      .filter(function (v) {
        return v.sez;
      });

    // La colonna a lato è una copia scritta dal build: si aggancia alle stesse
    // voci invece di tenere un secondo elenco che può divergere.
    [].forEach.call(document.querySelectorAll(".sb-riv-rail-nav a"), function (a) {
      var href = a.getAttribute("href") || "";
      voci.forEach(function (v) {
        if (href === "#" + v.id) v.eco.push(a);
      });
    });

    /* ── La scheda su schermo stretto ─────────────────────────────────────
       Si costruisce qui e non nel frammento perché senza JavaScript non si
       aprirebbe: un tasto che non fa niente è peggio di un tasto che non c'è.
       Il suo contenuto è lo stesso elenco, non una terza copia. */
    var wrap = document.querySelector(".sb-riv-top-wrap");
    var apri = null;
    var scheda = null;

    if (wrap && tastoSu) {
      apri = document.createElement("button");
      apri.type = "button";
      apri.className = "sb-riv-top sb-riv-ind-apri";
      apri.setAttribute("aria-label", "Sezioni di questa pagina");
      apri.setAttribute("aria-expanded", "false");
      apri.title = "Sezioni di questa pagina";
      apri.innerHTML =
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>';

      scheda = document.createElement("div");
      scheda.className = "sb-riv-ind";
      scheda.hidden = true;
      scheda.innerHTML =
        '<div class="sb-riv-ind-scrim" data-ind-chiudi></div>' +
        '<div class="sb-riv-ind-box" role="dialog" aria-modal="true" aria-label="Sezioni di questa pagina">' +
        '<p class="sb-riv-ind-t">In questa pagina</p><nav class="sb-riv-ind-nav"></nav></div>';

      var lista = scheda.querySelector(".sb-riv-ind-nav");
      voci.forEach(function (v) {
        var a = document.createElement("a");
        a.href = "#" + v.id;
        a.textContent = v.nome;
        lista.appendChild(a);
        v.eco.push(a);
      });

      var mostra = function (aperta) {
        scheda.hidden = !aperta;
        apri.setAttribute("aria-expanded", aperta ? "true" : "false");
        if (aperta) lista.querySelector("a").focus();
        else apri.focus();
      };

      apri.addEventListener("click", function () {
        mostra(scheda.hidden);
      });
      scheda.addEventListener("click", function (e) {
        // Un tocco su una voce porta alla sezione: la scheda ha finito.
        if (e.target.closest("[data-ind-chiudi]") || e.target.closest("a")) mostra(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !scheda.hidden) mostra(false);
      });

      wrap.insertBefore(apri, tastoSu);
      /* Dentro .sb-home, non in fondo al body. I token del design system —
         --sb-surface-100, --sb-border-strong, --sb-shape-lg e tutti gli altri —
         non stanno su :root ma su .sb-home, che è il contenitore di pagina.
         Appesa al body la scheda restava fuori da quella discendenza: ogni
         var() si risolveva nel vuoto e la scheda finiva senza fondo, senza
         bordo e senza smusso — trasparente, col testo della pagina che le
         passava attraverso. Da qui dentro eredita il tema come tutto il resto,
         e segue anche il passaggio da chiaro a scuro senza saperne niente. */
      (document.querySelector(".sb-home") || document.body).appendChild(scheda);
    }

    /* Quale sezione. Quella che ha superato la testata per ultima: è la
       sezione che si sta leggendo, non quella che si intravede in fondo.

       Non è un IntersectionObserver ma un conto dentro il rAF dello scroll che
       già c'era: un osservatore in più per una cosa che si sa leggendo una
       coordinata sarebbe un secondo meccanismo da tenere d'accordo col primo. */
    var attiva = null;
    var segna = function () {
      /* La soglia è appena sotto la testata appiccicata (64 px) più un po'
         d'aria: una sezione conta come «quella che si sta leggendo» quando il
         suo titolo è passato di lì, non quando spunta in fondo allo schermo.

         Si misura con getBoundingClientRect e non con offsetTop: offsetTop è
         la distanza dal genitore posizionato — qui .sb-main, che comincia
         sotto la testata — e le sezioni risulterebbero tutte più in alto di
         dove sono, facendo scattare l'evidenza con un'intera testata di
         ritardo. Il rettangolo è in coordinate di schermo, e non ha genitori. */
      var scelta = voci[0];
      for (var i = 0; i < voci.length; i++) {
        if (voci[i].sez.getBoundingClientRect().top <= 96) scelta = voci[i];
      }
      // In fondo alla pagina vince sempre l'ultima: le sezioni corte in coda,
      // altrimenti, non si accenderebbero mai perché non arrivano alla soglia.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) scelta = voci[voci.length - 1];
      if (scelta === attiva) return;
      if (attiva) attiva.eco.forEach(function (e) { e.removeAttribute("aria-current"); });
      scelta.eco.forEach(function (e) { e.setAttribute("aria-current", "true"); });
      attiva = scelta;
    };

    /* La colonna a lato non scansa più niente, e non c'è più codice che la
       sposti: sta oltre il bordo del contenitore, in un vuoto che è suo, e sopra
       il contenuto non ci passa per costruzione. Si era provato a farla scansare
       gli ingombri uno per uno — ma su /paese le fotografie a coppie e le tabelle
       larghe sono quasi tutta la pagina, e una colonna che scansa sempre è una
       colonna che vive appiccicata al bordo destro, smorzata, dove non la legge
       nessuno. Dove il vuoto non c'è, adesso, non c'è nemmeno la colonna: sotto i
       1440px l'indice è il tasto in basso a destra. */

    var attesa = false;
    var alloScroll = function () {
      if (attesa) return;
      attesa = true;
      requestAnimationFrame(function () {
        segna();
        // Il tasto dell'indice compare quando compare quello per tornare in
        // cima: sono la stessa domanda — «sono lontano, dove sono finito?» —
        // e devono comparire insieme o l'angolo si popola a scatti.
        if (apri) apri.classList.toggle("sb-riv-top--visibile", window.scrollY > window.innerHeight * 1.5);
        attesa = false;
      });
    };
    window.addEventListener("scroll", alloScroll, { passive: true });
    window.addEventListener("resize", alloScroll, { passive: true });
    segna();
  }

  /* ── «Continua di là» ────────────────────────────────────────────────────
     Le tabelle più larghe dello schermo scorrono di lato, ma la lastra taglia
     il bordo di netto e sembrano finite. Qui si accende il velo sul bordo
     destro solo quando c'è davvero altro da vedere, e si spegne arrivati in
     fondo: a script spenti non compare, e va bene così — meglio nessuna
     promessa che una promessa che non si può mantenere.

     Il riquadro prende il fuoco perché glielo scrive build.mjs (tabindex e
     role): qui si aggiunge solo quello che il CSS non sa, cioè a che punto
     dello scorrimento si è. */
  [].forEach.call(document.querySelectorAll(".sb-riv-scroll"), function (box) {
    var wrap = box.closest(".sb-riv-tablewrap");
    if (!wrap) return;
    var guarda = function () {
      wrap.classList.toggle("sb-riv-tablewrap--altro", box.scrollWidth - box.clientWidth - box.scrollLeft > 4);
    };
    box.addEventListener("scroll", guarda, { passive: true });
    window.addEventListener("resize", guarda, { passive: true });
    guarda();
  });

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
