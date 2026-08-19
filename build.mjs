/* ═══════════════════════════════════════════════════════════════════════════
   Assemblatore del sito — zero dipendenze, `node build.mjs`.

   Nove pagine condividono la stessa nav e lo stesso footer. Tenerne nove
   copie a mano significa che prima o poi otto sono aggiornate e una no, ed è
   sempre quella che qualcuno apre. Qui il guscio sta in _build/head.html e
   _build/foot.html, il contenuto in _build/<pagina>.body.html, e questo
   script li incolla.

   Il risultato è HTML statico puro: niente build step in produzione, niente
   runtime, si serve così com'è. Lo script serve solo a chi modifica il sito.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";

/* Dominio di produzione. Serve per due cose che DEVONO dire la stessa identica
   riga, o Search Console le tratta come pagine diverse: l'URL canonico nella
   testata di ogni pagina e il <loc> nella sitemap. Sta scritto una volta qui. */
const SITE = "https://www.rivaltasulmincio.it";

const head = readFileSync("_build/head.html", "utf8");
const foot = readFileSync("_build/foot.html", "utf8");

// Titolo e descrizione stanno in testa al frammento, come due commenti: così
// il contenuto e i suoi metadati non possono separarsi.
const meta = (src, key) => {
  const m = src.match(new RegExp(`^<!--\\s*${key}:\\s*([\\s\\S]*?)-->`, "m"));
  if (!m) throw new Error(`manca <!--${key}: ...--> nel frammento`);
  return m[1].trim();
};

/* ── Rassegna stampa ──────────────────────────────────────────────────────
   Le notizie stanno in _build/notizie.json e vengono rese qui, al posto del
   segnaposto {{NEWS}}. Aggiornare la rassegna significa toccare un JSON, non
   cercare il punto giusto dentro una pagina.

   Si pubblicano SOLO titolo, testata, data e collegamento all'originale — mai
   il testo dell'articolo, mai la sua fotografia. Il traffico e il contenuto
   restano di chi la notizia l'ha scritta; qui c'è solo l'indice. La `nota` è
   un dato di fatto (date, luogo) scritto da noi, non una frase ripresa. */
const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const renderNews = () => {
  const items = JSON.parse(readFileSync("_build/notizie.json", "utf8"))
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  return items
    .map(
      (n) => `        <a class="sb-card sb-riv-news-card" href="${escape(n.url)}" target="_blank" rel="noreferrer noopener">
          <div class="sb-panel"><div class="sb-panel-inner sb-riv-news-pad">
            <div class="sb-riv-news-top">
              <span class="sb-riv-news-src">${escape(n.testata)}</span>
              <span class="sb-riv-news-date">${escape(n.dataTesto)}</span>
            </div>
            <h3 class="sb-riv-news-title">${escape(n.titolo)}</h3>${
              n.autore ? `\n            <p class="sb-riv-news-by">di ${escape(n.autore)}</p>` : ""
            }
            <p class="sb-riv-news-note">${escape(n.nota)}</p>
            <span class="sb-link sb-riv-news-go">Leggi su ${escape(n.testata)}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
          </div></div>
        </a>`
    )
    .join("\n");
};

/* Metadato facoltativo: se il frammento non lo dichiara, vale il default. */
const optMeta = (src, key, fallback) => {
  const m = src.match(new RegExp(`^<!--\\s*${key}:\\s*([\\s\\S]*?)-->`, "m"));
  return m ? m[1].trim() : fallback;
};

/* ── Il registro dei luoghi ───────────────────────────────────────────────
   _build/luoghi.json è l'anagrafe dei posti di cui il sito parla: nome,
   indirizzo, coordinate, la pagina che li racconta e il nome del file della
   loro fotografia. Da qui escono tre cose che altrimenti si scriverebbero
   tre volte a mano e divergerebbero al primo cambiamento: i collegamenti
   alla mappa, le fotografie e le schede della pagina /mappa. */
const luoghi = JSON.parse(readFileSync("_build/luoghi.json", "utf8"));
const perSlug = new Map(luoghi.map((l) => [l.slug, l]));

/* Un indirizzo si apre su OpenStreetMap, la stessa fonte da cui vengono i
   geodati di tutto il sito. Con le coordinate si punta il segnaposto esatto;
   senza, si ripiega su una ricerca per nome — meglio una mappa vicina che un
   collegamento morto. */
const osmUrl = (l) =>
  l.lat != null && l.lon != null
    ? `https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lon}#map=18/${l.lat}/${l.lon}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${l.nome}, Rivalta sul Mincio`)}`;

const PIN = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

const geoLink = (href, testo, titolo) =>
  `<a class="sb-riv-geo" href="${escape(href)}" target="_blank" rel="noreferrer noopener"` +
  ` title="${escape(titolo)} — apri su OpenStreetMap">${escape(testo)}${PIN}</a>`;

/* ── Fotografie ───────────────────────────────────────────────────────────
   {{foto:slug}} produce la figura SOLO se il file esiste davvero su disco.
   È la regola che rende possibile scrivere oggi il markup di 110 fotografie
   che non sono ancora state scattate: finché il jpg non c'è, il segnaposto
   non lascia né un buco né un'immagine rotta; il giorno che il file entra
   nella cartella, la figura compare da sé al primo build. */
const mancanti = [];
const renderFoto = (slug) => {
  const l = perSlug.get(slug);
  if (!l) throw new Error(`{{foto:${slug}}} — slug assente da _build/luoghi.json`);
  const rel = `assets/foto/${l.foto}`;
  if (!existsSync(rel)) {
    mancanti.push(slug);
    return "";
  }
  const credito = l.credito ? ` <span class="sb-riv-foto-by">Foto: ${escape(l.credito)}</span>` : "";
  return `<figure class="sb-riv-foto">
      <div class="sb-panel"><div class="sb-panel-inner">
        <img src="${rel}" alt="${escape(l.alt)}" loading="lazy" decoding="async" width="1600" height="1067">
      </div></div>
      <figcaption>${escape(l.nome)}${credito}</figcaption>
    </figure>`;
};

/* ── Gli shortcode ────────────────────────────────────────────────────────
   Tre segnaposto, tutti risolti qui e nessuno scritto a mano nelle pagine:

     {{luogo:corte-mincio-porto}}        nome del luogo, premibile
     {{luogo:corte-mincio-porto|Via Porto}}  etichetta diversa dal nome
     {{geo:45.1799,10.6807|Piazza Chiesa}}   coordinate sciolte
     {{foto:chiesa-santi-vigilio-donato}}    la fotografia, se esiste

   Uno slug che non esiste fa fallire il build, come già succede a un
   frammento senza titolo: un collegamento rotto scoperto in produzione costa
   più di un build che si ferma. */
const shortcodes = (html) =>
  html
    .replace(/\{\{luogo:([a-z0-9-]+)(?:\|([^}]*))?\}\}/g, (_, slug, etichetta) => {
      const l = perSlug.get(slug);
      if (!l) throw new Error(`{{luogo:${slug}}} — slug assente da _build/luoghi.json`);
      return geoLink(osmUrl(l), etichetta || l.nome, l.nome);
    })
    .replace(/\{\{geo:(-?\d+\.\d+),\s*(-?\d+\.\d+)(?:\|([^}]*))?\}\}/g, (_, lat, lon, etichetta) =>
      geoLink(
        `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`,
        etichetta || `${lat}, ${lon}`,
        `${lat}, ${lon}`
      )
    )
    .replace(/\{\{foto:([a-z0-9-]+)\}\}/g, (_, slug) => renderFoto(slug));

/* ── La mappa ─────────────────────────────────────────────────────────────
   I punti non si caricano a runtime: il dataset è già qui al momento del
   build, e un fetch in più per dati che non cambiano fra un deploy e l'altro
   sarebbe solo un modo per far vedere una mappa vuota a chi ha la linea
   lenta. {{MAPPA}} diventa i filtri più un blocco JSON che assets/mappa.js
   legge dal DOM.

   Del dataset completo si porta solo ciò che serve a disegnare un segnaposto
   e la sua scheda: dai 10.190 righe del file scaricabile si scende a poche
   decine di kB. */
const renderMappa = () => {
  const { gruppi, tipi } = JSON.parse(readFileSync("_build/tipi.json", "utf8"));
  const ds = JSON.parse(readFileSync("data/rivalta_dataset.json", "utf8"));

  const ignoti = new Set();
  const punti = [];
  for (const p of ds.poi) {
    const chiave = `${p.categoria}/${p.tipo}`;
    const t = tipi[chiave];
    if (!t) {
      ignoti.add(chiave);
      continue;
    }
    if (t.escluso) continue;
    punti.push({
      n: p.nome || null,
      t: t.l,
      g: t.g,
      c: [Number(p.lat.toFixed(6)), Number(p.lon.toFixed(6))],
      d: p.dist_m,
      i: p.indirizzo || null,
      tel: p.telefono || null,
      w: p.web || null,
      o: p.orari || null,
    });
  }
  // Prima i punti con un nome: nella lista sotto la mappa contano di più.
  punti.sort((a, b) => (a.n ? 0 : 1) - (b.n ? 0 : 1) || a.d - b.d);

  if (ignoti.size) {
    console.log(`\n⚠ tipi OSM non ancora tradotti (esclusi dalla mappa): ${[...ignoti].join(", ")}`);
    console.log(`  Aggiungerli a _build/tipi.json con etichetta e gruppo.`);
  }

  const conta = (g) => punti.filter((p) => p.g === g).length;
  const filtri = Object.entries(gruppi)
    .map(
      ([id, nome]) => `          <label class="sb-riv-filtro">
            <input type="checkbox" value="${id}" checked>
            <span class="sb-riv-filtro-pin" data-g="${id}" aria-hidden="true"></span>
            <span>${escape(nome)}</span>
            <span class="sb-riv-filtro-n">${conta(id)}</span>
          </label>`
    )
    .join("\n");

  return `<div class="sb-riv-mappa">
        <div class="sb-riv-filtri" role="group" aria-label="Categorie da mostrare sulla mappa">
${filtri}
        </div>
        <div class="sb-panel"><div class="sb-panel-inner">
          <div class="sb-riv-map" id="mappa" role="application" aria-label="Mappa dei punti d'interesse di Rivalta sul Mincio"></div>
        </div></div>
        <p class="sb-riv-cap" id="mappa-conteggio">${punti.length} punti sulla mappa. Senza JavaScript la mappa non compare: l'elenco completo dei luoghi resta qui sotto, e ogni voce apre OpenStreetMap.</p>
        <script type="application/json" id="mappa-poi">${JSON.stringify(punti).replace(/</g, "\\u003c")}</script>
      </div>`;
};

/* Le schede dei luoghi in coda alla mappa: il registro, non il dataset. Sono
   i posti di cui il sito parla davvero, con la loro fotografia e il rimando
   alla pagina che li racconta. */
const renderLuoghi = () => {
  const gruppi = [...new Set(luoghi.map((l) => l.gruppo))];
  return gruppi
    .map((g) => {
      const voci = luoghi
        .filter((l) => l.gruppo === g)
        .map((l) => {
          const scattata = existsSync(`assets/foto/${l.foto}`);
          if (!scattata) mancanti.push(l.slug);
          const foto = scattata
            ? `<img class="sb-riv-luogo-img" src="assets/foto/${l.foto}" alt="${escape(l.alt)}" loading="lazy" decoding="async" width="1600" height="1067">`
            : "";
          const dove = l.indirizzo ? `<span class="sb-riv-luogo-dove">${escape(l.indirizzo)}</span>` : "";
          const dist = l.dist_m != null ? `<span class="sb-riv-luogo-dist">${l.dist_m} m dal centro</span>` : "";
          return `          <div class="sb-panel"><div class="sb-panel-inner sb-riv-luogo">
            ${foto}
            <div class="sb-riv-luogo-testo">
              <h3>${escape(l.nome)}</h3>
              <p class="sb-riv-luogo-meta">${dove}${dist}</p>
              <p class="sb-riv-luogo-links">
                ${geoLink(osmUrl(l), "Apri nella mappa", l.nome)}
                <a class="sb-link" href="${escape(l.pagina)}">Scheda</a>
              </p>
            </div>
          </div></div>`;
        })
        .join("\n");
      return `      <h2 class="sb-riv-subhead">${escape(g)}</h2>
      <div class="sb-riv-luoghi">
${voci}
      </div>`;
    })
    .join("\n");
};

/* ── La stazione in diretta ───────────────────────────────────────────────
   {{METEO}} diventa i riquadri che assets/meteo.js riempie ogni minuto con la
   lettura vera della stazione di Rivalta. Qui c'è solo la forma: quali misure
   si mostrano, in che ordine, con che etichetta e che unità. Il numero non
   c'è e non ci deve essere — nel momento in cui questo file gira, il valore
   giusto non esiste ancora.

   Il blocco esce `hidden`: lo scopre lo script quando la prima lettura arriva
   davvero. Chi ha JavaScript spento, o chi apre la pagina mentre la stazione
   tace, resta con il paragrafo qui sopra — che dice il vero — invece di una
   griglia di trattini che promette dati e non li dà.

   `data-meteo` è il nome del campo nel JSON di /api/meteo, `data-meteo-dec` i
   decimali, `data-meteo-riga` la porzione da nascondere se quella misura non
   arriva (un sensore rotto toglie la sua riga, non falsifica un numero).
   Aggiungere una misura si fa qui, e basta: lo script non va toccato. */
const METEO_GRANDI = [
  { campo: "temperatura", unita: "°C", etichetta: "temperatura all'aperto" },
  { campo: "umidita", unita: "%", dec: 0, etichetta: "umidità relativa" },
  { campo: "vento", unita: "km/h", etichetta: "vento medio" },
  { campo: "pioggiaOggi", unita: "mm", etichetta: "pioggia caduta oggi" },
];

/* L'ordine è quello di lettura, non quello delle colonne: la griglia si riempie
   per righe e le colonne sono una, due o tre secondo la larghezza dello
   schermo, quindi qualsiasi accoppiamento pensato per due colonne si
   sfascerebbe alle altre due misure. */
const METEO_DETTAGLI = [
  { campo: "percepita", unita: "°C", etichetta: "Percepita" },
  { campo: "rugiada", unita: "°C", etichetta: "Punto di rugiada" },
  { campo: "temperaturaMin", unita: "°C", etichetta: "Minima di oggi" },
  { campo: "temperaturaMax", unita: "°C", etichetta: "Massima di oggi" },
  { campo: "raffica", unita: "km/h", etichetta: "Raffica" },
  { campo: "ventoDirezione", etichetta: "Direzione" },
  { campo: "pressione", unita: "hPa", etichetta: "Pressione" },
  { campo: "uv", etichetta: "Indice UV" },
  { campo: "radiazione", unita: "W/m²", dec: 0, etichetta: "Radiazione solare" },
  { campo: "pioggiaAnno", unita: "mm", etichetta: "Pioggia nell'anno" },
];

/* ── «Prossimamente» ──────────────────────────────────────────────────────
   La stazione è di meteomincio.it e il permesso di rilanciarne le letture
   gliel'abbiamo chiesto, ma la risposta non è ancora arrivata. Finché non
   arriva, la sezione dice di sé che è in prova.

   La barra sta **dentro** il blocco dei dati, non sopra: il blocco nasce
   nascosto e lo scopre lo script solo quando una lettura vera è arrivata, e
   una barra fuori resterebbe lì da sola ad annunciare una cosa che non si
   vede. Compaiono insieme o non compare niente.

   Quando la risposta arriva si toglie la chiamata a questa funzione dai due
   render qui sotto, e non resta traccia di niente. */
const renderProssimamente = (nota) =>
  `<div class="sb-riv-prossima">
          <span class="sb-riv-flash-badge">Prossimamente</span>${
            nota ? `\n          <span class="sb-riv-prossima-d">${nota}</span>` : ""
          }
        </div>`;

const NOTA_PROVA =
  "Sezione in prova: i dati sono veri e in diretta dalla stazione del paese, ma stiamo aspettando il via libera di chi la gestisce.";

/* Il trattino è il segnaposto di un valore che sta per arrivare, non un
   valore. Vive meno di un secondo — il blocco è nascosto finché lo script non
   ha scritto i numeri veri — ma serve perché la casella abbia un'altezza. */
const casella = ({ campo, unita, dec }) =>
  `<span class="sb-riv-stat-v" data-meteo="${campo}"${dec !== undefined ? ` data-meteo-dec="${dec}"` : ""}>—${
    unita ? `<small>${unita}</small>` : ""
  }</span>`;

const renderMeteo = () => {
  const grandi = METEO_GRANDI.map(
    (m) => `        <div class="sb-riv-stat" data-meteo-riga><div class="sb-panel"><div class="sb-panel-inner">${casella(
      m
    )}<span class="sb-riv-stat-l">${m.etichetta}</span></div></div></div>`
  ).join("\n");

  const dettagli = METEO_DETTAGLI.map(
    (m) =>
      `          <div class="row" data-meteo-riga><span>${m.etichetta}</span><span data-meteo="${m.campo}"${
        m.dec !== undefined ? ` data-meteo-dec="${m.dec}"` : ""
      }>—${m.unita ? `<small>${m.unita}</small>` : ""}</span></div>`
  ).join("\n");

  return `<div class="sb-riv-meteo" id="meteo-live" data-meteo-blocco hidden>
      ${renderProssimamente(NOTA_PROVA)}
      <div class="sb-riv-stats">
${grandi}
      </div>
      <div class="sb-panel sb-riv-meteo-dett"><div class="sb-panel-inner sb-riv-cardpad">
        <div class="sb-riv-meteo-rows">
${dettagli}
        </div>
      </div></div>
      <p class="sb-riv-meteo-pie">
        <span data-meteo-stato>Lettura in corso.</span>
        <span>Dati della stazione di Rivalta, per gentile concessione di <a href="https://www.meteomincio.it" target="_blank" rel="noreferrer noopener">meteomincio.it</a>.</span>
      </p>
    </div>`;
};

/* ── La stessa stazione, in piccolo ───────────────────────────────────────
   {{METEO_ORA}} è la scheda che sta a destra del titolo, nella home. Legge lo
   stesso /api/meteo della griglia di /natura, con lo stesso script: cambiano
   solo quali misure entrano e quanto spazio hanno.

   Qui la selezione è severa, ed è il punto della scheda. Chi arriva sulla home
   non vuole dieci misure: vuole sapere se fuori fa caldo, se piove e se tira
   vento — cioè se prendere la giacca. Il resto sta a un click di distanza, e
   il collegamento in fondo esiste per quello.

   La temperatura porta il grado attaccato e non l'unità intera: «31°» accanto
   a un disegno di sole si legge da solo, e «31,0 °C» in caratteri grandi
   occuperebbe metà scheda per dire la stessa cosa. I decimali restano, invece,
   nelle tre misure piccole, dove servono a distinguere 0,2 mm di pioggia da
   nessuna pioggia. */
const METEO_ORA_MINI = [
  { campo: "umidita", unita: "%", dec: 0, etichetta: "umidità" },
  { campo: "vento", unita: "km/h", etichetta: "vento" },
  { campo: "pioggiaOggi", unita: "mm", etichetta: "pioggia" },
];

const renderMeteoOra = () => {
  const mini = METEO_ORA_MINI.map(
    (m) =>
      `          <div class="sb-riv-ora-mini" data-meteo-riga><span class="sb-riv-ora-mini-v" data-meteo="${m.campo}"${
        m.dec !== undefined ? ` data-meteo-dec="${m.dec}"` : ""
      }>—<small>${m.unita}</small></span><span class="sb-riv-ora-mini-l">${m.etichetta}</span></div>`
  ).join("\n");

  /* Nella scheda della home la barra non porta la spiegazione: ventun rem non
     bastano a una frase di venticinque parole senza che diventi il pezzo più
     grosso del riquadro. Qui basta la parola, e la spiegazione sta su
     /natura, dove c'è lo spazio per darla — a un click dal collegamento che
     la scheda ha già in fondo. */
  return `<aside class="sb-riv-ora" data-meteo-blocco hidden aria-label="Il tempo a Rivalta in questo momento">
        ${renderProssimamente(null)}
        <div class="sb-panel"><div class="sb-panel-inner sb-riv-ora-inner">
          <span class="sb-riv-ora-occhiello">Ora a Rivalta</span>
          <div class="sb-riv-ora-testa">
            <span class="sb-riv-ora-icona" data-meteo-icona></span>
            <span class="sb-riv-ora-t"><span data-meteo="temperatura" data-meteo-dec="0">—</span><span class="sb-riv-ora-grado" aria-hidden="true">°</span></span>
          </div>
          <span class="sb-riv-ora-cond" data-meteo="condizione" data-meteo-riga>—</span>
          <div class="sb-riv-ora-estremi" data-meteo-riga>
            <span>min <span data-meteo="temperaturaMin" data-meteo-dec="0">—</span>°</span>
            <span>max <span data-meteo="temperaturaMax" data-meteo-dec="0">—</span>°</span>
          </div>
          <div class="sb-riv-ora-minis">
${mini}
          </div>
          <a class="sb-link sb-riv-ora-go" href="/natura#stazione-meteo">La stazione in dettaglio<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <span class="sb-riv-ora-stato" data-meteo-stato="breve">Lettura in corso</span>
        </div></div>
      </aside>`;
};

const bodies = readdirSync("_build").filter((f) => f.endsWith(".body.html"));
if (!bodies.length) throw new Error("nessun frammento in _build/");

const sitemap = [];

for (const file of bodies) {
  const page = file.replace(".body.html", "");
  const src = readFileSync(`_build/${file}`, "utf8");
  const body = shortcodes(
    src
      .replace(/^<!--[\s\S]*?-->\s*/gm, "")
      .trim()
      .replace("{{NEWS}}", renderNews)
      .replace("{{MAPPA}}", renderMappa)
      .replace("{{LUOGHI}}", renderLuoghi)
      .replace("{{METEO_ORA}}", renderMeteoOra)
      .replace("{{METEO}}", renderMeteo)
  );

  const title = meta(src, "title");
  const desc = meta(src, "desc");

  /* Leaflet pesa 160 kB fra script e foglio: caricarlo sulle nove pagine che
     una mappa non ce l'hanno sarebbe farlo scaricare per niente otto volte su
     nove. Non c'è un elenco da tenere aggiornato — se il frammento contiene
     il segnaposto della mappa, allora la mappa gli serve. */
  const conMappa = src.includes("{{MAPPA}}");
  const headExtra = conMappa ? `<link rel="stylesheet" href="assets/vendor/leaflet/leaflet.css">\n` : "";

  /* Stessa regola per la stazione meteo: lo script che la interroga ogni
     minuto lo scarica solo la pagina che i riquadri ce li ha davvero — la
     griglia estesa di /natura o la scheda piccola della home, indifferente:
     è lo stesso file e sa riempirle tutte e due. */
  const conMeteo = src.includes("{{METEO}}") || src.includes("{{METEO_ORA}}");

  const scriptExtra =
    (conMappa ? `<script src="assets/vendor/leaflet/leaflet.js"></script>\n<script src="assets/mappa.js"></script>\n` : "") +
    (conMeteo ? `<script src="assets/meteo.js"></script>\n` : "");

  /* L'anteprima social esiste solo quando esiste il file. Un og:image che
     punta a un'immagine assente fa sì che l'anteprima non compaia affatto:
     meglio dichiarare la scheda breve finché la fotografia non c'è. */
  const ogImg = existsSync("assets/foto/og.jpg")
    ? `<meta name="twitter:card" content="summary_large_image">\n<meta property="og:image" content="${SITE}/assets/foto/og.jpg">\n<meta property="og:image:alt" content="Rivalta sul Mincio">\n`
    : `<meta name="twitter:card" content="summary">\n`;
  /* Gli indirizzi pubblici non hanno estensione: /paese, non /paese.html. Il
     file su disco continua a chiamarsi paese.html — è "cleanUrls": true in
     vercel.json che lo serve senza, e che manda un redirect permanente dal
     vecchio indirizzo al nuovo, così quello che è già stato indicizzato o
     mandato a qualcuno non si rompe.

     La home è la radice del sito: un indirizzo solo per una pagina sola,
     altrimenti i motori ne indicizzano due identiche. */
  const canonical = page === "index" ? `${SITE}/` : `${SITE}/${page}`;

  const out =
    head
      .replace("{{TITLE}}", title)
      .replace("{{DESC}}", desc)
      .replace(/\{\{CANONICAL\}\}/g, canonical)
      .replace(/\{\{OG_TITLE\}\}/g, escape(title))
      .replace(/\{\{OG_DESC\}\}/g, escape(desc))
      .replace("{{OG_IMAGE}}", ogImg)
      .replace("{{HEAD}}", headExtra) +
    `  <main class="sb-main" id="main">\n${body}\n  </main>\n` +
    foot.replace("{{SCRIPTS}}", scriptExtra);

  writeFileSync(`${page}.html`, out);

  sitemap.push({
    loc: canonical,
    // Data dell'ultima modifica VERA del contenuto: il timestamp del frammento
    // sorgente, non "oggi". Rigenerare il sito senza aver cambiato niente non
    // deve dire ai motori che tutte e nove le pagine sono state riscritte.
    lastmod: statSync(`_build/${file}`).mtime.toISOString().slice(0, 10),
    freq: optMeta(src, "freq", "monthly"),
    prio: optMeta(src, "prio", "0.7"),
  });

  console.log(`✓ ${page}.html  (${(out.length / 1024).toFixed(1)} kB)`);
}

/* ── Sitemap ──────────────────────────────────────────────────────────────
   Generata dalla stessa lista che genera le pagine: una pagina nuova entra in
   sitemap da sé. Una sitemap scritta a mano è una sitemap che, prima o poi,
   elenca un indirizzo che non esiste più — ed è peggio di non averla. */
const urls = sitemap
  .sort((a, b) => Number(b.prio) - Number(a.prio) || a.loc.localeCompare(b.loc))
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.prio}</priority>
  </url>`
  )
  .join("\n");

writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`✓ sitemap.xml  (${sitemap.length} URL)`);

/* ── La lista della spesa ─────────────────────────────────────────────────
   Le fotografie si aggiungono una alla volta, nel tempo. Perché "quali
   mancano" non diventi una domanda a cui si risponde aprendo la cartella e
   confrontandola a occhio con le pagine, il build lo dice ogni volta. */
if (mancanti.length) {
  const unici = [...new Set(mancanti)];
  const fatte = luoghi.length - unici.length;
  console.log(`\n⚠ fotografie: ${fatte} su ${luoghi.length}. Ne mancano ${unici.length}.`);
  console.log(`  ${unici.slice(0, 6).map((s) => perSlug.get(s).foto).join("  ")}`);
  if (unici.length > 6) console.log(`  …e altre ${unici.length - 6}. L'elenco completo dei nomi file è in _build/luoghi.json`);
  console.log(`  Vanno in assets/foto/ con quel nome esatto: al prossimo build compaiono da sé.`);
}
