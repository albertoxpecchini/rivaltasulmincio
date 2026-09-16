/* ═══════════════════════════════════════════════════════════════════════════
   api/_paypal.mjs — la porta verso PayPal, e il formato in cui un'iscrizione
   ci sta dentro.

   Non è un endpoint: il trattino basso davanti al nome dice a Vercel di non
   farne una funzione. È il pezzo che le tre funzioni della Color Walk
   condividono, ed è qui e non copiato tre volte perché il formato con cui
   un'iscrizione viene scritta è lo stesso con cui va riletta: il giorno che
   si dividono, l'elenco degli iscritti smette di combaciare con quello che
   l'iscrizione ha scritto, e nessuno se ne accorge finché non manca qualcuno
   davanti alla chiesa.

   ── L'elenco degli iscritti è l'elenco delle fatture ──────────────────────
   Il sito non ha un database e non ne vuole uno: i dati di chi si iscrive
   stanno da PayPal, non da noi. Con Stripe stavano nei metadata della
   sessione di pagamento; PayPal non ha un'API che elenca gli ordini, quindi
   quel posto lì non esiste più e ne serve un altro.

   Quel posto è la FATTURA. Ogni iscrizione è una fattura PayPal, e nasce
   sempre allo stesso momento: quando il modulo viene spedito, prima che
   qualunque soldo si muova. Poi, secondo come si è scelto di pagare:

     · chi paga online   viene mandato a un ordine PayPal che di quella
                         fattura porta solo il numero. A incasso avvenuto il
                         webhook la segna saldata;
     · chi paga in       non viene mandato da nessuna parte: la fattura resta
       contanti          NON saldata finché qualcuno non incassa i soldi
                         davanti alla chiesa, il giorno stesso.

   Nascere prima del pagamento ha una conseguenza che va detta: chi apre il
   checkout e non arriva in fondo lascia una fattura non saldata. Non è un
   rifiuto in mezzo ai piedi, è esattamente il «pagamento non completato» che
   la pagina degli iscritti conta già — e il memo dice quale delle due cose è,
   perché ci porta scritto il modo di pagare scelto al momento del modulo.

   È una scelta che tiene, e non un ripiego: le fatture si elencano e si
   filtrano (`search-invoices`), i campi sono larghi — mille caratteri per
   voce, cinquecento di memo riservato — e «non ancora pagata» è uno stato
   che le fatture hanno già, mentre un pagamento o c'è o non c'è.

   Le fatture non vengono MAI mandate a chi si iscrive: si creano, si
   «spediscono» con `send_to_recipient: false` — che è il modo di portarle
   allo stato in cui accettano un pagamento senza che PayPal scriva a
   nessuno — e le mail restano le nostre, quelle di
   api/conferma-color-walk.mjs. Chi si iscrive non deve ricevere due
   messaggi diversi dallo stesso evento.

   ── Le credenziali ───────────────────────────────────────────────────────
   Vivono solo fra le variabili d'ambiente su Vercel, mai qui e mai nel repo:

     PAYPAL_CLIENT_ID      l'identificativo dell'app
     PAYPAL_CLIENT_SECRET  la chiave segreta
     PAYPAL_AMBIENTE       `prova` per la sandbox; qualunque altra cosa, o
                           niente, vale «live»
   ═══════════════════════════════════════════════════════════════════════════ */

const AMBIENTI = {
  live: "https://api-m.paypal.com",
  prova: "https://api-m.sandbox.paypal.com",
};

/* Il marchio dell'evento, scritto nel campo `reference` di ogni fattura. È
   quello che distingue le iscrizioni alla camminata da qualunque altra
   fattura ci sia sul conto PayPal, oggi o fra due anni. */
export const EVENTO = "color-walk-2026-09-20";

/* Quanti minori una singola iscrizione può portare. Non è una regola
   dell'evento: è la misura oltre la quale un modulo compilato col pollice
   diventa impraticabile. Otto figli a carico sono già una famiglia grande;
   chi ne ha di più compila il modulo due volte. */
export const MAX_MINORI = 8;

/* E quanti maggiorenni, capofila compreso: quattro vuol dire lui più tre.
   Ci sta la coppia, ci stanno i nonni, e chi ne ha di più compila il modulo
   due volte — la stessa misura dei minori, per la stessa ragione. */
export const MAX_ADULTI = 4;

/* E quanti bambini sotto i 6 anni. Stesso tetto dei minori e per la stessa
   ragione: non è una regola dell'evento, è il punto oltre il quale un modulo
   compilato col pollice diventa impraticabile. */
export const MAX_PICCOLI = 8;

export const VALUTA = "EUR";

/* Le due quote. Stanno qui e non nella funzione dell'iscrizione perché non
   le scrive soltanto lei: la ricevuta le rilegge dalla fattura, e il giorno
   che una delle due cambiasse a metà iscrizioni le vecchie fatture devono
   continuare a dire quello che è stato davvero pagato. */
/* ── Quanto ne resta all'associazione ────────────────────────────────────
   PayPal trattiene una commissione su ogni pagamento che passa da lui, e
   quello che arriva sul conto non è la quota che la persona ha versato. Chi
   tiene la cassa deve poter leggere tutti e due i numeri: il lordo è quello
   che è stato incassato, il netto è quello che ci sarà davvero.

   La tariffa è quella dei pagamenti da conto estero UE — 0,35 € fissi più il
   3,4% — ricavata dai movimenti veri del conto:

     10,00 € → 0,69 € di commissione → 9,31 € netti
     25,00 € → 1,20 € di commissione → 23,80 € netti
     30,00 € → 1,37 € di commissione → 28,63 € netti

   Torna esatta al centesimo su tutti e tre, e per questo si scrive come
   formula e non come tabella: le quote cambiano, le iscrizioni si sommano in
   cifre che nessuna tabella avrebbe previsto.

   Vale SOLO per i soldi passati da PayPal. Il contante preso al banchetto
   arriva intero — nessuno trattiene niente su una banconota — ed è il motivo
   per cui le due cifre vanno tenute separate invece che in un totale solo.

   La commissione si applica a OGNI pagamento, non alla somma: due iscrizioni
   da 10 € pagano due volte i 35 centesimi fissi. Chi somma il netto di un
   elenco deve quindi sommare i netti, non nettare la somma — e per questo
   questa funzione prende un importo solo. */
const PAYPAL_FISSA_CENT = 35;
const PAYPAL_PERCENTUALE = 0.034;

/* La commissione su un singolo pagamento, arrotondata al centesimo come fa
   PayPal. Su zero è zero: un bambino sotto i 6 anni non paga commissioni
   perché non paga niente. */
export const commissioneCent = (lordoCent) =>
  lordoCent > 0 ? Math.round(lordoCent * PAYPAL_PERCENTUALE) + PAYPAL_FISSA_CENT : 0;

/* Quanto ne resta dopo la commissione. */
export const nettoCent = (lordoCent) => lordoCent - commissioneCent(lordoCent);

export const QUOTA_ADULTO_CENT = 1000; // 10,00 €
export const QUOTA_MINORE_CENT = 500; //  5,00 € — dai 6 ai 17 anni

/* E i bambini sotto i 6 anni: zero. Non è una quota scontata, è l'assenza di
   quota — camminano gratis, e da sempre è così. La cifra esiste lo stesso,
   invece di essere uno zero scritto a mano dentro le voci, perché è da qui
   che passano tutti i conti: chi somma un totale non deve sapere che quella
   fascia è gratis, gli basta sommare la sua quota come per le altre due.

   Il motivo per cui questi bambini stanno sulla fattura, gratis, invece di
   non esserci affatto: prima una data sotto i 6 anni veniva respinta, e
   allora chi compilava toglieva la riga — il bambino spariva dal sito, ma
   alla camminata ci veniva lo stesso. La mattina del 20, al banco delle
   sacche, erano nomi che l'elenco non conosceva. Adesso ci sono, valgono
   zero euro, e si contano fra le persone. */
export const QUOTA_PICCOLO_CENT = 0; //  gratis — sotto i 6 anni

/* I due modi di pagare. Chi sceglie i contanti non passa da nessun
   pagamento online: si iscrive e basta, e paga davanti alla chiesa il
   giorno stesso, prima della partenza. */
export const MODALITA = new Set(["paypal", "contanti"]);

/* Il tetto d'attesa di UNA chiamata, e non di tutta la richiesta: iscriversi
   ne fa quattro in fila — gettone, fattura, spedizione, ordine — dentro i 20
   secondi dichiarati in vercel.json. Otto secondi l'una erano il limite di
   prima, quando la chiamata era una sola; adesso basterebbero tre chiamate
   lente a farci spegnere a metà frase, lasciando il browser davanti a una
   pagina bianca invece che davanti a un errore leggibile. */
export const ATTESA_MS = 6000;

export const base = () =>
  AMBIENTI[String(process.env.PAYPAL_AMBIENTE || "").trim().toLowerCase()] || AMBIENTI.live;

/* ── Il gettone ───────────────────────────────────────────────────────────
   PayPal non si autentica a ogni chiamata come faceva Stripe: si chiede un
   gettone e lo si riusa finché dura (nove ore). Tenerlo in una variabile di
   modulo non è una cache vera — su Vercel ogni istanza ha la sua, e le
   istanze vanno e vengono — ma dentro una singola richiesta che fa quattro
   chiamate a PayPal significa un giro di autenticazione invece di quattro.

   Si scade il gettone un minuto prima del dovuto: fra il controllo e l'uso
   passa una chiamata di rete, e un gettone scaduto proprio in mezzo sarebbe
   un errore che capita una volta ogni mille e non si riproduce mai. */
let gettone = { valore: "", scade: 0 };

async function autorizzazione() {
  if (gettone.valore && Date.now() < gettone.scade) return gettone.valore;

  const id = process.env.PAYPAL_CLIENT_ID;
  const segreto = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !segreto) throw new Error("PayPal non configurato: mancano PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET");

  const risposta = await fetch(`${base()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${segreto}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  const dati = await risposta.json().catch(() => ({}));
  if (!risposta.ok || !dati?.access_token) {
    /* Il rifiuto più probabile è il più banale: credenziali di sandbox su
       ambiente live, o viceversa. Detto così si aggiusta leggendo il log. */
    throw new Error(
      `PayPal non ha dato il gettone (${risposta.status}): ${dati?.error_description || dati?.error || "senza motivo"}` +
        ` — controllare PAYPAL_CLIENT_ID/SECRET e PAYPAL_AMBIENTE (adesso: ${base()})`
    );
  }

  gettone = { valore: dati.access_token, scade: Date.now() + (Number(dati.expires_in) || 300) * 1000 - 60_000 };
  return gettone.valore;
}

/* Gli errori di PayPal arrivano come un oggetto con dentro un elenco di
   `details`, e il messaggio in cima da solo dice quasi sempre soltanto
   «Request is not well-formed». Il motivo vero — quale campo, e perché — sta
   nei dettagli: si tirano fuori qui, una volta, così ogni log del progetto
   lo racconta per intero invece di far aprire un'indagine. */
function messaggio(dati, stato) {
  const dettagli = (dati?.details || [])
    .map((d) => [d.field, d.issue, d.description].filter(Boolean).join(" "))
    .filter(Boolean)
    .join("; ");
  return (
    [dati?.message || `PayPal ha risposto ${stato}`, dettagli].filter(Boolean).join(" — ") +
    (dati?.debug_id ? ` [debug_id ${dati.debug_id}]` : "")
  );
}

/* Una sola porta verso PayPal, così l'autorizzazione, il timeout e la
   lettura degli errori stanno scritti in un posto solo.

   `tollera` è l'elenco degli `issue` che NON sono un guasto: sono il modo in
   cui PayPal dice «questo l'avevi già fatto». Serve perché il webhook viene
   richiamato apposta — PayPal lo ripete fino a venticinque volte in tre
   giorni — e la seconda volta la fattura c'è già, è già spedita, è già
   saldata. Un tentativo che trova il lavoro fatto ha finito, non ha
   fallito. */
export async function paypal(percorso, { metodo = "GET", corpo, tollera = [], intestazioni = {} } = {}) {
  const risposta = await fetch(`${base()}${percorso}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${await autorizzazione()}`,
      "Content-Type": "application/json",
      ...intestazioni,
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  /* 204 e le risposte vuote: `send` e `payments` a volte non rispondono
     niente, ed è giusto così. `{}` è la risposta, non un errore.

     E se quello che torna non è JSON — la pagina d'errore di un proxy
     davanti a PayPal, che capita — non deve essere `JSON.parse` a spiegarlo
     con «Unexpected token <»: si tiene il testo, che almeno dice chi ha
     risposto al posto di PayPal. */
  const testo = await risposta.text();
  let dati = {};
  try {
    dati = testo ? JSON.parse(testo) : {};
  } catch {
    if (risposta.ok) throw new Error(`PayPal ha risposto ${risposta.status} con qualcosa che non è JSON`);
    throw new Error(`PayPal ha risposto ${risposta.status}: ${testo.slice(0, 200)}`);
  }

  if (risposta.ok) return dati;

  const problemi = [dati?.name, ...(dati?.details || []).map((d) => d.issue)].filter(Boolean);
  if (tollera.some((t) => problemi.includes(t))) return { giaFatto: true, ...dati };

  /* Cosa gli avevamo mandato. Senza questa riga, un rifiuto come
     `REQUEST_REJECTED` — che PayPal dà senza dire quale campo non gli va giù —
     è un'indagine a mani nude: si sa che ha detto di no e non si sa a cosa.
     Con il corpo nel registro, il campo storto si trova leggendo.

     Non ci finiscono dati di nessuno: si stampano i nomi dei campi e la
     LUNGHEZZA dei valori, non i valori. Le lunghezze sono quello che serve
     davvero, perché i rifiuti muti di PayPal sono quasi sempre un limite
     sforato; i nomi e i codici fiscali di chi si iscrive non hanno niente da
     fare in un registro di errori. */
  if (corpo && typeof corpo === "object") {
    const misura = (o, prefisso = "") =>
      Object.entries(o).flatMap(([k, v]) => {
        const dove = prefisso ? `${prefisso}.${k}` : k;
        if (typeof v === "string") return [`${dove}=${v.length}`];
        if (Array.isArray(v)) return [`${dove}[]=${v.length}`];
        if (v && typeof v === "object") return misura(v, dove);
        return [];
      });
    try {
      /* Il MOTIVO va scritto qui dentro, non solo nell'eccezione. Un log che
         dice soltanto le lunghezze dei campi racconta cosa avevamo mandato e
         non cosa PayPal ne pensa: davanti a un `/send` rifiutato — corpo di
         due booleani, tutte lunghezze vuote — quella riga non dice niente, e
         il motivo vero resta nell'errore che magari qualcuno ha inghiottito.
         Gli `issue` sono codici di PayPal, non dati di nessuno. */
      const perche = problemi.length ? ` — ${problemi.join(", ")}` : "";
      console.error(`PayPal ha rifiutato ${metodo} ${percorso}${perche} — lunghezze dei campi: ${misura(corpo).join(" ")}`);
    } catch {}
  }

  /* E la risposta di PayPal per intero, che è l'unica cosa che dice DAVVERO
     cosa non gli va bene.

     La riga qui sopra stampa i codici — `REQUEST_REJECTED` e compagnia — e
     quelli, da soli, sono ambigui per costruzione: `invoiceId` è il nome che
     PayPal dà ad almeno tre campi diversi, e un rifiuto che nomina quello si
     può leggere in tre modi, tutti plausibili e due sbagliati. La sera del 16
     settembre, con la camminata a quattro giorni, ho tirato a indovinare tre
     volte da quei codici: ogni volta un'ipotesi elegante, ogni volta falsa.
     Il `description` e i `links` che PayPal manda insieme all'errore — e che
     questa riga fino ad allora buttava via — dicono il motivo in inglese e
     mandano alla pagina che lo spiega.

     Non ci finiscono dati di nessuno: è la risposta di PayPal sul nostro
     rifiuto, fatta di codici e di prosa loro, non del contenuto del modulo. */
  try {
    console.error(`PayPal, risposta intera su ${metodo} ${percorso}: ${JSON.stringify(dati)}`);
  } catch {}

  /* Il rifiuto che non si legge da sé, e che ferma tutto: le credenziali sono
     giuste, il gettone arriva, e la chiamata alle fatture torna comunque
     «permessi insufficienti». Non è un errore di codice — è che l'app PayPal
     non ha la funzione Invoicing, e senza quella qui non si registra nessuno,
     perché il registro degli iscritti SONO le fatture.

     Detto così si aggiusta leggendo il log; detto com'era, si apriva
     un'indagine. La coda sul gettone in cache non è un dettaglio: è la prima
     cosa che inganna dopo aver spuntato la casella, perché per nove ore
     un'istanza già calda continua a usare quello vecchio, che il permesso
     nuovo non ce l'ha. */
  const nota =
    problemi.includes("NOT_AUTHORIZED") && percorso.includes("/v2/invoicing/")
      ? " — l'app PayPal non ha il permesso «Invoicing». PayPal Developer → Apps & Credentials," +
        " scheda Live, l'app, Features → Invoicing (richiede un conto Business verificato, e in" +
        " live può passare da una revisione). Se la spunta c'è già, rideployare: il gettone resta" +
        " in cache per nove ore e non si porta dietro i permessi concessi dopo."
      : "";

  throw new Error(messaggio(dati, risposta.status) + nota);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Come un'iscrizione entra in una fattura, e come ne esce
   ═══════════════════════════════════════════════════════════════════════════ */

/* La barra verticale separa i campi dentro una voce di fattura, quindi non
   può stare dentro un nome. Non è una censura: è che un cognome con una
   barra dentro spezzerebbe in due la riga di quella persona quando la si
   rilegge, e nessuno se ne accorgerebbe fino al ritiro delle sacche. */
export const pulisci = (v, max) =>
  String(v ?? "")
    .replace(/[|\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);

/* ── Nomi e cognomi con la maiuscola ──────────────────────────────────────
   Chi compila dal telefono scrive «primo pecchini», e l'`autocapitalize` del
   modulo è un suggerimento che le tastiere ignorano quando gli pare. Su un
   elenco che qualcuno legge ad alta voce al banchetto delle sacche, e su una
   ricevuta che arriva per posta, un nome tutto minuscolo si vede.

   La regola tocca solo le parole scritte TUTTE minuscole o TUTTE maiuscole:
   «primo» diventa «Primo», «ROSSI» diventa «Rossi». Una parola con le
   maiuscole già messe a mano — «McDonald», «DeLuca», «LoCicero» — si lascia
   stare, perché chi l'ha scritta così sa come si scrive il proprio nome
   meglio di questa funzione.

   Apostrofo e trattino contano come inizio di parola: «d'angelo» diventa
   «D'Angelo» e «anna-maria» diventa «Anna-Maria». */
export const maiuscole = (s) =>
  String(s ?? "").replace(/\S+/g, (parola) => {
    if (parola !== parola.toLowerCase() && parola !== parola.toUpperCase()) return parola;
    return parola
      .toLowerCase()
      .replace(/(^|[’'\-])(\p{L})/gu, (_, prima, lettera) => prima + lettera.toUpperCase());
  });

const euro = (centesimi) => (centesimi / 100).toFixed(2);
const centesimi = (valore) => Math.round(Number(valore || 0) * 100);

/* Il numero della fattura sta in VENTICINQUE caratteri, non uno di più: è il
   campo più stretto di tutto il giro, e del limite ci si accorgerebbe solo
   quando PayPal rifiuta l'iscrizione di qualcuno.

   Lo stesso numero per tutte e due le modalità, perché la fattura nasce
   sempre allo stesso momento — quando il modulo viene spedito — e solo
   dopo si sa se quei soldi arriveranno da un checkout o da una mano davanti
   alla chiesa. Il tempo in base 36 tiene le fatture in ordine di arrivo
   anche a colpo d'occhio; le cifre a caso in coda servono a non far
   coincidere due moduli spediti nello stesso millisecondo. */
export const numeroFattura = () =>
  `CW-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36).padStart(4, "0")}`.slice(0, 25);

/* ── Lo stesso modulo mandato due volte ───────────────────────────────────
   Il numero di fattura ricavato dal tentativo, invece che dall'orologio. È
   la cosa che impedisce a un modulo rimandato di iscrivere due volte la
   stessa famiglia, e nasce da un guasto vero: chi compila non vede tornare
   niente — la funzione ci ha messo troppo, la rete è caduta, il telefono ha
   cambiato cella — preme di nuovo, e si ritrova iscritto tre volte.

   Il meccanismo sta tutto qui: la pagina si inventa una sigla a caso quando
   si comincia a compilare, e la rimanda IDENTICA a ogni tentativo. Il numero
   della fattura scende da quella sigla, quindi il secondo tentativo chiede a
   PayPal una fattura con un numero già preso — e PayPal rifiuta. Quel
   rifiuto è la difesa: non è un guasto, è la prova che quell'iscrizione
   c'è già, e da lì si riprende invece di rifarla.

   Che a dire di no sia PayPal, e non un controllo nostro, è la parte che
   conta. Un controllo nostro dovrebbe prima cercare, e la ricerca delle
   fatture di PayPal è un indice che arriva con qualche secondo di ritardo:
   proprio nel minuto in cui uno preme tre volte, quella ricerca risponde
   «non c'è niente» tutte e tre. Il numero unico invece vale nell'istante in
   cui PayPal scrive, perché è lui a garantirlo.

   Ventitré caratteri: `CW-T-` più diciotto di sigla, e non i venticinque
   esatti che erano scritti qui prima.

   Il tetto di PayPal per `invoice_number` è venticinque, e ci stavamo dentro
   per il pelo di zero. Il 15 settembre un'iscrizione in contanti — un adulto
   solo, niente di strano — è tornata indietro con un `REQUEST_REJECTED` sul
   campo `invoiceId`: il rifiuto generico che PayPal dà quando un valore non
   gli va giù senza dire quale sia il problema. Stare esattamente sul limite
   di una regola scritta da qualcun altro, per un numero che non deve essere
   bello ma solo unico, è un rischio che non paga niente.

   Ma il 16 settembre lo stesso rifiuto è tornato, e da lì si è capito che
   quella diagnosi era sbagliata: la lunghezza non c'entrava. `invoiceId` è
   il nome che PayPal dà a DUE campi diversi — `invoice_number` sulla
   fattura, e `invoice_id` sull'ordine — e quello che rifiutava era il
   secondo, che PayPal tiene unico per conto su tutti gli ordini. Il numero
   accorciato qui sopra non ha guastato niente e resta com'è, ma la cosa da
   sapere sta in `numeroPerOrdine`, più sotto: sull'ordine il numero ci va una
   volta sola, e dal secondo checkout in poi vuole un contrassegno in coda.

   E soprattutto: si taglia dalla TESTA, non dalla coda. La sigla che manda la
   pagina è dodici caratteri di sessione più otto di impronta del modulo, e
   l'impronta è l'unico pezzo che cambia quando cambia quello che si sta
   mandando. Tagliando in fondo — com'era la prima versione di questa
   correzione — si buttano via proprio quei caratteri: due moduli DIVERSI
   dalla stessa sessione, una famiglia che si iscrive e poi corregge una data
   e rimanda, finirebbero sullo stesso numero. E una collisione qui non è un
   numero doppio qualunque: è il secondo modulo che si sente rispondere «eri
   già iscritto» e sparisce senza che nessuno se ne accorga, cioè esattamente
   il guasto che la sigla esiste per impedire.

   Quindi: gli ultimi otto caratteri — l'impronta, intera — e davanti quanta
   sessione ci sta. Chi rimanda lo STESSO modulo ottiene lo stesso numero, che
   è tutto il punto, e due moduli diversi restano diversi. */
const SIGLA_NEL_NUMERO = 18;
export const numeroDaTentativo = (tentativo) => {
  const pulita = String(tentativo || "").replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (pulita.length < 8) return "";
  const corta = pulita.length > SIGLA_NEL_NUMERO ? pulita.slice(-SIGLA_NEL_NUMERO) : pulita;
  return `CW-T-${corta}`;
};

/* L'indirizzo a cui una fattura è intestata. Serve in un punto solo: quando
   si scopre che il numero era già preso, prima di riusare quella fattura
   bisogna sapere che è davvero la stessa iscrizione e non quella di un altro
   finita sotto lo stesso numero — la sigla arriva da fuori, e da fuori si può
   scrivere qualunque cosa. */
export const emailFattura = (fattura) =>
  String(fattura?.primary_recipients?.[0]?.billing_info?.email_address || "").trim().toLowerCase();


/* ── Il modulo cartaceo riportato a mano ──────────────────────────────────
   Chi si iscrive al banchetto compila un foglio, e quel foglio porta in cima
   un numero progressivo scritto da chi sta al banco. Quando poi lo si ricopia
   in elenco, quel numero diventa il numero della fattura.

   Fa due mestieri in uno. Rende riconoscibile per sempre un'iscrizione
   arrivata dalla carta — si legge nel pannello di PayPal, in elenco e nel CSV,
   senza bisogno di un campo in più da nessuna parte, e soprattutto senza
   toccare il memo. E impedisce di riportare due volte lo stesso foglio: la
   seconda volta il numero è già preso, e chi ricopia se lo sente dire invece
   di far pagare due volte la stessa persona.

   Il prefisso non può nascere da `numeroFattura`, che dopo `CW-` mette sempre
   un tempo in base 36 e non le lettere `CART-`. */
export const numeroCartaceo = (modulo) =>
  `CW-CART-${String(modulo || "").replace(/[^0-9A-Za-z]/g, "").toUpperCase().slice(0, 12)}`;

export const daCartaceo = (numero) => String(numero || "").startsWith("CW-CART-");

/* Il numero della prossima versione di un foglio corretto.

   Correggere un'iscrizione vuol dire crearne una nuova e annullare quella
   di prima — PayPal non lascia riscrivere una fattura già pagata — e la
   nuova ha bisogno di un numero suo, perché due fatture non possono
   portare lo stesso. Ma il numero del foglio è quello scritto a penna in
   cima alla carta nel raccoglitore, e se lo si buttasse via la riga in
   elenco non si potrebbe più far corrispondere al foglio firmato.

   Quindi si tiene, e gli si attacca una lettera: CW-CART-42 corretto
   diventa CW-CART-42B, poi 42C, poi 42D. Il foglio resta il 42 per
   chiunque lo legga — `moduloDi` restituisce «42B», che al banco si
   riconosce ancora — e le correzioni non si pestano i piedi fra loro.

   Dopo la Z si passa a doppia lettera (42AA), che non succederà mai: sono
   venticinque correzioni sullo stesso foglio. Ma una funzione che a un
   certo punto ricomincia a dare numeri già usati è peggio di una riga in
   più scritta adesso. */
export function prossimoCartaceo(numero) {
  /* Il tetto di PayPal è venticinque caratteri, e questa funzione ne aggiunge
     uno: quindi prima si fa il posto, poi si attacca la lettera.

     Serve perché questa funzione non lavora solo sui numeri di carta, che
     sono corti (`CW-CART-42`), ma anche su quelli nati dal sito, che di
     caratteri ne hanno già ventitré (`CW-T-` più diciotto di sigla). Su
     quelli la prima correzione arrivava a ventiquattro, la seconda a
     venticinque, la terza sforava — e PayPal rispondeva
     `INVALID_STRING_MAX_LENGTH`, cioè «non si corregge più», a chi stava
     solo sistemando una data di nascita.

     Si taglia dalla coda e non dalla testa, al contrario di quanto fa
     `numeroDaTentativo`: lì la coda è l'impronta del modulo e buttarla
     confonderebbe due iscrizioni diverse, qui invece si sta costruendo un
     numero NUOVO che deve solo essere diverso dal precedente, e la lettera
     attaccata in fondo è proprio ciò che lo distingue. */
  const TETTO = 25;
  const base = String(numero || "").slice(0, TETTO - 1);
  const coda = base.match(/([A-Z]*)$/)[1];
  const senzaCoda = coda ? base.slice(0, -coda.length) : base;

  /* Nessuna lettera ancora: è la prima correzione. */
  if (!coda) return `${base}B`;

  /* L'ultima lettera avanza di uno; se era una Z si aggiunge una lettera
     invece di tornare ad A, che darebbe un numero già preso. */
  const ultima = coda[coda.length - 1];
  if (ultima === "Z") return `${senzaCoda}${coda}A`;
  return `${senzaCoda}${coda.slice(0, -1)}${String.fromCharCode(ultima.charCodeAt(0) + 1)}`;
}

/* Il numero del foglio, riletto dal numero della fattura. Stringa vuota se
   quella fattura dalla carta non ci è mai passata. */
export const moduloDi = (numero) => (daCartaceo(numero) ? String(numero).slice("CW-CART-".length) : "");
/* ── Le voci: una per persona ─────────────────────────────────────────────
   Non «1 × maggiorenne, 3 × ragazzi» ma una riga per ciascuno, col suo nome
   e la sua data di nascita. Costa qualche riga in più sulla fattura e in
   cambio dà la cosa che serve davvero il giorno della camminata: l'elenco
   delle persone, non il conto dei pagamenti.

   Il nome della voce è per gli occhi — è quello che si legge nel pannello di
   PayPal — e la descrizione è per il codice: il ruolo, e poi i campi separati
   dalla barra verticale, nella stessa forma in cui li rilegge `personeDa`. */
const FASCIA_ADULTO = "maggiorenne";
const FASCIA_MINORE = "dai 6 ai 17 anni";
const FASCIA_PICCOLO = "sotto i 6 anni — gratis";

/* I ruoli sono quattro e le fasce tre: `A` è chi compila il modulo, `B` ogni
   altro maggiorenne che cammina con lui, `M` i minori dai 6 ai 17, `P` i
   bambini sotto i 6 anni. `A` e `B` si chiamano tutti e due «maggiorenne»
   perché quello è il nome che si legge nel pannello di PayPal e sulla
   ricevuta, e lì la differenza non serve a nessuno. La differenza sta nella
   lettera, e la lettera la legge il codice: chi ha in carico i minori, e chi
   risponde soltanto di sé.

   `P` invece una fascia sua ce l'ha, e si legge: la sua voce vale zero euro,
   e una riga da zero euro in mezzo alle altre, senza niente scritto accanto,
   sembrerebbe uno sbaglio a chi apre la fattura. «Sotto i 6 anni — gratis»
   dice che quello zero è voluto. */
const FASCIA = { A: FASCIA_ADULTO, B: FASCIA_ADULTO, M: FASCIA_MINORE, P: FASCIA_PICCOLO };

/* Il trattino al posto del campo vuoto vale per la data come per il codice
   fiscale: sul foglio di carta un maggiorenne che cammina con altri può aver
   lasciato in bianco l'uno, l'altro o tutti e due, e una descrizione che
   finisse con due barre attaccate si leggerebbe come un dato perso invece che
   come un dato mai dato. `personeDa` rimette la stringa vuota rileggendo. */
const voce = (persona, ruolo, quotaCent) => ({
  name: `${persona.nome} ${persona.cognome} — ${FASCIA[ruolo] || FASCIA_MINORE}`.slice(0, 200),
  description: [ruolo, persona.nome, persona.cognome, persona.dataNascita || "—", persona.codiceFiscale || "—"]
    .join("|")
    .slice(0, 1000),
  quantity: "1",
  unit_amount: { currency_code: VALUTA, value: euro(quotaCent) },
});

/* Il memo è riservato a chi ha il conto PayPal: chi si iscrive non lo vede
   mai, perché la fattura non gli arriva mai. È il posto giusto per le tre
   cose che non sono né un nome né un importo — come ha scelto di pagare, il
   telefono, le note — e per l'ora del consenso, che è la parte che serve se
   un domani qualcuno chiede conto di quei dati. */
const memoDa = ({ modalita, telefono, note, consenso }) =>
  [modalita, telefono || "—", consenso, note || "—"].join("|").slice(0, 500);

export function leggiMemo(memo) {
  const [modalita = "", telefono = "", consenso = "", ...resto] = String(memo || "").split("|");
  const note = resto.join("|");
  return {
    modalita: MODALITA.has(modalita) ? modalita : "",
    telefono: telefono === "—" ? "" : telefono,
    consenso,
    note: note === "—" ? "" : note,
  };
}

/* Il corpo della fattura, pronto da mandare a PayPal. Gli importi non si
   sommano qui: li somma PayPal dalle voci, ed è meglio così — un totale
   calcolato due volte è un totale che prima o poi non combacia. */
export function componiFattura({ numero, adulto, adulti = [], minori, piccoli = [], email, modalita, telefono, note, consenso }) {
  const oggi = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

  return {
    detail: {
      currency_code: VALUTA,
      invoice_number: numero,
      invoice_date: oggi,
      reference: EVENTO,
      memo: memoDa({ modalita, telefono, note, consenso }),
      payment_term: { term_type: "DUE_ON_RECEIPT" },
    },
    primary_recipients: [
      {
        billing_info: {
          name: { given_name: adulto.nome.slice(0, 140), surname: adulto.cognome.slice(0, 140) },
          email_address: email,
        },
      },
    ],
    /* L'ordine delle voci è l'ordine in cui si rileggono: prima il
       capofila, poi i maggiorenni che camminano con lui, poi i minori, e in
       fondo i bambini sotto i 6 anni. Non è un vezzo — `personeDa` prende
       come capofila il primo maggiorenne che incontra, e questa è la riga
       che glielo garantisce. */
    items: [
      voce(adulto, "A", QUOTA_ADULTO_CENT),
      ...adulti.map((a) => voce(a, "B", QUOTA_ADULTO_CENT)),
      ...minori.map((m) => voce(m, "M", QUOTA_MINORE_CENT)),
      ...piccoli.map((p) => voce(p, "P", QUOTA_PICCOLO_CENT)),
    ],
    configuration: { allow_tip: false, tax_inclusive: false },
  };
}

/* ── E all'incontrario ────────────────────────────────────────────────────
   Le persone rilette dalle voci della fattura. Una voce illeggibile si
   scarta e le altre restano: una descrizione storta non deve far sparire
   un'intera famiglia dall'elenco di chi sta consegnando le sacche.

   Torna tre cose. `adulto` è il capofila — chi ha compilato il modulo, chi
   ha in carico i minori, e resta il nome che aveva prima perché i punti del
   sito che lo leggono continuino a funzionare senza sapere niente di questa
   modifica. `adulti` sono i maggiorenni che camminano con lui e rispondono
   di sé, ed è un elenco anche quando è vuoto. `minori` come sempre, e
   `piccoli` i bambini sotto i 6 anni: non pagano, ma ci sono, e chi conta le
   persone al banco delle sacche deve poterli contare. */
export function personeDa(fattura) {
  let adulto = null;
  const adulti = [];
  const minori = [];
  const piccoli = [];

  for (const v of fattura?.items || []) {
    const [ruolo, nome = "", cognome = "", dataNascita = "", codiceFiscale = ""] = String(v.description || "").split("|");
    if (ruolo !== "A" && ruolo !== "B" && ruolo !== "M" && ruolo !== "P") continue;
    if (!nome.trim() && !cognome.trim()) continue;

    /* Le maiuscole si rimettono anche in lettura, non solo in scrittura: le
       iscrizioni già registrate prima di questa regola sono sulle fatture
       com'erano state scritte, e non si riscrivono. Così l'elenco e le mail
       le mostrano a posto lo stesso. */
    const persona = {
      nome: maiuscole(nome.trim()),
      cognome: maiuscole(cognome.trim()),
      dataNascita: dataNascita.trim() === "—" ? "" : dataNascita.trim(),
      codiceFiscale: codiceFiscale.trim() === "—" ? "" : codiceFiscale.trim(),
      importoCent: centesimi(v.unit_amount?.value) * (Number(v.quantity) || 1),
    };

    /* Chi non è un minore è un maggiorenne, e il primo che passa è il
       capofila: di solito è la `A`, che la fattura scrive per prima, ma se
       una fattura arrivasse senza il capofila è meglio promuovere il primo
       adulto che lasciare l'iscrizione senza nessuno. Quello che non si fa
       mai è il contrario di prima — raccattare in mezzo ai minori tutto
       quello che non si è riconosciuto: è così che un secondo maggiorenne
       diventerebbe un ragazzino di dieci anni. */
    if (ruolo === "P") piccoli.push(persona);
    else if (ruolo === "M") minori.push(persona);
    else if (!adulto) adulto = persona;
    else adulti.push(persona);
  }

  return { adulto, adulti, minori, piccoli };
}

/* ── Pagata o no ──────────────────────────────────────────────────────────
   PayPal ha sedici stati per una fattura e a noi ne servono due: i soldi ci
   sono o non ci sono. `MARKED_AS_PAID` è quello in cui finiscono le nostre —
   sia l'incasso online che il contante segnato davanti alla chiesa sono
   pagamenti registrati a mano su una fattura che PayPal non ha mai spedito —
   ma gli altri si accettano lo stesso: il giorno che qualcuno saldasse una
   di queste fatture dal pannello di PayPal, l'elenco non deve dire che non
   ha pagato. */
const SALDATE = new Set(["PAID", "MARKED_AS_PAID", "PAID_EXTERNAL"]);
export const saldata = (fattura) => SALDATE.has(String(fattura?.status || ""));

/* Come è arrivato il denaro, per la pagina di chi organizza: `contanti` se
   qualcuno l'ha incassato di persona, `paypal` se è passato dal checkout. Lo
   dice il pagamento registrato sulla fattura; se non ce n'è ancora nessuno
   lo dice il memo, che porta scritta la scelta fatta al momento del modulo. */
export function comePagata(fattura) {
  const pagamenti = fattura?.payments?.transactions || [];
  const metodo = pagamenti.length ? String(pagamenti[pagamenti.length - 1].method || "") : "";
  if (metodo === "CASH") return "contanti";
  if (metodo) return "paypal";
  return leggiMemo(fattura?.detail?.memo).modalita || "contanti";
}

/* ═══════════════════════════════════════════════════════════════════════════
   Le quattro cose che si fanno a una fattura
   ═══════════════════════════════════════════════════════════════════════════ */

/* Creare. Il numero già preso non è un guasto: è il webhook che ripassa
   sullo stesso pagamento, e la fattura di quel pagamento esiste già. Oppure —
   il caso per cui questa tolleranza è diventata importante — è lo stesso
   modulo rimandato una seconda volta perché la prima non era tornata
   indietro: vedi `numeroDaTentativo`.

   `PayPal-Request-Id` è la cintura sopra le bretelle. Dove PayPal la
   riconosce, la seconda richiesta identica non crea niente e restituisce la
   risposta della prima — identificativo compreso, che è proprio quello che
   al secondo giro manca. Dove non la riconosce non fa danno: è
   un'intestazione in più che nessuno legge, e a fermare il doppione resta il
   numero di fattura. */
export const creaFattura = (corpo, tentativo = "") =>
  paypal("/v2/invoicing/invoices", {
    metodo: "POST",
    corpo,
    tollera: ["DUPLICATE_INVOICE_NUMBER"],
    ...(tentativo ? { intestazioni: { "PayPal-Request-Id": String(tentativo).slice(0, 108) } } : {}),
  });

/* «Spedire» una fattura che non va spedita a nessuno. Serve solo a portarla
   fuori dalla bozza: una bozza non accetta pagamenti, e senza questo
   passaggio non si potrebbe segnare né l'incasso online né il contante.
   `send_to_recipient: false` è la riga che impedisce a PayPal di scrivere a
   chi si è iscritto — le mail sono le nostre, e una sola.

   — Cosa si tollera, e cosa no —
   `ALREADY_SENT` e `ALREADY_PAID` dicono «l'avevi già fatto», ed è vero:
   la fattura è già fuori dalla bozza, che è tutto quello che serve.

   `INVOICE_STATE_NOT_ALLOWED` NON sta in questo elenco, e ci stava fino
   al 15 settembre — lo stesso sbaglio già tolto da `registraPagamento`,
   rimasto qui. Vuol dire il contrario di «era già fatto»: vuol dire che la
   fattura è in uno stato da cui non esce, e che quindi è RIMASTA bozza.
   Tollerarlo faceva tirare dritto il riporto di un modulo cartaceo fino a
   `registraPagamento`, che su una bozza non può scrivere niente: il foglio
   entrava in elenco come «da incassare» con i soldi già in cassetta, e il
   tasto «segna incassati» falliva ogni volta, perché la fattura era bozza
   allora e bozza restava. Adesso sale come errore, e chi riporta il foglio
   lo legge subito — mentre il foglio è ancora in mano. */
export const spedisciFattura = (id) =>
  paypal(`/v2/invoicing/invoices/${encodeURIComponent(id)}/send`, {
    metodo: "POST",
    corpo: { send_to_invoicer: false, send_to_recipient: false },
    tollera: ["ALREADY_SENT", "ALREADY_PAID"],
  });

/* Segnare il pagamento. `EXTERNAL` è la verità in tutti e due i casi: i soldi
   non sono passati per questa fattura — sono passati per il checkout, o per
   una mano davanti alla chiesa — e la fattura ne prende atto. Il metodo dice
   quale delle due.

   — Cosa si tollera, e cosa no —
   Qui dentro si tollera una cosa sola: che quei soldi risultino già
   incassati. `ALREADY_PAID` e `PAYMENT_AMOUNT_EXCEEDS_DUE_AMOUNT` dicono
   esattamente quello — qualcuno ha già segnato, o il webhook è arrivato
   prima — e chi ha premuto il tasto ha ottenuto quello che voleva.

   `INVOICE_STATE_NOT_ALLOWED` NON sta in questo elenco, e ci stava fino al
   15 settembre. Vuol dire il contrario di «era già fatto»: vuol dire che
   la fattura è in uno stato che il pagamento non lo accetta — una bozza
   mai spedita, una annullata — e che quindi NON è stato scritto niente.
   Tollerarlo faceva rispondere «incassato» a chi non aveva incassato: il
   tasto al banchetto si spegneva, la pagina si ricaricava, e la riga era
   ancora lì da incassare senza che niente dicesse perché. Adesso sale
   come errore, e chi sta al banco lo legge. */
export const registraPagamento = (id, { metodo, nota }) =>
  paypal(`/v2/invoicing/invoices/${encodeURIComponent(id)}/payments`, {
    metodo: "POST",
    corpo: {
      type: "EXTERNAL",
      method: metodo,
      payment_date: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date()),
      ...(nota ? { note: nota.slice(0, 2000) } : {}),
    },
    tollera: ["ALREADY_PAID", "PAYMENT_AMOUNT_EXCEEDS_DUE_AMOUNT"],
  });

/* Cercare. Il filtro lo applica PayPal — `reference` è il marchio dell'evento
   — così non si scaricano fatture che non ci riguardano per poi buttarle qui.
   `fields` va elencato: le voci e i pagamenti non arrivano se non si chiedono,
   e senza le voci una fattura non dice chi si è iscritto.

   Il tetto di pagine esiste perché una funzione che pagina all'infinito è una
   funzione che un giorno non torna più. Cento per dieci sono mille
   iscrizioni: per una camminata di paese è un tetto che non si tocca.

   ATTENZIONE: questa ricerca NON restituisce le voci delle fatture, per
   quanto gliele si chieda in `fields`. Verificato sul campo, e non è una
   sottigliezza: una fattura senza voci non dice chi è iscritto. Va bene per
   contare e per trovare un numero; per leggere un'iscrizione servono
   trovaFattura() o tutteLeFatture(), che le voci ce le hanno. */
const PER_PAGINA = 100;
const PAGINE_MAX = 10;

/* Il numero della fattura, ripulito dal contrassegno del tentativo.

   Sull'ORDINE il numero non può ripetersi: PayPal tiene `invoice_id` unico
   per conto, su tutti gli ordini, per sempre. Un secondo checkout sulla
   stessa iscrizione — che è la cosa che succede ogni volta che il primo non
   torna indietro — chiederebbe un numero già bruciato dal primo, e PayPal lo
   rifiuta con un `REQUEST_REJECTED` sul campo `invoiceId` che non spiega
   niente. Quindi dal secondo tentativo in poi l'ordine porta il numero con
   un `-2`, `-3` in coda (lo mette `numeroPerOrdine`, più sotto).

   Sulla FATTURA invece il numero deve restare quello di sempre, perché è lui
   l'identità dell'iscrizione: è quello che si ripete a chiedere di nuovo la
   stessa risposta invece di iscrivere due volte la stessa persona.

   Da qui questa riga. Il webhook il numero lo legge dall'ORDINE — col
   contrassegno — e deve arrivare alla FATTURA, che ce l'ha senza. Toglierlo
   qui dentro, e non nei sei punti che chiamano questa funzione, è la
   differenza fra una regola sola e sei posti dove dimenticarsela: sbagliarne
   uno vuol dire un incasso che non trova la sua fattura, cioè qualcuno che
   ha pagato e che l'elenco degli iscritti non conosce. */
const senzaTentativo = (numero) => String(numero || "").replace(/-\d+$/, "");

/* Una sola fattura, per numero. Torna `null` se non c'è: chi chiama deve
   poter distinguere «non l'ho trovata» da «è andato storto qualcosa», perché
   nel webhook le due cose portano a risposte opposte — un 200 che chiude la
   partita, o un 500 che chiede a PayPal di riprovare. */
export async function trovaFattura(numeroGrezzo) {
  const numero = senzaTentativo(numeroGrezzo);
  const trovate = await cercaFatture({ invoice_number: numero });
  const scheda = trovate.find((f) => String(f?.detail?.invoice_number || "") === numero);
  if (!scheda) return null;

  /* E poi la si rilegge intera. Non è un giro superfluo: la ricerca NON
     restituisce le voci, per quanto gliele si chieda — verificato sul
     campo — e senza le voci una fattura non dice chi è iscritto né quanto
     ha pagato. Chi chiama questa funzione lo fa per scrivere una ricevuta o
     per segnare un incasso: gli serve la fattura vera, non la sua ombra.

     Costa una chiamata su una fattura sola. Il giorno che la ricerca
     imparasse a mandare le voci, questa riga diventerebbe superflua e
     innocua: si toglie e basta. */
  return (await leggiFattura(scheda.id).catch(() => null)) || scheda;
}

/* ── Tutte le fatture dell'evento, voci comprese ──────────────────────────
   Per l'elenco degli iscritti non si usa la ricerca ma l'elenco vero e
   proprio, che accetta `fields=all` e le voci le manda davvero. Si paga
   scaricando anche le fatture che non ci riguardano — se un domani su quel
   conto PayPal ce ne fossero altre — e si filtra qui sul marchio dell'evento.

   È il contrario della scelta di prima, ed è la scelta giusta: meglio
   filtrare in casa qualche fattura di troppo che ricevere le fatture giuste
   svuotate di quello che serve. */
export async function tutteLeFatture() {
  const fatture = [];

  for (let pagina = 1; pagina <= PAGINE_MAX; pagina++) {
    const blocco = await paypal(
      `/v2/invoicing/invoices?page=${pagina}&page_size=${PER_PAGINA}&fields=all&total_required=false`
    );

    const trovate = blocco?.items || blocco?.invoices || [];
    fatture.push(...trovate);
    if (trovate.length < PER_PAGINA) break;
  }

  return fatture.filter((f) => String(f?.detail?.reference || "") === EVENTO);
}

export async function cercaFatture(filtro = {}) {
  const fatture = [];

  for (let pagina = 1; pagina <= PAGINE_MAX; pagina++) {
    const blocco = await paypal(`/v2/invoicing/search-invoices?page=${pagina}&page_size=${PER_PAGINA}`, {
      metodo: "POST",
      corpo: { reference: EVENTO, fields: ["items", "payments"], ...filtro },
    });

    const trovate = blocco?.items || [];
    fatture.push(...trovate);
    if (trovate.length < PER_PAGINA) break;
  }

  /* Il marchio lo filtra già PayPal, ma la sua è una ricerca e non un
     uguale: si ricontrolla qui, che è dove si sa cosa vale davvero. Una
     fattura di qualcos'altro che passasse per somiglianza finirebbe in
     elenco fra gli iscritti, e non è un errore che si nota. */
  return fatture.filter((f) => String(f?.detail?.reference || "") === EVENTO);
}

/* ═══════════════════════════════════════════════════════════════════════════
   L'ordine: il pagamento online, e nient'altro
   ═══════════════════════════════════════════════════════════════════════════ */

/* Il numero come lo porta l'ORDINE, che non è quello della fattura.

   `invoice_id` PayPal lo tiene unico per conto su tutti gli ordini, quindi il
   numero della fattura ci sta una volta sola: al primo checkout. Dal secondo
   in poi — cioè ogni volta che il primo non è tornato indietro e si ripreme —
   ci vuole un valore che non sia mai stato usato, e insieme che riporti alla
   stessa fattura. Da qui il contrassegno in coda: `-2` al secondo tentativo,
   `-3` al terzo. `trovaFattura` lo toglie, e l'incasso ritrova la sua.

   Il conto delle volte non lo teniamo noi: è quante fatture con quel numero
   PayPal ha già visto passare in un ordine, e non lo sappiamo. Si prova, e se
   PayPal dice di no si riprova col successivo — chi conta è lui, che è
   l'unico che sa davvero quali numeri ha già bruciato. */
const numeroPerOrdine = (numero, tentativo) => (tentativo <= 1 ? numero : `${numero}-${tentativo}`);
const TENTATIVI_ORDINE = 6;

/* L'ordine non porta i dati di nessuno. Porta il numero della fattura
   (`invoice_id`), il marchio dell'evento (`custom_id`) e le voci, che
   servono solo perché chi sta pagando riconosca cosa sta pagando: «Mario
   Rossi — maggiorenne, 10 €» dice più di «Iscrizione, 20 €».

   Nome, data di nascita e codice fiscale li ha già la fattura, che esiste
   prima di questo ordine. Quando il webhook dovrà scrivere la ricevuta li
   rileggerà da lì, non da qui: sono nati in un posto solo e si leggono in un
   posto solo.

   `user_action: PAY_NOW` toglie di mezzo la schermata di riepilogo di
   PayPal: il riepilogo l'ha già fatto il nostro modulo, e farlo due volte
   perde per strada chi si è già deciso. */
export async function creaOrdine({ numero, adulto, adulti = [], minori, piccoli = [], descrizione, ritorno, annulla }) {
  /* L'unico totale del sistema che non lo somma PayPal dalle voci: qui serve
     prima, per dire all'ordine quanto vale. Deve combaciare con le voci qui
     sotto o PayPal rifiuta l'ordine — ed è meglio così, perché è un rifiuto
     che si vede subito invece di un conto sbagliato che passa. */
  const totaleCent = QUOTA_ADULTO_CENT * (1 + adulti.length) + minori.length * QUOTA_MINORE_CENT;
  const importo = { currency_code: VALUTA, value: euro(totaleCent) };

  const corpoOrdine = (volta) => ({
      intent: "CAPTURE",
      purchase_units: [
        {
          invoice_id: numeroPerOrdine(numero, volta),
          custom_id: EVENTO,
          description: descrizione.slice(0, 127),
          amount: { ...importo, breakdown: { item_total: importo } },
          items: [
            voce(adulto, "A", QUOTA_ADULTO_CENT),
            ...adulti.map((a) => voce(a, "B", QUOTA_ADULTO_CENT)),
            ...minori.map((m) => voce(m, "M", QUOTA_MINORE_CENT)),
            /* Valgono zero, e vanno nell'ordine lo stesso: `item_total` è la
               somma delle voci, quindi uno zero non sposta niente e chi paga
               si vede scritto chi sta portando. */
            ...piccoli.map((p) => voce(p, "P", QUOTA_PICCOLO_CENT)),
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Color Walk — Rivalta sul Mincio",
            locale: "it-IT",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: ritorno,
            cancel_url: annulla,
          },
        },
      },
  });

  /* Si prova col numero nudo, e se PayPal lo rifiuta si riprova col
     contrassegno successivo. Il rifiuto che ci interessa è muto — un
     `REQUEST_REJECTED` che non dice quale campo — quindi non lo si può
     distinguere da un altro guasto leggendolo: si riprova e basta, e se anche
     l'ultimo giro non passa l'errore esce così com'è, che è quello che deve
     succedere quando il problema non era il numero.

     Sei giri sono più di quanti tentativi faccia una persona sola prima di
     scrivere una mail, e restano pochi abbastanza da non tenere in ballo
     nessuno: quando il numero è davvero il problema, a passare è il secondo. */
  let ordine = null;
  let ultimo = null;
  for (let volta = 1; volta <= TENTATIVI_ORDINE; volta++) {
    try {
      ordine = await paypal("/v2/checkout/orders", { metodo: "POST", corpo: corpoOrdine(volta) });
      if (volta > 1) console.warn(`ordine ${numero}: numero già usato, passato al tentativo ${volta}`);
      break;
    } catch (errore) {
      ultimo = errore;
    }
  }
  if (!ordine) throw ultimo;

  /* L'indirizzo a cui mandare il browser non sta in un campo suo: sta
     nell'elenco dei link, riconoscibile dal ruolo. `payer-action` è quello
     del flusso con `payment_source`; `approve` è il nome che aveva prima, e
     si guarda lo stesso perché costa una riga e toglie di mezzo un intero
     modo di rompersi in silenzio. */
  const link = (ordine.links || []).find((l) => l.rel === "payer-action" || l.rel === "approve");
  if (!link?.href) throw new Error("PayPal ha creato l'ordine ma non ha detto dove mandare a pagare");

  return { id: ordine.id, url: link.href, totaleCent };
}

export const leggiOrdine = (id) => paypal(`/v2/checkout/orders/${encodeURIComponent(id)}`);

/* Incassare. È un passaggio a parte perché PayPal, quando chi paga approva,
   non prende ancora niente: l'ordine resta APPROVED e i soldi si muovono
   solo quando glielo si chiede.

   Lo chiedono in due — la pagina al ritorno dal pagamento e il webhook — e
   non è una svista: al ritorno dal pagamento non ci si torna sempre. Si
   chiude la scheda, finisce la batteria, il treno entra in galleria. Se a
   incassare fosse solo la pagina, quella persona avrebbe approvato un
   pagamento che non arriva mai; se fosse solo il webhook, chi torna
   resterebbe a guardare «un momento…» finché non arriva l'avviso.

   Che ci provino tutti e due è sicuro perché la seconda volta PayPal dice
   `ORDER_ALREADY_CAPTURED`, e quella non è una brutta notizia: è la conferma
   che i soldi sono già stati presi. Una volta sola, comunque vada. */
export const incassaOrdine = (id) =>
  paypal(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    metodo: "POST",
    corpo: {},
    /* `PayPal-Request-Id` rende la richiesta ripetibile dalla parte di
       PayPal: due chiamate identiche partite insieme — la pagina e il
       webhook nello stesso istante — valgono un incasso solo. */
    intestazioni: { "PayPal-Request-Id": `incasso-${id}` },
    tollera: ["ORDER_ALREADY_CAPTURED"],
  });

/* L'incasso dentro un ordine già letto: l'identificativo serve alla nota che
   finisce sulla fattura, ed è il filo che lega la riga dell'elenco al
   movimento vero sul conto PayPal. */
export const incassoDi = (ordine) =>
  ordine?.purchase_units?.[0]?.payments?.captures?.find((c) => c.status === "COMPLETED") || null;

/* Annullare. È il modo di dire «questa iscrizione non è andata in porto» a
   una fattura che non sarà mai pagata, e insieme il segno che l'avviso a chi
   ci aveva provato è già partito — un secondo avviso per lo stesso mancato
   pagamento sarebbe una molestia, non una cortesia.

   Anche qui PayPal non scrive a nessuno: chi si è iscritto ha già ricevuto la
   nostra mail, e riceverne una seconda che parla di fatture lo confonderebbe
   e basta. */
export const annullaFattura = (id) =>
  paypal(`/v2/invoicing/invoices/${encodeURIComponent(id)}/cancel`, {
    metodo: "POST",
    corpo: { send_to_invoicer: false, send_to_recipient: false },
    tollera: ["INVOICE_STATE_NOT_ALLOWED", "ALREADY_CANCELLED", "ALREADY_PAID"],
  });

export const annullata = (fattura) => String(fattura?.status || "") === "CANCELLED";

/* Cancellare, che è un'altra cosa dall'annullare, e la differenza la impone
   PayPal: una fattura ancora in bozza non si può annullare — non è mai
   uscita, non c'è niente da disdire — e l'unico modo di toglierla di mezzo è
   buttarla via. Restare in bozza è raro ma succede: la funzione che l'ha
   creata si è spenta fra la creazione e la spedizione. Senza questo, una
   bozza rimasta lì non si sarebbe potuta togliere da nessuna parte. */
export const cancellaFattura = (id) =>
  paypal(`/v2/invoicing/invoices/${encodeURIComponent(id)}`, {
    metodo: "DELETE",
    tollera: ["RESOURCE_NOT_FOUND", "INVOICE_STATE_NOT_ALLOWED"],
  });

/* L'incasso, riletto da PayPal a partire dal suo identificativo. È la sola
   cosa che si prende dall'avviso del webhook: il resto — se ha pagato, e
   quanto, e per quale iscrizione — lo dice questa risposta, non chi ha
   bussato alla porta. */
export const leggiIncasso = (id) => paypal(`/v2/payments/captures/${encodeURIComponent(id)}`);

/* Una fattura sola, per identificativo. */
export const leggiFattura = (id) => paypal(`/v2/invoicing/invoices/${encodeURIComponent(id)}`);
