/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscritti-color-walk — l'elenco di chi si è iscritto alla Color
   Walk, per chi organizza. Lo legge la pagina /iscritti.

   L'elenco degli iscritti non è un database nostro: è la lista dei pagamenti
   nel dashboard Stripe, e i dati del modulo ci viaggiano dentro come metadata
   della sessione (vedi api/iscrizione-color-walk.mjs). Questa funzione non
   fa altro che rileggerli da lì e rimetterli in fila. Non c'è niente da
   tenere allineato, perché non c'è una seconda copia.

   ── Un'iscrizione può valere più persone ──────────────────────────────────
   Chi si iscrive è maggiorenne e può portare con sé i minori a suo carico
   (vedi api/iscrizione-color-walk.mjs). Un pagamento, quindi, non è più una
   persona: è un adulto più i suoi minori, scritti nei metadata come
   `minore_1`, `minore_2`… Qui si sciolgono e si contano uno per uno, perché
   il tetto dell'evento è di 300 PARTECIPANTI e non di 300 pagamenti — e
   perché l'elenco che serve al ritiro delle sacche è quello delle persone.

   ── Qui dentro passano dati di persone vere ───────────────────────────────
   Nome, cognome, CODICE FISCALE, data di nascita, email e telefono di
   chiunque si sia iscritto, e i nomi dei minori che qualcuno porta con sé. È
   il dato più sensibile che questo sito tocchi, e sta dietro l'unica porta
   chiusa a chiave del progetto:

     · serve la chiave in ISCRITTI_CHIAVE, una variabile d'ambiente su Vercel.
       Se non è impostata la funzione non risponde — non «risponde a tutti»:
       una porta senza serratura si tiene chiusa, non spalancata;
     · il confronto è a tempo costante, così la chiave non si indovina un
       carattere alla volta misurando quanto ci mette a dire di no;
     · chi sbaglia aspetta mezzo secondo prima della risposta: rende inutile
       provarne diecimila;
     · niente cache, da nessuna parte: `no-store` in testata;
     · la pagina che la interroga è noindex e fuori dalla sitemap, e /api/ è
       già escluso in robots.txt.

   Chi non ha completato il pagamento non entra nell'elenco con nome e
   cognome: se ne conta soltanto quanti sono. Sono persone che ci hanno
   ripensato, e di loro agli organizzatori serve sapere il numero, non
   l'anagrafica.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createHash, timingSafeEqual } from "node:crypto";

/* Deve dire la stessa identica riga di EVENTO nelle altre due funzioni della
   Color Walk: è il marchio con cui si riconoscono le sessioni che la
   riguardano fra tutti i pagamenti del sito. `color-runner-2026-09-20` è il
   vecchio marchio (l'evento si chiamava «Color Runner»): le sessioni di prima
   del cambio nome lo portano scritto e si contano lo stesso. */
const EVENTO = "color-walk-2026-09-20";
const EVENTI_VALIDI = new Set([EVENTO, "color-runner-2026-09-20"]);

const ATTESA_MS = 8000;

/* Cento sessioni per pagina, dieci pagine: mille pagamenti. Per una camminata
   di paese è un tetto che non si tocca, ed esiste solo perché una funzione
   che pagina all'infinito è una funzione che un giorno non torna più. */
const PER_PAGINA = 100;
const PAGINE_MAX = 10;

/* Il materiale che ANSPI ha a disposizione basta per trecento persone: è il
   tetto dell'evento, e la pagina /iscritti lo mostra accanto al conto di
   quante ne sono state iscritte finora. */
const TETTO_PARTECIPANTI = 300;

/* Quanti minori una singola iscrizione può portare: la stessa cifra di
   MAX_MINORI in api/iscrizione-color-walk.mjs. Qui serve solo a sapere fin
   dove cercare le chiavi `minore_N` nei metadata. */
const MAX_MINORI = 8;

const pulisci = (v, max) => String(v ?? "").trim().slice(0, max);

/* I minori scritti nei metadata: una chiave per uno, quattro campi separati
   da una barra verticale — nome, cognome, data di nascita, codice fiscale
   (`—` se non è stato dato). Si legge quello che c'è e si tira via il resto:
   una chiave malformata non deve far sparire l'intera iscrizione dall'elenco
   di chi sta consegnando le sacche. */
function leggiMinori(m) {
  const minori = [];
  for (let i = 1; i <= MAX_MINORI; i++) {
    const riga = m[`minore_${i}`];
    if (!riga) continue;
    const [nome = "", cognome = "", dataNascita = "", codiceFiscale = ""] = String(riga).split("|");
    if (!nome && !cognome) continue;
    minori.push({
      nome: nome.trim(),
      cognome: cognome.trim(),
      dataNascita: dataNascita.trim(),
      codiceFiscale: codiceFiscale.trim() === "—" ? "" : codiceFiscale.trim(),
    });
  }
  return minori;
}

/* Le due chiavi passano da uno sha256 prima del confronto: così sono sempre
   lunghe uguali — timingSafeEqual pretende due buffer della stessa misura, e
   se glieli si desse di lunghezza diversa bisognerebbe controllarla prima,
   rivelando proprio quella. */
function stessaChiave(a, b) {
  if (!a || !b) return false;
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));

async function stripe(chiave, percorso) {
  const risposta = await fetch(`https://api.stripe.com/v1/${percorso}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${chiave}:`).toString("base64")}` },
    signal: AbortSignal.timeout(ATTESA_MS),
  });
  const dati = await risposta.json();
  if (!risposta.ok) throw new Error(dati?.error?.message || `Stripe ha risposto ${risposta.status}`);
  return dati;
}

export default async function handler(req, res) {
  /* Un elenco di iscritti non si mette in cache da nessuna parte: né nel
     browser, né nella rete di distribuzione davanti alla funzione. */
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  const chiaveStripe = process.env.STRIPE_SECRET_KEY;
  const segreto = process.env.ISCRITTI_CHIAVE;

  if (!chiaveStripe || !segreto) {
    return res.status(503).json({
      errore: "zona iscritti non configurata: manca ISCRITTI_CHIAVE fra le variabili d'ambiente",
    });
  }

  const data = pulisci(req.query?.chiave || req.headers["x-chiave"], 200);
  if (!stessaChiave(data, segreto)) {
    await aspetta(500);
    return res.status(401).json({ errore: "chiave non valida" });
  }

  try {
    const iscritti = [];
    let incompleti = 0;
    let dopo = null;

    for (let pagina = 0; pagina < PAGINE_MAX; pagina++) {
      const query = `limit=${PER_PAGINA}` + (dopo ? `&starting_after=${encodeURIComponent(dopo)}` : "");
      const blocco = await stripe(chiaveStripe, `checkout/sessions?${query}`);
      const sessioni = blocco?.data || [];
      if (!sessioni.length) break;

      for (const s of sessioni) {
        if (!EVENTI_VALIDI.has(s.metadata?.evento)) continue;
        if (s.payment_status !== "paid") {
          incompleti++;
          continue;
        }
        const m = s.metadata || {};
        iscritti.push({
          id: s.id,
          nome: m.nome || "",
          cognome: m.cognome || "",
          codiceFiscale: m.codice_fiscale || "",
          dataNascita: m.data_nascita || "",
          email: s.customer_details?.email || s.customer_email || "",
          telefono: m.telefono === "—" ? "" : m.telefono || "",
          note: m.note === "—" ? "" : m.note || "",
          consenso: m.consenso || "",
          minori: leggiMinori(m),
          quandoISO: new Date(s.created * 1000).toISOString(),
          importoCent: s.amount_total ?? 0,
        });
      }

      if (!blocco.has_more) break;
      dopo = sessioni[sessioni.length - 1].id;
    }

    // Prima l'ultimo arrivato: è quello che chi guarda sta cercando.
    iscritti.sort((a, b) => (a.quandoISO < b.quandoISO ? 1 : -1));

    return res.status(200).json({
      evento: EVENTO,
      iscritti,
      incompleti,
      /* Due numeri diversi e tutti e due veri: quante volte è stato compilato
         il modulo, e quante persone cammineranno. È il secondo a doversi
         fermare sotto il tetto. */
      persone: iscritti.reduce((n, i) => n + 1 + i.minori.length, 0),
      tetto: TETTO_PARTECIPANTI,
      totaleCent: iscritti.reduce((s, i) => s + i.importoCent, 0),
      aggiornatoISO: new Date().toISOString(),
    });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}
