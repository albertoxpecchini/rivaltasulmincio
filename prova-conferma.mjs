/* ═══════════════════════════════════════════════════════════════════════════
   Banco di prova per api/conferma-color-walk.mjs — `node prova-conferma.mjs`.

   La domanda a cui questo file risponde è una sola, ed è quella che conta:
   quando qualcuno paga, parte davvero la mail? E quando non paga, parte
   quella giusta invece di quella sbagliata?

   PayPal e il servizio di posta qui sono finti — `global.fetch` è sostituito
   — quindi si può provare tutto, compresi i casi che nella realtà si vedono
   una volta l'anno, senza spedire niente a nessuno e senza toccare un
   pagamento vero. Zero dipendenze, come il resto: è solo Node.

   Va rilanciato dopo ogni modifica alla funzione. Non gira su Vercel: sta in
   .vercelignore insieme a build.mjs e serve.mjs.
   ═══════════════════════════════════════════════════════════════════════════ */
import handler from "./api/conferma-color-walk.mjs";

process.env.PAYPAL_CLIENT_ID = "finto";
process.env.PAYPAL_CLIENT_SECRET = "finto";
process.env.PAYPAL_WEBHOOK_ID = "WH-PROVA";
process.env.RESEND_API_KEY = "re_finta";

const EVENTO = "color-walk-2026-09-20";

let chiamate;

/* ── Le fatture finte ─────────────────────────────────────────────────────
   Un'iscrizione da 20 €: una maggiorenne più due minori a suo carico. Le voci
   sono nella forma in cui le scrive api/_paypal.mjs — una per persona, con i
   campi separati dalla barra verticale — perché è da lì che la ricevuta
   rilegge nomi e importi invece di ricopiarli. */
const voce = (ruolo, nome, cognome, nascita, cf, euro) => ({
  name: `${nome} ${cognome} — ${ruolo === "A" ? "maggiorenne" : "dai 6 ai 17 anni"}`,
  description: [ruolo, nome, cognome, nascita, cf].join("|"),
  quantity: "1",
  unit_amount: { currency_code: "EUR", value: euro },
});

const fattura = (extra = {}) => ({
  id: "INV2-PROVA",
  status: "UNPAID",
  detail: {
    invoice_number: "CW-prova-0001",
    invoice_date: "2026-09-02",
    reference: EVENTO,
    memo: "paypal|3331234567|2026-09-02T10:00:00Z|—",
    metadata: { create_time: "2026-09-02T10:00:00Z" },
  },
  primary_recipients: [
    { billing_info: { name: { given_name: "Rebecca", surname: "Rossi" }, email_address: "rebecca@example.com" } },
  ],
  amount: { currency_code: "EUR", value: "20.00" },
  items: [
    voce("A", "Rebecca", "Rossi", "1985-03-11", "RSSRCC85C51F205X", "10.00"),
    voce("M", "Luca", "Rossi", "2015-04-02", "—", "5.00"),
    voce("M", "Anna", "Rossi", "2018-11-20", "—", "5.00"),
  ],
  ...extra,
});

/* La stessa iscrizione, ma di chi cammina da solo: serve a provare che la
   riga dei ragazzi sparisce invece di stampare «0 ragazzi — 0,00 €». */
const fatturaSola = (extra = {}) =>
  fattura({
    amount: { currency_code: "EUR", value: "10.00" },
    items: [voce("A", "Rebecca", "Rossi", "1985-03-11", "RSSRCC85C51F205X", "10.00")],
    ...extra,
  });

const INCASSO = {
  id: "3AB12345CD678901E",
  status: "COMPLETED",
  invoice_id: "CW-prova-0001",
  custom_id: EVENTO,
  create_time: "2026-09-02T11:00:00Z",
  amount: { currency_code: "EUR", value: "20.00" },
};

function stubFetch(opts) {
  const {
    incasso = INCASSO,
    fatture = [fattura()],
    firmaOk = true,
    postaRompe = false,
    ricercaRotta = false,
  } = opts;

  return async (url, opzioni = {}) => {
    const u = String(url);
    chiamate.push(
      `${opzioni.method || "GET"} ${u.replace(/^https:\/\/api-m\.paypal\.com/, "").replace("https://api.resend.com/", "resend:")}`
    );

    if (u.includes("/v1/oauth2/token")) return risposta(200, { access_token: "gettone", expires_in: 3600 });

    if (u.includes("/verify-webhook-signature")) {
      return risposta(200, { verification_status: firmaOk ? "SUCCESS" : "FAILURE" });
    }

    if (u.includes("/v2/payments/captures/")) {
      if (!incasso) return risposta(404, { name: "RESOURCE_NOT_FOUND", message: "non è un incasso" });
      return risposta(200, incasso);
    }

    if (u.includes("/search-invoices")) {
      if (ricercaRotta) return risposta(500, { message: "PayPal giù" });
      const filtro = JSON.parse(opzioni.body || "{}");
      const trovate = filtro.invoice_number
        ? fatture.filter((f) => f.detail.invoice_number === filtro.invoice_number)
        : fatture;
      return risposta(200, { items: trovate });
    }

    if (u.includes("/payments") && opzioni.method === "POST") return risposta(200, {});
    if (u.includes("/cancel")) return risposta(200, {});

    if (u.includes("/v2/checkout/orders/")) {
      return risposta(200, {
        id: "ORDINEPROVA00001",
        status: "APPROVED",
        purchase_units: [{ invoice_id: "CW-prova-0001", custom_id: EVENTO }],
      });
    }

    if (u.includes("resend")) {
      return postaRompe ? risposta(500, { message: "posta giù" }) : risposta(200, { id: "email_1" });
    }

    throw new Error("URL non previsto dal banco di prova: " + u);
  };
}

const risposta = (stato, corpo) => ({
  ok: stato >= 200 && stato < 300,
  status: stato,
  json: async () => corpo,
  text: async () => JSON.stringify(corpo),
});

function richiesta(evento) {
  const grezzo = JSON.stringify(evento);
  return {
    method: "POST",
    headers: {
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-cert-url": "https://api.paypal.com/cert.pem",
      "paypal-transmission-id": "trasmissione-1",
      "paypal-transmission-sig": "firma",
      "paypal-transmission-time": new Date().toISOString(),
    },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(grezzo, "utf8");
    },
  };
}

const finestraRisposta = () => {
  const r = { codice: 0, corpo: null, intestazioni: {} };
  r.status = (c) => ((r.codice = c), r);
  r.json = (b) => ((r.corpo = b), r);
  r.setHeader = (k, v) => (r.intestazioni[k] = v);
  return r;
};

let passate = 0;
let fallite = 0;

async function prova(nome, { evento, stub = {}, atteso }) {
  chiamate = [];
  const poste = [];
  const vero = stubFetch(stub);
  global.fetch = async (url, opzioni) => {
    if (String(url).includes("resend")) poste.push(JSON.parse(opzioni.body));
    return vero(url, opzioni);
  };

  const res = finestraRisposta();
  await handler(richiesta(evento), res);

  const corpoMail = (poste[0]?.html || "") + "\n" + (poste[0]?.text || "");
  const esito = {
    codice: res.codice,
    mail: poste.length,
    oggetto: poste[0]?.subject || "",
    a: poste[0]?.to?.[0] || "",
  };

  const lista = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  const ok =
    esito.codice === atteso.codice &&
    esito.mail === atteso.mail &&
    (atteso.oggetto === undefined || esito.oggetto.includes(atteso.oggetto)) &&
    lista(atteso.contiene).every((s) => corpoMail.includes(s)) &&
    lista(atteso.nonContiene).every((s) => !corpoMail.includes(s)) &&
    lista(atteso.chiama).every((s) => chiamate.some((c) => c.includes(s)));

  console.log(`${ok ? "  ok  " : "  NO  "} ${nome}`);
  if (!ok) {
    console.log(`        atteso  ${JSON.stringify(atteso)}`);
    console.log(`        ottenuto ${JSON.stringify(esito)}`);
    console.log(`        chiamate ${JSON.stringify(chiamate)}`);
    fallite++;
  } else {
    passate++;
  }
}

const ev = (tipo, risorsa = { id: INCASSO.id }) => ({
  id: "WH-EVT-1",
  event_type: tipo,
  create_time: new Date().toISOString(),
  resource: risorsa,
});

console.log("\n── Il pagamento è andato a buon fine ──────────────────────────");

await prova("incassato → parte la ricevuta", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione confermata" },
});

/* La ricevuta di un gruppo deve dire chi è iscritto e quanto è costata
   ogni fascia. E non deve MAI portarsi dietro un segnaposto o un marcatore
   di sezione non sciolto: sarebbe una graffa nella posta di una persona
   vera, ed è il tipo di errore che si scopre solo lì. */
await prova("gruppo → la ricevuta elenca tutti e divide le due fasce", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  atteso: {
    codice: 200,
    mail: 1,
    contiene: ["Rebecca Rossi", "Luca Rossi", "Anna Rossi", "1 maggiorenne", "2 ragazzi dai 6 ai 17 anni", "20,00", "10,00"],
    nonContiene: ["{{", "<!--se:", "commissioni", "Commissioni", "da pagare al ritrovo", "Da pagare"],
  },
});

await prova("da sola → niente riga dei ragazzi", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  stub: { fatture: [fatturaSola()] },
  atteso: {
    codice: 200,
    mail: 1,
    contiene: ["Rebecca Rossi", "1 maggiorenne"],
    nonContiene: ["dai 6 ai 17 anni", "{{", "<!--se:"],
  },
});

/* Il segno di «già fatto» non è un registro a parte: è lo stato della
   fattura. Una già saldata non fa ripartire niente. */
await prova("ricevuta già spedita → non si ripete", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  stub: { fatture: [fattura({ status: "MARKED_AS_PAID" })] },
  atteso: { codice: 200, mail: 0 },
});

await prova("posta giù → 500, così PayPal ritenta", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  stub: { postaRompe: true },
  atteso: { codice: 500, mail: 1 },
});

/* Approvato non vuol dire incassato: PayPal, finché non glielo si chiede,
   non prende niente. Questo avviso serve a chiederglielo per chi non è
   tornato sulla pagina — e non manda nessuna mail, perché la manderà
   l'avviso dell'incasso che questo incasso fa scattare. */
await prova("approvato → si incassa, e nessuna mail", {
  evento: ev("CHECKOUT.ORDER.APPROVED", { id: "ORDINEPROVA00001" }),
  atteso: { codice: 200, mail: 0, chiama: "/capture" },
});

console.log("\n── Il pagamento NON è andato a buon fine ──────────────────────");

await prova("incasso rifiutato → parte l'avviso", {
  evento: ev("PAYMENT.CAPTURE.DENIED"),
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione non completata" },
});

await prova("rifiutato, ma la fattura è già annullata → niente", {
  evento: ev("PAYMENT.CAPTURE.DENIED"),
  stub: { fatture: [fattura({ status: "CANCELLED" })] },
  atteso: { codice: 200, mail: 0 },
});

await prova("rifiutato, ma ha pagato con un altro tentativo → niente", {
  evento: ev("PAYMENT.CAPTURE.DENIED"),
  stub: {
    fatture: [
      fattura(),
      fattura({ id: "INV2-ALTRA", status: "MARKED_AS_PAID", detail: { ...fattura().detail, invoice_number: "CW-prova-0002" } }),
    ],
  },
  atteso: { codice: 200, mail: 0 },
});

/* Chi paga al ritrovo non deve MAI ricevere «il pagamento non è andato a
   buon fine»: la sua quota non è fallita, è ancora da pagare, e dirgli che
   non è iscritto sarebbe falso. */
await prova("iscrizione in contanti → nessun avviso di mancato pagamento", {
  evento: ev("PAYMENT.CAPTURE.DENIED"),
  stub: {
    fatture: [fattura({ detail: { ...fattura().detail, memo: "contanti|3331234567|2026-09-02T10:00:00Z|—" } })],
  },
  atteso: { codice: 200, mail: 0 },
});

await prova("PayPal muto sul controllo: nel dubbio non accusa chi ha pagato", {
  evento: ev("PAYMENT.CAPTURE.DENIED"),
  stub: { ricercaRotta: true },
  atteso: { codice: 500, mail: 0 },
});

console.log("\n── Chi bussa senza essere PayPal ──────────────────────────────");

await prova("firma non valida → 400, nessuna mail", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  stub: { firmaOk: false },
  atteso: { codice: 400, mail: 0 },
});

/* Il corpo dell'avviso dice «incassato». PayPal, interrogato, dice che
   quell'incasso è stato rifiutato. Vince PayPal. */
await prova("avviso firmato che MENTE sull'incasso → nessuna ricevuta", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED", { id: INCASSO.id, status: "COMPLETED", amount: { value: "20.00" } }),
  stub: { incasso: { ...INCASSO, status: "DECLINED" } },
  atteso: { codice: 200, mail: 0 },
});

await prova("pagamento di un altro evento → ignorato", {
  evento: ev("PAYMENT.CAPTURE.COMPLETED"),
  stub: { incasso: { ...INCASSO, custom_id: "sagra-2027" } },
  atteso: { codice: 200, mail: 0 },
});

await prova("avviso che non riguarda i pagamenti → ignorato", {
  evento: ev("BILLING.SUBSCRIPTION.CREATED", { id: "I-ABC" }),
  atteso: { codice: 200, mail: 0 },
});

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
