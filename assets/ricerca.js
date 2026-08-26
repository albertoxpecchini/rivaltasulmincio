/* ═══════════════════════════════════════════════════════════════════════════
   Ricerca — la tendina «Cerca» in testata.

   L'indice è già nel browser: assets/ricerca-dati.js lo mette su
   window.RSM_RICERCA ed è generato dal build da tutte le pagine pubbliche
   (nome, indirizzo, descrizione, sezioni ancorate). Qui non si fa nessuna
   chiamata di rete — si cerca in memoria, e funziona anche offline.

   Senza JavaScript questo file non gira, il tasto in testata resta invisibile
   (lo accende la riga qui sotto) e la navigazione a voci basta da sola.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var DATI = Array.isArray(window.RSM_RICERCA) ? window.RSM_RICERCA : [];
  var box = document.getElementById("rsm-cerca");
  if (!box || !DATI.length) return;

  var input = document.getElementById("rsm-cerca-input");
  var lista = document.getElementById("rsm-cerca-lista");
  var vuoto = box.querySelector(".sb-riv-cerca-vuoto");
  var qOut = box.querySelector("[data-cerca-q]");
  var apritori = document.querySelectorAll("[data-search-open]");
  var chiuditori = box.querySelectorAll("[data-cerca-close]");
  var sheet = document.getElementById("menu-sheet");
  var burger = document.querySelector("[data-menu-toggle]");

  /* I tasti che aprono la ricerca non hanno senso senza di essa: il foglio di
     stile li tiene nascosti finché ricerca.js non aggiunge .sb-ready — come
     glass.js col tasto del movimento. */
  apritori.forEach(function (b) { b.classList.add("sb-ready"); });

  /* ── Normalizzazione ──────────────────────────────────────────────────
     minuscolo + accenti via sostituzione di singoli caratteri: resta 1 a 1
     in lunghezza con l'originale, e questo serve a rimettere i <mark> nel
     punto giusto del testo non normalizzato. */
  function piega(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[àáâãä]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/ç/g, "c")
      .replace(/ñ/g, "n");
  }

  /* ── L'indice, spianato ───────────────────────────────────────────────
     Una riga per pagina (pesa di più) e una per ogni sezione ancorata. Nel
     "pagliaio" (hay) entra anche un pezzo di testo non mostrato: fa pescare
     i termini di contenuto — «autobus», «meteo» — che nei titoli non ci sono.
     Il titolo però resta l'unico posto che dà il bonus di rilevanza, quindi
     un riscontro solo nel testo pesa meno di uno nel titolo. */
  var record = [];
  DATI.forEach(function (p) {
    record.push({
      url: p.u,
      nome: p.t,
      ctx: "Pagina",
      pagina: p.t,
      hay: piega(p.t + " " + (p.d || "") + " " + (p.x || "")),
      peso: 3,
    });
    (p.h || []).forEach(function (h) {
      record.push({
        url: p.u + "#" + h[1],
        nome: h[0],
        ctx: p.t,
        pagina: p.t,
        hay: piega(h[0] + " " + p.t + " " + (h[2] || "")),
        peso: 1,
      });
    });
  });

  function cerca(q) {
    var termini = piega(q).trim().split(/\s+/).filter(Boolean);

    // Campo vuoto: la palette dei comandi — le pagine, in fila.
    if (!termini.length) {
      return DATI.map(function (p) {
        return { url: p.u, nome: p.t, ctx: "Pagina", score: 0 };
      });
    }

    var frase = termini.join(" ");
    var out = [];
    record.forEach(function (r) {
      var s = 0;
      var tutti = termini.every(function (t) {
        var i = r.hay.indexOf(t);
        if (i < 0) return false;
        s += r.peso;
        if (i === 0) s += 3;
        if (piega(r.nome).indexOf(t) >= 0) s += 2;
        return true;
      });
      if (!tutti) return;
      if (piega(r.nome).indexOf(frase) >= 0) s += 5;
      out.push({ url: r.url, nome: r.nome, ctx: r.ctx, score: s });
    });

    out.sort(function (a, b) {
      return b.score - a.score || a.nome.length - b.nome.length;
    });
    return out.slice(0, 8);
  }

  /* ── Evidenziazione ──────────────────────────────────────────────────── */
  function evidenzia(el, testo, termini) {
    el.textContent = "";
    if (!termini.length) { el.textContent = testo; return; }

    var f = piega(testo);
    var punti = [];
    termini.forEach(function (t) {
      var da = 0, i;
      while ((i = f.indexOf(t, da)) >= 0) {
        punti.push([i, i + t.length]);
        da = i + t.length;
      }
    });
    if (!punti.length) { el.textContent = testo; return; }

    punti.sort(function (a, b) { return a[0] - b[0]; });
    var uniti = [punti[0].slice()];
    for (var k = 1; k < punti.length; k++) {
      var ultimo = uniti[uniti.length - 1];
      if (punti[k][0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], punti[k][1]);
      else uniti.push(punti[k].slice());
    }

    var pos = 0;
    uniti.forEach(function (r) {
      if (r[0] > pos) el.appendChild(document.createTextNode(testo.slice(pos, r[0])));
      var mk = document.createElement("mark");
      mk.textContent = testo.slice(r[0], r[1]);
      el.appendChild(mk);
      pos = r[1];
    });
    if (pos < testo.length) el.appendChild(document.createTextNode(testo.slice(pos)));
  }

  /* ── Disegno della lista ─────────────────────────────────────────────── */
  var risultati = [];
  var sel = -1;

  function render(q) {
    risultati = cerca(q);
    var termini = piega(q).trim().split(/\s+/).filter(Boolean);
    lista.textContent = "";

    risultati.forEach(function (r, idx) {
      var li = document.createElement("li");
      li.setAttribute("role", "presentation");

      var a = document.createElement("a");
      a.className = "sb-riv-cerca-link";
      a.href = r.url;
      a.id = "rsm-cerca-op-" + idx;
      a.setAttribute("role", "option");
      a.setAttribute("aria-selected", idx === 0 ? "true" : "false");

      var nome = document.createElement("span");
      nome.className = "sb-riv-cerca-nome";
      evidenzia(nome, r.nome, termini);

      var ctx = document.createElement("span");
      ctx.className = "sb-riv-cerca-ctx";
      ctx.textContent = r.ctx;

      a.appendChild(nome);
      a.appendChild(ctx);
      a.addEventListener("click", chiudi);
      li.appendChild(a);
      lista.appendChild(li);
    });

    sel = risultati.length ? 0 : -1;
    var niente = !risultati.length && !!q.trim();
    vuoto.hidden = !niente;
    if (niente && qOut) qOut.textContent = q.trim();
    aggiornaAttivo();
  }

  function aggiornaAttivo() {
    var voci = lista.querySelectorAll("a");
    voci.forEach(function (a, i) {
      a.setAttribute("aria-selected", i === sel ? "true" : "false");
      if (i === sel) a.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", sel >= 0 ? "rsm-cerca-op-" + sel : "");
  }

  function muovi(passo) {
    if (!risultati.length) return;
    sel = (sel + passo + risultati.length) % risultati.length;
    aggiornaAttivo();
  }

  /* ── Apri / chiudi ───────────────────────────────────────────────────── */
  var ultimoFuoco = null;
  var scrollBloccato = "";

  function apri() {
    if (!box.hidden) return;
    ultimoFuoco = document.activeElement;

    // Se si arriva dal menu a schermo stretto, quello si chiude: non deve
    // restare aperto dietro la tendina.
    if (sheet && sheet.classList.contains("sb-open")) {
      sheet.classList.remove("sb-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    }

    box.hidden = false;
    scrollBloccato = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    input.value = "";
    render("");
    input.focus();
  }

  function chiudi() {
    if (box.hidden) return;
    box.hidden = true;
    document.documentElement.style.overflow = scrollBloccato;
    if (ultimoFuoco && typeof ultimoFuoco.focus === "function") ultimoFuoco.focus();
  }

  apritori.forEach(function (b) { b.addEventListener("click", apri); });
  chiuditori.forEach(function (e) { e.addEventListener("click", chiudi); });
  input.addEventListener("input", function () { render(input.value); });

  /* Il fuoco non esce dalla tendina finché è aperta: se scappa, torna al
     campo. Semplice, e non richiede di elencare gli elementi mettibili a
     fuoco uno per uno. */
  box.addEventListener("focusout", function (e) {
    if (box.hidden) return;
    if (!document.hasFocus()) return;
    if (e.relatedTarget && box.contains(e.relatedTarget)) return;
    input.focus();
  });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) {
      var t = e.target || {};
      var tag = (t.tagName || "").toLowerCase();
      var scrive = tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable;
      var scorc = e.key === "/" || ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K"));
      if (scorc && !scrive && !e.altKey) {
        e.preventDefault();
        apri();
      }
      return;
    }

    if (e.key === "Escape") { e.preventDefault(); chiudi(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); muovi(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); muovi(-1); return; }
    if (e.key === "Enter") {
      var voce = lista.querySelectorAll("a")[sel];
      if (voce) { e.preventDefault(); voce.click(); }
    }
  });
})();
