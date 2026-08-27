/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscrizione-color-runner — l'iscrizione alla Color Runner del
   20 settembre: raccolta dati e incasso di quota e commissioni, in un
   passaggio solo.

   Fa due mestieri, secondo il metodo con cui lo si chiama:

     POST  il modulo manda nome, cognome, codice fiscale, email, indirizzo
           di residenza e il consenso spuntato;
           qui si apre una sessione Stripe Checkout e si risponde con
           l'indirizzo a cui mandare il browser a pagare.

     GET   ?sessione=cs_...  al ritorno dal pagamento la pagina chiede
           «questa sessione è stata davvero pagata?». Serve perché
           l'indirizzo di ritorno lo può digitare chiunque: senza questo
           controllo basterebbe aprire /color-runner?stato=ok per vedersi
           dire «iscrizione ricevuta» senza aver pagato una lira.

   Chiama direttamente l'API REST di Stripe via fetch, senza il pacchetto
   npm `stripe`: stesso principio di zero-dipendenze del resto del sito,
   stesso stile di /api/meteo.mjs. I dati dell'iscritto viaggiano come
   metadata della sessione: compaiono così nel dashboard Stripe accanto al
   pagamento — è quello l'elenco degli iscritti, e non serve né un database
   né un foglio a parte.

   La chiave segreta vive solo in una variabile d'ambiente su Vercel
   (STRIPE_SECRET_KEY) — non è mai scritta qui né altrove nel repo.
   ═══════════════════════════════════════════════════════════════════════════ */

/* La carta viene addebitata di QUOTA_CENT + COMMISSIONI_CENT, in due voci
   distinte nel Checkout. La quota è quella che deve arrivare intera
   all'organizzazione; l'euro di commissioni di servizio copre quanto il
   circuito di pagamento trattiene su ogni incasso, così i 10 € non si
   assottigliano. Le due voci compaiono separate sulla pagina di Stripe e
   nella ricevuta. */
const QUOTA_CENT = 1000; // 10,00 €
const COMMISSIONI_CENT = 100; // 1,00 €
const VALUTA = "eur";
const DESCRIZIONE_PRODOTTO = "Iscrizione Color Runner — 20 settembre";
const DESCRIZIONE_COMMISSIONI = "Commissioni di servizio";
const NOTA_COMMISSIONI =
  "Il circuito di pagamento trattiene una piccola commissione su ogni incasso: " +
  "questo euro la copre, così alla camminata arrivano 10 € pieni.";

/* Deve dire la stessa identica riga di EVENTO in api/conferma-color-runner.mjs:
   è il marchio con cui quella funzione riconosce le sessioni che la
   riguardano. Se le due righe divergono, le mail smettono di partire. */
const EVENTO = "color-runner-2026-09-20";

const SITE = "https://www.rivaltasulmincio.it";

/* Meno del limite di 10 secondi dichiarato in vercel.json: se Stripe tarda,
   vogliamo rispondere noi con un errore leggibile, non farci spegnere a metà
   frase lasciando il browser davanti a una pagina bianca. */
const ATTESA_MS = 8000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Sedici caratteri fra lettere e cifre, e basta. Il controllo severo — quello
   del carattere di controllo — lo fa la pagina, che può spiegare a chi scrive
   cosa non torna e farglielo correggere. Qui si guarda solo la forma, di
   proposito: un codice legittimo ma fuori dall'ordinario respinto da questa
   funzione diventerebbe una persona che non riesce a iscriversi e non sa
   perché, con la pagina che le diceva che andava bene. */
const CF_RE = /^[A-Z0-9]{16}$/;

const pulisci = (v, max) => String(v ?? "").trim().slice(0, max);

/* Una sola porta verso Stripe, così l'autorizzazione e il timeout stanno
   scritti in un posto solo. `corpo` assente = richiesta in lettura (GET). */
async function stripe(chiave, percorso, corpo) {
  const risposta = await fetch(`https://api.stripe.com/v1/${percorso}`, {
    method: corpo ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${chiave}:`).toString("base64")}`,
      ...(corpo ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: corpo ? corpo.toString() : undefined,
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  const dati = await risposta.json();
  if (!risposta.ok) throw new Error(dati?.error?.message || `Stripe ha risposto ${risposta.status}`);
  return dati;
}

export default async function handler(req, res) {
  const chiave = process.env.STRIPE_SECRET_KEY;
  if (!chiave) {
    return res.status(500).json({ errore: "pagamento non ancora configurato" });
  }

  if (req.method === "GET") return verifica(req, res, chiave);
  if (req.method === "POST") return iscrivi(req, res, chiave);

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ errore: "metodo non consentito" });
}

/* ── Il ritorno dal pagamento ─────────────────────────────────────────────
   L'identificativo di sessione non è indovinabile, quindi chi ce l'ha è chi
   ha appena pagato: gli si può dire il suo nome. Fuori di lì non esce niente
   — né l'email né l'importo né gli altri campi. */
async function verifica(req, res, chiave) {
  const id = pulisci(req.query?.sessione, 100);
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) {
    return res.status(400).json({ errore: "sessione non valida" });
  }

  try {
    const sessione = await stripe(chiave, `checkout/sessions/${encodeURIComponent(id)}`);
    return res.status(200).json({
      pagato: sessione.payment_status === "paid",
      nome: sessione.metadata?.nome || "",
    });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}

/* ── L'iscrizione ─────────────────────────────────────────────────────────
   Stripe Checkout vuole i parametri in x-www-form-urlencoded, con la
   notazione a parentesi quadre per gli oggetti annidati (line_items,
   price_data, metadata): è la stessa forma richiesta a chi lo chiama da
   curl o da un backend senza SDK. */
async function iscrivi(req, res, chiave) {
  const nome = pulisci(req.body?.nome, 80);
  const cognome = pulisci(req.body?.cognome, 80);
  const email = pulisci(req.body?.email, 200);
  const codiceFiscale = pulisci(req.body?.codiceFiscale, 16).toUpperCase();
  const indirizzo = pulisci(req.body?.indirizzo, 120);
  const telefono = pulisci(req.body?.telefono, 40) || "—";
  const note = pulisci(req.body?.note, 300) || "—";
  const consenso = req.body?.consenso === true;

  /* La risottata finale è a prenotazione e non si paga qui: è solo un numero di
     coperti da segnare accanto all'iscrizione. Chi non spunta niente vale zero;
     chi spunta vale almeno uno (sé stesso), al massimo dieci — oltre, si scrive
     alle organizzatrici. Il numero arriva da un modulo pubblico: si stringe nel
     range e non ci si fida di quello che dice. */
  const vuoleRisotto = req.body?.risotto === true;
  const risottoPersone = vuoleRisotto
    ? Math.min(10, Math.max(1, Math.floor(Number(req.body?.risottoPersone)) || 1))
    : 0;

  if (!nome || !cognome || !EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "nome, cognome o email mancanti o non validi" });
  }
  if (!CF_RE.test(codiceFiscale)) {
    return res.status(400).json({ errore: "codice fiscale mancante o non valido" });
  }
  if (indirizzo.length < 5) {
    return res.status(400).json({ errore: "indirizzo di residenza mancante" });
  }
  /* La spunta è obbligatoria anche qui e non solo nel modulo: il `required`
     dell'HTML è una cortesia verso chi compila, non una garanzia per chi
     riceve. Ed è il consenso a trattare dati di persone vere. */
  if (!consenso) {
    return res.status(400).json({ errore: "manca il consenso al trattamento dei dati" });
  }

  const parametri = new URLSearchParams();
  parametri.set("mode", "payment");
  parametri.set("locale", "it");
  parametri.set("customer_email", email);
  /* {CHECKOUT_SESSION_ID} lo sostituisce Stripe con l'identificativo vero al
     momento del rimando: è quello che poi la pagina ci riporta indietro da
     verificare. Le graffe le codifica URLSearchParams, e Stripe le rilegge
     tali e quali — è la stessa cosa che succede chiamandolo da curl. */
  parametri.set("success_url", `${SITE}/color-runner?stato=ok&sessione={CHECKOUT_SESSION_ID}`);
  parametri.set("cancel_url", `${SITE}/color-runner?stato=annullato`);
  parametri.set("line_items[0][quantity]", "1");
  parametri.set("line_items[0][price_data][currency]", VALUTA);
  parametri.set("line_items[0][price_data][unit_amount]", String(QUOTA_CENT));
  parametri.set("line_items[0][price_data][product_data][name]", DESCRIZIONE_PRODOTTO);
  /* Seconda voce, separata di proposito: chi paga vede scritto nero su bianco
     che l'euro in più sono commissioni di servizio, non un rincaro della
     quota. Stessa distinzione si ritrova nella ricevuta. */
  parametri.set("line_items[1][quantity]", "1");
  parametri.set("line_items[1][price_data][currency]", VALUTA);
  parametri.set("line_items[1][price_data][unit_amount]", String(COMMISSIONI_CENT));
  parametri.set("line_items[1][price_data][product_data][name]", DESCRIZIONE_COMMISSIONI);
  parametri.set("line_items[1][price_data][product_data][description]", NOTA_COMMISSIONI);
  parametri.set("payment_intent_data[description]", `${DESCRIZIONE_PRODOTTO} — ${nome} ${cognome}`);
  /* Il marchio dell'evento. Oggi la Color Runner è l'unica cosa che si paga
     su questo sito, ma /api/conferma-color-runner risponde a ogni avviso di
     pagamento che Stripe manda: è questo a dirgli quali sono i suoi. */
  parametri.set("metadata[evento]", EVENTO);
  parametri.set("metadata[nome]", nome);
  parametri.set("metadata[cognome]", cognome);
  /* Codice fiscale e residenza servono all'assicurazione dei partecipanti, ed
     è l'unico motivo per cui il modulo li chiede. Viaggiano dove vanno tutti
     gli altri campi — nei metadata della sessione — e finiscono nella stessa
     riga del dashboard Stripe: non c'è un secondo posto in cui dati di persone
     vere vadano a finire. */
  parametri.set("metadata[codice_fiscale]", codiceFiscale);
  parametri.set("metadata[indirizzo]", indirizzo);
  parametri.set("metadata[telefono]", telefono);
  parametri.set("metadata[note]", note);
  /* La risottata: "si"/"no" e quanti coperti. Viaggiano nei metadata come tutto
     il resto — è da qui che /api/conferma-color-runner ci scrive la riga nella
     mail e /api/iscritti-color-runner tira su la lista di chi resta a mangiare. */
  parametri.set("metadata[risotto]", vuoleRisotto ? "si" : "no");
  parametri.set("metadata[risotto_persone]", String(risottoPersone));
  /* Quando è stato dato il consenso, non solo che è stato dato: è la parte
     che serve se un domani qualcuno chiede conto di quei dati. */
  parametri.set("metadata[consenso]", new Date().toISOString());

  try {
    const sessione = await stripe(chiave, "checkout/sessions", parametri);
    return res.status(200).json({ url: sessione.url });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}
