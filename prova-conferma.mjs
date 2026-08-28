/* ═══════════════════════════════════════════════════════════════════════════
   Banco di prova per api/conferma-color-walk.mjs — `node prova-conferma.mjs`.

   La domanda a cui questo file risponde è una sola, ed è quella che conta:
   quando qualcuno paga (quota più commissioni di servizio), parte davvero la
   mail? E quando non paga, parte quella giusta invece di quella sbagliata?

   Stripe e il servizio di posta qui sono finti — `global.fetch` è sostituito —
   quindi si può provare tutto, compresi i casi che nella realtà si vedono una
   volta l'anno, senza spedire niente a nessuno e senza toccare un pagamento
   vero. Zero dipendenze, come il resto: è solo Node.

   Va rilanciato dopo ogni modifica alla funzione. Non gira su Vercel: sta in
   .vercelignore insieme a build.mjs e serve.mjs.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createHmac } from "node:crypto";
import handler from "./api/conferma-color-walk.mjs";

const SEGRETO = "whsec_prova";
process.env.STRIPE_SECRET_KEY = "sk_test_finta";
process.env.STRIPE_WEBHOOK_SECRET = SEGRETO;
process.env.RESEND_API_KEY = "re_finta";

let chiamate;

function stubFetch(stubOpts) {
  const { sessione, listaPagate = [], postaRompe = false } = stubOpts;
  return async (url, opzioni = {}) => {
    const u = String(url);
    chiamate.push(`${opzioni.method || "GET"} ${u.replace("https://api.stripe.com/v1/", "").replace("https://api.resend.com/", "resend:")}`);

    if (u.includes("/checkout/sessions?")) {
      const conFiltro = u.includes("customer_details[email]") || u.includes("customer_details%5Bemail%5D");
      if (conFiltro && stubOpts.filtroRotto) {
        return risposta(400, { error: { message: "Received unknown parameter" } });
      }
      if (stubOpts.listaRotta) return risposta(500, { error: { message: "Stripe giù" } });
      return risposta(200, { data: listaPagate });
    }
    if (u.includes("/checkout/sessions/")) return risposta(200, sessione);
    if (u.includes("/payment_intents/")) return risposta(200, { id: "pi_1" });
    if (u.includes("resend")) {
      return postaRompe
        ? risposta(500, { message: "posta giù" })
        : risposta(200, { id: "email_1" });
    }
    throw new Error("URL non previsto dal banco di prova: " + u);
  };
}

const risposta = (stato, corpo) => ({
  ok: stato >= 200 && stato < 300,
  status: stato,
  json: async () => corpo,
});

function richiesta(evento, { firma = true, vecchia = false } = {}) {
  const grezzo = JSON.stringify(evento);
  const t = Math.floor(Date.now() / 1000) - (vecchia ? 3600 : 0);
  const v1 = createHmac("sha256", firma ? SEGRETO : "whsec_sbagliato")
    .update(`${t}.${grezzo}`, "utf8")
    .digest("hex");

  return {
    method: "POST",
    headers: { "stripe-signature": `t=${t},v1=${v1}` },
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

const SESSIONE_PAGATA = {
  id: "cs_test_1",
  payment_status: "paid",
  amount_total: 1100,
  currency: "eur",
  /* Le due voci come le espande Stripe: la funzione ci legge quota e
     commissioni per la ricevuta, invece di ricopiare un numero. */
  line_items: {
    data: [
      { description: "Iscrizione Color Walk — 20 settembre", amount_total: 1000 },
      { description: "Commissioni di servizio", amount_total: 100 },
    ],
  },
  customer_details: { email: "rebecca@example.com", name: "Rebecca Rossi" },
  metadata: { evento: "color-walk-2026-09-20", nome: "Rebecca", cognome: "Rossi" },
  payment_intent: { id: "pi_1", created: 1787000000, metadata: {} },
};

const SESSIONE_NON_PAGATA = {
  ...SESSIONE_PAGATA,
  payment_status: "unpaid",
  payment_intent: { id: "pi_1", created: 1787000000, metadata: {} },
};

/* Come SESSIONE_PAGATA, ma con la risottata prenotata per tre. È l'unica
   differenza: nella ricevuta deve comparire la riga dei coperti. */
const SESSIONE_PAGATA_RISOTTO = {
  ...SESSIONE_PAGATA,
  metadata: { ...SESSIONE_PAGATA.metadata, risotto: "si", risotto_persone: "3" },
};

let passate = 0;
let fallite = 0;

async function prova(nome, { evento, opzioniReq = {}, stub, atteso }) {
  chiamate = [];
  const poste = [];
  const vero = stubFetch(stub);
  global.fetch = async (url, opzioni) => {
    if (String(url).includes("resend")) {
      poste.push(JSON.parse(opzioni.body));
    }
    return vero(url, opzioni);
  };

  const res = finestraRisposta();
  await handler(richiesta(evento, opzioniReq), res);

  const corpoMail = ((poste[0]?.html || "") + "\n" + (poste[0]?.text || ""));
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
    lista(atteso.nonContiene).every((s) => !corpoMail.includes(s));

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

const ev = (tipo, oggetto = { id: "cs_test_1" }) => ({
  type: tipo,
  created: Math.floor(Date.now() / 1000),
  data: { object: oggetto },
});

console.log("\n── Il pagamento è andato a buon fine ──────────────────────────");

await prova("pagata → parte la ricevuta", {
  evento: ev("checkout.session.completed"),
  stub: { sessione: SESSIONE_PAGATA },
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione confermata" },
});

await prova("pagata in differita → parte la ricevuta", {
  evento: ev("checkout.session.async_payment_succeeded"),
  stub: { sessione: SESSIONE_PAGATA },
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione confermata" },
});

await prova("ricevuta già spedita → non si ripete", {
  evento: ev("checkout.session.completed"),
  stub: {
    sessione: {
      ...SESSIONE_PAGATA,
      payment_intent: { id: "pi_1", created: 1787000000, metadata: { ricevuta: "2026-08-24T20:00:00Z" } },
    },
  },
  atteso: { codice: 200, mail: 0 },
});

await prova("posta giù → 500, così Stripe ritenta", {
  evento: ev("checkout.session.completed"),
  stub: { sessione: SESSIONE_PAGATA, postaRompe: true },
  atteso: { codice: 500, mail: 1 },
});

await prova("ha prenotato la risottata → la ricevuta cita i coperti", {
  evento: ev("checkout.session.completed"),
  stub: { sessione: SESSIONE_PAGATA_RISOTTO },
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione confermata", contiene: "3 coperti" },
});

await prova("non ha prenotato la risottata → la ricevuta lo dice, niente segnaposto", {
  evento: ev("checkout.session.completed"),
  stub: { sessione: SESSIONE_PAGATA },
  atteso: {
    codice: 200,
    mail: 1,
    contiene: ["Risottata finale", "Non prenotata"],
    nonContiene: ["{{RISOTTO}}", "coperti", "coperto"],
  },
});

await prova("risottata per uno → «1 coperto», non «1 coperti»", {
  evento: ev("checkout.session.completed"),
  stub: {
    sessione: {
      ...SESSIONE_PAGATA,
      metadata: { ...SESSIONE_PAGATA.metadata, risotto: "si", risotto_persone: "1" },
    },
  },
  atteso: { codice: 200, mail: 1, contiene: "1 coperto", nonContiene: "1 coperti" },
});

console.log("\n── Il pagamento NON è andato a buon fine ──────────────────────");

await prova("sessione scaduta → parte l'avviso", {
  evento: ev("checkout.session.expired"),
  stub: { sessione: SESSIONE_NON_PAGATA },
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione non completata" },
});

await prova("pagamento differito rifiutato → parte l'avviso", {
  evento: ev("checkout.session.async_payment_failed"),
  stub: { sessione: SESSIONE_NON_PAGATA },
  atteso: { codice: 200, mail: 1, oggetto: "Iscrizione non completata" },
});

await prova("scaduta, ma ha pagato con un'altra sessione → niente", {
  evento: ev("checkout.session.expired"),
  stub: {
    sessione: SESSIONE_NON_PAGATA,
    listaPagate: [
      { id: "cs_test_2", payment_status: "paid", customer_details: { email: "rebecca@example.com" } },
    ],
  },
  atteso: { codice: 200, mail: 0 },
});

await prova("completata ma non pagata → si aspetta, niente mail", {
  evento: ev("checkout.session.completed"),
  stub: { sessione: SESSIONE_NON_PAGATA },
  atteso: { codice: 200, mail: 0 },
});

console.log("\n── Chi bussa senza essere Stripe ──────────────────────────────");

await prova("filtro per indirizzo rifiutato da Stripe: ripiega e trova il pagato", {
  evento: ev("checkout.session.expired"),
  stub: {
    sessione: SESSIONE_NON_PAGATA,
    filtroRotto: true,
    listaPagate: [
      { id: "cs_test_2", payment_status: "paid", customer_details: { email: "rebecca@example.com" } },
    ],
  },
  atteso: { codice: 200, mail: 0 },
});

await prova("Stripe muto sul controllo: nel dubbio non accusa chi ha pagato", {
  evento: ev("checkout.session.expired"),
  stub: { sessione: SESSIONE_NON_PAGATA, filtroRotto: true, listaRotta: true },
  atteso: { codice: 200, mail: 0 },
});

await prova("firma sbagliata → 400, nessuna mail", {
  evento: ev("checkout.session.completed"),
  opzioniReq: { firma: false },
  stub: { sessione: SESSIONE_PAGATA },
  atteso: { codice: 400, mail: 0 },
});

await prova("firma vecchia di un'ora → 400, nessuna mail", {
  evento: ev("checkout.session.completed"),
  opzioniReq: { vecchia: true },
  stub: { sessione: SESSIONE_PAGATA },
  atteso: { codice: 400, mail: 0 },
});

await prova("avviso firmato che MENTE sul pagamento → nessuna ricevuta", {
  // Il corpo dice «pagata». Stripe, interrogato, dice di no. Vince Stripe.
  evento: ev("checkout.session.completed", {
    id: "cs_test_1",
    payment_status: "paid",
    amount_total: 1000,
    customer_details: { email: "ladro@example.com" },
  }),
  stub: { sessione: SESSIONE_NON_PAGATA },
  atteso: { codice: 200, mail: 0 },
});

await prova("sessione di un altro evento → ignorata", {
  evento: ev("checkout.session.completed"),
  stub: {
    sessione: { ...SESSIONE_PAGATA, metadata: { evento: "sagra-2027", nome: "Tizio" } },
  },
  atteso: { codice: 200, mail: 0 },
});

await prova("avviso che non riguarda le sessioni → ignorato", {
  evento: ev("invoice.paid", { id: "in_1" }),
  stub: { sessione: SESSIONE_PAGATA },
  atteso: { codice: 200, mail: 0 },
});

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
