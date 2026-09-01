/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscrizione-color-walk — l'iscrizione alla Color Walk del
   20 settembre: raccolta dati e incasso delle quote, in un passaggio solo.

   Fa due mestieri, secondo il metodo con cui lo si chiama:

     POST  il modulo manda i dati di chi si iscrive — che deve essere
           maggiorenne — più quelli dei minori che porta con sé, e il
           consenso spuntato; qui si apre una sessione Stripe Checkout e si
           risponde con l'indirizzo a cui mandare il browser a pagare.

     GET   ?sessione=cs_...  al ritorno dal pagamento la pagina chiede
           «questa sessione è stata davvero pagata?». Serve perché
           l'indirizzo di ritorno lo può digitare chiunque: senza questo
           controllo basterebbe aprire /color-walk?stato=ok per vedersi
           dire «iscrizione ricevuta» senza aver pagato una lira.

   ── Un'iscrizione è un gruppo, non una persona ─────────────────────────
   La regola decisa da chi organizza: ognuno è tutore di sé stesso, e il
   maggiorenne che si iscrive è tutore dei minori a suo carico che iscrive
   insieme a sé. Da lì scendono due conseguenze che questo file fa
   rispettare, e non solo il modulo: chi compila deve avere almeno 18 anni
   compiuti il giorno della camminata, e un minore non può esistere qui
   dentro senza l'adulto che lo porta.

   L'addebito è la somma delle quote: 10 € il maggiorenne, 5 € ognuno dei
   6-17 anni. Sotto i 6 anni non ci si iscrive — si partecipa e basta — ed è
   il motivo per cui una data di nascita troppo recente viene respinta invece
   che fatta pagare.

   Le commissioni del circuito di pagamento non compaiono da nessuna parte:
   né qui, né sul Checkout, né nella ricevuta. Sono un costo
   dell'organizzazione, non una voce a carico di chi si iscrive.

   Chiama direttamente l'API REST di Stripe via fetch, senza il pacchetto
   npm `stripe`: stesso principio di zero-dipendenze del resto del sito,
   stesso stile di /api/meteo.mjs. I dati dell'iscritto viaggiano come
   metadata della sessione: compaiono così nel dashboard Stripe accanto al
   pagamento — è quello l'elenco degli iscritti, e non serve né un database
   né un foglio a parte.

   La chiave segreta vive solo in una variabile d'ambiente su Vercel
   (STRIPE_SECRET_KEY) — non è mai scritta qui né altrove nel repo.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Le due quote, e il tetto di minori che una singola iscrizione può portare.
   Il tetto non è una regola dell'evento: è la misura oltre la quale i
   metadata di Stripe si affollano (50 chiavi in tutto) e un modulo compilato
   col pollice diventa impraticabile. Otto figli a carico sono già una
   famiglia grande; chi ne ha di più compila il modulo due volte. */
const QUOTA_ADULTO_CENT = 1000; // 10,00 €
const QUOTA_MINORE_CENT = 500; //  5,00 € — dai 6 ai 17 anni
const MAX_MINORI = 8;

const VALUTA = "eur";
const DESCRIZIONE_ADULTO = "Iscrizione Color Walk — 20 settembre · maggiorenne";
const DESCRIZIONE_MINORE = "Iscrizione Color Walk — 20 settembre · dai 6 ai 17 anni";

/* Il marchio che va sulle sessioni nuove. conferma-color-walk.mjs e
   iscritti-color-walk.mjs riconoscono questo e anche il vecchio
   `color-runner-2026-09-20` (le sessioni di prima del cambio nome): l'importante
   è che il valore scritto qui sia fra quelli che loro accettano. */
const EVENTO = "color-walk-2026-09-20";

/* Il giorno della camminata. Le età si contano a questa data e non a oggi:
   chi compie 18 anni il 19 settembre si iscrive da sé, e chi ne compie 18 il
   21 è ancora un minore a carico di qualcuno. */
const GIORNO_EVENTO = "2026-09-20";

/* Le iscrizioni online si chiudono alle 23:59 del 18 settembre — due giorni
   prima della camminata, il tempo di preparare le sacche e i sacchetti di
   polvere. Non è più una scadenza assicurativa: chi arriva dopo si iscrive
   sul posto, col modulo cartaceo e in contanti.
   `+02:00` è l'ora legale italiana di settembre: senza il fuso, un server a
   Londra taglierebbe un'ora prima. Passata questa data la POST risponde 403 e
   non apre nessun pagamento; la GET di verifica resta aperta, perché chi ha
   pagato all'ultimo minuto torna dal pagamento dopo la mezzanotte. */
const CHIUSURA_ISO = "2026-09-18T23:59:59+02:00";
const CHIUSURA_MS = Date.parse(CHIUSURA_ISO);

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
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

const pulisci = (v, max) => String(v ?? "").trim().slice(0, max);

/* ── Età e codice fiscale ─────────────────────────────────────────────────
   Il codice fiscale non serve più alla polizza — non c'è polizza. Serve a
   dare una certezza in più su chi si sta assumendo delle responsabilità:
   un nome falso è gratis, un codice fiscale falso che torna anche con la
   data di nascita dichiarata è un'altra cosa.

   Perciò qui il codice non si legge solo nella forma: si controlla che la
   data che porta dentro sia quella dichiarata nel modulo. È il confronto
   che rende il campo utile, ed è il motivo per cui lo si chiede ancora. */

/* Il mese di nascita, nei codici fiscali, è una lettera sola. */
const MESI_CF = "ABCDEHLMPRST";

/* L'omocodia: quando due persone otterrebbero lo stesso codice, l'Agenzia
   sostituisce una o più cifre con una lettera secondo questa tabella. Un
   codice omocodico è legittimo quanto gli altri e va letto come gli altri,
   altrimenti si respinge una persona vera che non capisce perché. */
const OMOCODIA = { L: 0, M: 1, N: 2, P: 3, Q: 4, R: 5, S: 6, T: 7, U: 8, V: 9 };
const cifra = (c) => (c >= "0" && c <= "9" ? Number(c) : OMOCODIA[c]);

/* Le due cifre di una posizione numerica del codice, omocodia sciolta.
   `null` se non sono cifre né lettere sostitutive: il codice è illeggibile
   e il confronto con la data dichiarata non si può fare. */
function numero(codice, da) {
  const alta = cifra(codice[da]);
  const bassa = cifra(codice[da + 1]);
  if (alta === undefined || bassa === undefined) return null;
  return alta * 10 + bassa;
}

/* Vero se il codice fiscale porta dentro proprio quella data di nascita.
   L'anno nel codice sono due cifre: si confronta con le ultime due
   dell'anno dichiarato, e il secolo lo dà la data del modulo — così non
   c'è nessuna ambiguità da indovinare. Il giorno delle donne è aumentato
   di 40, ed è l'unico posto in cui il sesso entra in questo controllo. */
function codiceCombaciaConData(codice, iso) {
  const anno = numero(codice, 6);
  const mese = MESI_CF.indexOf(codice[8]) + 1;
  const giornoGrezzo = numero(codice, 9);
  if (anno === null || mese === 0 || giornoGrezzo === null) return false;

  const giorno = giornoGrezzo > 40 ? giornoGrezzo - 40 : giornoGrezzo;
  const [annoIso, meseIso, giornoIso] = iso.split("-").map(Number);

  return anno === annoIso % 100 && mese === meseIso && giorno === giornoIso;
}

/* Una data vera, non solo una stringa nella forma giusta: il 31 febbraio
   passa la regex e non passa di qui. */
function dataValida(iso) {
  if (!DATA_RE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/* Gli anni compiuti alla data della camminata. */
function etaAllEvento(iso) {
  const [a, m, g] = iso.split("-").map(Number);
  const [ae, me, ge] = GIORNO_EVENTO.split("-").map(Number);
  let anni = ae - a;
  if (me < m || (me === m && ge < g)) anni -= 1;
  return anni;
}

/* Un partecipante letto dal modulo, controllato e restituito pulito.
   `minimo`/`massimo` sono la fascia d'età ammessa per il posto che occupa:
   18-120 per chi si iscrive, 6-17 per chi porta con sé. L'errore torna
   come stringa in italiano, pronto da mostrare. */
function leggiPersona(grezza, { minimo, massimo, chi, cfObbligatorio }) {
  const nome = pulisci(grezza?.nome, 80);
  const cognome = pulisci(grezza?.cognome, 80);
  const dataNascita = pulisci(grezza?.dataNascita, 10);
  const codiceFiscale = pulisci(grezza?.codiceFiscale, 16).toUpperCase();

  if (!nome || !cognome) return { errore: `${chi}: nome o cognome mancanti` };
  if (!dataValida(dataNascita)) return { errore: `${chi}: data di nascita mancante o non valida` };

  const eta = etaAllEvento(dataNascita);
  if (eta < minimo) {
    return {
      errore:
        minimo === 18
          ? "per iscriversi bisogna essere maggiorenni: i minori li iscrive un adulto insieme a sé"
          : `${chi}: sotto i 6 anni non serve iscriversi, si partecipa gratis`,
    };
  }
  if (eta > massimo) {
    return {
      errore:
        massimo === 17
          ? `${chi}: ha 18 anni o più il giorno della camminata, va iscritto con la quota intera`
          : `${chi}: data di nascita non plausibile`,
    };
  }

  if (codiceFiscale || cfObbligatorio) {
    if (!CF_RE.test(codiceFiscale)) return { errore: `${chi}: codice fiscale mancante o non valido` };
    if (!codiceCombaciaConData(codiceFiscale, dataNascita)) {
      return { errore: `${chi}: il codice fiscale non corrisponde alla data di nascita` };
    }
  }

  return { persona: { nome, cognome, dataNascita, codiceFiscale } };
}

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
   ha appena pagato: gli si può dire il suo nome e quante persone ha
   iscritto. Fuori di lì non esce niente — né l'email né l'importo né gli
   altri campi. */
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
      persone: 1 + (Number(sessione.metadata?.n_minori) || 0),
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
  /* Iscrizioni chiuse: si dice qui, prima di guardare i campi, così chi arriva
     tardi legge «chiuse» e non «codice fiscale non valido». Il `chiuse: true`
     lo usa la pagina per nascondere il modulo invece di dire «riprova». */
  if (Date.now() > CHIUSURA_MS) {
    return res.status(403).json({
      errore:
        "le iscrizioni online si sono chiuse alle 23:59 del 18 settembre — " +
        "il giorno stesso ci si iscrive sul posto, prima della partenza",
      chiuse: true,
    });
  }

  /* Chi si iscrive: maggiorenne per forza, codice fiscale obbligatorio.
     È la persona che si assume la responsabilità — per sé e per i minori
     che porta — quindi è quella che va identificata per intero. */
  const letto = leggiPersona(req.body, {
    minimo: 18,
    massimo: 120,
    chi: "Chi si iscrive",
    cfObbligatorio: true,
  });
  if (letto.errore) return res.status(400).json({ errore: letto.errore });
  const adulto = letto.persona;

  const email = pulisci(req.body?.email, 200);
  const telefono = pulisci(req.body?.telefono, 40) || "—";
  const note = pulisci(req.body?.note, 300) || "—";
  const consenso = req.body?.consenso === true;

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "email mancante o non valida" });
  }
  /* La spunta è obbligatoria anche qui e non solo nel modulo: il `required`
     dell'HTML è una cortesia verso chi compila, non una garanzia per chi
     riceve. Ed è la dichiarazione con cui una persona si assume la
     responsabilità di sé e di chi porta con sé. */
  if (!consenso) {
    return res.status(400).json({ errore: "manca la dichiarazione di responsabilità" });
  }

  /* I minori a carico. Il codice fiscale qui è facoltativo — chi si assume la
     responsabilità è l'adulto, già identificato — ma se c'è viene controllato
     con lo stesso metro, data di nascita compresa. */
  const grezzi = Array.isArray(req.body?.minori) ? req.body.minori : [];
  if (grezzi.length > MAX_MINORI) {
    return res.status(400).json({
      errore: `si possono iscrivere al massimo ${MAX_MINORI} minori per volta: per gli altri, compila di nuovo il modulo`,
    });
  }

  const minori = [];
  for (let i = 0; i < grezzi.length; i++) {
    const esito = leggiPersona(grezzi[i], {
      minimo: 6,
      massimo: 17,
      chi: `Minore ${i + 1}`,
      cfObbligatorio: false,
    });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    minori.push(esito.persona);
  }

  const parametri = new URLSearchParams();
  parametri.set("mode", "payment");
  parametri.set("locale", "it");
  parametri.set("customer_email", email);
  /* {CHECKOUT_SESSION_ID} lo sostituisce Stripe con l'identificativo vero al
     momento del rimando: è quello che poi la pagina ci riporta indietro da
     verificare. Le graffe le codifica URLSearchParams, e Stripe le rilegge
     tali e quali — è la stessa cosa che succede chiamandolo da curl. */
  parametri.set("success_url", `${SITE}/color-walk?stato=ok&sessione={CHECKOUT_SESSION_ID}`);
  parametri.set("cancel_url", `${SITE}/color-walk?stato=annullato`);

  /* Due voci al massimo, una per fascia, con la quantità a fare il conto:
     su Stripe si legge «1 × maggiorenne 10 €» e «2 × dai 6 ai 17 anni 5 €»,
     che è esattamente come è stata composta l'iscrizione. La stessa
     divisione si ritrova nella ricevuta. */
  parametri.set("line_items[0][quantity]", "1");
  parametri.set("line_items[0][price_data][currency]", VALUTA);
  parametri.set("line_items[0][price_data][unit_amount]", String(QUOTA_ADULTO_CENT));
  parametri.set("line_items[0][price_data][product_data][name]", DESCRIZIONE_ADULTO);

  if (minori.length) {
    parametri.set("line_items[1][quantity]", String(minori.length));
    parametri.set("line_items[1][price_data][currency]", VALUTA);
    parametri.set("line_items[1][price_data][unit_amount]", String(QUOTA_MINORE_CENT));
    parametri.set("line_items[1][price_data][product_data][name]", DESCRIZIONE_MINORE);
  }

  const quante = minori.length ? ` + ${minori.length} minori` : "";
  parametri.set(
    "payment_intent_data[description]",
    `Color Walk 20 settembre — ${adulto.nome} ${adulto.cognome}${quante}`
  );

  /* Il marchio dell'evento. Oggi la Color Walk è l'unica cosa che si paga
     su questo sito, ma /api/conferma-color-walk risponde a ogni avviso di
     pagamento che Stripe manda: è questo a dirgli quali sono i suoi. */
  parametri.set("metadata[evento]", EVENTO);
  parametri.set("metadata[nome]", adulto.nome);
  parametri.set("metadata[cognome]", adulto.cognome);
  parametri.set("metadata[data_nascita]", adulto.dataNascita);
  /* Il codice fiscale è la certezza in più su chi si assume la
     responsabilità, ed è l'unico motivo per cui il modulo lo chiede. Viaggia
     dove vanno tutti gli altri campi — nei metadata della sessione — e
     finisce nella stessa riga del dashboard Stripe: non c'è un secondo posto
     in cui dati di persone vere vadano a finire. */
  parametri.set("metadata[codice_fiscale]", adulto.codiceFiscale);
  parametri.set("metadata[telefono]", telefono);
  parametri.set("metadata[note]", note);

  /* I minori, una chiave per uno. Quattro campi separati da una barra
     verticale: è la forma più corta che resta leggibile a occhio nel
     dashboard di Stripe, dove qualcuno la guarderà davvero. */
  parametri.set("metadata[n_minori]", String(minori.length));
  minori.forEach((m, i) => {
    parametri.set(
      `metadata[minore_${i + 1}]`,
      `${m.nome}|${m.cognome}|${m.dataNascita}|${m.codiceFiscale || "—"}`
    );
  });

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
