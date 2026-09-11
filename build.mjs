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
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync, watch } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

/* ── Come si lancia ───────────────────────────────────────────────────────
   `node build.mjs` costruisce una volta e finisce: è il modo di sempre.

   `node build.mjs --guarda` costruisce, poi resta ad ascoltare _build/ e
   assets/ e ricostruisce da sé a ogni salvataggio. Non ricostruisce dentro
   questo processo: rilancia sé stesso come figlio. Metà di questo file è
   stato a livello di modulo — le JSON lette una volta sola, gli elenchi degli
   avvisi che si riempiono via via — e riusarlo due volte vorrebbe dire
   portarsi dietro le briciole del giro prima. Un processo nuovo parte pulito
   per costruzione, e costa quaranta millisecondi.

   Al figlio si passano in ambiente le due cose che costano davvero: la data
   dell'ultimo commit e il conto dei commit. Sono due sottoprocessi git — su
   Windows la parte lenta di tutto il build — e fra un salvataggio e l'altro
   non cambiano mai. */
const GUARDA = process.argv.includes("--guarda");
const FIGLIO = process.argv.includes("--figlio");
const PARTITO = Date.now();

/* ── Si scrive solo quello che cambia ─────────────────────────────────────
   Finora ogni giro riscriveva tutti e diciotto i file, identici a sé stessi.
   Tre conseguenze, tutte fastidiose: `git status` non sapeva più distinguere
   una modifica vera dal rumore del build, l'anteprima ricaricava diciotto
   volte per una parola cambiata, e il registro in console diceva diciotto
   volte la stessa cosa senza dire l'unica che interessa — cos'è cambiato.

   Qui si confronta prima di scrivere. Chi non è cambiato non si tocca. */
const cambiati = [];
const invariati = [];

/* Gli avvisi che nascono mentre le pagine si montano non si stampano lì:
   uscirebbero in mezzo all'elenco dei file, e verrebbero spinti via dalle
   righe che arrivano dopo. Si mettono da parte e si dicono tutti insieme in
   fondo, dove si guarda. */
const avvisiRimandati = [];

const scriviSeCambia = (percorso, contenuto) => {
  const prima = existsSync(percorso) ? readFileSync(percorso, "utf8") : null;
  if (prima === contenuto) {
    invariati.push(percorso);
    return false;
  }
  writeFileSync(percorso, contenuto);
  cambiati.push({ percorso, kB: contenuto.length / 1024, delta: prima === null ? null : (contenuto.length - prima.length) / 1024 });
  return true;
};


/* Dominio di produzione. Serve per due cose che DEVONO dire la stessa identica
   riga, o Search Console le tratta come pagine diverse: l'URL canonico nella
   testata di ogni pagina e il <loc> nella sitemap. Sta scritto una volta qui. */
const SITE = "https://www.rivaltasulmincio.it";

const head = readFileSync("_build/head.html", "utf8");
const foot = readFileSync("_build/foot.html", "utf8");

/* ── Il vestito del mese ─────────────────────────────────────────────────
   Un mese, un simbolo. Il sito si veste della stagione: l'accento azzurro
   del design system vira sulla tinta del mese, un festone si appende alla
   testata, qualche foglia scende sul fondale. Impaginato, caratteri, grigi,
   margine sinistro e smusso non si muovono: cambia l'accento, non il sito.

   Qui si cambia UNA riga. STAGIONE punta alla voce del mese in corso; a
   ottobre si aggiunge la voce nuova e si sposta il puntatore. STAGIONE a
   null spoglia il sito e non lascia in giro né classi né script.

   Fuori restano le tre pagine della Color Walk: una vernice ce l'hanno già
   (.sb-cr, le tinte delle polveri) e due stagioni addosso sono una di
   troppo. Non è un elenco di nomi da tenere aggiornato — è lo stesso
   riconoscimento che decide se caricare color-walk.js.

   Il colore, il festone e la nota sono CSS e HTML: arrivano anche senza
   JavaScript. Solo le foglie che scendono hanno bisogno di
   assets/stagioni.js, ed è l'unico peso in più.

   ── E i colori da dove vengono ────────────────────────────────────────
   Non da un occhio che sceglie un viola che sta bene. Rivalta non ha
   vigne — la sua terra fa cereali e meloni, sta scritto in /attivita — ma
   il Mincio che le passa davanti scende dall'anfiteatro morenico del
   Garda, e lassù il vino c'è. Le sei tinte di settembre sono le parole
   con cui l'articolo 6 dei due disciplinari di zona descrive quei vini:
   «rosso rubino più o meno intenso», «o granato», «tendente al cerasuolo
   con l'invecchiamento», «rosato brillante», «giallo paglierino»,
   «sentore di viola o ribes». Ognuna sta scritta nella nota in fondo alle
   pagine, con la denominazione da cui viene e la fonte.

   Questo è il senso di `tinte` e `zone` qui sotto: non sono decorazione,
   sono la citazione. Cambiando mese cambiano le une e le altre. */
const STAGIONI = {
  uva: {
    nome: "settembre · vendemmia",
    occhiello: "Settembre · vendemmia",
    titolo: "I colori di questo mese sono parole",
    testo: [
      `A Rivalta non ci sono vigne: qui la terra fa <a href="/attivita#economia">cereali e meloni</a>. Ma il fiume che le passa davanti scende dall'<strong>anfiteatro morenico del Garda</strong>, e lassù — una ventina di chilometri risalendo il Mincio — il vino si fa da molto prima che ci fosse un disciplinare a descriverlo.`,
      `Le sei tinte di settembre non le ha scelte nessuno a occhio: sono i colori che i disciplinari di quei vini <strong>scrivono, parola per parola</strong>, all'articolo 6.`,
    ],
    /* Ogni tinta: la variabile del foglio, la parola testuale del
       disciplinare, e da quale vino viene. L'ordine è quello in cui si
       leggono in fondo alla pagina. */
    tinte: [
      { v: "rubino", parola: "rosso rubino più o meno intenso", dove: "Lambrusco Mantovano DOC · rosso" },
      { v: "granato", parola: "…o granato", dove: "Lambrusco Mantovano DOC · rosso" },
      { v: "cerasuolo", parola: "tendente al cerasuolo con l'invecchiamento", dove: "Garda Colli Mantovani DOC · rosso" },
      { v: "rosato", parola: "rosato brillante", dove: "Garda Colli Mantovani DOC · chiaretto" },
      { v: "paglierino", parola: "giallo paglierino", dove: "Garda Colli Mantovani DOC · bianco" },
      { v: "viola", parola: "sentore di viola o ribes", dove: "Lambrusco Mantovano DOC · odore" },
    ],
    zone: [
      {
        t: "Le colline, risalendo il Mincio",
        d: `<strong>Garda Colli Mantovani DOC</strong> e <strong>Alto Mincio IGT</strong> stanno sugli stessi sei comuni dell'anfiteatro morenico: Castiglione delle Stiviere, Cavriana, Monzambano, Ponti sul Mincio, Solferino, Volta Mantovana. Due di quei paesi stanno sul Mincio come Rivalta, solo più a monte. Uve: garganega e trebbiano per il bianco, merlot, rondinella e cabernet per il rosso e il chiaretto.`,
      },
      {
        t: "La pianura, oltre l'Oglio e oltre il Po",
        d: `<strong>Lambrusco Mantovano DOC</strong> in due sottozone: <em>Viadanese-Sabbionetano</em> fra Oglio e Po — Commessaggio, Dosolo, Gazzuolo, Sabbioneta, Viadana — e <em>Oltrepò Mantovano</em>, oltre il Po. Uve Lambrusco Viadanese (o Grappello Ruberti), Maestri, Marani e Salamino.`,
      },
    ],
    fonti: [
      { t: "Garda Colli Mantovani DOC — disciplinare, art. 6", u: "https://www.agraria.org/vini/garda-colli-mantovani-doc.htm" },
      { t: "Lambrusco Mantovano DOC — disciplinare, art. 6", u: "https://www.agraria.org/vini/lambrusco-mantovano-doc.htm" },
      { t: "Strada dei Vini e dei Sapori Mantovani", u: "https://www.mantovastrada.it/" },
    ],
    /* Il ritmo del festone: cosa pende da ogni campata. Scritto a mano e
       non tirato a caso — il build deve dare lo stesso file a ogni giro,
       o quindici pagine cambiano a ogni `node build.mjs` senza motivo. */
    pendenti: ["foglia", "grappolo", "viticcio", "foglia", "grappolo", "foglia", "viticcio", "grappolo", "foglia", "viticcio", "grappolo", "foglia", "grappolo"],
  },
};
const STAGIONE = "uva";
const stagione = STAGIONE && STAGIONI[STAGIONE] ? STAGIONE : null;
if (STAGIONE && !stagione) throw new Error(`STAGIONE = "${STAGIONE}" — voce assente da STAGIONI`);
const stag = stagione ? STAGIONI[stagione] : null;

/* ── Il festone ──────────────────────────────────────────────────────────
   Un tralcio che attraversa la testata, con foglie, grappoli e viticci
   appesi. NON è un'immagine ripetuta: è SVG in pagina, perché ogni pendaglio
   deve poter dondolare per conto suo — un festone in cui tutto oscilla allo
   stesso istante non è un festone, è una texture che trema.

   Tredici campate da 200px coprono 2600px, cioè qualunque schermo; il
   contenitore taglia il resto. L'arco di ogni campata parte e finisce a
   y=4, così le campate si saldano fra loro senza giunte visibili, e tocca
   il punto più basso a (100, 23.5), che è dove si attacca il pendaglio.

   I disegni stanno una volta sola in <defs> e si ripetono con <use>: il
   tralcio intero pesa poco più di una foto piccola, e il colore lo prende
   dal foglio (classi, non attributi) così segue il tema chiaro/scuro.

   La foglia è quella della vite: cinque lobi, seni profondi, nervature
   che partono tutte dal picciolo. Il grappolo è conico, largo in cima e a
   punta in fondo, con tre acini che prendono luce. Il viticcio è la
   spirale con cui la vite si aggrappa. */
function renderFestone(s) {
  const CAMPATA = 200;
  const N = s.pendenti.length;
  const W = CAMPATA * N;

  /* Le tre scale si ripetono ogni tre campate: due pendagli identici
     accanto si riconoscono subito come copie, tre scale diverse no. */
  const SCALE = [0.98, 0.86, 0.92];

  /* ── Perché il colore passa da variabili e non da classi ────────────────
     Dentro un <use> non si entra col selettore: il clone vive in un albero
     d'ombra, e `.campata .sb-stag-verde` non trova niente perché quella
     classe sta in <defs>, fuori dalla campata. Per un po' qui c'erano tre
     regole di nth-of-type scritte proprio così, e non hanno mai tinto una
     foglia — il festone era tredici copie identiche, e il commento accanto
     diceva il contrario.

     Quello che ATTRAVERSA il confine del clone è l'eredità. Quindi i
     disegni in <defs> non nominano più una tinta: nominano una variabile
     (--f-lembo, --f-tralcio, --f-acino), e ogni campata scrive la propria
     sul <g> che la contiene. La variabile scende nel clone, e la stessa
     foglia esce verde in una campata e già girata all'oro in quella dopo.

     Le tre serie non tornano mai in fase — 3, 4 e 5 campate — così su
     tredici campate non se ne ripete nessuna uguale a un'altra. */
  const LEMBO = ["vite", "vite-oro", "vite"];
  const ACINI = ["granato", "rubino", "granato", "cerasuolo"];
  /* Una campata su cinque sta un passo indietro: in un filare vero non è
     tutto sullo stesso piano, e su cinquanta pixel d'altezza la profondità
     si legge dal tono, non dalla dimensione. */
  const INDIETRO = 5;

  const campate = s.pendenti
    .map((p, i) => {
      const x = i * CAMPATA;
      const sc = SCALE[i % SCALE.length];
      const lembo = LEMBO[i % LEMBO.length];
      const acino = ACINI[i % ACINI.length];
      const dietro = i % INDIETRO === 2;
      const stile =
        `--f-lembo: var(--stag-${lembo});` +
        `--f-tralcio: var(--stag-${lembo});` +
        `--f-acino: var(--stag-${acino})`;
      return (
        `<g transform="translate(${x} 0)" style="${stile}"${dietro ? ` class="sb-stag-dietro"` : ""}>` +
        `<use href="#stag-arco"/>` +
        `<g transform="translate(100 23.5) scale(${sc})">` +
        `<g class="sb-stag-pend" style="--i:${i}"><use href="#stag-${p}"/></g>` +
        `</g></g>`
      );
    })
    .join("");

  return (
    `    <div class="sb-stag-festone" aria-hidden="true">\n` +
    `      <svg width="${W}" height="50" viewBox="0 0 ${W} 50" fill="none" focusable="false">\n` +
    `        <defs>\n` +
    `          <path id="stag-arco" class="sb-stag-tralcio" d="M0 4C50 30 150 30 200 4"/>\n` +
    /* Foglia di vite: picciolo, lembo a cinque lobi, cinque nervature. */
    `          <g id="stag-foglia">` +
    `<path class="sb-stag-tralcio" d="M0 0v4"/>` +
    `<path class="sb-stag-verde" d="M0 2C4 2 8 3 10 5.6 11 7.5 8.5 8.5 6.6 10.2 9.6 10.6 12 12 12.2 14.4 12.4 16.4 8 16.8 5.2 17.8 4.4 21 2.6 23 0 25.4-2.6 23-4.4 21-5.2 17.8-8 16.8-12.4 16.4-12.2 14.4-12 12-9.6 10.6-6.6 10.2-8.5 8.5-11 7.5-10 5.6-8 3-4 2 0 2Z"/>` +
    `<path class="sb-stag-nervo" d="M0 4V23M0 4.4 8.8 5.6M0 4.4 10.6 13.6M0 4.4-8.8 5.6M0 4.4-10.6 13.6"/>` +
    `</g>\n` +
    /* Grappolo conico: dieci acini che si stringono verso la punta, tre
       con la luce addosso in alto a sinistra, da dove viene sempre. */
    `          <g id="stag-grappolo">` +
    `<path class="sb-stag-tralcio" d="M0 0v3.4"/>` +
    `<g class="sb-stag-acino">` +
    `<circle cx="-8.2" cy="6.2" r="3.2"/><circle cx="-2.7" cy="6.2" r="3.2"/><circle cx="2.9" cy="6.2" r="3.2"/><circle cx="8.3" cy="6.2" r="3.2"/>` +
    `<circle cx="-5.5" cy="10.9" r="3.2"/><circle cx="0.2" cy="10.9" r="3.2"/><circle cx="5.7" cy="10.9" r="3.2"/>` +
    `<circle cx="-2.8" cy="15.5" r="3.2"/><circle cx="3" cy="15.5" r="3.2"/>` +
    `<circle cx="0.1" cy="20" r="3.2"/>` +
    `</g>` +
    `<g class="sb-stag-luce"><circle cx="-9.3" cy="5.1" r="1.05"/><circle cx="-6.6" cy="9.8" r="1.05"/><circle cx="-3.9" cy="14.4" r="1.05"/></g>` +
    `</g>\n` +
    /* Viticcio: la spirale con cui la vite si tiene. */
    `          <g id="stag-viticcio">` +
    `<path class="sb-stag-tralcio" d="M0 0c0 5-6 5-6 9.5s8 4.5 8 9-5.5 5-6.2 2.1 3.5-2.6 3.3 0"/>` +
    `</g>\n` +
    `        </defs>\n` +
    `        ${campate}\n` +
    `      </svg>\n` +
    `    </div>`
  );
}

/* ── La nota di stagione ─────────────────────────────────────────────────
   Sopra il footer, su tutte le pagine di stagione: cosa c'entra l'uva con
   Rivalta, e da dove vengono esattamente i sei colori. Senza questa nota il
   tema sarebbe un capriccio cromatico; con questa nota è una citazione, e si
   può controllare. Le fonti sono in fondo, come dappertutto sul sito. */
function renderNota(s) {
  const tinte = s.tinte
    .map(
      (t) =>
        `          <li class="sb-stag-tinta">\n` +
        `            <span class="sb-stag-tinta-q" style="--q: var(--stag-${t.v})" aria-hidden="true"></span>\n` +
        `            <span class="sb-stag-tinta-w">«${escape(t.parola)}»</span>\n` +
        `            <span class="sb-stag-tinta-d">${escape(t.dove)}</span>\n` +
        `          </li>`
    )
    .join("\n");

  const zone = s.zone
    .map(
      (z) =>
        `          <div class="sb-stag-zona">\n` +
        `            <h3 class="sb-stag-zona-t">${escape(z.t)}</h3>\n` +
        `            <p class="sb-stag-zona-d">${z.d}</p>\n` +
        `          </div>`
    )
    .join("\n");

  const fonti = s.fonti
    .map((f) => `<a href="${f.u}" target="_blank" rel="noreferrer noopener">${escape(f.t)}</a>`)
    .join(" · ");

  return (
    `<section class="sb-home sb-stag-nota" aria-labelledby="stag-nota-t">\n` +
    `  <div class="sb-container sb-stag-nota-in">\n` +
    `    <p class="sb-stag-occhiello">\n` +
    `      <svg class="sb-stag-occhiello-i" width="13" height="17" viewBox="-12 0 24 24" aria-hidden="true"><g class="sb-stag-acino"><circle cx="-5.2" cy="5.4" r="2.9"/><circle cx="0.2" cy="5.4" r="2.9"/><circle cx="5.4" cy="5.4" r="2.9"/><circle cx="-2.6" cy="10.1" r="2.9"/><circle cx="2.8" cy="10.1" r="2.9"/><circle cx="0.1" cy="14.8" r="2.9"/></g><path class="sb-stag-tralcio" d="M0 0v2.6"/></svg>\n` +
    `      ${escape(s.occhiello)}\n` +
    `    </p>\n` +
    `    <h2 class="sb-stag-nota-t" id="stag-nota-t">${escape(s.titolo)}</h2>\n` +
    s.testo.map((p) => `    <p class="sb-stag-nota-p">${p}</p>\n`).join("") +
    `    <ol class="sb-stag-tinte">\n${tinte}\n    </ol>\n` +
    `    <div class="sb-stag-zone">\n${zone}\n    </div>\n` +
    `    <p class="sb-stag-fonti">Fonti: ${fonti}</p>\n` +
    `  </div>\n` +
    `</section>\n`
  );
}

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
  // Sotto sorveglianza la data arriva già risolta dal padre: git non si
  // scomoda a ogni salvataggio per ripetere quello che ha appena detto.
  if (FIGLIO && /^\d{4}-\d{2}-\d{2}$/.test(process.env.RSM_AGG || "")) return process.env.RSM_AGG;
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
const meta = (src, key, dove) => {
  const m = src.match(new RegExp(`^<!--\\s*${key}:\\s*([\\s\\S]*?)-->`, "m"));
  // Il nome del frammento fa la differenza fra un errore che si corregge in
  // dieci secondi e uno che si cerca aprendo diciotto file a caso.
  if (!m) throw new Error(`manca <!--${key}: ...--> in cima a _build/${dove || "?"}`);
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
            }${
              n.nota ? `\n            <p class="sb-riv-news-note">${escape(n.nota)}</p>` : ""
            }
            <span class="sb-link sb-riv-news-go">Leggi su ${escape(n.testata)}</span>
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

/* ── Il libro da cui vengono le fotografie d'archivio ─────────────────────
   {{libro}} stampa la scheda del volume: la copertina in tre dimensioni, il
   titolo, l'editore e il ringraziamento a chi l'ha donato.

   Sta qui e non nei frammenti per la stessa ragione per cui ci sta la nav.
   La regola è «ogni fotografia d'archivio dice da dove viene», e quella
   scheda va quindi ripetuta sotto ogni gruppo di immagini prese dal libro:
   tenerne quattro copie a mano vuol dire che prima o poi tre sono giuste e
   una no — e sarà quella col nome di chi ha fatto il dono scritto storto.

   Il volume è disegnato con due facce di CSS, copertina e dorso, e non è
   un'animazione: sta fermo, come sta fermo un libro su un tavolo. La
   copertina è la scansione vera; il dorso è la stessa scansione stirata sul
   suo primo centimetro, così i colori del taglio continuano quelli del
   piatto invece di essere una tinta inventata. */
const LIBRI = {
  eventi: {
    classe: "",
    copertina: "assets/foto/archivio/eventi-e-ricordi-copertina.jpg",
    alt: "La copertina del libro «Rivalta sul Mincio 2001-2013 — Eventi e Ricordi»: il paese visto dall'alto, sopra la fotografia di un canneto che brucia sul fiume e una barca verde tirata a riva.",
    titolo: "Rivalta sul Mincio 2001&#8202;–&#8202;2013 — Eventi e Ricordi",
    editore: "Nuova Universo Gutenberg Edizioni",
    testo: "Dodici anni di paese raccolti in un volume: le feste, i lavori, le sere che poi si raccontano. Le fotografie qui sopra sono riprodotte da lì.",
    grazie: "Il libro è arrivato al sito in dono da <strong>Annasofia Sanfelici</strong>. Grazie.",
  },
  novecento: {
    classe: " sb-riv-libro--900",
    copertina: "assets/foto/archivio/rivalta-nel-900-copertina.jpg",
    alt: "La copertina del libro «rivalta nel '900 — Immagini per non dimenticare»: una fotografia seppia del porto di Rivalta, con la pescheria a portico sull'acqua, le barche tirate a riva e il campanile fra gli alberi.",
    titolo: "Rivalta nel '900 — Immagini per non dimenticare",
    editore: "Circolo Fotografico Rivalta · Comune di Rodigo",
    testo: "Il paese del Novecento a coppie di fotografie: la stessa strada, la stessa casa, com'era e com'è. Le immagini qui sopra vengono da lì.",
    grazie: "Anche questo volume è arrivato al sito in dono da <strong>Annasofia Sanfelici</strong>. Grazie.",
  },
};

const renderLibro = (chiave = "eventi") => {
  const b = LIBRI[chiave];
  return `<aside class="sb-riv-fonte">
    <div class="sb-panel"><div class="sb-panel-inner sb-riv-fonte-in">
      <div class="sb-riv-libro${b.classe}">
        <div class="sb-riv-libro-corpo">
          <img class="sb-riv-libro-piatto" src="${b.copertina}" alt="${b.alt}" width="820" height="1156" loading="lazy" decoding="async">
          <span class="sb-riv-libro-dorso" aria-hidden="true"></span>
        </div>
        <span class="sb-riv-libro-ombra" aria-hidden="true"></span>
      </div>
      <div class="sb-riv-fonte-testo">
        <span class="sb-riv-fonte-occhiello">Da dove vengono queste fotografie</span>
        <p class="sb-riv-fonte-titolo"><strong>${b.titolo}</strong><br><span class="sb-riv-na">${b.editore}</span></p>
        <p class="sb-riv-p">${b.testo}</p>
        <p class="sb-riv-fonte-grazie">${b.grazie}</p>
      </div>
    </div></div>
  </aside>`;
};

/* ── Gli shortcode ────────────────────────────────────────────────────────
   Cinque segnaposto, tutti risolti qui e nessuno scritto a mano nelle pagine:

     {{luogo:corte-mincio-porto}}        nome del luogo, premibile
     {{luogo:corte-mincio-porto|Via Porto}}  etichetta diversa dal nome
     {{geo:45.1799,10.6807|Piazza Chiesa}}   coordinate sciolte
     {{aperto:bar-platano}}                  aperto adesso, o chiuso
     {{foto:chiesa-santi-vigilio-donato}}    la fotografia, se esiste
     {{libro}}                               la scheda del libro d'archivio

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
    .replace(/\{\{aperto:([a-z0-9-]+)\}\}/g, (_, id) => renderAperto(id))
    .replace(/\{\{foto:([a-z0-9-]+)\}\}/g, (_, slug) => renderFoto(slug))
    .replace(/\{\{libro900\}\}/g, () => renderLibro("novecento"))
    .replace(/\{\{libro\}\}/g, () => renderLibro());

/* ── Gli aggiornamenti ────────────────────────────────────────────────────
   Il registro dei commit non è un elenco di novità: dice «via un import
   rimasto orfano» e «il build non si ferma più su un ritorno a capo», che a
   chi cerca l'orario del mercato non servono a niente.

   _build/aggiornamenti.json è la lista scritta a mano di quello che è
   cambiato PER CHI LEGGE: un orario nuovo, una strada chiusa, una pagina che
   prima non c'era. Una voce si aggiunge lì e compare in /aggiornamenti; se
   una modifica non cambia niente per chi apre il sito, in quel file non ci
   entra — è tutto il senso della pagina. */
const AGGIORNAMENTI = JSON.parse(readFileSync("_build/aggiornamenti.json", "utf8"));

const dataBreve = (iso) => {
  const [a, m, g] = iso.split("-").map(Number);
  return `${g} ${MESI_BREVI[m - 1]} ${a}`;
};

const renderAggiornamenti = () => {
  const voci = [...AGGIORNAMENTI].sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : 0));
  return (
    `<ol class="sb-riv-crono">\n` +
    voci
      .map((v) => {
        const chiave = v.chiave ? " sb-riv-crono-riga--chiave" : "";
        const dove = v.dove
          ? `\n        <a class="sb-link" href="${escape(v.dove)}">Vai a vedere</a>`
          : "";
        const voce = v.voce ? ` <span class="sb-riv-na">· ${escape(v.voce)}</span>` : "";
        return (
          `      <li class="sb-riv-crono-riga${chiave}">\n` +
          `        <time class="sb-riv-crono-anno" datetime="${escape(v.data)}">${dataBreve(v.data)}</time>\n` +
          `        <div class="sb-riv-crono-fatto">\n` +
          `          <strong>${escape(v.titolo)}</strong>${voce}\n` +
          `          <p>${escape(v.testo)}</p>${dove}\n` +
          `        </div>\n` +
          `      </li>`
        );
      })
      .join("\n") +
    `\n    </ol>`
  );
};

/* ── Il muro dei commit ───────────────────────────────────────────────────
   Il numero scritto coi quadratini, portato qui dalla sezione «Open source»
   di albertopecchini.it — che a sua volta l'ha preso da supabase.com. Là il
   fondale è un finto grafo delle contribuzioni dove le celle accese compongono
   un numero; qui il numero è quello vero di questo repository: quanti commit
   ci sono voluti per fare il sito.

   Là è un componente React che monta 1.100 rettangoli nel browser di chi
   legge. Qui non serve: il conteggio non cambia fra un build e l'altro, quindi
   il muro esce già disegnato dal build ed è HTML statico come tutto il resto —
   zero JavaScript, e funziona identico a script spenti.

   Il carattere è cinque colonne per sette righe a cifra, un pixel di spazio
   fra una e l'altra: la misura minima in cui una cifra resta una cifra —
   sotto le cinque colonne lo zero e l'otto diventano lo stesso disegno.

   ── La griglia si taglia sul numero, non viceversa ────────────────────────
   Prima la griglia era fissa — 32 colonne per 16 righe — e il numero ci
   veniva centrato dentro con una divisione intera. Ma 32 meno le 17 colonne
   di un numero a tre cifre fa 15, che è dispari: restavano sette colonne di
   margine da una parte e otto dall'altra, e il numero si leggeva storto senza
   che si capisse perché. Adesso il margine è dichiarato — sette colonne per
   lato, quattro righe sopra e sotto — e la griglia è quello che ne esce: il
   numero sta esattamente in mezzo, a qualunque numero di cifre.

   Il ritardo dell'accensione sta sulla COLONNA, non sulla cella: sono
   centinaia di celle e uno `style` per ciascuna sarebbero centinaia di
   attributi per un'onda che si vede uguale. Il fondo si apre da sinistra a
   destra, e le celle del numero partono un po' dopo — così il numero emerge
   dal rumore invece di nascerci dentro già acceso. */
const COMMITS = (() => {
  if (FIGLIO && process.env.RSM_COMMITS) return Number(process.env.RSM_COMMITS) || 0;
  try {
    return Number(execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim()) || 0;
  } catch {
    return 0;
  }
})();

const CIFRE = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["01110", "10001", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "10001", "01110"],
};

const maschera = (testo) => {
  const accese = new Set();
  let x = 0;
  for (const ch of testo) {
    const g = CIFRE[ch];
    if (g) {
      for (let r = 0; r < g.length; r++) {
        for (let c = 0; c < g[r].length; c++) if (g[r][c] === "1") accese.add(`${x + c},${r}`);
      }
    }
    x += 6; // 5 di cifra + 1 di spazio
  }
  return accese;
};

const renderMuro = () => {
  const CELLA = 3;
  const VUOTO = 0.5;
  const MARGINE_X = 7; // colonne di rumore per lato
  const MARGINE_Y = 4; // righe di rumore sopra e sotto
  const testo = String(COMMITS);
  const acc = maschera(testo);

  /* Il numero decide la griglia: larghezza delle cifre più il margine, due
     volte. Nessuna divisione intera, nessun mezzo quadratino di scarto. */
  const LARGO = testo.length * 6 - 1;
  const COL = LARGO + MARGINE_X * 2;
  const RIGHE = 7 + MARGINE_Y * 2;
  const x0 = MARGINE_X;
  const y0 = MARGINE_Y;

  /* Rumore ripetibile: xorshift con seme fisso. Un fondale che cambia disegno
     a ogni build è un fondale che si fa notare nei diff senza motivo. */
  let seme = 0x9e3779b9;
  const caso = () => {
    seme ^= seme << 13;
    seme ^= seme >>> 17;
    seme ^= seme << 5;
    return (seme >>> 0) / 0xffffffff;
  };

  const colonne = [];
  for (let c = 0; c < COL; c++) {
    const celle = [];
    for (let r = 0; r < RIGHE; r++) {
      const v = caso();
      const on = acc.has(`${c - x0},${r - y0}`);
      const lv = v < 0.45 ? 0 : v < 0.65 ? 1 : v < 0.8 ? 2 : v < 0.92 ? 3 : 4;
      /* Misura e raggio non stanno qui: li mette il foglio di stile con le
         proprietà geometriche SVG (width/height/rx valgono anche in CSS).
         Centinaia di celle per tre attributi identici erano chilobyte di
         pagina per dire cento volte la stessa cosa. Anche il livello è finito
         nella classe, per lo stesso motivo. */
      const n = (v) => String(Math.round(v * 10) / 10);
      celle.push(
        `<rect class="${on ? "on l" : "l"}${lv}" x="${n(c * (CELLA + VUOTO))}" y="${n(r * (CELLA + VUOTO))}"/>`
      );
    }
    colonne.push(`<g style="--d:${(c * 0.02).toFixed(2)}s">${celle.join("")}</g>`);
  }

  const w = (COL * (CELLA + VUOTO) - VUOTO).toFixed(1);
  const h = (RIGHE * (CELLA + VUOTO) - VUOTO).toFixed(1);
  /* preserveAspectRatio resta quello di serie: il muro adesso sta dentro una
     lastra sua e si vede tutto: ritagliarlo per riempire un riquadro voleva
     dire mangiare via le colonne di bordo, e con loro la simmetria. */
  return (
    `<svg class="sb-riv-cwall" viewBox="0 0 ${w} ${h}" role="img" aria-label="${COMMITS} commit">` +
    colonne.join("") +
    `</svg>`
  );
};

/* ── Il banner degli aggiornamenti in home ────────────────────────────────
   Le ultime due voci del registro, in fondo alla home e sopra il footer. In
   fondo alla pagina c'è di suo il momento in cui uno si chiede «e poi?»: è lì
   che una riga di novità serve, non in mezzo alle altre. */
const renderAggBanner = () => {
  const voci = [...AGGIORNAMENTI]
    .sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : 0))
    .slice(0, 2);
  if (!voci.length) return "";
  return (
    `<section class="sb-container sb-riv-aggban" aria-labelledby="aggban-tit">\n` +
    `      <div class="sb-panel"><div class="sb-panel-inner sb-riv-aggban-pad">\n` +
    `        <div class="sb-riv-aggban-testa">\n` +
    `          <span class="sb-riv-aggban-occhiello" id="aggban-tit"><span class="sb-chip-dot" aria-hidden="true"></span>Cosa è cambiato</span>\n` +
    `          <a class="sb-link" href="/aggiornamenti">Tutti gli aggiornamenti</a>\n` +
    `        </div>\n` +
    `        <ul class="sb-riv-aggban-lista">\n` +
    voci
      .map(
        (v) =>
          `          <li><time datetime="${escape(v.data)}">${dataBreve(v.data)}</time>` +
          `<a href="${escape(v.dove || "/aggiornamenti")}">${escape(v.titolo)}</a></li>`
      )
      .join("\n") +
    `\n        </ul>\n` +
    `      </div></div>\n` +
    `    </section>`
  );
};

/* ── Gli orari di apertura ────────────────────────────────────────────────
   _build/orari.json tiene gli orari in sintassi OpenStreetMap — «Tu-Su
   19:00-22:30» — e da lì escono due cose che devono per forza dire lo stesso:
   la riga leggibile scritta qui dentro la pagina, e il «aperto ora / chiuso»
   che assets/orari.js calcola nel browser sull'ora di chi guarda.

   Perché la stessa stringa e non due campi: un orario scritto due volte
   diverge al primo cambiamento, e la versione sbagliata è sempre quella che
   qualcuno legge prima di uscire di casa.

   Senza JavaScript resta la riga degli orari, che è esattamente quello che
   c'era prima del pallino: si perde il comodo, non l'informazione. */
const orari = JSON.parse(readFileSync("_build/orari.json", "utf8"));

const GG = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const GG_IT = ["lu", "ma", "me", "gio", "ve", "sa", "do"];

/* «Tu-Su» e «Sa,Su» diventano l'insieme dei giorni che nominano. */
const giorniDi = (spec) => {
  const dentro = new Set();
  for (const pezzo of spec.split(",")) {
    const [a, b] = pezzo.trim().split("-");
    const i = GG.indexOf(a);
    if (i < 0) throw new Error(`orari: giorno sconosciuto «${a}» in «${spec}»`);
    if (b === undefined) { dentro.add(i); continue; }
    const j = GG.indexOf(b);
    if (j < 0) throw new Error(`orari: giorno sconosciuto «${b}» in «${spec}»`);
    // Un intervallo può scavalcare la domenica (Sa-Tu): si gira in tondo.
    for (let k = i; ; k = (k + 1) % 7) { dentro.add(k); if (k === j) break; }
  }
  return [...dentro].sort((a, b) => a - b);
};

/* E tornano indietro in italiano, richiusi in intervalli: 0..6 → «lu–ve»,
   tutti e sette → «tutti i giorni». */
const GG_IT_LUNGHI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];

const giorniIt = (indici) => {
  if (indici.length === 7) return "tutti i giorni";
  // Un giorno solo si scrive per esteso: «venerdì 08:00–13:00» si legge, «ve
  // 08:00–13:00» si decifra. Le abbreviazioni servono quando i giorni sono
  // tanti e la riga deve stare in una cella di tabella.
  if (indici.length === 1) return GG_IT_LUNGHI[indici[0]];
  const blocchi = [];
  for (const i of indici) {
    const ultimo = blocchi[blocchi.length - 1];
    if (ultimo && ultimo[1] === i - 1) ultimo[1] = i;
    else blocchi.push([i, i]);
  }
  const pezzi = blocchi.map(([a, b]) =>
    a === b ? GG_IT[a] : b === a + 1 ? `${GG_IT[a]} e ${GG_IT[b]}` : `${GG_IT[a]}–${GG_IT[b]}`
  );
  return pezzi.length > 1 ? `${pezzi.slice(0, -1).join(", ")} e ${pezzi[pezzi.length - 1]}` : pezzi[0];
};

const leggibile = (oh) => {
  if (oh.trim() === "24/7") return "sempre aperto";
  return oh
    .split(";")
    .map((regola) => {
      const m = /^\s*([A-Za-z,\-\s]+?)\s+([\d:,\-\s]+)\s*$/.exec(regola);
      if (!m) throw new Error(`orari: regola non riconosciuta «${regola.trim()}»`);
      const ore = m[2]
        .split(",")
        .map((f) => {
          const t = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(f);
          if (!t) throw new Error(`orari: fascia non riconosciuta «${f.trim()}»`);
          return `${t[1]}–${t[2]}`;
        })
        .join(" e ");
      return `${giorniIt(giorniDi(m[1].trim()))} ${ore}`;
    })
    .join(" · ");
};

/* Il pallino nasce nascosto: lo accende assets/orari.js dopo aver calcolato
   se in questo momento è aperto. Un «Aperto ora» scritto dal build sarebbe
   vero solo nell'istante della build. */
const renderAperto = (id) => {
  const o = orari[id];
  if (!o) throw new Error(`{{aperto:${id}}} — voce assente da _build/orari.json`);
  return (
    `<span class="sb-riv-ap" data-oh="${escape(o.oh)}">` +
    `<span class="sb-riv-ap-stato" hidden></span>` +
    `<span class="sb-riv-ap-ore" title="Orari — fonte: ${escape(o.fonte)}">${escape(leggibile(o.oh))}</span>` +
    `</span>`
  );
};

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
    avvisiRimandati.push(
      `tipi OSM non ancora tradotti (esclusi dalla mappa): ${[...ignoti].join(", ")}\n  Aggiungerli a _build/tipi.json con etichetta e gruppo.`
    );
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

/* ── Il gusto — «cosa vuoi mangiare?» ─────────────────────────────────────
   /mangiare non è l'elenco dei ristoranti: quello è /attivita. Qui si parte
   dalla domanda che uno si fa davvero prima di uscire — «cosa mi va?» — e si
   arriva al locale come ultima riga, non come prima.

   {{VOGLIE}} diventa la fila dei tasti più le schede dei piatti. Il contenuto
   sta in _build/gusto.json; i locali sotto ogni piatto sono slug del registro
   dei luoghi, quindi nome, indirizzo, mappa e scheda arrivano da lì e restano
   un posto solo da correggere il giorno che un locale cambia indirizzo.

   Senza JavaScript i tasti non filtrano ma tutte le schede sono già in
   pagina: la pagina resta intera, si legge solo tutta invece che a pezzi. */
const enfasi = (s) =>
  escape(s).replace(/\*([^*]+)\*/g, (_, t) => `<strong>${t}</strong>`);

const renderVoglie = () => {
  const { voglie, piatti } = JSON.parse(readFileSync("_build/gusto.json", "utf8"));

  const idVoglie = new Set(voglie.map((v) => v.id));
  for (const p of piatti) {
    for (const v of p.voglie) {
      if (!idVoglie.has(v)) throw new Error(`gusto.json — il piatto "${p.slug}" dichiara la voglia "${v}", che non esiste`);
    }
    for (const d of p.dove) {
      if (!perSlug.has(d.luogo)) throw new Error(`gusto.json — "${p.slug}" manda a "${d.luogo}", slug assente da _build/luoghi.json`);
    }
  }
  const conta = (id) => piatti.filter((p) => p.voglie.includes(id)).length;
  for (const v of voglie) {
    if (!conta(v.id)) throw new Error(`gusto.json — la voglia "${v.id}" non ha nemmeno un piatto: un tasto che apre il vuoto`);
  }

  const tasti = [
    `          <button class="sb-riv-mang-voglia" type="button" id="voglia-tutto" data-voglia="tutto" aria-pressed="true">
            <span class="sb-riv-mang-voglia-n">Tutto</span>
            <span class="sb-riv-mang-voglia-c">${piatti.length}</span>
          </button>`,
    ...voglie.map(
      (v) => `          <button class="sb-riv-mang-voglia" type="button" id="voglia-${v.id}" data-voglia="${v.id}" aria-pressed="false" title="${escape(v.d)}">
            <span class="sb-riv-mang-voglia-n">${escape(v.n)}</span>
            <span class="sb-riv-mang-voglia-c">${conta(v.id)}</span>
          </button>`
    ),
  ].join("\n");

  /* Una riga per locale: chi è, dove sta (il pallino apre OpenStreetMap come
     ovunque nel sito), cosa ne fa di questo piatto, e quanto si spende — se
     il dato esiste, e detto per quello che è.

     La scheda è quella che il registro dichiara, tranne quando il posto è
     raccontato altrove per quello che fa di principale: il Green Village sta
     in /comunita perché è un polo sportivo, ma chi arriva qui cerca gli orari
     della pizzeria. Per quei casi la voce di gusto.json può dire . */
  const dove = (d) => {
    const l = perSlug.get(d.luogo);
    const indirizzo = l.indirizzo
      ? geoLink(osmUrl(l), l.indirizzo, l.nome)
      : geoLink(osmUrl(l), l.dist_m != null ? `~${l.dist_m} m dal centro` : "apri nella mappa", l.nome);
    const fascia = d.fascia
      ? `<span class="sb-riv-mang-fascia" title="spesa indicativa a persona, dichiarata dai portali di prenotazione">${escape(d.fascia)}</span>`
      : "";
    return `            <li class="sb-riv-mang-locale">
              <p class="sb-riv-mang-locale-t"><strong>${escape(l.nome)}</strong>${fascia}</p>
              <p class="sb-riv-mang-locale-d">${indirizzo}</p>
              <p class="sb-riv-mang-come">${enfasi(d.come)}</p>
              <a class="sb-link" href="${escape(d.scheda || l.pagina)}">Contatti e orari</a>
            </li>`;
  };

  const schede = piatti
    .map((p) => {
      const occhiello = p.occhiello
        ? `\n        <span class="sb-riv-mang-occhiello">${escape(p.occhiello)}</span>`
        : "";
      const perche = p.perche ? `\n        <p class="sb-riv-p sb-riv-mang-perche">${enfasi(p.perche)}</p>` : "";
      const quando = p.quando
        ? `\n        <p class="sb-riv-mang-quando"><span>Quando</span>${enfasi(p.quando)}</p>`
        : "";
      const vedi = p.vedi
        ? `\n        <p class="sb-riv-mang-vedi">${p.vedi
            .map((v) => `<a class="sb-link" href="${escape(v.href)}">${escape(v.t)}</a>`)
            .join("")}</p>`
        : "";
      return `      <article class="sb-panel sb-riv-mang-piatto" id="${p.slug}" data-voglie="${p.voglie.join(" ")}">
        <div class="sb-panel-inner sb-riv-mang-pad">${occhiello}
        <h3>${escape(p.nome)}</h3>
        <p class="sb-riv-p sb-riv-mang-cose">${enfasi(p.cose)}</p>${perche}${quando}
        <h4 class="sb-riv-mang-dovet">Dove mangiarlo</h4>
        <ul class="sb-riv-mang-dove">
${p.dove.map(dove).join("\n")}
        </ul>${vedi}
        </div>
      </article>`;
    })
    .join("\n");

  return `<div class="sb-riv-mang">
        <div class="sb-riv-mang-voglie" role="group" aria-label="Cosa vuoi mangiare">
${tasti}
        </div>
        <p class="sb-riv-cap" id="mang-conteggio">${piatti.length} cose da mangiare, in ${new Set(piatti.flatMap((p) => p.dove.map((d) => d.luogo))).size} locali. Senza JavaScript i tasti non filtrano: l'elenco resta qui sotto per intero.</p>
        <div class="sb-riv-mang-lista">
${schede}
        </div>
      </div>`;
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
          <a class="sb-link sb-riv-ora-go" href="/natura#stazione-meteo">La stazione in dettaglio</a>
          <span class="sb-riv-ora-stato" data-meteo-stato="breve">Lettura in corso</span>
        </div></div>
      </aside>`;
};

/* ── Chi c'è dietro ───────────────────────────────────────────────────────
   Non è una striscia di loghi: sono tre cose diverse, e mescolarle direbbe
   una bugia. Chi organizza risponde dell'evento. Il Comune e la Polizia
   Locale lo permettono — un patrocinio non è una sponsorizzazione, e un
   marchio istituzionale infilato in fila con le pizzerie fa credere che
   l'ente abbia pagato per starci. Le attività del paese mettono cibo,
   bevande e una mano.

   Perciò quattro fasce separate da un filo, ognuna con la sua frase scritta
   SOPRA i suoi marchi e in un corpo che si legge — non un rigo in punta di
   piedi sotto a tutto. La formula del patrocinio è quella che il Comune ha
   chiesto e va copiata parola per parola: sta scritta in un posto solo, qui.

   La frase sta sopra e non più di fianco, e le fasce partono tutte dal
   margine sinistro. Prima erano l'ultimo blocco centrato rimasto sul sito, e
   avevano tre disposizioni diverse a seconda di quanti marchi aveva ognuna:
   i due stemmi ai lati della frase, la frase in cima quando i marchi erano
   sette, la frase di fianco negli altri casi. Tre modi di dire la stessa
   cosa, e nessuno dei tre come il resto del sito. Adesso ce n'è uno: la
   frase, e sotto i marchi che descrive — che è anche l'ordine in cui serve
   leggerli. Da qui sono spariti i flag `sopra` e `attorno`.

   Stessa regola delle fotografie per i file: il logo compare solo se il file
   esiste davvero. Finché non c'è, al suo posto sta il nome scritto — che in
   una fascia di loghi si legge come una scelta e non come un'immagine rotta.
   Il giorno che il file entra in assets/loghi/ prende il suo posto da sé.
   L'estensione non è fissata: vince il primo formato trovato, in quest'ordine.
   Un SVG resta nitido a qualsiasi misura ed è la scelta giusta per un logo.

   Quasi nessuno ha un `url`: sono attività di paese e associazioni di
   volontariato, un sito non ce l'hanno. Senza `url` la piastrella resta una
   piastrella e non finge un collegamento che non porta da nessuna parte. */
const FASCE_LOGHI = [
  {
    testo:
      "Organizzano la <strong>Parrocchia Santi Vigilio e Donato</strong> di Rivalta sul Mincio " +
      "e l'<strong>Associazione San Filippo Neri ANSPI APS-ETS</strong> di Rodigo, circolo " +
      "affiliato ad ANSPI, a cui va per intero la quota di iscrizione.",
    loghi: [
      { file: "parrocchia", nome: "Parrocchia Santi Vigilio e Donato", desc: "Parrocchia Santi Vigilio e Donato di Rivalta sul Mincio", url: "https://sites.google.com/site/parrocchiadirivaltasm/", classe: "sb-cw-logo--quadro" },
      { file: "anspi", nome: "ANSPI", desc: "Associazione Nazionale San Paolo Italia — oratori e circoli", url: "https://www.anspi.it", classe: "sb-cw-logo--anspi" },
    ],
  },
  {
    testo:
      "<strong>Con il patrocinio del Comune di Rodigo</strong> e la collaborazione della " +
      "<strong>Polizia Locale Mantova Ovest</strong>, che presidia gli attraversamenti.",
    loghi: [
      { file: "comune-rodigo", nome: "Comune di Rodigo", desc: "Comune di Rodigo — con il patrocinio del Comune", url: "https://comune.rodigo.mn.it", classe: "sb-cw-logo--rodigo" },
      { file: "polizia-locale", nome: "Polizia Locale Mantova Ovest", desc: "Corpo Intercomunale di Polizia Locale Mantova Ovest — presidia gli attraversamenti", url: "https://www.comune.rodigo.mn.it/amministrazione/unita_organizzativa/polizia_locale/", classe: "sb-cw-logo--quadro" },
    ],
  },
  {
    testo:
      "<strong>Con il sostegno delle attività di Rivalta</strong>, che offrono l'aperitivo di " +
      "fine camminata e quello che ci sta intorno — tutto compreso nella quota.",
    loghi: [
      { file: "avis-rivalta", nome: "AVIS Rivalta", desc: "AVIS Rivalta sul Mincio — offre l'aperitivo", url: "https://www.facebook.com/avisrsm/" },
      { file: "pizzangolo", nome: "Pizzangolo", desc: "Pizzangolo — pizzeria di Rivalta sul Mincio", url: "https://www.facebook.com/pizzangolotakeaway/" },
      { file: "marchini", nome: "Panificio Marchini", desc: "Panificio Marchini dal 1923", url: "https://www.facebook.com/PanificioMarchini/" },
      { file: "storti", nome: "Storti Salumi", desc: "Storti Salumi", url: "https://www.stortisalumi.it" },
      { file: "farmacia-tona", nome: "Farmacia Tona", desc: "Farmacia Tona di Rivalta sul Mincio", url: "https://www.facebook.com/farmaciatona/", classe: "sb-cw-logo--quadro" },
      { file: "fior-di-loto", nome: "Fiordiloto", desc: "Fiordiloto profumeria di Rivalta sul Mincio", url: "https://www.facebook.com/profumeriaFDL/" },
      { file: "non-solo-lady", nome: "Non Solo Lady", desc: "Non Solo Lady — parrucchiere di Marco Marazzi", url: "https://www.facebook.com/nonsololady/", classe: "sb-cw-logo--quadro" },
    ],
  },
  {
    minuta: true,
    testo: 'Sito e materiali di <strong>Alberto Pecchini</strong> — <span class="sb-cw-ente-luogo">Rivalta sul Mincio, frazione del Comune di Rodigo (MN)</span>',
    loghi: [
      { file: "ap", nome: ".ap", desc: "Alberto Pecchini", url: "https://albertopecchini.it", classe: "sb-cw-logo--ap" },
    ],
  },
];

const loghiMancanti = [];

const renderPiastrella = (l) => {
  const trovato = ["svg", "png", "webp", "jpg"]
    .map((est) => `assets/loghi/${l.file}.${est}`)
    .find((p) => existsSync(p));
  if (!trovato) loghiMancanti.push(`${l.file}.svg`);
  const dentro = trovato
    ? `<img src="${trovato}" alt="${escape(l.desc)}" loading="lazy" decoding="async">`
    : `<span class="sb-cw-logo-t">${escape(l.nome)}</span>`;
  /* Un marchio senza sito non diventa un collegamento che non porta da
     nessuna parte: resta una piastrella e basta. Fuori dal marcatore <a>
     sparisce anche il title, che su un elemento non interattivo non lo
     legge nessuno: la stessa frase sta già nell'alt dell'immagine. */
  if (!l.url) return `        <div class="sb-cw-logo ${l.classe || ""}">${dentro}</div>`;
  return `        <a class="sb-cw-logo ${l.classe || ""}" href="${escape(l.url)}" target="_blank" rel="noreferrer noopener" title="${escape(l.desc)}">${dentro}</a>`;
};

const gruppoLoghi = (loghi) =>
  `      <div class="sb-cw-loghi">
${loghi.map(renderPiastrella).join("\n")}
      </div>`;

/* Una disposizione sola: la frase, e sotto i marchi che descrive. L'ordine
   nel documento è quello in cui si legge — anche a fogli di stile spenti,
   anche a voce.

   Le fasce non entrano più scorrendo: portavano .sb-cw-su e il passo della
   cascata in data-cw-fila, e sono andati via con tutti gli altri ingressi
   della Color Walk. Chi arriva in fondo alla pagina sta cercando chi ha
   organizzato, non uno spettacolo. */
const renderLoghi = () =>
  `<div class="sb-cw-enti">
${FASCE_LOGHI.map((f) => {
  const classe = "sb-cw-ente" + (f.minuta ? " sb-cw-ente--minuta" : "");
  return `    <div class="${classe}">
      <p class="sb-cw-ente-t">${f.testo}</p>
${gruppoLoghi(f.loghi)}
    </div>`;
}).join("\n")}
  </div>`;

/* ── Il banner e la locandina della Color Walk ─────────────────────────
   Due pezzi disegnati a parte (design/color-walk/, tela di Claude Design) ed
   esportati in assets/: il banner orizzontale e la locandina A4.

   {{BANNER}} mette il banner com'è — una <img> sola, niente intorno — nella
   testata di /color-walk, al posto della scheda dell'evento in home (dove è
   un collegamento) e in coda al regolamento. {{LOCANDINA}} mette la locandina
   su /color-walk: l'anteprima porta al PDF A4 da stampare.

   Finché il file non c'è, il segnaposto non lascia né un buco né una cornice:
   la pagina sta in piedi lo stesso. Rifatti i pezzi sulla tela, si riesporta
   con questi nomi e ricompaiono al primo build. */
const BANNER = "color-walk-banner";
const LOCANDINA = "color-walk-locandina";
let bannerTrovato = null;
let locandinaTrovata = null;

const renderBanner = () => {
  bannerTrovato = ["webp", "avif", "png", "jpg", "svg"]
    .map((est) => `assets/foto/${BANNER}.${est}`)
    .find((p) => existsSync(p));
  if (!bannerTrovato) return "";
  return `<img class="sb-riv-cwbanner" src="${bannerTrovato}" width="2400" height="900" decoding="async"
      alt="Color Walk, Rivalta sul Mincio — una camminata per tutti, senza cronometro e senza classifica, lungo le vie del paese. Domenica 20 settembre 2026: ritrovo alle 15:30, partenza alle 16:00, Piazza della Chiesa. Quote 5 € dai 6 ai 17 anni e 10 € adulti, aperitivo incluso nella quota. Iscrizioni anche il giorno stesso, maglia bianca consigliata. In caso di pioggia si rinvia a domenica 27 settembre. Organizzano la Parrocchia Santi Vigilio e Donato di Rivalta sul Mincio e l'Associazione San Filippo Neri ANSPI APS-ETS di Rodigo, con il patrocinio del Comune di Rodigo.">`;
};

/* ── Il blocco «Color Walk come in home» ────────────────────────────────
   {{BANNER}} è la sola immagine; {{CW_HOME}} è come la home la mostra: il
   banner dentro una cornice del sito (.sb-panel) coi due tasti dell'evento.
   Lo usa ogni pagina che nomina la camminata fuori da /color-walk — la
   home, /comunita, /eventi, il regolamento — così l'evento si presenta
   sempre allo stesso modo. Una definizione sola: se cambiano i tasti,
   cambiano dappertutto. Senza il file del banner, sparisce tutto il blocco:
   nessuna cornice vuota.

   Sulla pagina del regolamento il tasto «Regolamento» punterebbe a sé stessa:
   lì resta solo «Iscriviti». */
const renderBannerHome = (page) => {
  const img = renderBanner();
  if (!img) return "";
  const regolamento =
    page === "color-walk-regolamento"
      ? ""
      : `\n            <a class="sb-btn sb-btn--secondary" href="/color-walk-regolamento"><span>Regolamento</span></a>`;
  return `<div class="sb-riv-cwhome">
        <div class="sb-panel"><div class="sb-panel-inner">
          ${img}
          <div class="sb-riv-cwhome-azioni">
            <a class="sb-btn sb-btn--primary" href="/color-walk#iscrizione"><span>Iscriviti alla camminata</span></a>${regolamento}
          </div>
        </div></div>
      </div>`;
};

/* La locandina si guarda come un foglio in un lettore di documenti: l'anteprima
   (l'immagine, .webp leggera ma nitida — è ricavata dallo stesso PNG del PDF) e
   sotto un tasto che apre il PDF A4 già pronto per la stampa. Il clic
   sull'anteprima apre anch'esso il PDF, nel visore del browser (Ctrl+P e via).
   Se il PDF non c'è, resta la sola anteprima che si apre a dimensione piena. */
const renderLocandina = () => {
  locandinaTrovata = ["webp", "avif", "png", "jpg"]
    .map((est) => `assets/foto/${LOCANDINA}.${est}`)
    .find((p) => existsSync(p));
  if (!locandinaTrovata) return "";
  const pdf = `assets/${LOCANDINA}.pdf`;
  const conPdf = existsSync(pdf);
  const alt =
    "Locandina A4 della Color Walk, con in cima un disegno di gente coperta " +
    "di colori che corre per il paese. Camminata a colori per tutti a Rivalta " +
    "sul Mincio, senza cronometro e senza classifica: domenica 20 settembre " +
    "2026, ritrovo alle 15:30 e partenza alle 16:00, partenza e arrivo in " +
    "Piazza della Chiesa. Quote 5 € dai 6 ai 17 anni e 10 € adulti. " +
    "Aperitivo incluso nel prezzo: l'aperitivo e tutto il cibo offerto dagli " +
    "sponsor sono compresi nella quota, nessun costo aggiuntivo. Iscrizioni " +
    "anche il giorno stesso, prima della partenza davanti alla chiesa; sacca " +
    "in omaggio per ogni iscritto; si consiglia una maglia bianca, perché i " +
    "colori si vedono molto di più. In caso di pioggia si rinvia a domenica " +
    "27 settembre 2026. Un codice QR porta all'iscrizione online. In fondo " +
    "gli stemmi delle sei contrade, il patrocinio del Comune di Rodigo con la " +
    "collaborazione della Polizia Locale Mantova Ovest, i marchi degli " +
    "sponsor e gli organizzatori: la Parrocchia Santi Vigilio e Donato e " +
    "l'Associazione San Filippo Neri ANSPI APS-ETS di Rodigo.";
  const anteprima = conPdf
    ? ` href="${pdf}" target="_blank" rel="noopener" aria-label="Apri la locandina in PDF (A4, pronta da stampare)"`
    : ` href="${locandinaTrovata}" target="_blank" rel="noopener" aria-label="Apri la locandina a dimensione piena"`;
  const stampa = conPdf
    ? `\n      <a class="sb-btn sb-btn--primary sb-riv-cwloc-print" href="${pdf}" download="${LOCANDINA}.pdf" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        <span>Stampa la locandina — PDF A4</span>
      </a>`
    : "";
  return `<figure class="sb-riv-cwloc">
      <a class="sb-riv-cwloc-a"${anteprima}>
        <img src="${locandinaTrovata}" width="1240" height="1754" loading="lazy" decoding="async"
          alt="${alt}">
      </a>${stampa}
    </figure>`;
};

/* ── Le sei contrade ──────────────────────────────────────────────────────
   Rivalta si divide in sei contrade, e le sei ricorrono in due pagine: per
   esteso in /eventi, in fila su /color-walk. Stanno scritte qui una volta
   sola — nome, colore, stemma — e le pagine le chiamano con {{CONTRADE}} e
   {{CONTRADE_FILA}}. Il giorno che arriva l'artwork vero degli stemmi si
   cambia questo elenco, non due pagine.

   `arte` è il disegno vero, a colori pieni come sui cartelli del Palio: lo
   usano tutte e due le rese, la scheda grande di /eventi e la fila di
   /color-walk. Il colore della contrada non è qui: lo dà assets/rivalta.css a
   partire da `slug`, così una tinta sbagliata si corregge in un posto solo.

   `stemma` è lo stesso soggetto ridisegnato al tratto sulla griglia 24×24
   delle altre icone del sito. **Oggi non lo rende nessuna pagina**: serviva
   alla fila finché la piastrella era 2,2 rem e un disegno a colori ci si
   riduceva a una macchia. Resta qui perché è il ricambio del giorno che
   l'artwork dovesse sparire, non perché sia in uso — se quel giorno non
   arriva, si cancella insieme a `icona()`.

   I file di `arte` stanno in assets/icone/, uno per slug: il `.webp` a 256 px
   è quello che va in pagina, il `.png` accanto è il master alla misura piena.
   Se un giorno arriva l'artwork ufficiale delle contrade, si sostituisce il
   file e basta — qui non cambia niente.

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
    arte: "assets/icone/filanda.webp",
    arteAlt: "la filanda con la ciminiera e il bozzolo del baco da seta",
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
    arte: "assets/icone/roccolo.webp",
    arteAlt: "il boschetto di alberi verdi",
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
    arte: "assets/icone/colonie.webp",
    arteAlt: "la caravella con la croce blu sulla vela",
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
    arte: "assets/icone/piasaroi.webp",
    arteAlt: "la torre gialla col tetto rosso e la campana",
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
    arte: "assets/icone/platana.webp",
    arteAlt: "il platano dalla chioma viola",
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
    arte: "assets/icone/fanfane.webp",
    arteAlt: "l'anfora arancione che versa acqua",
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

/* Il nome delle contrade porta l'articolo dentro («la Filanda», «i Piasaröi»),
   e nel testo alternativo va retto: «lo stemma DELLA Filanda», «DEI Piasaröi».
   Sei nomi, sei articoli scritti a mano: una regola per ricavarli sarebbe più
   lunga della tabella. */
const ARTICOLO = {
  filanda: "della Filanda",
  roccolo: "del Roccolo",
  colonie: "delle Colonie",
  piasaroi: "dei Piasaröi",
  platana: "della Plàtana",
  fanfane: "delle Fanfane",
};

/* Per esteso: una scheda a testa, col disegno dello stemma, il nome, cosa c'è
   dipinto e il colore. */
const renderContrade = () =>
  `<div class="sb-riv-contrade">\n` +
  CONTRADE.map(
    (c) =>
      `      <div class="sb-riv-contrada" data-contrada="${c.slug}">\n` +
      `        <div class="sb-panel"><div class="sb-panel-inner">\n` +
      `          <span class="sb-riv-stemma sb-riv-stemma--arte"><img src="${c.arte}" width="256" height="256" loading="lazy" decoding="async" alt="Lo stemma ${ARTICOLO[c.slug]}: ${c.arteAlt}"></span>\n` +
      `          <div class="sb-riv-contrada-t">\n` +
      `            <h4>${c.nome}</h4>\n` +
      `            <p>${c.nota}</p>\n` +
      `            <span class="sb-riv-contrada-c">${c.colore}</span>\n` +
      `          </div>\n` +
      `        </div></div>\n` +
      `      </div>`
  ).join("\n") +
  `\n    </div>`;

/* In fila: stemma e nome, niente altro. Anche qui il disegno vero, come
   nella scheda grande: la piastrella della fila si allarga apposta a 2,8 rem
   per reggerlo. */
const renderContradeFila = () =>
  `<div class="sb-riv-contrade sb-riv-contrade--fila">\n` +
  CONTRADE.map(
    (c) =>
      `      <div class="sb-riv-contrada" data-contrada="${c.slug}">` +
      `<span class="sb-riv-stemma sb-riv-stemma--arte">` +
      `<img src="${c.arte}" width="256" height="256" loading="lazy" decoding="async" ` +
      `alt="Lo stemma ${ARTICOLO[c.slug]}: ${c.arteAlt}"></span>` +
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

/* ── Un'ancora per ogni titolo ────────────────────────────────────────────
   Le pagine qui sono lunghe: /paese e /attivita si leggono a schermate, e
   mandare a qualcuno «guarda gli orari delle Messe» ha voluto dire finora
   mandargli l'intera pagina e fidarsi che scorresse fino in fondo.

   Le sezioni un'ancora ce l'hanno già (#messe, #monumenti), i sotto-titoli
   no. Qui ogni <h3> senza id ne riceve uno preso dal suo stesso testo, e
   assets/rivalta.js ci appende il § che copia il collegamento.

   L'id si scrive nel build e non nel browser di chi legge: un'ancora che
   esiste solo se il JavaScript è arrivato è un'ancora che si rompe proprio
   nel caso che conta — il link mandato a qualcun altro.

   Gli <h2> restano scoperti apposta: stanno dentro una <section> che l'id ce
   l'ha già, e due bersagli a un dito di distanza sarebbero due indirizzi per
   lo stesso posto. Il § dell'h2 punta alla sezione che lo contiene. */
const slugTitolo = (s) =>
  senzaTag(s)
    .toLowerCase()
    .replace(/[àáâä]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôö]/g, "o").replace(/[ùúûü]/g, "u").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* Un titolo lungo non fa un indirizzo lungo: si taglia a sessanta caratteri,
   ma sull'ultimo trattino intero — «…strade-e-parco-chiusi», non
   «…strade-e-parco-chiusi-da», che sembra una parola mangiata a metà. */
const accorcia = (t) => (t.length <= 60 ? t : t.slice(0, 60).replace(/-[^-]*$/, ""));


const ancore = (html) => {
  const presi = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  return html.replace(/<h3\b([^>]*)>([\s\S]*?)<\/h3>/g, (tutto, attr, testo) => {
    if (/\bid=/.test(attr)) return tutto;
    // I titoli della rassegna stampa restano scoperti: ogni scheda è già
    // tutta un collegamento all'articolo della testata, e un'ancora accanto
    // sarebbe un secondo collegamento che porta da un'altra parte.
    if (attr.includes("sb-riv-news-title")) return tutto;
    const base = accorcia(slugTitolo(testo));
    if (!base) return tutto;
    // Due «Etimologia» nella stessa pagina non possono avere lo stesso id:
    // il secondo diventa etimologia-2, e il collegamento resta univoco.
    let id = base;
    for (let n = 2; presi.has(id); n++) id = `${base}-${n}`;
    presi.add(id);
    return `<h3${attr} id="${id}">${testo}</h3>`;
  });
};

/* Qualche parola in più a livello di pagina: l'occhiello (.sb-riv-lede) o il
   primo paragrafo. Non si mostra, si cerca soltanto. */
const parolePagina = (html) => {
  const lede = html.match(/<p class="sb-riv-lede"[^>]*>([\s\S]*?)<\/p>/);
  const primo = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  return senzaTag((lede || primo || [, ""])[1]).slice(0, 240).replace(/\s+\S*$/, "");
};

/* ══════════════════════════════════════════════════════════════════════════
   LE FOTOGRAFIE, RIDOTTE ALLA MISURA DELLO SCHERMO

   Le foto d'archivio sono JPEG da 1600 px: giuste per l'archivio, sbagliate
   per un telefono che le mostra in uno slot da 165 px. Su /paese sono
   sessantadue, e chi scorre tutta la pagina si porta a casa dieci megabyte e
   mezzo per vederne una frazione.

   Qui ogni originale genera tre derivate WebP — 480, 960, 1600 — e il markup
   se le prende da sé (vedi `figureResponsive`). Misurato sulle foto vere:
   a 960 px si risparmia il 62%, a 480 px l'89%.

   Il nome della derivata porta dentro l'impronta dell'originale:
   `al-dos-1985-a1b2c3d4-960.webp`. È quella che rende onesto l'`immutable`
   in vercel.json — se un giorno la fotografia si sostituisce, il nome cambia
   con lei e nessuna cache può servire quella di prima. Senza impronta,
   `immutable` sarebbe una bugia che dura un anno.

   Sharp serve solo a GENERARE. Il sito continua a costruirsi senza, perché
   le misure stanno scritte in _w/misure.json e le derivate sono committate:
   chi clona il repo e lancia `node build.mjs` senza aver installato niente
   ottiene le stesse pagine. È la promessa del README, e non si rompe. */
/* I gradini della scala. Non sono scelti a occhio: sono le misure che i
   telefoni chiedono davvero.

   Una figura a piena colonna su un telefono da 390 px occupa 342 px, che a
   densità doppia fanno 684 px veri. Con la scala 480 · 960 il browser saltava
   a 960 — ventotto per cento di pixel scaricati e mai mostrati, su
   trentaquattro fotografie di /paese. Il 720 è quel gradino lì, e da solo
   vale un megabyte a visita. */
const FOTO_LARGHEZZE = [480, 720, 960, 1440, 1600, 2200];
const FOTO_QUALITA = 72;
const MISURE_FILE = "assets/foto/_w/misure.json";

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = null;
}

const misure = existsSync(MISURE_FILE) ? JSON.parse(readFileSync(MISURE_FILE, "utf8")) : {};

// Tutti i file immagine sotto assets/foto/, esclusa la cartella delle derivate.
const fotoOriginali = (dir = "assets/foto") => {
  const out = [];
  for (const voce of readdirSync(dir, { withFileTypes: true })) {
    if (voce.name === "_w") continue;
    const p = `${dir}/${voce.name}`;
    if (voce.isDirectory()) out.push(...fotoOriginali(p));
    else if (/\.(jpe?g|png)$/i.test(voce.name)) out.push(p);
  }
  return out;
};

const impronta = (p) => createHash("sha1").update(readFileSync(p)).digest("hex").slice(0, 8);
const derivata = (p, imp, w) =>
  `assets/foto/_w/${p.replace(/^assets\/foto\//, "").replace(/\.[^.]+$/, "")}-${imp}-${w}.webp`;

/* Prima si misura soltanto. Leggere l'intestazione di un JPEG costa niente —
   non si decodifica l'immagine — e serve per due cose: le dimensioni vere da
   scrivere nel markup, e l'impronta che finisce nel nome delle derivate.

   Le derivate NON si generano qui. Si generano dopo, quando le pagine sono
   montate e si sa quali servono davvero: vedi «Adesso si taglia». */
const derivateSenzaSharp = [];

for (const p of fotoOriginali()) {
  const imp = impronta(p);
  if (misure[p] && misure[p].imp === imp) continue;
  if (!sharp) {
    // Senza sharp non si misura e non si genera, ma non si rompe niente: la
    // figura resta un <img> semplice finché qualcuno non rifà il build con
    // sharp installato. È la promessa del README, e regge.
    derivateSenzaSharp.push(p);
    continue;
  }
  const mis = await sharp(p).metadata();
  misure[p] = { imp, w: mis.width, h: mis.height };
}

// Le misure di fotografie che non esistono più non servono a nessuno.
for (const p of Object.keys(misure)) if (!existsSync(p)) delete misure[p];

/* ── Da <img> a <picture> ─────────────────────────────────────────────────
   Le figure del sito sono scritte in due modi: settantuno a mano dentro i
   frammenti e ventisette dal segnaposto {{foto:}}. Aggiornarle tutte a mano
   vorrebbe dire ricordarsene ogni volta che se ne scrive una nuova.

   Quindi non si tocca niente: si riscrive qui, sul corpo già montato. Chi
   scrive una fotografia domani continua a scrivere <img src="assets/foto/…">
   e la riceve responsiva senza doverlo sapere.

   `sizes` dice al browser quanto sarà larga la figura PRIMA che il foglio di
   stile esista: se si sbaglia, si scarica il file sbagliato. Si ricava dal
   contenitore, che qui si vede perché si lavora sull'HTML montato. */
/* Le tre fasce non si danno a tutte le fotografie. La più grande, 1600, serve
   a una cosa sola: una figura a piena colonna — 46rem, cioè 736 px — su uno
   schermo a doppia densità. Una figura dentro una griglia non passa mai i 480
   px di lato, e darle un file da 1600 vuol dire tenersi in repository un
   megabyte che nessun browser scaricherà mai.

   Misurato: generarle tutte a tappeto faceva 15 MB di derivate, di cui 8,3
   nella sola fascia da 1600. Deciderle dal contesto le porta a metà. */
const SIZES_SOLA = "(min-width: 52rem) 46rem, calc(100vw - 3rem)";
const SIZES_GRIGLIA = "(min-width: 1024px) 20rem, (min-width: 640px) 46vw, calc(100vw - 3rem)";
const SIZES_DUE = "(min-width: 1024px) 30rem, (min-width: 640px) 46vw, calc(100vw - 3rem)";
const SIZES_COPPIA = "(min-width: 1024px) 30rem, 46vw";

const FASCE = new Map([
  // A piena colonna, e su schermo grande a densità doppia: 46rem × 2 = 1472.
  // Il 2200 è il gradino sopra, per gli schermi che quel 1472 lo superano.
  [SIZES_SOLA, [480, 720, 960, 1440, 1600, 2200]],
  // Su telefono queste vanno a tutta larghezza come le sole; su schermo largo
  // si fermano a metà o a un terzo. 30rem × 2 = 960, e il gradino dopo serve
  // a chi ha il monitor a densità tripla.
  [SIZES_DUE, [480, 720, 960, 1440]],
  /* Le griglie si fermavano a 960 e si vedeva: una scheda da 20rem su un
     monitor a densità doppia ne chiede 640, ma a tripla 960 li tocca esatti —
     e il browser, dovendo scegliere l'ultimo gradino, mostrava un file che
     stava al limite. Il 1440 è il margine che mancava. */
  [SIZES_GRIGLIA, [480, 720, 960, 1440]],
  // Le coppie del '900 stanno a due colonne anche sul telefono: 46vw di 390
  // fanno 179 px, che a densità tripla sono 537.
  [SIZES_COPPIA, [480, 720, 960]],
]);

/* Quali derivate servono davvero. Si riempie mentre le pagine si montano, e
   si legge quando è ora di tagliare: una fotografia che compare due volte in
   contesti diversi si prende l'unione delle due fasce, non l'ultima vista. */
const servono = new Map();

const figureResponsive = (html) => {
  /* Per ogni figura serve sapere dentro che cosa sta. Un'espressione regolare
     che guardi indietro fin dove comincia il contenitore non esiste; guardare
     il testo che precede, sì — ed è leggibile. */
  const contesto = (prima) => {
    const apre = prima.lastIndexOf('class="sb-riv-foto-grid');
    if (apre === -1) return SIZES_SOLA;
    const dentro = prima.slice(apre);

    /* La griglia è ancora aperta? Si contano i tag scorrendoli in ordine, con
       un saldo che parte da uno — il <div> della griglia, che sta appena prima
       del punto in cui `dentro` comincia. Appena il saldo torna a zero quella
       griglia si è chiusa, e tutto quello che viene dopo sta fuori.

       Contare invece i <div> e i </div> di tutto il blocco e confrontarne il
       totale non funziona: ogni figura del segnaposto ne apre due e ne chiude
       due, il saldo resta in pari, e una figura scritta da sola dopo una
       griglia continuava a sembrarci dentro. Si prendeva un file da 480 px e
       lo si stirava su una colonna da 730: era quella la sfocatura. */
    let saldo = 1;
    for (const t of dentro.match(/<\/?div\b/g) || []) {
      saldo += t[1] === "/" ? -1 : 1;
      if (saldo === 0) return SIZES_SOLA;
    }

    const classe = (dentro.match(/^class="([^"]*)"/) || [, ""])[1];
    if (classe.includes("--coppia")) return SIZES_COPPIA;
    if (classe.includes("--due")) return SIZES_DUE;
    return SIZES_GRIGLIA;
  };

  let da = 0;
  return html.replace(/<img\s([^>]*?)src="(assets\/foto\/[^"]+)"([^>]*?)>/g, (tutto, prima, src, dopo, pos) => {
    da = pos;
    const m = misure[src];
    if (!m) return tutto; // fotografia senza misure note: resta com'era.

    const sizes = contesto(html.slice(0, da));
    /* Mai più larghe dell'originale: una foto da 900 px non guadagna niente a
       essere chiesta a 1600, e la fascia doppia si eviterebbe da sé al momento
       di tagliare, lasciando però un srcset che promette una misura che non
       esiste. Si toglie qui, dove la promessa si scrive. */
    const fasce = FASCE.get(sizes).filter((w, i, a) => w <= m.w || a[i - 1] === undefined || a[i - 1] < m.w);
    for (const w of fasce) servono.set(derivata(src, m.imp, w), { src, w: Math.min(w, m.w) });

    const set = fasce.map((w) => `${derivata(src, m.imp, w)} ${Math.min(w, m.w)}w`).join(", ");

    /* Le dimensioni vere, lette da sharp, al posto di quelle scritte a mano:
       il 1600×1067 del segnaposto era giusto per tutte le foto di oggi e
       sarebbe stato sbagliato per la prima che non fosse in tre a due. */
    const attr = `${prima}${dopo}`
      .replace(/\s*\bwidth="[^"]*"/g, "")
      .replace(/\s*\bheight="[^"]*"/g, "")
      .trim();
    return (
      `<picture><source type="image/webp" srcset="${set}" sizes="${sizes}">` +
      `<img ${attr} src="${src}" width="${m.w}" height="${m.h}"></picture>`
    );
  });
};

/* ── Le tabelle dicono che scorrono ───────────────────────────────────────
   Nove tabelle su nove, su /paese, sono più larghe dello schermo di un
   telefono: la più stretta chiede 32rem contro i 342 px utili di un 390.
   Scorrono già, ma .sb-panel-inner taglia il bordo di netto e sembrano
   finite — chi legge gli orari delle Messe si perde la terza colonna.

   La sfumatura sul bordo la mette il foglio di stile. Qui si mette quello che
   il foglio non può: un riquadro che prende il fuoco, così la tabella si
   scorre anche da tastiera e non solo col dito. Si fa dal build e non a mano
   perché sono ventiquattro riquadri su undici pagine, e domani di più. */
const tabelleScorrevoli = (html) =>
  html.replace(
    /<div class="sb-riv-scroll">/g,
    '<div class="sb-riv-scroll" tabindex="0" role="region" aria-label="Tabella, scorrevole in orizzontale">'
  );

/* ── L'indice si scrive da sé ─────────────────────────────────────────────
   Finora l'indice era battuto a mano in cima a ogni frammento, e poteva
   divergere dalle sezioni che elencava. È già successo: su /paese l'occhiello
   parlava di quattro sezioni quando erano sette, e il numero 21 era usato due
   volte. Nessuno se n'era accorto perché nessuno guardava.

   Adesso {{indice}} lo ricava dalle sezioni della pagina stessa: divergere
   non è più possibile, perché non c'è più niente da tenere allineato.

   Ma NON lo ricava dagli <h2>, e questa è la parte che conta. Le voci
   dell'indice erano più corte dei titoli, e lo erano apposta: «Fibra e 5G» è
   una pillola, «Connettività: Wi-Fi, fibra, 5G» è un titolo, e infilare il
   secondo in una fila di pillole su un telefono le manda a capo tre volte.
   Quelle etichette erano informazione, non una copia sciatta del titolo.

   Quindi l'etichetta breve resta, ma va a stare ADDOSSO alla sezione:

     <section class="sb-container sb-riv-sec" id="connettivita" data-indice="Fibra e 5G">

   Senza l'attributo vale il titolo, che il più delle volte è già giusto.
   L'etichetta sta accanto alla cosa che etichetta, e una sezione rinominata
   si porta dietro la sua voce invece di lasciarla indietro in cima al file.

   Due superfici da una verità sola:
     · le pillole in cima, che ci sono sempre e funzionano a script spenti;
     · la colonna a destra, che su PC riempie la fascia oggi vuota.
   La colonna è una copia, quindi è aria-hidden: chi legge con uno screen
   reader sente l'indice una volta, non due. Su telefono la stessa colonna
   non si mostra: lì l'indice lo apre il tasto in basso, che se lo costruisce
   da solo leggendo le pillole (assets/rivalta.js). */
const sezioniIndice = (html) => {
  const out = [];
  for (const blocco of html.split(/<section\b/).slice(1)) {
    const testa = blocco.slice(0, blocco.indexOf(">"));
    if (!/sb-riv-sec\b/.test(testa)) continue;
    const id = (testa.match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const breve = (testa.match(/\bdata-indice="([^"]*)"/) || [])[1];
    const h2 = blocco.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
    if (!breve && !h2) continue;
    out.push({ id, nome: breve || senzaTag(h2[1]).trim() });

    /* Un sotto-titolo può chiedere di entrare in indice, se è una cosa che si
       cerca per nome — «Il Luccio alla Rivaltese» dentro una sezione che si
       chiama altrimenti. Deve avere un id scritto a mano: quelli che scrive
       `ancore()` non esistono ancora, a questo punto del giro. */
    for (const m of blocco.matchAll(/<h3\b([^>]*)>([\s\S]*?)<\/h3>/g)) {
      const sub = (m[1].match(/\bdata-indice="([^"]*)"/) || [])[1];
      const subId = (m[1].match(/\bid="([^"]+)"/) || [])[1];
      if (sub === undefined || !subId) continue;
      out.push({ id: subId, nome: sub || senzaTag(m[2]).trim() });
    }
  }
  return out;
};

/* ── I capitoli che questa pagina copre ───────────────────────────────────
   L'occhiello sopra il titolo dice da quali capitoli del dossier viene la
   pagina: «Sezioni 1 · 2 · 8 · 21». Era scritto a mano su sei pagine, e su
   sei stava giusto finché nessuno aggiungeva niente. Poi a /paese è arrivato
   il Novecento — capitolo 22 — e l'occhiello ha continuato a dire quattro
   numeri per una pagina che ne copriva cinque.

   Nessuno lo aveva notato, e non c'era ragione perché qualcuno lo notasse:
   è una riga piccola in cima, e chi aggiunge una sezione sta guardando il
   fondo del file. Adesso si conta da sé, dai numeri delle sezioni. */
const renderSezioni = (html) => {
  const numeri = [...new Set([...html.matchAll(/sb-riv-secnum">\s*(\d+)/g)].map((m) => Number(m[1])))];
  if (!numeri.length) return "";
  return `Sezioni ${numeri.sort((a, b) => a - b).join(" · ")}`;
};

const renderIndice = (html) => {
  const sez = sezioniIndice(html);
  if (!sez.length) return "";
  const voci = (sp, extra = "") => sez.map((s) => `<a href="#${s.id}"${extra}>${escape(s.nome)}</a>`).join(`\n${sp}`);

  /* La colonna a lato è aria-hidden perché è una copia: chi legge con uno
     screen reader deve sentire l'indice una volta, non due.

     E allora i suoi link devono anche uscire dal giro del tab. Un elemento
     dentro un aria-hidden che però prende il fuoco è la peggiore delle due
     cose insieme: il lettore di schermo non lo annuncia, e intanto il fuoco
     ci finisce dentro e chi naviga da tastiera si trova da nessuna parte.
     L'indice vero — le pillole qui sopra — si tabula tutto, e ha le stesse
     identiche voci. */
  return `<nav class="sb-riv-toc" aria-label="Sezioni di questa pagina">
    ${voci("    ")}
  </nav>
  <aside class="sb-riv-rail" aria-hidden="true">
    <p class="sb-riv-rail-t">In questa pagina</p>
    <nav class="sb-riv-rail-nav">
      ${voci("      ", ' tabindex="-1"')}
    </nav>
  </aside>`;
};

const bodies = readdirSync("_build").filter((f) => f.endsWith(".body.html"));
if (!bodies.length) throw new Error("nessun frammento in _build/");

/* Festone e nota sono identici su tutte le pagine di stagione: si compongono
   una volta qui e si incollano quindici volte, invece di rifarli a ogni giro
   del ciclo. Fuori stagione restano stringhe vuote e i due segnaposto si
   sciolgono nel nulla. */
const FESTONE = stag ? renderFestone(stag) : "";
const NOTA = stag ? renderNota(stag) : "";

/* ── Un nome, due cose ────────────────────────────────────────────────────
   Il JavaScript delle pagine sta dentro <script> in fondo ai frammenti, e non
   passa da nessun controllo: un errore lì non rompe il build, rompe la pagina
   di chi la apre — e in silenzio, perché il browser non lo dice a nessuno.

   Di tutti i modi di sbagliare, questo controlla il più insidioso: lo stesso
   nome usato per una funzione e per una variabile nello stesso script. È
   sintatticamente perfetto, quindi nessun controllo di sintassi lo vede, e il
   `var` sovrascrive la funzione al primo passaggio. La funzione smette di
   esistere e la pagina muore al primo clic che la chiama.

   È successo davvero: `var ordine = query.get("token")` accanto a
   `function ordine()`, e il tasto «Vai al pagamento» ha smesso di rispondere
   senza che si vedesse niente di storto. Da qui in poi il build lo dice. */
function nomiRaddoppiati(html) {
  const scontri = new Set();
  for (const [, js] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const funzioni = new Set([...js.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]));
    for (const [, nome] of js.matchAll(/\bvar\s+([A-Za-z_$][\w$]*)\s*=/g)) {
      if (funzioni.has(nome)) scontri.add(nome);
    }
  }
  return [...scontri];
}

const sitemap = [];
const ricerca = [];
const pagine = [];

for (const file of bodies) {
  const page = file.replace(".body.html", "");
  const src = readFileSync(`_build/${file}`, "utf8");
  let body = shortcodes(
    src
      .replace(/^<!--[\s\S]*?-->\s*/gm, "")
      .trim()
      .replace("{{NEWS}}", renderNews)
      .replace("{{AGGIORNAMENTI}}", renderAggiornamenti)
      .replace("{{AGG_BANNER}}", renderAggBanner)
      .replace("{{MURO_COMMIT}}", renderMuro)
      .replaceAll("{{COMMITS}}", String(COMMITS))
      .replace("{{MAPPA}}", renderMappa)
      .replace("{{VOGLIE}}", renderVoglie)
      .replace("{{LUOGHI}}", renderLuoghi)
      .replace("{{METEO_ORA}}", renderMeteoOra)
      .replace("{{METEO}}", renderMeteo)
      .replace("{{LOGHI}}", renderLoghi)
      .replace("{{BANNER}}", renderBanner)
      .replace("{{CW_HOME}}", () => renderBannerHome(page))
      .replace("{{LOCANDINA}}", renderLocandina)
      .replace("{{CONTRADE_FILA}}", renderContradeFila)
      .replace("{{CONTRADE}}", renderContrade)
  );

  /* Tre passaggi sul corpo già montato. L'indice legge le sezioni; le figure
     e le tabelle riscrivono markup che esiste già, e non si accorgono l'una
     dell'altra. Stanno qui e non nei frammenti perché valgono per tutte le
     pagine, comprese quelle che nessuno ha ancora scritto. */
  body = body.replace("{{indice}}", () => renderIndice(body));
  body = body.replace("{{sezioni}}", () => renderSezioni(body));
  body = figureResponsive(body);
  body = tabelleScorrevoli(body);

  const title = meta(src, "title", file);
  const desc = meta(src, "desc", file);

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

  /* E i tasti delle voglie di /mangiare: novanta righe di script che nessuna
     altra pagina userebbe, quindi le scarica solo quella. */
  const conGusto = src.includes("{{VOGLIE}}");

  /* E il movimento delle due pagine della Color Walk. Non c'è un elenco di
     nomi da tenere aggiornato: se il frammento si mette addosso la vernice
     dell'evento — la classe .sb-cr, che porta le tinte delle polveri e il
     fondale — allora è una pagina della camminata e quelle animazioni le
     servono. Le altre dodici non lo scaricano. */
  const conColorWalk = src.includes('class="sb-cr');

  /* E il vestito del mese, che è l'altra faccia della stessa domanda: si
     mette a tutte le pagine TRANNE quelle che una vernice ce l'hanno già. */
  const conStagione = Boolean(stagione) && !conColorWalk;

  /* E il conto dell'«aperto adesso»: lo scarica solo la pagina che almeno
     un orario ce l'ha davvero. Si guarda il corpo già montato, non il
     frammento: il segnaposto {{aperto:}} a quel punto è diventato markup. */
  const conOrari = body.includes("sb-riv-ap");

  const scriptExtra =
    (conMappa ? `<script src="assets/vendor/leaflet/leaflet.js"></script>\n<script src="assets/mappa.js"></script>\n` : "") +
    (conMeteo ? `<script src="assets/meteo.js"></script>\n` : "") +
    (conGusto ? `<script src="assets/gusto.js"></script>\n` : "") +
    (conColorWalk ? `<script src="assets/color-walk.js"></script>\n` : "") +
    (conOrari ? `<script src="assets/orari.js"></script>\n` : "") +
    (conStagione ? `<script src="assets/stagioni.js"></script>\n` : "");

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
      /* L'attributo su <html> accende il foglio di stagione, e sta lì e non
         nello script di avvio perché non dipende da niente che si sappia
         solo nel browser: il mese lo decide il build. Il segnaposto del
         festone si scioglie su TUTTE le pagine — vuoto dove non serve — o
         resterebbe scritto in chiaro su quelle della Color Walk.

         Anche il colore della barra del browser passa di stagione: su un
         telefono la cornice attorno alla pagina è l'ultima cosa che
         resterebbe del tema di prima. */
      .replace('<html lang="it">', conStagione ? `<html lang="it" data-stagione="${stagione}">` : '<html lang="it">')
      .replace('<meta name="theme-color" content="#fcfcfc">', conStagione ? '<meta name="theme-color" content="#fcfbf9">' : '<meta name="theme-color" content="#fcfcfc">')
      .replace(/[ \t]*\{\{STAGIONE_FESTONE\}\}\r?\n/, conStagione ? `${FESTONE}\r\n` : "")
      .replace("{{HEAD}}", headExtra) +
    `  <main class="sb-main" id="main">\n${ancore(body)}\n  </main>\n` +
    foot
      .replace("{{SCRIPTS}}", scriptExtra)
      .replace(/[ \t]*\{\{STAGIONE_NOTA\}\}\r?\n/, conStagione ? NOTA : "");

  /* La data dell'ultimo commit sta in testata e in fondo a ogni pagina, con
     tre forme: l'attributo `datetime` legge la macchina, la riga lunga si
     legge in fondo, quella breve in testata dove lo spazio è poco. */
  out = out
    .replace(/\{\{UPDATED_ISO\}\}/g, AGG_ISO)
    .replace(/\{\{UPDATED_LONG\}\}/g, AGG_LUNGO)
    .replace(/\{\{UPDATED_SHORT\}\}/g, AGG_BREVE);

  /* La pagina 404 viene servita a QUALSIASI indirizzo sbagliato, e quindi
     anche a /qualcosa/di/profondo: da lì «assets/sb.css» punterebbe a
     /qualcosa/di/assets/sb.css e la pagina arriverebbe nuda, senza foglio di
     stile e senza ricerca — l'unica pagina del sito che ha bisogno di essere
     leggibile proprio quando qualcosa è andato storto. Solo per lei i
     percorsi degli asset diventano assoluti.

     Gli indirizzi interni (href="/paese") sono già assoluti e non c'entrano.
     Vercel la serve da sé: un file 404.html nella radice è la pagina di
     errore del sito, senza niente da configurare. */
  if (page === "404") out = out.split('="assets/').join('="/assets/');

  /* Non si scrive ancora. Prima si montano tutte le pagine, poi la pagella le
     guarda insieme — un collegamento a /storia#mestieri si può giudicare solo
     quando anche /storia esiste — e solo alla fine si scrive. Così un build
     che si ferma a metà non lascia mezze pagine sul disco, come faceva finora
     il controllo dei nomi raddoppiati qui sotto. */
  pagine.push({ page, out, noindex });

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

  /* Si ferma, non avvisa: una pagina con dentro questo scontro è una pagina
     rotta, e pubblicarla con un avviso nel registro del build vuol dire
     scoprirlo da chi non riesce a iscriversi. */
  const scontri = nomiRaddoppiati(out);
  if (scontri.length) {
    throw new Error(
      `${page}.html: ${scontri.join(", ")} — stesso nome per una funzione e per un var nello ` +
        `stesso <script>. Il var sovrascrive la funzione: rinominare la variabile.`
    );
  }

}

/* ══════════════════════════════════════════════════════════════════════════
   LA PAGELLA

   Il build sapeva già fermarsi su tredici errori — uno slug inventato, un
   orario che non esiste, un nome usato due volte nello stesso script. Ma di
   tutto quello che si rompe scrivendo una pagina non vedeva niente: un
   collegamento a una sezione che non c'è più, una fotografia citata e mai
   arrivata, un indirizzo verso una pagina cancellata, un segnaposto scritto
   storto che finisce in chiaro sotto gli occhi di chi legge.

   Sono errori che non fanno rumore. La pagina si costruisce, si pubblica, e
   il primo che se ne accorge è chi ci sbatte contro.

   Qui si guardano tutte le pagine insieme, perché è l'unico momento in cui
   si può: un collegamento a /storia#mestieri si giudica solo quando anche
   /storia è stata montata.

   Gli errori (✗) fanno uscire il build con codice 1 — su una macchina che
   pubblica da sola, è quello che ferma la pubblicazione. Gli avvisi (⚠) no:
   dicono una cosa che vale la pena sapere e lasciano lavorare. Ognuno dice
   cosa fare, come fanno già gli avvisi che c'erano prima. */
const errori = [];
const avvisi = [];

// Gli indirizzi che esistono senza essere pagine: le cartelle servite così
// come sono, e i file con un'estensione vera in fondo.
const nonEPagina = (u) => /^\/(assets|data|api)\//.test(u) || /\.[a-z0-9]{2,5}$/i.test(u);

/* Gli <script> in fondo ai frammenti sono pieni di stringhe che assomigliano
   a markup — `id="' + chiave + '"`, indirizzi costruiti a pezzi — e non sono
   markup: sono codice. Guardarli come se fossero HTML vuol dire inventarsi
   errori che non esistono. Si tolgono prima di guardare, e con loro i
   commenti, che dicono cose che non finiscono in pagina. */
const soloMarkup = (html) =>
  html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");

// `\sid=` e non `\bid=`: fra il trattino e la «i» di data-id c'è un confine
// di parola, e senza lo spazio ogni data-id passerebbe per un id vero.
const idsDi = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const indirizzi = new Set(pagine.map((p) => (p.page === "index" ? "/" : `/${p.page}`)));
const idsPerPagina = new Map(
  pagine.map((p) => [p.page === "index" ? "/" : `/${p.page}`, idsDi(soloMarkup(p.out))])
);

for (const { page, out: grezzo } of pagine) {
  const dove = `${page}.html`;
  const out = soloMarkup(grezzo);

  // 1. Un segnaposto rimasto in chiaro. Finora si controllava solo nelle due
  //    mail della Color Walk: una pagina poteva spedirlo a chi legge.
  for (const m of new Set([...out.matchAll(/\{\{[A-Za-z_][^}\n]{0,60}\}\}/g)].map((m) => m[0]))) {
    errori.push(`${dove}: ${m} è rimasto scritto in chiaro. O il segnaposto non esiste, o è finito in una pagina che non lo scioglie.`);
  }

  // 2. e 3. Collegamenti interni e ancore. Un href="/storia#mestieri" chiede
  //    due cose insieme: che /storia esista e che quell'ancora ci sia dentro.
  for (const m of out.matchAll(/href="(\/[^"#]*)?(#[^"]*)?"/g)) {
    const [, percorso, frammento] = m;
    const bersaglio = percorso === undefined ? (page === "index" ? "/" : `/${page}`) : percorso === "" ? "/" : percorso;
    if (percorso !== undefined && !nonEPagina(bersaglio) && !indirizzi.has(bersaglio)) {
      errori.push(`${dove}: porta a ${bersaglio}, che non è una pagina del sito. Un frammento cancellato lascia in giro i link che ci andavano.`);
      continue;
    }
    if (!frammento || frammento === "#" || nonEPagina(bersaglio)) continue;
    const ids = idsPerPagina.get(bersaglio);
    if (ids && !ids.has(frammento.slice(1))) {
      errori.push(`${dove}: ${bersaglio}${frammento} non risponde — quell'ancora in pagina non c'è. Se la sezione è stata rinominata, il link va rifatto.`);
    }
  }

  // 4. Una fotografia citata e mai arrivata. Il segnaposto {{foto:}} lo
  //    controllava già; le settantuno figure scritte a mano no.
  for (const m of out.matchAll(/<img[^>]*\ssrc="\/?(assets\/[^"]+)"/g)) {
    if (!existsSync(m[1])) {
      errori.push(`${dove}: manca il file ${m[1]}. Va messo lì con quel nome esatto, e al prossimo build compare da sé.`);
    }
  }

  // 5. Due elementi con lo stesso id: il secondo è irraggiungibile, e un
  //    collegamento che ci punta arriva sempre e solo sul primo.
  const visti = new Set();
  for (const m of out.matchAll(/\sid="([^"]+)"/g)) {
    if (visti.has(m[1])) errori.push(`${dove}: l'id "${m[1]}" è usato due volte. Un'ancora sola può rispondere: la seconda non la raggiunge nessuno.`);
    visti.add(m[1]);
  }
}

/* Il numero di sezione ripetuto NON è un controllo, ed è bene sia scritto
   perché a prima vista sembra che dovrebbe esserlo. I numeri vengono dai
   capitoli di data/rivalta-sul-mincio-dossier.md, e un capitolo si spezza in
   più sezioni per come è fatta la pagina: «04 — Commercio», «04 — Mercato» e
   «04 — Professioni» sono tutte e tre il capitolo 4. Succede su sette pagine
   su undici. Un controllo che lo chiamasse errore avrebbe torto ventuno volte
   su ventidue, e un avviso che ha quasi sempre torto insegna solo a non
   leggere gli avvisi. */

// 6. Una pagina in radice che non ha più il suo frammento: cancellare
//    _build/x.body.html non cancella x.html, che resta online per sempre.
for (const f of readdirSync(".").filter((f) => f.endsWith(".html"))) {
  if (!existsSync(`_build/${f.replace(".html", ".body.html")}`)) {
    avvisi.push(`${f} non ha più un frammento in _build/: è rimasta orfana e continua a essere pubblicata. Se non serve più, si cancella a mano.`);
  }
}

/* 7. Una pagina che esiste e che dalla nav non si raggiunge. Aggiungere un
      frammento non aggiunge la voce in testata, e finora nessuno lo diceva.

      Le pagine `noindex` restano fuori: sono bozze e zone riservate — la
      /iscritti degli organizzatori, il modulo da stampare — e il fatto che
      dai menu non si raggiungano è il motivo per cui esistono così. */
for (const { page, noindex } of pagine) {
  if (page === "404" || page === "index" || noindex) continue;
  if (!head.includes(`href="/${page}"`) && !foot.includes(`href="/${page}"`)) {
    avvisi.push(`/${page} non è raggiungibile da nessun menu: la voce va aggiunta a mano in _build/head.html e _build/foot.html.`);
  }
}

/* ── Adesso si taglia ─────────────────────────────────────────────────────
   Le pagine sono montate, quindi `servono` sa esattamente quali derivate
   qualche srcset ha promesso. Si generano quelle e nient'altro: chiedere a
   sharp settantaquattro fotografie per tre misure ognuna vorrebbe dire fare
   il doppio del lavoro per tenersi il doppio dei file.

   Quello che c'è già non si rifà — il nome porta dentro l'impronta
   dell'originale, quindi un file col nome giusto è per costruzione il taglio
   giusto di quella fotografia lì. */
const derivateNuove = [];
if (sharp) {
  for (const [f, { src, w }] of servono) {
    if (existsSync(f)) continue;
    mkdirSync(f.replace(/\/[^/]+$/, ""), { recursive: true });
    // Non si ingrandisce mai: una foto da 900 px non diventa da 1600
    // guadagnando pixel che non ha, diventa solo un file più grosso.
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: FOTO_QUALITA }).toFile(f);
    derivateNuove.push(f);
  }
  mkdirSync("assets/foto/_w", { recursive: true });
  const ordinate = Object.fromEntries(Object.keys(misure).sort().map((k) => [k, misure[k]]));
  scriviSeCambia(MISURE_FILE, JSON.stringify(ordinate, null, 2) + "\n");
}

/* E si butta quello che non serve più: la derivata di una fotografia
   sostituita resta lì col vecchio nome e nessuna pagina la apre. Senza questo
   la cartella cresce a ogni ritocco e nessuno saprebbe più cosa serve.

   Si butta solo quando sharp c'è: senza, `servono` è mezzo vuoto perché le
   misure mancano, e si cancellerebbero derivate buone credendole orfane. */
const derivateOrfane = [];
if (sharp && existsSync("assets/foto/_w")) {
  const gira = (dir) => {
    for (const voce of readdirSync(dir, { withFileTypes: true })) {
      const f = `${dir}/${voce.name}`;
      if (voce.isDirectory()) gira(f);
      else if (f.endsWith(".webp") && !servono.has(f)) {
        rmSync(f);
        derivateOrfane.push(f);
      }
    }
  };
  gira("assets/foto/_w");
}

/* Adesso si scrive. Le pagine sono tutte montate e tutte guardate: quello che
   finisce sul disco è un sito intero o è quello di prima, mai una via di
   mezzo. */
for (const { page, out } of pagine) scriviSeCambia(`${page}.html`, out);

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

scriviSeCambia(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

/* ── Dati della ricerca ──────────────────────────────────────────────────
   Lo stesso elenco che genera le pagine genera l'indice: una pagina nuova
   entra nella ricerca da sé. Va in assets/ (che il browser scarica), non in
   _build/ (che resta a casa), e si committa già pronto come sitemap.xml. */
scriviSeCambia(
  "assets/ricerca-dati.js",
  `/* Generato da build.mjs — NON modificare a mano.
   Indice della ricerca: nome, indirizzo, descrizione e sezioni ancorate di
   ogni pagina pubblica. Lo rigenera ogni build; lo legge assets/ricerca.js
   per la tendina «Cerca» in testata. */
window.RSM_RICERCA = ${JSON.stringify(ricerca)};
`
);
const nSezioni = ricerca.reduce((n, p) => n + p.h.length, 0);

/* ── Le mail della Color Walk ───────────────────────────────────────────
   Due mail — la ricevuta e l'avviso a chi non è arrivato in fondo al
   pagamento — vivono come HTML in _build/email/, perché è lì che si guardano
   e si correggono: aprendole nel browser. Ma a spedirle è una funzione su
   Vercel, e _build/ è in .vercelignore: su Vercel quei file non ci arrivano.

   Quindi il build le porta di là. Risolve i dati dell'evento, toglie via le
   sezioni che non hanno ancora i loro dati, e scrive il risultato dentro
   api/_posta.mjs, fra due marcatori. Da lì in poi sono due stringhe dentro un
   modulo: nessun file da leggere a runtime, nessuna configurazione di
   bundling da indovinare, niente che possa mancare all'appello proprio
   mentre qualcuno sta pagando.

   Due mail e non tre: la ricevuta è la stessa per chi ha pagato online e per
   chi paga in contanti al ritrovo. Quello che cambia sta dentro i marcatori
   condizionali del modello, che scioglie chi spedisce.

   Il blocco fra i marcatori è generato: si modifica l'HTML in _build/email/ e
   si rifà il build, non il contrario. Il build successivo lo riscrive.       */
const evento = JSON.parse(readFileSync("_build/email/evento.json", "utf8"));

/* La testata delle due mail: la fascia alta del banner, ritagliata e in JPEG
   da design/color-walk/render-banner-mail.mjs. Non è il banner del sito —
   quello è largo 2400 e dentro una lastra da 600 diventa pettine — ed è un
   file a parte anche perché il webp, in Outlook, non si apre.

   Nella mail ci va per indirizzo assoluto, non allegata: chi ha le immagini
   bloccate legge il testo alternativo e non perde niente, perché tutto quello
   che il banner dice la mail lo dice anche a parole, più sotto. */
const BANNER_MAIL = "assets/foto/color-walk-banner-mail.jpg";

/* Una sezione entra nella mail solo se TUTTI i campi che le servono sono
   compilati. È la regola che impedisce a «ritrovo alle {{RITROVO_ORA}}» di
   arrivare nella posta di una persona vera: mezza indicazione di ritrovo è
   peggio di nessuna, e una parentesi graffa è peggio di tutte e due. */
const pieno = (k) => String(evento[k] ?? "").trim() !== "";
const sezioni = {
  /* L'ora di partenza sta con il ritrovo, non col percorso: è quello che
     serve a chi legge per non arrivare tardi, e non deve restare fuori dalla
     ricevuta solo perché non si sa ancora quanto è lungo il giro. */
  quando: ["ritrovoOra", "ritrovoLuogo", "partenza"].every(pieno),
  percorso: pieno("distanza"),
  portare: ["portare", "fornito"].every(pieno),
  rimborsi: ["dataLimite", "rimborsi"].every(pieno),
  contatto: pieno("organizzatori"),
  /* Questa non dipende da evento.json ma da un file: se il ritaglio non c'è,
     la mail parte senza testata invece che con un rettangolo rotto. */
  banner: existsSync(BANNER_MAIL),
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
  BANNER_MAIL: `${SITE}/${BANNER_MAIL}`,
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
     qui non ce ne sono, ma il giorno che servissero non vanno tolte.

     Sopravvivono anche i marcatori `se:` — <!--se:chiave--> … <!--/se--> —
     che NON sono roba del build: li scioglie api/conferma-color-walk.mjs al
     momento di spedire, quando sa com'è fatta quella singola iscrizione. Le
     sezioni qui sopra dipendono da evento.json, che è uguale per tutti; i
     marcatori `se:` dipendono da chi ha compilato il modulo — se una
     famiglia ha iscritto dei ragazzi o no. */
  src = src.replace(/[ \t]*<!--(?!\[if|se:|\/se-->)[\s\S]*?-->\r?\n?/g, "");

  // Poi i dati dell'evento. Vengono da un JSON scritto a mano e finiscono in
  // HTML: passano dall'escape come qualunque altro testo di provenienza umana.
  for (const [chiave, valore] of Object.entries(campiMail)) {
    src = src.split(`{{${chiave}}}`).join(escape(String(valore ?? "")));
  }

  const restati = src.match(/\{\{[A-Z_]+\}\}/g) || [];
  /* I segnaposto che il build lascia in piedi di proposito: li riempie chi
     spedisce, con quello che la fattura PayPal dice dell'iscrizione e di chi
     è stato iscritto. Qualunque altro `{{...}}` rimasto è un dato che nessuno
     riempirà mai, e il build si ferma invece di spedirlo. */
  const attesi = [
    "{{NOME}}",
    "{{DATA}}",
    "{{PARTECIPANTI}}",
    "{{VOCE_ADULTI}}",
    "{{IMPORTO_ADULTI}}",
    "{{VOCE_RAGAZZI}}",
    "{{IMPORTO_RAGAZZI}}",
    "{{IMPORTO}}",
    "{{MOTIVO}}",
    /* Il numero del foglio, quando l'iscrizione è stata ricopiata da un modulo
       cartaceo. Sta dentro un blocco condizionale che per tutti gli altri non
       viene nemmeno stampato. */
    "{{MODULO}}",
  ];
  const orfani = [...new Set(restati)].filter((x) => !attesi.includes(x));
  if (orfani.length) throw new Error(`${nome}: segnaposto senza dato — ${orfani.join(" ")}`);

  return src;
};

/* Dentro un template literal solo tre cose vanno protette. Il resto dell'HTML
   — apici, virgolette, accenti — ci sta dentro tale e quale. */
const stringa = (t) =>
  "`" + t.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const FUNZIONE = "api/_posta.mjs";
const sorgente = readFileSync(FUNZIONE, "utf8");
/* Il `\r?` non è pignoleria. Questo file è misto per costruzione: il corpo lo
   scrive una persona e su Windows arriva con le righe alla Windows, la parte
   fra i marcatori la scrive il build e le fa alla Unix. Chiunque passi il file
   in un normalizzatore — o anche solo un `git switch` con autocrlf — sposta il
   ritorno a capo del marcatore, e senza questa domanda il build smette di
   trovarlo e si ferma. Si è fermato davvero, ed è così che si è scoperto. */
const marcatori = /(\/\* build:modelli:inizio \*\/\r?\n)[\s\S]*?(\/\* build:modelli:fine \*\/)/;
if (!marcatori.test(sorgente)) {
  throw new Error(`${FUNZIONE}: mancano i marcatori build:modelli:inizio … build:modelli:fine`);
}

const ricevuta = compilaMail("ricevuta-color-walk.html");
const fallita = compilaMail("fallita-color-walk.html");

/* `export` e non `const` semplice: li importano le due funzioni che
   spediscono — il webhook e l'iscrizione in contanti — e prova-invio.mjs, che
   se ne manda una vera prima che lo faccia un iscritto vero. */
const generato = `/* Generato da build.mjs — NON modificare a mano.
   I sorgenti sono _build/email/ricevuta-color-walk.html,
   _build/email/fallita-color-walk.html e _build/email/evento.json. */

export const ORGANIZZATORI = ${JSON.stringify(String(evento.organizzatori || "").trim())};

export const MODELLO_RICEVUTA = ${stringa(ricevuta)};

export const MODELLO_FALLITA = ${stringa(fallita)};

`;

/* La sostituzione passa da una funzione e non da una stringa: dentro
   `generato` c'è HTML, e String.replace legge $& $1 $` come istruzioni
   proprie anche quando sono capitate lì per caso. */
scriviSeCambia(FUNZIONE, sorgente.replace(marcatori, (_, apri, chiudi) => apri + generato + chiudi));

/* Gli avvisi di sempre — le sezioni della mail non compilate, i loghi e le
   fotografie che non sono ancora arrivate — stanno in una funzione e non
   in linea per una ragione sola: l'ordine in cui si leggono. Prima si dice
   cos'e' cambiato, che e' la domanda con cui si guarda il terminale, poi si
   dice cosa manca. Al contrario gli avvisi scorrono via sopra l'elenco. */
const avvisiDiSempre = () => {
  /* Le sezioni saltate non sono un errore — la mail funziona lo stesso — ma non
     devono passare inosservate: sono le cose che il gruppo del Palio non ha
     ancora deciso, e finché non le decide chi si iscrive non le legge. */
  /* Le due qui sotto non si compilano: le decide il build guardando le altre,
     e una delle due c'è sempre. Non sono cose che manchino. */
  const dedotte = ["dettagli-in-arrivo", "ancora-da-dire"];
  /* E «banner» non manca per una decisione che non è stata presa: manca un
     file. Se ne parla da sé più sotto, dove si parla degli altri pezzi
     grafici che non si trovano. */
  const saltate = Object.entries(sezioni).filter(
    ([k, v]) => !v && !dedotte.includes(k) && k !== "banner"
  );
  if (saltate.length) {
    const vuoti = Object.keys(campiMail).filter(
      (k) => String(campiMail[k] ?? "").trim() === ""
    );
    console.error(`\n⚠ mail Color Walk: ${saltate.length} sezioni non entrano — ${saltate.map(([k]) => k).join(", ")}.`);
    console.error(`  Campi vuoti in _build/email/evento.json: ${vuoti.join(", ")}`);
    if (!sezioni.contatto) {
      console.error(`  Senza "organizzatori" le mail partono senza indirizzo a cui rispondere.`);
    }
    console.error(`  Si compilano lì e si rifà il build: le sezioni tornano da sé.`);
  }

  if (!sezioni.banner) {
    console.error(`
  ⚠ testata delle mail: manca ${BANNER_MAIL}.`);
    console.error(`  Si ricava dal banner con «npm run render:banner-mail».`);
    console.error(`  Finché non c'è, le due mail partono senza immagine in cima.`);
  }

  if (loghiMancanti.length) {
    console.error(`
  ⚠ loghi: ne mancano ${loghiMancanti.length} — ${loghiMancanti.join("  ")}`);
    console.error(`  Vanno in assets/loghi/ con quel nome esatto (svg, png, webp o jpg).`);
    console.error(`  Finché non ci sono, su /color-walk al loro posto si legge il nome.`);
  }

  if (!bannerTrovato) {
    console.error(`
  ⚠ banner Color Walk: manca assets/foto/${BANNER}.webp (o .png/.jpg/.avif/.svg).`);
    console.error(`  L'originale è la tela in design/color-walk/: si riesporta e ricompare.`);
  }

  if (!locandinaTrovata) {
    console.error(`
  ⚠ locandina Color Walk: manca assets/foto/${LOCANDINA}.webp (o .png/.jpg/.avif).`);
    console.error(`  L'anteprima e il link al PDF su /color-walk compaiono col file.`);
  }

  /* ── La lista della spesa ─────────────────────────────────────────────────
     Le fotografie si aggiungono una alla volta, nel tempo. Perché "quali
     mancano" non diventi una domanda a cui si risponde aprendo la cartella e
     confrontandola a occhio con le pagine, il build lo dice ogni volta. */
  if (mancanti.length) {
    const unici = [...new Set(mancanti)];
    const fatte = luoghi.length - unici.length;
    console.error(`\n⚠ fotografie: ${fatte} su ${luoghi.length}. Ne mancano ${unici.length}.`);
    console.error(`  ${unici.slice(0, 6).map((s) => perSlug.get(s).foto).join("  ")}`);
    if (unici.length > 6) console.error(`  …e altre ${unici.length - 6}. L'elenco completo dei nomi file è in _build/luoghi.json`);
    console.error(`  Vanno in assets/foto/ con quel nome esatto: al prossimo build compaiono da sé.`);
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   COS'È CAMBIATO

   Il registro di prima stampava diciotto righe ✓ tutte uguali, una per
   pagina, a ogni giro: diceva che il build era andato, che è la cosa che si
   sa già, e non diceva l'unica che serve — cos'è cambiato. Su diciotto righe
   identiche un avviso in fondo non lo legge nessuno.

   Qui si nominano solo i file toccati davvero, col peso e con quanto sono
   cresciuti o calati. Chi non si è mosso vale una riga sola in coda. */
const kB = (n) => n.toFixed(1).replace(".", ",") + " kB";

for (const c of cambiati.sort((a, b) => a.percorso.localeCompare(b.percorso))) {
  const delta =
    c.delta === null ? "  nuovo" : c.delta === 0 ? "" : `  ${c.delta > 0 ? "+" : "−"}${kB(Math.abs(c.delta))}`;
  console.log(`  ${c.percorso.padEnd(28)}${kB(c.kB).padStart(10)}${delta}`);
}
if (invariati.length) console.log(`  · ${invariati.length} file invariati`);
if (!cambiati.length) console.log(`  · niente da riscrivere`);

if (derivateNuove.length || derivateOrfane.length) {
  const pezzi = [];
  if (derivateNuove.length) pezzi.push(`${derivateNuove.length} generate`);
  if (derivateOrfane.length) pezzi.push(`${derivateOrfane.length} orfane buttate`);
  console.log(`  · fotografie: ${pezzi.join(", ")}`);
}

if (derivateSenzaSharp.length) {
  console.error(`
⚠ ${derivateSenzaSharp.length} fotografie sono senza derivate e sharp non c'è.`);
  console.error(`  Restano <img> semplici: si vedono, ma un telefono se le scarica intere.`);
  console.error(`  Si sistemano con «npm install» e un altro build.`);
}

/* La pagella parla per ultima, e su stderr. Gli avvisi finora finivano nello
   stesso rivolo delle righe normali e non si potevano separare: chi lancia il
   build da uno script non aveva modo di leggere solo quello che non va. */
avvisiDiSempre();
for (const a of [...avvisiRimandati, ...avvisi]) console.error(`\n⚠ ${a}`);
for (const e of errori) console.error(`\n✗ ${e}`);

if (errori.length) {
  console.error(`\n✗ ${errori.length} error${errori.length === 1 ? "e" : "i"}: le pagine sono scritte, ma così non si pubblicano.`);
  process.exitCode = 1;
}

console.log(`${errori.length ? "" : "✓"} fatto in ${Date.now() - PARTITO} ms`.trim());

/* ══════════════════════════════════════════════════════════════════════════
   LA SORVEGLIANZA

   Finora il giro era: cambio una parola nel frammento, non succede niente,
   passo all'altro terminale, rilancio il build, torno nel browser e ricarico.
   Quattro gesti per una parola, e tre sono sempre gli stessi.

   Da qui in poi il build resta acceso e li fa lui. Il ricarico del browser lo
   fa serve.mjs, che guarda le pagine in radice cambiare (vedi lì).

   Le due cartelle che il build SCRIVE — assets/foto/_w/ e il file dell'indice
   di ricerca — sono escluse apposta: sorvegliare quello che si scrive da sé
   è il modo più diretto per costruire all'infinito. */
if (GUARDA) {
  /* ── Uno solo ────────────────────────────────────────────────────────────
     I guardiani si moltiplicano da soli se nessuno lo impedisce. Vite riavvia
     il proprio server ogni volta che vite.config.mjs cambia, e a ogni riavvio
     ne genera uno nuovo senza che il vecchio se ne accorga; e un guardiano
     che sopravvive al padre — succede quando il padre viene ucciso invece che
     chiuso — resta acceso a ricostruire per conto suo. Due guardiani sullo
     stesso repository non rompono niente, ma ricostruiscono ognuno per sé, e
     il terminale comincia a dire cose che non tornano.

     Il lucchetto è un file col numero del processo. Se c'è ed è vivo, questo
     saluta e se ne va: il guardiano acceso continua a fare il suo lavoro.
     Se c'è ma il processo è morto, il lucchetto era rimasto lì da un'uscita
     brutta e si sostituisce senza dire niente. */
  const LUCCHETTO = "_build/.guardiano";
  const vivo = (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };

  if (existsSync(LUCCHETTO)) {
    const altro = Number(readFileSync(LUCCHETTO, "utf8").trim());
    if (altro && altro !== process.pid && vivo(altro)) {
      console.log(`\n👁  c'è già un guardiano acceso su questa cartella (pid ${altro}): questo si ferma qui.`);
      process.exit(0);
    }
  }
  writeFileSync(LUCCHETTO, String(process.pid));
  const sganciaLucchetto = () => {
    try {
      if (existsSync(LUCCHETTO) && readFileSync(LUCCHETTO, "utf8").trim() === String(process.pid)) rmSync(LUCCHETTO);
    } catch {}
  };
  process.on("exit", sganciaLucchetto);
  for (const segnale of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) {
    process.on(segnale, () => {
      sganciaLucchetto();
      process.exit(0);
    });
  }

  const ignora = (f) => {
    const p = String(f || "").replace(/\\/g, "/");
    return (
      !p ||
      p.startsWith("_w/") ||
      p.includes("/_w/") ||
      p.endsWith("ricerca-dati.js") ||
      p.endsWith(".guardiano") ||
      p.endsWith("~") ||
      /\.tmp$/i.test(p)
    );
  };

  let timer = null;
  let giro = 0;

  const rifai = () => {
    timer = null;
    const n = ++giro;
    process.stdout.write(`\n── ricostruisco (${n}) ──\n`);
    const esito = spawnSync(process.execPath, ["build.mjs", "--figlio"], {
      stdio: "inherit",
      env: { ...process.env, RSM_AGG: AGG_ISO, RSM_COMMITS: String(COMMITS) },
    });
    if (esito.status !== 0) process.stdout.write(`   (il build è uscito con ${esito.status}: la pagina è ancora quella di prima)\n`);
  };

  // Antirimbalzo: un salvataggio da un editor arriva spesso come tre eventi
  // ravvicinati, e ricostruire tre volte di fila non serve a nessuno.
  const programma = (f) => {
    if (ignora(f)) return;
    clearTimeout(timer);
    timer = setTimeout(rifai, 80);
  };

  for (const d of ["_build", "assets", "data"]) {
    if (existsSync(d)) watch(d, { recursive: true }, (_, f) => programma(f));
  }

  console.log(`\n👁  sorveglianza accesa su _build/, assets/ e data/. Ctrl+C per smettere.`);
}
