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
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";

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

const bodies = readdirSync("_build").filter((f) => f.endsWith(".body.html"));
if (!bodies.length) throw new Error("nessun frammento in _build/");

const sitemap = [];

for (const file of bodies) {
  const page = file.replace(".body.html", "");
  const src = readFileSync(`_build/${file}`, "utf8");
  const body = src
    .replace(/^<!--[\s\S]*?-->\s*/gm, "")
    .trim()
    .replace("{{NEWS}}", renderNews);

  const title = meta(src, "title");
  const desc = meta(src, "desc");
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
      .replace(/\{\{OG_DESC\}\}/g, escape(desc)) +
    `  <main class="sb-main" id="main">\n${body}\n  </main>\n` +
    foot;

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
