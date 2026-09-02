/* ═══════════════════════════════════════════════════════════════════════════
   /api/conferma-color-walk — la mail che chiude l'iscrizione alla Color
   Walk pagata online, e l'incasso che la precede.

   Non è un endpoint che chiama il sito: lo chiama PayPal. È il webhook a cui
   PayPal manda gli avvisi su cosa succede a ogni pagamento.

   Fa due cose, secondo l'avviso che arriva:

     · pagamento approvato   PayPal, quando chi paga dice di sì, non prende
       (CHECKOUT.ORDER.        ancora niente: l'ordine resta approvato e i
        APPROVED)              soldi si muovono solo quando glielo si chiede.
                               Qui glielo si chiede.

     · soldi incassati       si segna la fattura come saldata e parte la
       (PAYMENT.CAPTURE.       ricevuta.
        COMPLETED)

     · incasso rifiutato     parte l'avviso che l'iscrizione non è andata in
       (PAYMENT.CAPTURE.       porto e che non è stato addebitato niente, e la
        DENIED, e i suoi)      fattura si annulla.

   Chi ha scelto di pagare in contanti al ritrovo non passa mai di qui: per
   lui non c'è nessun pagamento online di cui avvisare, e la sua mail gliel'ha
   già mandata /api/iscrizione-color-walk nel momento in cui si è iscritto.

   ── Perché non lo fa la pagina al ritorno dal pagamento ──────────────────
   Perché al ritorno dal pagamento non ci si torna sempre. Si chiude la
   scheda, finisce la batteria, il treno entra in galleria mentre PayPal sta
   rimandando indietro il browser: il pagamento è approvato e la pagina non
   lo sa. Se l'incasso e la mail partissero solo da lì, quella persona
   avrebbe approvato un pagamento che non arriva mai e resterebbe senza
   conferma — e la conferma è la cosa che dimostra l'iscrizione.

   PayPal invece l'avviso lo manda da server a server, e se non gli si
   risponde 2xx lo rimanda: fino a venticinque volte in tre giorni. Ecco
   perché qui sotto un errore nello spedire diventa una risposta 500 e non un
   log: è il modo di dire a PayPal «riprova», ed è ciò che rende la mail una
   cosa che prima o poi arriva invece di una cosa che parte una volta e
   speriamo bene.

   ── Perché la mail non crede a quello che riceve ─────────────────────────
   L'avviso di PayPal arriva su un indirizzo pubblico: lo può chiamare
   chiunque, con dentro scritto quello che gli pare. Due controlli, in fila:

     1. la firma. La verifica PayPal stesso, a cui si rimanda l'avviso
        insieme alle cinque intestazioni con cui è arrivato e
        all'identificativo del webhook (PAYPAL_WEBHOOK_ID). È il motivo per
        cui `bodyParser` è spento: il corpo va rimandato byte per byte com'è
        arrivato, perché anche solo riscriverne gli spazi cambierebbe la
        firma;

     2. e comunque, del corpo dell'avviso si prende UNA cosa sola —
        l'identificativo. Se ha pagato, e quanto, e per quale iscrizione, non
        lo dice l'avviso: lo si va a chiedere a PayPal. Anche un avviso falso
        perfettamente firmato non riuscirebbe a far partire una ricevuta per
        un pagamento che non c'è.

   ── Perché non arriva due volte ──────────────────────────────────────────
   Il segno di «fatto» non è un registro a parte: è lo stato della fattura.
   Una fattura già saldata non fa ripartire la ricevuta, una già annullata non
   fa ripartire l'avviso di mancato pagamento. Serve perché lo stesso
   pagamento genera più di un avviso, e perché i rinvii di PayPal sono fatti
   apposta per ripetersi.

   La ricevuta parte PRIMA che la fattura venga segnata saldata, ed è
   voluto: al contrario, un segno scritto e una spedizione fallita darebbero
   una mail che non parte più. Meglio il rischio remoto di una copia in più
   che la certezza di uno zero.

   ── Quello che PayPal non dice ───────────────────────────────────────────
   Chi apre il pagamento e poi chiude tutto senza approvare non genera nessun
   avviso: PayPal non ha un evento per gli ordini abbandonati, come invece
   c'era prima. Quella persona non riceve nessuna mail, e la sua iscrizione
   resta fra le «non completate» che la pagina /iscritti conta. È una cosa in
   meno rispetto a prima, ed è scritta qui perché si sappia che manca.

   ── Da mettere a mano, su Vercel ─────────────────────────────────────────
     PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET   le stesse di tutto il resto
     PAYPAL_WEBHOOK_ID   lo dà PayPal quando si crea il webhook
     RESEND_API_KEY      la chiave del servizio che spedisce
   ═══════════════════════════════════════════════════════════════════════════ */
import {
  EVENTO,
  annullaFattura,
  annullata,
  incassaOrdine,
  leggiIncasso,
  paypal,
  registraPagamento,
  saldata,
  trovaFattura,
  cercaFatture,
  leggiMemo,
} from "./_paypal.mjs";
import { MODELLO_FALLITA, ricevuta, riempi, spedisci } from "./_posta.mjs";

/* Il corpo va letto grezzo o la firma non torna. Su Vercel il corpo lo
   preparerebbe la piattaforma, riscrivendolo: questa riga glielo impedisce. */
export const config = { api: { bodyParser: false } };

const SITE = "https://www.rivaltasulmincio.it";

const OGGETTO_FALLITA = "Iscrizione non completata — Color Walk, 20 settembre";

/* Gli avvisi che chiudono la partita in negativo. Una carta rifiutata mentre
   si è ancora sulle pagine di PayPal non arriva fin qui, ed è giusto così: lì
   si ritenta subito, e una mail a ogni tentativo sarebbe molestia. */
const FALLIMENTI = new Set([
  "PAYMENT.CAPTURE.DENIED",
  "PAYMENT.CAPTURE.REVERSED",
  "CHECKOUT.ORDER.DECLINED",
]);

const corpoGrezzo = async (req) => {
  const pezzi = [];
  for await (const pezzo of req) pezzi.push(pezzo);
  return Buffer.concat(pezzi).toString("utf8");
};

/* ── La firma ─────────────────────────────────────────────────────────────
   La verifica la fa PayPal: gli si rimanda l'avviso con le cinque
   intestazioni con cui è arrivato, e risponde se torna o no.

   Il corpo si infila nella richiesta TALE E QUALE, montando il JSON a mano
   invece di passare per JSON.stringify di un oggetto già letto. Non è
   pignoleria: rileggere e riscrivere lo stesso JSON cambia l'ordine delle
   chiavi e la spaziatura, e la firma è calcolata sui byte. È lo scoglio su
   cui si arena chiunque provi a verificare un webhook PayPal la prima
   volta. */
async function firmaValida(grezzo, intestazioni, idWebhook) {
  const campi = {
    auth_algo: intestazioni["paypal-auth-algo"],
    cert_url: intestazioni["paypal-cert-url"],
    transmission_id: intestazioni["paypal-transmission-id"],
    transmission_sig: intestazioni["paypal-transmission-sig"],
    transmission_time: intestazioni["paypal-transmission-time"],
    webhook_id: idWebhook,
  };
  if (Object.values(campi).some((v) => !v)) return false;

  const corpo =
    "{" +
    Object.entries(campi)
      .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(String(v))}`)
      .join(",") +
    `,"webhook_event":${grezzo}}`;

  const esito = await paypal("/v1/notifications/verify-webhook-signature", {
    metodo: "POST",
    corpo: JSON.parse(corpo),
  });

  return esito?.verification_status === "SUCCESS";
}

/* ── Ha già pagato in un altro modo? ──────────────────────────────────────
   Chi lascia a metà un pagamento e poi ne fa un altro che va a buon fine si
   ritroverebbe, al rifiuto del primo, una mail che gli dice che non è
   iscritto: falsa, e proprio a chi ha pagato. Prima di quella mail si guarda
   quindi se a quell'indirizzo risulta un'iscrizione saldata.

   Se la domanda non si riesce a farla, la mail NON parte: dire per sbaglio
   «non sei iscritto» a chi ha pagato è un danno; non dire niente a chi non ha
   pagato è, al massimo, un'occasione persa. Nel dubbio, si sta zitti. */
async function haPagatoAltrove(email, escludi) {
  const trovate = await cercaFatture({ recipient_email: email });
  return trovate.some((f) => f.id !== escludi && saldata(f));
}

const indirizzoDi = (fattura) =>
  String(fattura?.primary_recipients?.[0]?.billing_info?.email_address || "")
    .trim()
    .toLowerCase();

/* ═══════════════════════════════════════════════════════════════════════════
   Il gestore
   ═══════════════════════════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  const idWebhook = process.env.PAYPAL_WEBHOOK_ID;

  let grezzo = await corpoGrezzo(req);
  let firmabile = true;

  /* Se `bodyParser: false` non venisse rispettato, il corpo l'avrebbe già
     letto la piattaforma e il flusso qui arriverebbe vuoto. Ricomporlo da
     `req.body` non ridà la stessa sequenza di byte, quindi la firma non
     tornerebbe più: si smette di controllarla, non di lavorare. Fermarsi
     vorrebbe dire non spedire mai più una ricevuta a nessuno, e in silenzio.
     Quello che decide — pagata sì o no, e a che indirizzo — si rilegge
     comunque da PayPal, che è la garanzia vera. */
  if (!grezzo && req.body) {
    grezzo = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    firmabile = false;
    console.error(
      "corpo già consumato dalla piattaforma: firma non verificabile. " +
        "Controllare che `export const config = { api: { bodyParser: false } }` sia in vigore."
    );
  }

  if (!grezzo) return res.status(400).json({ errore: "corpo vuoto" });

  if (idWebhook && firmabile) {
    let valida = false;
    try {
      valida = await firmaValida(grezzo, req.headers, idWebhook);
    } catch (errore) {
      /* Non poter chiedere a PayPal se la firma torna non è un avviso falso:
         è un guasto. 500, così l'avviso ritorna invece di sparire. */
      console.error("verifica della firma non riuscita:", errore.message);
      return res.status(500).json({ errore: "firma non verificabile" });
    }
    if (!valida) return res.status(400).json({ errore: "firma non valida" });
  } else if (!idWebhook) {
    /* Senza l'identificativo del webhook la firma non si può controllare. Non
       è motivo per fermarsi — quello che conta lo si rilegge comunque da
       PayPal — ma è un buco da chiudere, e nei log si vede. */
    console.error("PAYPAL_WEBHOOK_ID assente: avviso accettato senza verificarne la firma");
  }

  let avviso;
  try {
    avviso = JSON.parse(grezzo);
  } catch {
    return res.status(400).json({ errore: "corpo non leggibile" });
  }

  const tipo = String(avviso?.event_type || "");
  const id = String(avviso?.resource?.id || "");
  if (!id) return res.status(200).json({ ignorato: tipo || "avviso senza risorsa" });

  try {
    /* ── Approvato ma non ancora incassato ──────────────────────────────
       È qui che i soldi si muovono per chi non è tornato sulla pagina. Non
       parte nessuna mail: la manderà l'avviso dell'incasso, che questo
       incasso fa scattare da sé. */
    if (tipo === "CHECKOUT.ORDER.APPROVED") {
      await incassaOrdine(id);
      return res.status(200).json({ incassato: id });
    }

    /* `await` e non solo `return`: senza, un errore là dentro nascerebbe dopo
       che questa funzione è già finita, il catch qui sotto non lo vedrebbe
       passare, e a PayPal andrebbe un 200 che dice «fatto» per una mail che
       non è partita. Che è esattamente il contrario di quello che serve. */
    if (tipo === "PAYMENT.CAPTURE.COMPLETED") return await riuscito(res, id);
    if (FALLIMENTI.has(tipo)) return await fallito(res, id, tipo);

    return res.status(200).json({ ignorato: tipo || "avviso senza tipo" });
  } catch (errore) {
    /* 500, non 200. È la richiesta a PayPal di riprovare: finché non si
       risponde 2xx l'avviso torna, per tre giorni. Una chiave sbagliata o un
       servizio di posta giù smettono così di essere una mail persa e
       diventano una mail in ritardo. */
    console.error("conferma non spedita:", errore);
    return res.status(500).json({ errore: String(errore.message || errore) });
  }
}

/* ── I soldi ci sono ──────────────────────────────────────────────────────
   L'incasso si rilegge da PayPal, e da lì si arriva alla fattura: il numero
   che le abbiamo dato viaggia sull'ordine e torna indietro sull'incasso. */
async function riuscito(res, idIncasso) {
  const incasso = await leggiIncasso(idIncasso);

  if (incasso?.custom_id !== EVENTO) {
    return res.status(200).json({ ignorato: "pagamento di un altro evento" });
  }
  if (incasso?.status !== "COMPLETED") {
    return res.status(200).json({ ignorato: `incasso in stato ${incasso?.status || "ignoto"}` });
  }

  const numero = String(incasso.invoice_id || "");
  const fattura = numero ? await trovaFattura(numero) : null;
  if (!fattura) {
    /* 500 e non 200: la fattura nasce PRIMA dell'ordine, quindi se non si
       trova è quasi sempre la ricerca che deve ancora vederla. All'avviso
       successivo — PayPal lo ripete — ci sarà. */
    throw new Error(`incasso ${idIncasso}: nessuna fattura col numero ${numero || "(vuoto)"}`);
  }

  if (saldata(fattura)) return res.status(200).json({ ignorato: "ricevuta già spedita" });

  const email = indirizzoDi(fattura);
  if (!email) return res.status(200).json({ ignorato: "fattura senza indirizzo" });

  const mail = ricevuta({ fattura, pagato: true, quando: incasso.create_time });
  await spedisci({ a: email, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });

  /* Prima si spedisce, poi si segna: un segno scritto e una spedizione
     fallita darebbero una mail che non parte più. */
  await registraPagamento(fattura.id, {
    metodo: "PAYPAL",
    nota: `Incassato con PayPal Checkout — incasso ${idIncasso}`,
  });

  return res.status(200).json({ spedita: "ricevuta" });
}

/* ── I soldi non ci sono ──────────────────────────────────────────────────
   L'avviso a chi ci ha provato e non è arrivato in fondo, e la fattura
   annullata — che è insieme la verità su quell'iscrizione e il segno che
   l'avviso è già partito. */
async function fallito(res, idRisorsa, tipo) {
  /* Un rifiuto può arrivare su un incasso o su un ordine: nel primo caso il
     numero della fattura è sull'incasso, nel secondo sull'ordine. Si prova a
     leggerlo come incasso, e se non è quello si guarda l'ordine. */
  let numero = "";
  let evento = "";
  try {
    const incasso = await leggiIncasso(idRisorsa);
    numero = String(incasso?.invoice_id || "");
    evento = String(incasso?.custom_id || "");
  } catch {
    const ordine = await paypal(`/v2/checkout/orders/${encodeURIComponent(idRisorsa)}`);
    numero = String(ordine?.purchase_units?.[0]?.invoice_id || "");
    evento = String(ordine?.purchase_units?.[0]?.custom_id || "");
  }

  if (evento !== EVENTO) return res.status(200).json({ ignorato: "pagamento di un altro evento" });

  const fattura = numero ? await trovaFattura(numero) : null;
  if (!fattura) return res.status(200).json({ ignorato: `nessuna fattura col numero ${numero || "(vuoto)"}` });

  if (saldata(fattura)) return res.status(200).json({ ignorato: "risulta pagata" });
  if (annullata(fattura)) return res.status(200).json({ ignorato: "avviso già spedito" });

  /* Chi paga al ritrovo non riceve mai questa mail: la sua quota non è «non
     andata a buon fine», è ancora da pagare, e dirgli che l'iscrizione non è
     registrata sarebbe falso. Se una fattura in contanti finisse qui dentro
     sarebbe un avviso che non la riguarda, e si lascia stare. */
  if (leggiMemo(fattura?.detail?.memo).modalita === "contanti") {
    return res.status(200).json({ ignorato: "iscrizione da pagare al ritrovo" });
  }

  const email = indirizzoDi(fattura);
  if (!email) return res.status(200).json({ ignorato: "fattura senza indirizzo" });

  let pagatoAltrove;
  try {
    pagatoAltrove = await haPagatoAltrove(email, fattura.id);
  } catch (errore) {
    console.error("controllo altri pagamenti fallito, avviso non spedito:", errore.message);
    return res.status(200).json({ ignorato: "impossibile escludere un pagamento riuscito" });
  }
  if (pagatoAltrove) {
    return res.status(200).json({ ignorato: "stesso indirizzo, pagamento riuscito altrove" });
  }

  const nome = String(fattura?.primary_recipients?.[0]?.billing_info?.name?.given_name || "");
  const motivo =
    tipo === "CHECKOUT.ORDER.DECLINED"
      ? "il pagamento non è stato completato."
      : "il pagamento è stato rifiutato.";

  await spedisci({
    a: email,
    oggetto: OGGETTO_FALLITA,
    html: riempi(MODELLO_FALLITA, { NOME: nome, MOTIVO: motivo }),
    testo:
      `Ciao ${nome}, il pagamento della quota della Color Walk non è andato ` +
      `a buon fine: ${motivo} La tua iscrizione non è registrata e il posto non è tenuto.\n\n` +
      `Non ti abbiamo preso niente: sul conto non arriva nessun addebito.\n\n` +
      `Se vuoi riprovare, il modulo è qui: ${SITE}/color-walk\n` +
      `E se preferisci, puoi iscriverti scegliendo di pagare in contanti al ritrovo.\n\n` +
      `Il gruppo del Palio delle Contrade — Rivalta sul Mincio`,
  });

  await annullaFattura(fattura.id);
  return res.status(200).json({ spedita: "avviso di mancato pagamento" });
}
