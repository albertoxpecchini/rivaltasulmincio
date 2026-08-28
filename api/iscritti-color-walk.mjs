/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscritti-color-walk — l'elenco di chi si è iscritto alla Color
   Walk, per chi organizza. Lo legge la pagina /iscritti.

   L'elenco degli iscritti non è un database nostro: è la lista dei pagamenti
   nel dashboard Stripe, e i dati del modulo ci viaggiano dentro come metadata
   della sessione (vedi api/iscrizione-color-walk.mjs). Questa funzione non
   fa altro che rileggerli da lì e rimetterli in fila. Non c'è niente da
   tenere allineato, perché non c'è una seconda copia.

   ── Qui dentro passano dati di persone vere ───────────────────────────────
   Nome, cognome, CODICE FISCALE, indirizzo di casa, email e telefono di
   chiunque si sia iscritto. È il dato più sensibile che questo sito tocchi, e
   sta dietro l'unica porta chiusa a chiave del progetto:

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
   riguardano fra tutti i pagamenti del sito. */
const EVENTO = "color-walk-2026-09-20";

const ATTESA_MS = 8000;

/* Cento sessioni per pagina, dieci pagine: mille pagamenti. Per una camminata
   di paese è un tetto che non si tocca, ed esiste solo perché una funzione
   che pagina all'infinito è una funzione che un giorno non torna più. */
const PER_PAGINA = 100;
const PAGINE_MAX = 10;

const pulisci = (v, max) => String(v ?? "").trim().slice(0, max);

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
        if (s.metadata?.evento !== EVENTO) continue;
        if (s.payment_status !== "paid") {
          incompleti++;
          continue;
        }
        const m = s.metadata || {};
        /* La risottata: "si" più il numero di coperti, o niente. Chi cucina
           guarda questi due — e il totale qui sotto — non le nove righe della
           scheda. `risottoPersone` resta 0 per chi non si ferma a mangiare. */
        const risotto = m.risotto === "si";
        const risottoPersone = risotto
          ? Math.min(10, Math.max(1, Math.floor(Number(m.risotto_persone)) || 1))
          : 0;
        iscritti.push({
          id: s.id,
          nome: m.nome || "",
          cognome: m.cognome || "",
          codiceFiscale: m.codice_fiscale || "",
          indirizzo: m.indirizzo || "",
          email: s.customer_details?.email || s.customer_email || "",
          telefono: m.telefono === "—" ? "" : m.telefono || "",
          note: m.note === "—" ? "" : m.note || "",
          consenso: m.consenso || "",
          risotto,
          risottoPersone,
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
      totaleCent: iscritti.reduce((s, i) => s + i.importoCent, 0),
      /* Per la risottata: quante prenotazioni e quanti coperti in tutto. Li
         conta la funzione una volta, così la pagina non rifà la somma a ogni
         ridisegno e chi cucina ha il numero pronto. */
      risottoPrenotazioni: iscritti.filter((i) => i.risotto).length,
      risottoCoperti: iscritti.reduce((s, i) => s + i.risottoPersone, 0),
      aggiornatoISO: new Date().toISOString(),
    });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}
