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
import { execSync } from "node:child_process";

/* Dominio di produzione. Serve per due cose che DEVONO dire la stessa identica
   riga, o Search Console le tratta come pagine diverse: l'URL canonico nella
   testata di ogni pagina e il <loc> nella sitemap. Sta scritto una volta qui. */
const SITE = "https://www.rivaltasulmincio.it";

const head = readFileSync("_build/head.html", "utf8");
const foot = readFileSync("_build/foot.html", "utf8");

/* ── Ultimo aggiornamento del sito ───────────────────────────────────────
   "Quando il sito è cambiato l'ultima volta" è la data dell'ultimo commit:
   scritta una volta qui e messa in testata, nel foglio del menu su schermo
   stretto e in fondo alla pagina. Si prende la sola parte YYYY-MM-DD della
   data del commit — niente oggetto Date, così il fuso orario di chi fa il
   build non sposta il giorno. Fuori da un repo git (uno zip scaricato) si
   ripiega sulla data di oggi. */
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const MESI_BREVI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

const dataUltimoCommit = () => {
  try {
    const iso = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  } catch {}
  return new Date().toLocaleDateString("sv"); // "sv" formatta come YYYY-MM-DD
};

const AGG_ISO = dataUltimoCommit();
const [AGG_A, AGG_M, AGG_G] = AGG_ISO.split("-").map(Number);
const AGG_LUNGO = `${AGG_G} ${MESI[AGG_M - 1]} ${AGG_A}`;
const AGG_BREVE = `${AGG_G} ${MESI_BREVI[AGG_M - 1]}`;

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

/* ── Le vie del paese, per il modulo della Color Runner ───────────────────
   {{VIE}} diventa un blocco JSON che il modulo di /color-runner legge dal DOM
   per suggerire l'indirizzo mentre lo si scrive. Sono le vie vere di Rivalta
   con i civici mappati in OpenStreetMap: chi abita qui trova il suo indirizzo
   in due lettere e lo sceglie, invece di scriverlo ognuno a modo suo — «V.
   Sette Frati 12», «via settefrati, 12», «Via Sette Frati n. 12» sono tre
   grafie della stessa casa, e a chi poi legge l'elenco degli iscritti tocca
   riconoscerle a mano.

   Non è un archivio anagrafico e non pretende di esserlo: i civici sono
   quelli che risultano mappati (177 su 21 vie), e le vie senza nemmeno un
   civico in OSM restano nell'elenco lo stesso — la via si sceglie dalla lista
   e il numero si scrive a mano. Il campo accetta comunque testo libero: chi
   abita fuori Rivalta scrive il suo indirizzo e nessuno glielo impedisce. */
const VIE_ESCLUSE = new Set([
  // Non sono indirizzi di casa: nessuno ci abita.
  "Ciclabile Rivalta sul Mincio - Grazie",
  "Sottopasso",
]);

/* Due nomi arrivano da OSM in una forma che in un elenco di indirizzi si
   leggerebbe come uno sbaglio nostro. Si correggono qui, non nel dataset:
   quel file è la copia fedele di quanto scaricato, e va lasciato tale.
   La correzione giusta sta a monte, in OpenStreetMap. */
const VIE_CORREZIONI = {
  "Via Gacomo Puccini": "Via Giacomo Puccini", // refuso in OSM
  "Via T. Battisti": "Via Tertulliano Battisti", // stessa via, scritta corta
};

const renderVie = () => {
  const ds = JSON.parse(readFileSync("data/rivalta_dataset.json", "utf8"));
  const nome = (n) => VIE_CORREZIONI[n] || n;
  const vie = new Map();

  for (const s of ds.strade) {
    if (!s.nome || s.nome === "(senza nome)" || VIE_ESCLUSE.has(s.nome)) continue;
    vie.set(nome(s.nome), []);
  }
  for (const [via, civici] of Object.entries(ds.civici_mappati)) {
    const chiave = nome(via);
    if (VIE_ESCLUSE.has(via)) continue;
    const elenco = vie.get(chiave) || [];
    // Ordine di casa: 2, 6, 9, 10 — non 10, 2, 6 come ordinerebbe il testo.
    vie.set(
      chiave,
      [...new Set([...elenco, ...civici])].sort(
        (a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b)
      )
    );
  }

  const ordinate = Object.fromEntries([...vie.entries()].sort((a, b) => a[0].localeCompare(b[0], "it")));
  return `<script type="application/json" id="cr-vie">${JSON.stringify(ordinate).replace(/</g, "\\u003c")}</script>`;
};

/* ── I loghi di chi c'è dietro ────────────────────────────────────────────
   Stessa regola delle fotografie: il logo compare solo se il file esiste
   davvero. Finché non c'è, al suo posto sta il nome scritto — che in una
   striscia di loghi si legge come una scelta e non come un'immagine rotta.
   Il giorno che il file entra in assets/loghi/ prende il suo posto da sé.

   L'estensione non è fissata: vince il primo formato trovato, in quest'ordine.
   Un SVG resta nitido a qualsiasi misura ed è la scelta giusta per un logo. */
const LOGHI = [
  { file: "anspi", nome: "ANSPI", desc: "Associazione Nazionale San Paolo Italia — oratori e circoli", url: "https://www.anspi.it", classe: "sb-cr-logo--anspi" },
  { file: "comune-rodigo", nome: "Comune di Rodigo", desc: "Stemma del Comune di Rodigo", url: "https://comune.rodigo.mn.it", classe: "sb-cr-logo--rodigo" },
  { file: "ap", nome: ".ap", desc: "Alberto Pecchini", url: "https://albertopecchini.it", classe: "sb-cr-logo--ap" },
];

const loghiMancanti = [];
const renderLoghi = () =>
  `<div class="sb-cr-loghi">
${LOGHI.map((l) => {
  const trovato = ["svg", "png", "webp", "jpg"]
    .map((est) => `assets/loghi/${l.file}.${est}`)
    .find((p) => existsSync(p));
  if (!trovato) loghiMancanti.push(`${l.file}.svg`);
  const dentro = trovato
    ? `<img src="${trovato}" alt="${escape(l.desc)}" loading="lazy" decoding="async">`
    : `<span class="sb-cr-logo-t">${escape(l.nome)}</span>`;
  return `      <a class="sb-cr-logo ${l.classe || ""}" href="${escape(l.url)}" target="_blank" rel="noreferrer noopener" title="${escape(l.desc)}">${dentro}</a>`;
}).join("\n")}
    </div>`;

/* ── Il banner della Color Runner ─────────────────────────────────────────
   Il manifesto dell'evento, in HTML e non in un'immagine: testo vero in
   Titillium Web, tema chiaro/scuro nativo, nitido a ogni scala. Forma e colore
   li tiene .sb-riv-crbanner in assets/rivalta.css.

   Un pezzo, tre tagli, tutti da {{BANNER}} — che nel frammento di ogni pagina
   sta nel punto giusto: grande dentro la testata di /color-runner; una
   striscia incassata nella scheda in home; una striscia-collegamento in coda
   al regolamento. La data sta scritta qui una volta per tutte e tre. */
const CR_DATA = "Domenica 20 settembre 2026";

const tesseraMincio =
  `<span class="sb-riv-crbanner-tessera">` +
  `<svg width="18" height="11" viewBox="0 0 24 14" fill="none" aria-hidden="true">` +
  `<path d="M1 4.6c2.6-3 5.1-3 7.7 0s5.1 3 7.7 0 5.1-3 6.6-1.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M1 10c2.6-3 5.1-3 7.7 0s5.1 3 7.7 0 5.1-3 6.6-1.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` +
  `</svg></span>`;

const marchioMincio =
  `<div class="sb-riv-crbanner-marchio">${tesseraMincio}<span>Rivalta sul Mincio</span></div>`;

const renderBanner = (page) => {
  if (page === "color-runner") {
    return `<figure class="sb-riv-crbanner sb-riv-crbanner--manifesto">
      <div class="sb-panel"><div class="sb-panel-inner">
        <div class="sb-riv-crbanner-corpo">
          <span class="sb-riv-crbanner-polvere" aria-hidden="true"></span>
          <div class="sb-riv-crbanner-testo">
            <p class="sb-riv-crbanner-tit">Color Runner</p>
            <p class="sb-riv-crbanner-sub">Camminata a colori, non competitiva — per le vie di Rivalta sul Mincio</p>
          </div>
          ${marchioMincio}
        </div>
      </div></div>
    </figure>`;
  }
  if (page === "index") {
    return `<div class="sb-riv-crbanner sb-riv-crbanner--striscia sb-riv-crbanner--incasso">
            <div class="sb-riv-crbanner-corpo">
              <span class="sb-riv-crbanner-polvere" aria-hidden="true"></span>
              <div class="sb-riv-crbanner-testo">
                <p class="sb-riv-crbanner-data">${CR_DATA} · dalle 15:30</p>
              </div>
              ${marchioMincio}
            </div>
          </div>`;
  }
  if (page === "color-runner-regolamento") {
    return `<a class="sb-riv-crbanner sb-riv-crbanner--striscia" href="/color-runner">
    <div class="sb-panel"><div class="sb-panel-inner">
      <div class="sb-riv-crbanner-corpo">
        <span class="sb-riv-crbanner-polvere" aria-hidden="true"></span>
        <div class="sb-riv-crbanner-testo">
          <p class="sb-riv-crbanner-data">${CR_DATA}</p>
          <p class="sb-riv-crbanner-nome">Color Runner <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></p>
        </div>
        ${marchioMincio}
      </div>
    </div></div>
  </a>`;
  }
  return "";
};

/* ── Le sei contrade ──────────────────────────────────────────────────────
   Rivalta si divide in sei contrade, e le sei ricorrono in due pagine: per
   esteso in /eventi, in fila su /color-runner. Stanno scritte qui una volta
   sola — nome, colore, stemma — e le pagine le chiamano con {{CONTRADE}} e
   {{CONTRADE_FILA}}. Il giorno che arriva l'artwork vero degli stemmi si
   cambia questo elenco, non due pagine.

   Gli stemmi sono ridisegnati al tratto sulla stessa griglia 24×24 delle
   altre icone del sito: quelli veri sono dipinti a colori pieni sui cartelli
   che stanno in mostra alle giornate del Palio, e questi ne sono la
   traduzione, non la copia. Il colore non è qui: lo dà assets/rivalta.css a
   partire da `slug`, così una tinta sbagliata si corregge in un posto solo.

   `nota` dice cosa c'è dipinto sul cartello, e — dove il sito ha già il dato
   altrove — dove quel nome ricompare in paese. Niente etimologie inventate:
   di Filanda, Piasaröi e Fanfane si dice solo lo stemma, perché di più non
   si sa. */
const icona = (d) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const CONTRADE = [
  {
    slug: "filanda",
    nome: "la Filanda",
    colore: "marrone",
    nota: "La filanda, e accanto il bozzolo del baco da seta.",
    stemma: icona(
      `<path d="M2.6 11.5 8.5 6l5.9 5.5"/><path d="M4.3 11.5V20h8.4v-8.5"/>` +
      `<path d="M7.1 20v-4h3v4"/><path d="M18.8 20v-4.3"/><ellipse cx="18.8" cy="11.9" rx="2.4" ry="3.4"/>`
    ),
  },
  {
    slug: "roccolo",
    nome: "il Roccolo",
    colore: "verde",
    nota: "Il boschetto del roccolo. In paese il nome è rimasto a Via Roccolo.",
    stemma: icona(
      `<circle cx="12" cy="8.5" r="4.2"/><circle cx="6.3" cy="11.9" r="3.1"/><circle cx="17.7" cy="11.9" r="3.1"/>` +
      `<path d="M12 20v-7"/><path d="M6.3 20v-5"/><path d="M17.7 20v-5"/><path d="M3.5 20h17"/>`
    ),
  },
  {
    slug: "colonie",
    nome: "le Colonie",
    colore: "azzurro",
    nota: "La barca a vela con la croce. Il nome torna nell'insegna del pub «Le Antiche Colonie».",
    stemma: icona(
      `<path d="M3.8 15.5h16.4l-2.3 4.5H6.1z"/><path d="M12 15.5V3.5"/>` +
      `<path d="M6.8 5.5h10.4v7H6.8z"/><path d="M6.8 9h10.4"/>`
    ),
  },
  {
    slug: "piasaroi",
    nome: "i Piasaröi",
    colore: "giallo",
    nota: "La torre, col tetto rosso e la finestra sul fronte.",
    stemma: icona(
      `<path d="M5.8 9.5 12 4l6.2 5.5"/><path d="M7.6 9.5V20h8.8V9.5"/>` +
      `<rect x="10" y="12" width="4" height="4.4" rx="0.6"/><path d="M4.5 20h15"/>`
    ),
  },
  {
    slug: "platana",
    nome: "la Plàtana",
    colore: "viola",
    nota: "Il platano. È il nome di Piazza Platana, del suo parco e dell'Area Feste.",
    stemma: icona(
      `<path d="M4.6 9.6C4.6 6.2 7.9 3.5 12 3.5s7.4 2.7 7.4 6.1-3.3 5.6-7.4 5.6-7.4-1.8-7.4-5.6Z"/>` +
      `<path d="M12 20v-5.2"/><path d="M9 20h6"/>`
    ),
  },
  {
    slug: "fanfane",
    nome: "le Fanfane",
    colore: "arancione",
    nota: "L'anfora, con l'acqua che le passa sul collo.",
    stemma: icona(
      `<path d="M9.2 3.5h5.6"/>` +
      `<path d="M10 3.5v1.5c0 2.3-3.6 3.5-3.6 7.4 0 4.2 2.5 7.6 5.6 7.6s5.6-3.4 5.6-7.6c0-3.9-3.6-5.1-3.6-7.4V3.5"/>` +
      `<path d="M10 5.4C8 5.9 6.9 7.3 7 8.9"/><path d="M14 5.4c2 .5 3.1 1.9 3 3.5"/>` +
      `<path d="M8.2 13.6c1.2-1 2.5-1 3.8 0s2.6 1 3.8 0"/>`
    ),
  },
];

/* Per esteso: una scheda a testa, con lo stemma, il nome, cosa c'è dipinto e
   il colore. */
const renderContrade = () =>
  `<div class="sb-riv-contrade">\n` +
  CONTRADE.map(
    (c) =>
      `      <div class="sb-riv-contrada" data-contrada="${c.slug}">\n` +
      `        <div class="sb-panel"><div class="sb-panel-inner">\n` +
      `          <span class="sb-riv-stemma">${c.stemma}</span>\n` +
      `          <div class="sb-riv-contrada-t">\n` +
      `            <h4>${c.nome}</h4>\n` +
      `            <p>${c.nota}</p>\n` +
      `            <span class="sb-riv-contrada-c">${c.colore}</span>\n` +
      `          </div>\n` +
      `        </div></div>\n` +
      `      </div>`
  ).join("\n") +
  `\n    </div>`;

/* In fila: stemma e nome, niente altro. */
const renderContradeFila = () =>
  `<div class="sb-riv-contrade sb-riv-contrade--fila">\n` +
  CONTRADE.map(
    (c) =>
      `      <div class="sb-riv-contrada" data-contrada="${c.slug}">` +
      `<span class="sb-riv-stemma">${c.stemma}</span>` +
      `<span class="sb-riv-contrada-n">${c.nome}</span></div>`
  ).join("\n") +
  `\n    </div>`;

/* ── Indice della ricerca ────────────────────────────────────────────────
   Da ogni pagina pubblica: un nome breve, l'indirizzo, la descrizione e
   l'elenco delle sezioni ancorate. L'etichetta della sezione la dà l'indice
   in cima alla pagina (.sb-riv-toc) quando c'è — è già scritta bene lì —
   altrimenti il titolo <h2> della sezione. A ogni sezione si allega anche un
   pezzo del suo testo (non mostrato, solo cercabile): così «autobus» porta a
   /muoversi#trasporti anche se la parola non è nel titolo della sezione.

   Il risultato finisce in assets/ricerca-dati.js, che assets/ricerca.js
   legge per la tendina «Cerca» in testata: nessuna chiamata a runtime,
   l'indice è già qui. */
const senzaTag = (s) =>
  s
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp|egrave|agrave|ograve|igrave|ugrave|eacute);/g, (_, e) =>
      ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " ",
         egrave: "è", agrave: "à", ograve: "ò", igrave: "ì", ugrave: "ù", eacute: "é" }[e])
    )
    .replace(/\s+/g, " ")
    .trim();

const sezioniDi = (html) => {
  const etichetta = {};
  const toc = html.match(/<nav class="sb-riv-toc"[\s\S]*?<\/nav>/);
  if (toc) {
    for (const m of toc[0].matchAll(/href="#([^"]+)">([\s\S]*?)<\/a>/g)) {
      etichetta[m[1]] = senzaTag(m[2]);
    }
  }
  const pulisci = (s) => senzaTag(s).replace(/^\d{1,3}\s*[–—.)]\s+/, "").trim();
  const taglia = (s, n) => senzaTag(s).slice(0, n).replace(/\s+\S*$/, "");

  const out = [];
  const visti = new Set();
  // Lo split su <section taglia il documento in blocchi che finiscono dove
  // comincia la sezione dopo: un <h2> non può sconfinare in quella seguente.
  for (const blocco of html.split(/<section\b/).slice(1)) {
    const id = (blocco.match(/^[^>]*\bid="([^"]+)"/) || [])[1];
    if (!id || visti.has(id)) continue;
    const h2 = blocco.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
    const nome = pulisci(etichetta[id] || (h2 ? h2[1] : ""));
    if (nome) {
      visti.add(id);
      const testo = taglia(blocco.replace(/<h2\b[\s\S]*?<\/h2>/i, " "), 320);
      out.push(testo ? [nome, id, testo] : [nome, id]);
    }
    // Anche i sotto-titoli con un'ancora propria (l'unico <h3> con id nella
    // pagina, tipo #stazione-meteo): sono bersagli di collegamento veri.
    for (const m of blocco.matchAll(/<h3\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/g)) {
      if (visti.has(m[1])) continue;
      const sub = pulisci(m[2]);
      if (!sub) continue;
      visti.add(m[1]);
      const dopo = blocco.slice(blocco.indexOf(m[0]) + m[0].length);
      const testo = taglia(dopo, 220);
      out.push(testo ? [sub, m[1], testo] : [sub, m[1]]);
    }
  }
  return out;
};

/* Qualche parola in più a livello di pagina: l'occhiello (.sb-riv-lede) o il
   primo paragrafo. Non si mostra, si cerca soltanto. */
const parolePagina = (html) => {
  const lede = html.match(/<p class="sb-riv-lede"[^>]*>([\s\S]*?)<\/p>/);
  const primo = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  return senzaTag((lede || primo || [, ""])[1]).slice(0, 240).replace(/\s+\S*$/, "");
};

const bodies = readdirSync("_build").filter((f) => f.endsWith(".body.html"));
if (!bodies.length) throw new Error("nessun frammento in _build/");

const sitemap = [];
const ricerca = [];

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
      .replace("{{VIE}}", renderVie)
      .replace("{{LOGHI}}", renderLoghi)
      .replace("{{BANNER}}", () => renderBanner(page))
      .replace("{{CONTRADE_FILA}}", renderContradeFila)
      .replace("{{CONTRADE}}", renderContrade)
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

  /* Una pagina bozza (link condiviso a mano, non ancora in nav) dichiara
     `noindex: true` nel frammento: esce dal sito con
     "noindex, nofollow" e non entra in sitemap.xml, così Google non la
     scopre e non la indicizza finché non è pronta a essere pubblica. */
  const noindex = optMeta(src, "noindex", "false") === "true";
  const robots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  let out =
    head
      .replace("{{TITLE}}", title)
      .replace("{{DESC}}", desc)
      .replace(/\{\{CANONICAL\}\}/g, canonical)
      .replace(/\{\{OG_TITLE\}\}/g, escape(title))
      .replace(/\{\{OG_DESC\}\}/g, escape(desc))
      .replace("{{OG_IMAGE}}", ogImg)
      .replace("{{ROBOTS}}", robots)
      .replace("{{HEAD}}", headExtra) +
    `  <main class="sb-main" id="main">\n${body}\n  </main>\n` +
    foot.replace("{{SCRIPTS}}", scriptExtra);

  /* La data dell'ultimo commit sta in testata e in fondo a ogni pagina, con
     tre forme: l'attributo `datetime` legge la macchina, la riga lunga si
     legge in fondo, quella breve in testata dove lo spazio è poco. */
  out = out
    .replace(/\{\{UPDATED_ISO\}\}/g, AGG_ISO)
    .replace(/\{\{UPDATED_LONG\}\}/g, AGG_LUNGO)
    .replace(/\{\{UPDATED_SHORT\}\}/g, AGG_BREVE);

  writeFileSync(`${page}.html`, out);

  if (!noindex) {
    ricerca.push({
      t: page === "index" ? "Home" : senzaTag((body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1]) || title.split("—")[0].trim(),
      u: page === "index" ? "/" : `/${page}`,
      d: desc,
      x: parolePagina(body),
      h: sezioniDi(body),
    });

    sitemap.push({
      loc: canonical,
      // Data dell'ultima modifica VERA del contenuto: il timestamp del frammento
      // sorgente, non "oggi". Rigenerare il sito senza aver cambiato niente non
      // deve dire ai motori che tutte e nove le pagine sono state riscritte.
      lastmod: statSync(`_build/${file}`).mtime.toISOString().slice(0, 10),
      freq: optMeta(src, "freq", "monthly"),
      prio: optMeta(src, "prio", "0.7"),
    });
  }

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

/* ── Dati della ricerca ──────────────────────────────────────────────────
   Lo stesso elenco che genera le pagine genera l'indice: una pagina nuova
   entra nella ricerca da sé. Va in assets/ (che il browser scarica), non in
   _build/ (che resta a casa), e si committa già pronto come sitemap.xml. */
writeFileSync(
  "assets/ricerca-dati.js",
  `/* Generato da build.mjs — NON modificare a mano.
   Indice della ricerca: nome, indirizzo, descrizione e sezioni ancorate di
   ogni pagina pubblica. Lo rigenera ogni build; lo legge assets/ricerca.js
   per la tendina «Cerca» in testata. */
window.RSM_RICERCA = ${JSON.stringify(ricerca)};
`
);
const nSezioni = ricerca.reduce((n, p) => n + p.h.length, 0);
console.log(`✓ assets/ricerca-dati.js  (${ricerca.length} pagine, ${nSezioni} sezioni)`);

/* ── Le mail della Color Runner ───────────────────────────────────────────
   Due mail — la ricevuta di chi ha pagato e l'avviso a chi non è arrivato in
   fondo — vivono come HTML in _build/email/, perché è lì che si guardano e si
   correggono: aprendole nel browser. Ma a spedirle è una funzione su Vercel, e
   _build/ è in .vercelignore: su Vercel quei file non ci arrivano.

   Quindi il build le porta di là. Risolve i dati dell'evento, toglie via le
   sezioni che non hanno ancora i loro dati, e scrive il risultato dentro
   api/conferma-color-runner.mjs, fra due marcatori. Da lì in poi sono due
   stringhe dentro la funzione: nessun file da leggere a runtime, nessuna
   configurazione di bundling da indovinare, niente che possa mancare
   all'appello proprio mentre qualcuno sta pagando.

   Il blocco fra i marcatori è generato: si modifica l'HTML in _build/email/ e
   si rifà il build, non il contrario. Il build successivo lo riscrive.       */
const evento = JSON.parse(readFileSync("_build/email/evento.json", "utf8"));

/* Una sezione entra nella mail solo se TUTTI i campi che le servono sono
   compilati. È la regola che impedisce a «ritrovo alle {{RITROVO_ORA}}» di
   arrivare nella posta di una persona vera: mezza indicazione di ritrovo è
   peggio di nessuna, e una parentesi graffa è peggio di tutte e due. */
const pieno = (k) => String(evento[k] ?? "").trim() !== "";
const sezioni = {
  quando: ["ritrovoOra", "ritrovoLuogo"].every(pieno),
  percorso: ["partenza", "distanza"].every(pieno),
  portare: ["portare", "fornito"].every(pieno),
  rimborsi: ["dataLimite", "rimborsi"].every(pieno),
  contatto: pieno("organizzatori"),
};
/* Se non si sa né dove né cosa portare, la ricevuta non può tacere del tutto
   sul 20 settembre: al posto delle due sezioni ne compare una che dice che i
   dettagli arrivano. Quando anche una sola delle due c'è, non serve più. */
sezioni["dettagli-in-arrivo"] = !sezioni.quando && !sezioni.portare;
/* E quando invece il ritrovo si sa ma qualcos'altro no, la ricevuta non torna
   muta sul resto: una riga sola, sotto le sezioni che ci sono, dice che quel
   che manca arriva. Sparisce da sé il giorno che evento.json è completo. */
sezioni["ancora-da-dire"] = sezioni.quando && !(sezioni.percorso && sezioni.portare);

const campiMail = {
  RITROVO_ORA: evento.ritrovoOra,
  RITROVO_LUOGO: evento.ritrovoLuogo,
  PARTENZA: evento.partenza,
  DISTANZA: evento.distanza,
  PORTARE: evento.portare,
  FORNITO: evento.fornito,
  DATA_LIMITE: evento.dataLimite,
  RIMBORSI: evento.rimborsi,
  ORGANIZZATORI: evento.organizzatori,
};

const compilaMail = (nome) => {
  let src = readFileSync(`_build/email/${nome}`, "utf8");

  // Prima le sezioni: quello che sparisce non ha bisogno di essere riempito.
  // Se la sezione resta, se ne vanno solo le due righe dei marcatori.
  /* I file di _build/ hanno fine riga alla Windows: il `\r?` non è pignoleria,
     senza si lascerebbe indietro una riga vuota per ogni pezzo tolto. */
  for (const [chiave, tienila] of Object.entries(sezioni)) {
    const blocco = new RegExp(
      "[ \\t]*<!--sezione:" + chiave + "-->[\\s\\S]*?<!--/sezione-->\\r?\\n?",
      "g"
    );
    src = src.replace(blocco, (m) =>
      tienila ? m.replace(/[ \t]*<!--\/?sezione[^>]*-->\r?\n?/g, "") : ""
    );
  }

  /* Poi via i commenti. Quelli di questi due file sono lunghi — spiegano
     perché una mail si scrive a tabelle — e nella posta di chi si è iscritto
     non fanno niente: sono quattro kB per messaggio di conversazione fra chi
     mantiene il sito. Restano nel sorgente, che è dove si leggono.
     Le condizionali di Outlook (<!--[if mso]> … <![endif]-->) sopravvivono:
     qui non ce ne sono, ma il giorno che servissero non vanno tolte. */
  src = src.replace(/[ \t]*<!--(?!\[if)[\s\S]*?-->\r?\n?/g, "");

  // Poi i dati dell'evento. Vengono da un JSON scritto a mano e finiscono in
  // HTML: passano dall'escape come qualunque altro testo di provenienza umana.
  for (const [chiave, valore] of Object.entries(campiMail)) {
    src = src.split(`{{${chiave}}}`).join(escape(String(valore ?? "")));
  }

  const restati = src.match(/\{\{[A-Z_]+\}\}/g) || [];
  const attesi = [
    "{{NOME}}",
    "{{DATA}}",
    "{{IMPORTO_QUOTA}}",
    "{{IMPORTO_COMMISSIONI}}",
    "{{IMPORTO}}",
    "{{MOTIVO}}",
  ];
  const orfani = [...new Set(restati)].filter((x) => !attesi.includes(x));
  if (orfani.length) throw new Error(`${nome}: segnaposto senza dato — ${orfani.join(" ")}`);

  return src;
};

/* Dentro un template literal solo tre cose vanno protette. Il resto dell'HTML
   — apici, virgolette, accenti — ci sta dentro tale e quale. */
const stringa = (t) =>
  "`" + t.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const FUNZIONE = "api/conferma-color-runner.mjs";
const sorgente = readFileSync(FUNZIONE, "utf8");
const marcatori = /(\/\* build:modelli:inizio \*\/\n)[\s\S]*?(\/\* build:modelli:fine \*\/)/;
if (!marcatori.test(sorgente)) {
  throw new Error(`${FUNZIONE}: mancano i marcatori build:modelli:inizio … build:modelli:fine`);
}

const ricevuta = compilaMail("ricevuta-color-runner.html");
const fallita = compilaMail("fallita-color-runner.html");

/* `export` e non `const` semplice: prova-invio.mjs importa questi due modelli
   per spedirsi una mail vera prima che lo faccia un iscritto vero. Vercel
   guarda solo l'export di default, gli altri non gli danno fastidio. */
const generato = `/* Generato da build.mjs — NON modificare a mano.
   I sorgenti sono _build/email/ricevuta-color-runner.html,
   _build/email/fallita-color-runner.html e _build/email/evento.json. */

export const ORGANIZZATORI = ${JSON.stringify(String(evento.organizzatori || "").trim())};

export const MODELLO_RICEVUTA = ${stringa(ricevuta)};

export const MODELLO_FALLITA = ${stringa(fallita)};

`;

/* La sostituzione passa da una funzione e non da una stringa: dentro
   `generato` c'è HTML, e String.replace legge $& $1 $` come istruzioni
   proprie anche quando sono capitate lì per caso. */
writeFileSync(
  FUNZIONE,
  sorgente.replace(marcatori, (_, apri, chiudi) => apri + generato + chiudi)
);
console.log(
  `✓ ${FUNZIONE}  (2 mail, ${((ricevuta.length + fallita.length) / 1024).toFixed(1)} kB)`
);

/* Le sezioni saltate non sono un errore — la mail funziona lo stesso — ma non
   devono passare inosservate: sono le cose che il gruppo del Palio non ha
   ancora deciso, e finché non le decide chi si iscrive non le legge. */
/* Le due qui sotto non si compilano: le decide il build guardando le altre,
   e una delle due c'è sempre. Non sono cose che manchino. */
const dedotte = ["dettagli-in-arrivo", "ancora-da-dire"];
const saltate = Object.entries(sezioni).filter(([k, v]) => !v && !dedotte.includes(k));
if (saltate.length) {
  const vuoti = Object.keys(campiMail).filter(
    (k) => String(campiMail[k] ?? "").trim() === ""
  );
  console.log(`\n⚠ mail Color Runner: ${saltate.length} sezioni non entrano — ${saltate.map(([k]) => k).join(", ")}.`);
  console.log(`  Campi vuoti in _build/email/evento.json: ${vuoti.join(", ")}`);
  if (!sezioni.contatto) {
    console.log(`  Senza "organizzatori" le mail partono senza indirizzo a cui rispondere.`);
  }
  console.log(`  Si compilano lì e si rifà il build: le sezioni tornano da sé.`);
}

if (loghiMancanti.length) {
  console.log(`
⚠ loghi: ne mancano ${loghiMancanti.length} — ${loghiMancanti.join("  ")}`);
  console.log(`  Vanno in assets/loghi/ con quel nome esatto (svg, png, webp o jpg).`);
  console.log(`  Finché non ci sono, su /color-runner al loro posto si legge il nome.`);
}

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
