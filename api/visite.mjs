/* ═══════════════════════════════════════════════════════════════════════════
   /api/visite — il contatore delle bandiere.

   Un contatore di visite ha bisogno di due cose che un sito statico non ha:
   sapere da che paese arriva chi apre la pagina, e ricordarsi il conto fra
   una visita e l'altra. La prima la regala Vercel, che mette il paese
   nell'header `x-vercel-ip-country` di ogni richiesta a una funzione. La
   seconda no: qui non c'è un database, e non lo si aggiunge per contare
   delle visite.

   Il conto sta quindi su **Abacus** (jasoncameron.dev/abacus), un servizio
   gratuito che sa fare una cosa sola: tenere dei numeri interi e alzarli di
   uno. Niente iscrizione, niente chiavi, niente da configurare — si chiama
   un indirizzo e il numero sale. Un contatore per paese, più uno per il
   totale, e la tabella è tutta lì.

   ── Il limite che decide il disegno ──────────────────────────────────────
   Abacus non sa elencare le proprie chiavi: si può chiedere quanto vale
   `paese-DE`, non «quali paesi esistono». E accetta **30 richieste ogni 10
   secondi** per indirizzo IP. Le due cose insieme escludono la strada
   ovvia — passare in rassegna tutti e 253 i codici ISO a ogni lettura:
   sarebbero un minuto e mezzo di attesa e ottantasette richieste rifiutate.

   Quindi la tabella si legge su una lista fissa di paesi (ROSTER, qui
   sotto), scelta per un sito di paese: l'Europa, le Americhe dove Rivalta ha
   mandato gente, l'Australia. Ventotto letture più il totale: una finestra
   sola, mezzo secondo.

   Chi arriva da fuori lista non si perde per questo:

   · la sua visita viene contata lo stesso, sul contatore del suo paese;
   · la POST gli restituisce quel numero, e il browser mette la sua riga
     nella tabella insieme alle altre — chi guarda da Hanoi la bandiera del
     Vietnam la vede;
   · quello che avanza finisce nella riga «resto del mondo», che non è una
     stima: è il totale vero meno la somma di quelli mostrati.

   Se un giorno da un paese fuori lista arriva gente per davvero, si aggiunge
   il suo codice a ROSTER e la riga compare al primo aggiornamento. È l'unica
   manutenzione che questo file chiede.

   ── Cosa NON si salva ────────────────────────────────────────────────────
   Un numero per paese, e basta. Nessun cookie, nessun indirizzo IP scritto
   da qualche parte, nessuna sessione, nessun profilo: l'IP lo legge Vercel
   per dire «Italia», e da lì non esce. Guardando questi dati non c'è modo di
   risalire a una persona — perché di persone non ce n'è traccia.
   ═══════════════════════════════════════════════════════════════════════════ */

const ABACUS = "https://abacus.jasoncameron.dev";
const SPAZIO = "rivalta-sul-mincio.it";
const TOTALE = "visite-totali";

/* I paesi di cui si legge il conto a ogni aggiornamento. Ventotto, che col
   totale fanno ventinove: una richiesta sotto il tetto di trenta ogni dieci
   secondi. Il margine è di una sola, quindi una POST che passa nello stesso
   istante la porta la trova chiusa — e infatti riprova, appena la finestra si
   riapre (vedi `chiama` più sotto). L'ordine qui non conta: la tabella si
   ordina da sé sul numero. */
const ROSTER = [
  "IT", "DE", "CH", "FR", "GB", "ES", "AT", "NL", "BE", "PT",
  "PL", "RO", "CZ", "SE", "DK", "NO", "IE", "GR", "HU", "SI",
  "HR", "UA", "RU", "US", "CA", "BR", "AR", "AU",
];

/* Un codice paese è due lettere maiuscole e nient'altro. Vercel manda `XX`
   quando non sa dirlo e `T1` per chi passa da Tor: sono valori validi come
   forma ma non sono paesi, e non si contano. */
const codiceValido = (c) => /^[A-Z]{2}$/.test(c) && c !== "XX" && c !== "T1";

const paeseDi = (req) => {
  const c = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  return codiceValido(c) ? c : null;
};

/* I robot non sono visite. Non si tratta di tenerli fuori a tutti i costi —
   chi vuole gonfiare un contatore pubblico ci riesce comunque — ma di non
   scrivere «trecento visite dagli Stati Uniti» quando sono trecento passaggi
   di un indicizzatore. */
const RIGA_ROBOT = /bot|crawl|spider|slurp|preview|fetch|monitor|headless|lighthouse|curl|wget|python|axios|okhttp/i;
const eRobot = (req) => RIGA_ROBOT.test(String(req.headers["user-agent"] || ""));

/* ── Bussare ad Abacus ────────────────────────────────────────────────────
   Trenta richieste ogni dieci secondi, e le nostre arrivano a raffica: le
   ventinove della tabella partono insieme, e una POST di qualcuno che sta
   aprendo la pagina proprio in quel momento le trova già tutte in volo. Il
   tetto lo si sfiora per costruzione, ed è per questo che c'è un secondo
   tentativo.

   Non è un `retry` a caso dopo un tempo inventato: la risposta 429 dice in
   quale istante la finestra si riapre (`ratelimit-reset`), e si aspetta
   esattamente quello. Un tentativo solo, e un tetto di dodici secondi: se
   dopo quello il servizio ancora non risponde, non è una finestra piena, è
   un guasto — e a un guasto si risponde tacendo, non insistendo. */
const attesa = (ms) => new Promise((r) => setTimeout(r, ms));

/* L'header è un istante in secondi dall'epoca, ma qualche proxy lo riscrive
   come «fra quanti secondi»: un numero piccolo non può essere una data, e
   allora è un'attesa. Mezzo secondo di margine perché l'orologio di qui e
   quello di là non sono lo stesso orologio. */
const quantoAspettare = (r) => {
  const v = Number(r.headers.get("ratelimit-reset"));
  if (!Number.isFinite(v) || v <= 0) return 2000;
  const ms = v < 1e6 ? v * 1000 : v * 1000 - Date.now();
  return Math.min(12_000, Math.max(0, ms) + 500);
};

const chiama = async (percorso, riprovato = false) => {
  const r = await fetch(`${ABACUS}${percorso}`, { headers: { accept: "application/json" } });
  if (r.status !== 429 || riprovato) return r;
  await attesa(quantoAspettare(r));
  return chiama(percorso, true);
};

/* Una lettura sola. Una chiave che non esiste risponde 404, e qui 404 vuol
   dire zero: da quel paese non è ancora passato nessuno. Qualunque altro
   intoppo — rete, servizio giù, finestra piena anche al secondo giro — torna
   `null`, che è diverso da zero: la tabella salta quella riga invece di
   scrivere uno zero che non ha verificato. */
const leggi = async (chiave) => {
  try {
    const r = await chiama(`/get/${SPAZIO}/${chiave}`);
    if (r.status === 404) return 0;
    if (!r.ok) return null;
    const j = await r.json();
    return Number.isFinite(j.value) ? j.value : null;
  } catch {
    return null;
  }
};

const alza = async (chiave) => {
  try {
    const r = await chiama(`/hit/${SPAZIO}/${chiave}`);
    if (!r.ok) return null;
    const j = await r.json();
    return Number.isFinite(j.value) ? j.value : null;
  } catch {
    return null;
  }
};

/* ── GET: la tabella ──────────────────────────────────────────────────────
   Esce dalla CDN di Vercel, non da qui: s-maxage=300 vuol dire che Abacus
   viene interrogato al massimo una volta ogni cinque minuti, che le visite
   siano mille o una. Con stale-while-revalidate chi arriva allo scadere
   riceve subito la copia appena scaduta e l'aggiornamento avviene dietro le
   sue spalle: nessuno aspetta ventinove richieste di rete per vedere un
   footer. */
const tabella = async (res) => {
  const [totale, ...conti] = await Promise.all([leggi(TOTALE), ...ROSTER.map((c) => leggi(`paese-${c}`))]);

  const paesi = ROSTER.map((c, i) => ({ c, v: conti[i] })).filter((p) => Number.isFinite(p.v) && p.v > 0);

  if (totale === null && paesi.length === 0) {
    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60");
    return res.status(503).json({ errore: "contatore non raggiungibile" });
  }

  paesi.sort((a, b) => b.v - a.v || (a.c < b.c ? -1 : 1));

  /* Il resto del mondo non è una stima: è il totale vero meno quello che si
     sta mostrando. Se per un attimo la sottrazione venisse negativa — una
     lettura arrivata a metà, il totale vecchio di cinque minuti e un paese
     appena aggiornato — si scrive zero invece di un numero impossibile. */
  const mostrate = paesi.reduce((s, p) => s + p.v, 0);
  const resto = totale === null ? 0 : Math.max(0, totale - mostrate);

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json({ totale: totale === null ? mostrate : totale, paesi, resto });
};

/* ── POST: questa visita ──────────────────────────────────────────────────
   Due colpi soli: il totale e il paese di chi sta leggendo. Non si mette MAI
   in cache — è l'unica risposta del sito che parla di chi la sta chiedendo. */
const conta = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const paese = paeseDi(req);

  /* Niente paese (anteprima in locale, rete anonimizzata) o un robot: si
     risponde onestamente che non si è contato niente. Un contatore che sale
     mentre si sviluppa il sito racconterebbe le prove, non le visite. */
  if (!paese || eRobot(req)) return res.status(200).json({ paese, contata: false });

  const [, visite] = await Promise.all([alza(TOTALE), alza(`paese-${paese}`)]);
  return res.status(200).json({ paese, visite, contata: visite !== null });
};

export default async function handler(req, res) {
  if (req.method === "GET" || req.method === "HEAD") return tabella(res);
  if (req.method === "POST") return conta(req, res);
  res.setHeader("Allow", "GET, HEAD, POST");
  return res.status(405).json({ errore: "metodo non consentito" });
}
