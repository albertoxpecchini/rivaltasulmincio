/* ═══════════════════════════════════════════════════════════════════════════
   LA MAPPA — Leaflet, ospitato qui dentro, nessuna CDN.

   I punti non arrivano con una richiesta: sono già nella pagina, scritti dal
   build dentro <script type="application/json" id="mappa-poi">. Il dataset
   cambia quando qualcuno rigenera l'estratto OSM, cioè fra un deploy e
   l'altro: andarli a chiedere a ogni caricamento vorrebbe dire far vedere
   una mappa vuota a chi ha la linea lenta, per dati identici.

   Se questo file non gira, la pagina resta in piedi: sopra c'è un avviso e
   sotto l'elenco completo dei luoghi, ognuno con il suo collegamento a
   OpenStreetMap. La mappa è un di più, non il contenuto.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var nodo = document.getElementById("mappa");
  var dati = document.getElementById("mappa-poi");
  if (!nodo || !dati || typeof L === "undefined") return;

  var punti;
  try {
    punti = JSON.parse(dati.textContent);
  } catch (e) {
    return;
  }

  var CENTRO = [45.1801924, 10.6771374];
  var html = document.documentElement;

  /* Stessa disciplina del resto del sito: la scelta fatta col tasto vale su
     tutto, e senza scelta manuale comanda la preferenza di sistema. Qui non
     si tratta di decorazione — lo zoom animato di una mappa è movimento vero
     e a chi ha chiesto di non averne va tolto. */
  var fermo =
    html.classList.contains("rsm-still") ||
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !html.classList.contains("rsm-motion"));

  var mappa = L.map(nodo, {
    center: CENTRO,
    // 16 e non 15: a 15 il paese occupa un quarto dello schermo e i tre
    // quarti restanti sono campagna vuota con i segnaposto tutti addosso.
    zoom: 16,
    minZoom: 12,
    maxZoom: 19,
    scrollWheelZoom: false, // la rotella scorre la pagina, non zooma la mappa
    zoomAnimation: !fermo,
    fadeAnimation: !fermo,
    markerZoomAnimation: !fermo,
  });

  /* La rotella zooma solo dopo che si è cliccato dentro: altrimenti scorrendo
     la pagina la mappa cattura il gesto e si finisce in mezzo alla pianura. */
  mappa.on("focus", function () { mappa.scrollWheelZoom.enable(); });
  mappa.on("blur", function () { mappa.scrollWheelZoom.disable(); });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">OpenStreetMap</a>',
  }).addTo(mappa);

  /* ── I segnaposto ────────────────────────────────────────────────────────
     Un solo colore, l'azzurro brand, come ovunque nel sito: nove tinte per
     nove categorie sarebbero nove accenti nuovi in una palette che ne ha uno.
     A distinguere i gruppi è il segno dentro la goccia, e soprattutto i
     filtri — che è il modo con cui una mappa si legge davvero. */
  var SEGNI = {
    cultura: '<path d="M2 21h20M4 21V9m5 12V9m6 12V9m5 12V9M3 9l9-6 9 6"/>',
    culto: '<path d="M12 3v18M7 8h10"/>',
    verde: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    negozi: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    tavola: '<path d="M4 2v7a3 3 0 0 0 3 3v10M8 2v10M18 2v20c2 0 3-2 3-5V7c0-3-1-5-3-5Z"/>',
    servizi: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v6M9 11h6"/>',
    fiume: '<path d="M2 7c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 13c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 19c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>',
    muoversi:
      '<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6"/>',
    arredo: '<path d="M12 22a7 7 0 0 0 7-7c0-5-7-13-7-13S5 10 5 15a7 7 0 0 0 7 7Z"/>',
  };

  function icona(g, conNome) {
    return L.divIcon({
      className: "",
      html:
        '<span class="sb-riv-pin' +
        (conNome ? " sb-riv-pin--nome" : "") +
        '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        (SEGNI[g] || SEGNI.arredo) +
        "</svg></span>",
      iconSize: conNome ? [26, 26] : [18, 18],
      iconAnchor: conNome ? [13, 13] : [9, 9],
      popupAnchor: [0, -12],
    });
  }

  /* ── Le schede ───────────────────────────────────────────────────────────
     Costruite con i nodi, non incollando stringhe: i valori vengono dai tag
     OpenStreetMap, cioè da testo che scrive chiunque, e textContent è l'unico
     modo per essere certi che restino testo. */
  function scheda(p) {
    var box = document.createElement("div");
    box.className = "sb-riv-pop";

    var h = document.createElement("strong");
    h.textContent = p.n || p.t;
    box.appendChild(h);

    var tipo = document.createElement("span");
    tipo.className = "sb-riv-pop-t";
    tipo.textContent = p.n ? p.t : "";
    if (tipo.textContent) box.appendChild(tipo);

    function riga(etichetta, valore) {
      if (!valore) return;
      var r = document.createElement("span");
      r.className = "sb-riv-pop-r";
      var e = document.createElement("span");
      e.textContent = etichetta;
      r.appendChild(e);
      r.appendChild(document.createTextNode(valore));
      box.appendChild(r);
    }
    riga("Indirizzo ", p.i);
    riga("Orari ", p.o);
    riga("Distanza ", p.d + " m dal centro");

    if (p.tel) {
      var t = document.createElement("a");
      t.className = "sb-riv-pop-a";
      t.href = "tel:" + p.tel.replace(/\s+/g, "");
      t.textContent = p.tel;
      box.appendChild(t);
    }
    if (p.w) {
      var w = document.createElement("a");
      w.className = "sb-riv-pop-a";
      w.href = p.w;
      w.target = "_blank";
      w.rel = "noreferrer noopener";
      w.textContent = p.w.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      box.appendChild(w);
    }

    var osm = document.createElement("a");
    osm.className = "sb-riv-pop-a";
    osm.href =
      "https://www.openstreetmap.org/?mlat=" + p.c[0] + "&mlon=" + p.c[1] + "#map=19/" + p.c[0] + "/" + p.c[1];
    osm.target = "_blank";
    osm.rel = "noreferrer noopener";
    osm.textContent = "Apri su OpenStreetMap";
    box.appendChild(osm);

    return box;
  }

  /* Un livello per gruppo: accendere e spegnere un filtro diventa aggiungere
     o togliere un livello, non ridisegnare 266 segnaposto. */
  var livelli = {};
  punti.forEach(function (p) {
    if (!livelli[p.g]) livelli[p.g] = L.layerGroup().addTo(mappa);
    L.marker(p.c, {
      icon: icona(p.g, !!p.n),
      title: p.n || p.t,
      // I punti con un nome stanno sopra: sono quelli che si sta cercando.
      zIndexOffset: p.n ? 1000 : 0,
      keyboard: true,
      alt: p.n || p.t,
    })
      .bindPopup(scheda(p), { closeButton: true, maxWidth: 280 })
      .addTo(livelli[p.g]);
  });

  var conteggio = document.getElementById("mappa-conteggio");
  var totale = punti.length;

  function aggiorna() {
    var visibili = 0;
    Object.keys(livelli).forEach(function (g) {
      if (mappa.hasLayer(livelli[g])) visibili += punti.filter(function (p) { return p.g === g; }).length;
    });
    if (conteggio) {
      conteggio.textContent =
        visibili === totale
          ? totale + " punti sulla mappa."
          : visibili + " punti visibili su " + totale + ".";
    }
  }

  document.querySelectorAll(".sb-riv-filtri input[type=checkbox]").forEach(function (c) {
    c.addEventListener("change", function () {
      var l = livelli[c.value];
      if (!l) return;
      if (c.checked) mappa.addLayer(l);
      else mappa.removeLayer(l);
      aggiorna();
    });
  });

  aggiorna();
})();
