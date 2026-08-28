/* ═══════════════════════════════════════════════════════════════════════════
   Cerca-notizie della rassegna stampa — zero dipendenze, `node notizie.mjs`.

   Interroga la ricerca di Google News per «rivalta sul mincio», scarta quello
   che è già in _build/notizie.json e aggiunge il resto come voci da rivedere:
   titolo, testata e data arrivano dal feed, la `nota` e il link diretto
   all'articolo li mette una persona prima di dare per buona la rassegna.

   Non pubblica testo né foto: dal feed si prende solo l'indice. Il link
   salvato è quello di Google News (una pagina-ponte che rimanda alla testata):
   in fase di revisione va sostituito con l'URL diretto del pezzo.

   Gira a mano o dal workflow .github/workflows/notizie.yml (un giro al giorno).
   Scrive due file:
     · _build/notizie.json   — la rassegna, con in testa le voci nuove
     · notizie-nuove.md      — il corpo della pull request (o «nessuna novità»)
   Esce sempre con codice 0: se non ha aggiunto niente, il diff è vuoto e il
   workflow non apre nessuna pull request.

   Opzioni:
     --dry-run   elenca i candidati e non tocca nessun file
   Variabili d'ambiente:
     RASSEGNA_GIORNI   quanti giorni indietro guardare   (default 60)
     RASSEGNA_MAX      quante voci nuove al massimo per giro (default 12)
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from "node:fs";

const FEED =
  "https://news.google.com/rss/search?q=%22rivalta+sul+mincio%22&hl=it-IT&gl=IT&ceid=IT:it";
const FILE = "_build/notizie.json";
const CORPO_PR = "notizie-nuove.md";
const DRY = process.argv.includes("--dry-run");
const GIORNI = Number(process.env.RASSEGNA_GIORNI) || 60;
const MAX = Number(process.env.RASSEGNA_MAX) || 12;

const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

/* Testate che ripubblicano il lavoro altrui senza redazione locale: il feed le
   pesca lo stesso, ma in rassegna non le vogliamo. Il confronto è sul nome
   della fonte e sul suo dominio, non sul link (che è sempre news.google.com). */
const AGGREGATORI = ["zazoom", "informazione", "msn", "notizie.it", "google news", "virgilio"];

const decodeEntita = (s) =>
  String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/* Chiave di confronto: minuscolo, senza accenti né punteggiatura. Serve a
   riconoscere lo stesso titolo anche se una virgola è cambiata. */
const chiave = (s) =>
  decodeEntita(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseItems = (xml) =>
  xml
    .split("<item>")
    .slice(1)
    .map((blocco) => {
      const campo = (re) => (blocco.match(re) || [])[1] || "";
      const titoloGrezzo = decodeEntita(campo(/<title>([\s\S]*?)<\/title>/).trim());
      const testata = decodeEntita(campo(/<source[^>]*>([\s\S]*?)<\/source>/).trim());
      const dominio = campo(/<source url="([^"]+)"/).replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
      // Google News scrive «Titolo - Testata»: via il suffisso, se c'è.
      const titolo = testata && titoloGrezzo.endsWith(` - ${testata}`)
        ? titoloGrezzo.slice(0, -(testata.length + 3)).trim()
        : titoloGrezzo.replace(/\s+-\s+[^-]+$/, "").trim();
      return {
        titolo,
        testata,
        dominio,
        url: decodeEntita(campo(/<link>([\s\S]*?)<\/link>/).trim()),
        guid: campo(/<guid[^>]*>([\s\S]*?)<\/guid>/).trim(),
        pub: new Date(campo(/<pubDate>([\s\S]*?)<\/pubDate>/).trim()),
      };
    })
    .filter((n) => n.titolo && n.testata && n.url);

/* Deve parlare di Rivalta *sul Mincio*, non di una delle altre Rivalta d'Italia:
   o il nome per esteso, o «rivalta» insieme a un riferimento del territorio. */
const parlaDiRivalta = (titolo) => {
  const k = chiave(titolo);
  if (k.includes("rivalta sul mincio")) return true;
  return k.includes("rivalta") && /(mincio|mantov|rodigo|grazie|curtatone|valli)/.test(k);
};

const main = async () => {
  const rassegna = JSON.parse(readFileSync(FILE, "utf8"));
  const guidNoti = new Set(rassegna.map((n) => n.guid).filter(Boolean));
  const chiaviNote = rassegna.map((n) => chiave(n.titolo));

  const giaVisto = (titolo, guid) => {
    if (guid && guidNoti.has(guid)) return true;
    const k = chiave(titolo);
    return chiaviNote.some(
      (nota) => nota === k || (k.length > 25 && (nota.includes(k) || k.includes(nota)))
    );
  };

  let xml;
  try {
    const r = await fetch(FEED, { headers: { "user-agent": "Mozilla/5.0 (rassegna rivaltasulmincio.it)" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    xml = await r.text();
  } catch (e) {
    console.error(`Feed non raggiungibile: ${e.message}`);
    scriviCorpoPr("Il feed di Google News non ha risposto: riprovo al prossimo giro.");
    return; // esce 0: nessun diff, nessuna pull request
  }

  const limite = Date.now() - GIORNI * 864e5;
  const nuove = [];
  for (const n of parseItems(xml)) {
    if (isNaN(n.pub) || n.pub.getTime() < limite) continue;
    if (!parlaDiRivalta(n.titolo)) continue;
    const fonte = `${n.testata} ${n.dominio}`.toLowerCase();
    if (AGGREGATORI.some((a) => fonte.includes(a))) continue;
    if (giaVisto(n.titolo, n.guid)) continue;
    if (nuove.some((x) => chiave(x.titolo) === chiave(n.titolo))) continue;

    const iso = n.pub.toISOString().slice(0, 10);
    nuove.push({
      titolo: n.titolo,
      testata: n.testata,
      data: iso,
      dataTesto: `${n.pub.getUTCDate()} ${MESI[n.pub.getUTCMonth()]} ${n.pub.getUTCFullYear()}`,
      nota: "",
      url: n.url,
      guid: n.guid,
      daRivedere: true,
    });
  }

  if (!nuove.length) {
    console.log("Nessuna notizia nuova.");
    scriviCorpoPr("Nessun titolo nuovo su Rivalta rispetto alla rassegna attuale.");
    return;
  }

  nuove.sort((a, b) => (a.data < b.data ? 1 : -1));
  if (nuove.length > MAX) {
    console.log(`${nuove.length} candidati: tengo i ${MAX} più recenti, gli altri torneranno al prossimo giro.`);
    nuove.length = MAX;
  }
  console.log(`${nuove.length} titoli nuovi:`);
  for (const n of nuove) console.log(`  · [${n.data}] ${n.testata} — ${n.titolo}`);

  if (DRY) {
    console.log("\n--dry-run: non ho scritto niente.");
    return;
  }

  writeFileSync(FILE, JSON.stringify([...nuove, ...rassegna], null, 2) + "\n");
  scriviCorpoPr(corpoConElenco(nuove));
  console.log(`\nScritto ${FILE} e ${CORPO_PR}.`);
};

const corpoConElenco = (nuove) => {
  const righe = nuove
    .map(
      (n) =>
        `- **${n.testata}** — [${n.titolo}](${n.url})\n  ` +
        `_${n.dataTesto}_ · link Google News, da sostituire con l'articolo diretto`
    )
    .join("\n");
  return [
    `${nuove.length} ${nuove.length === 1 ? "titolo nuovo" : "titoli nuovi"} dalla ricerca Google News per «rivalta sul mincio».`,
    "",
    righe,
    "",
    "---",
    "",
    "**Prima di unire:** per ogni voce in `_build/notizie.json`",
    "1. apri l'articolo e controlla titolo e data;",
    "2. metti l'`url` diretto della testata al posto del link Google News;",
    "3. scrivi la `nota` (fatti nostri: luogo, date — mai frasi del pezzo);",
    "4. togli `\"daRivedere\": true` e `\"guid\"`;",
    "5. se la voce non serve, cancellala.",
    "",
    "Poi `node build.mjs` rigenera la home. Le voci ancora `daRivedere` finiscono",
    "online con la nota vuota: non unire senza averle sistemate.",
  ].join("\n");
};

const scriviCorpoPr = (testo) => {
  if (!DRY) writeFileSync(CORPO_PR, testo.endsWith("\n") ? testo : testo + "\n");
};

await main();
