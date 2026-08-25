/* ═══════════════════════════════════════════════════════════════════════════
   Banco di prova per api/iscritti-color-runner.mjs — `node prova-iscritti.mjs`.

   Questa funzione è l'unica del sito che, se sbaglia, consegna a uno
   sconosciuto il codice fiscale e l'indirizzo di casa di chi si è iscritto.
   Le domande a cui questo file risponde sono quindi due, nell'ordine:

     1. la porta regge? (chiave assente, sbagliata, di lunghezza diversa,
        variabile d'ambiente non impostata)
     2. e quando regge, l'elenco è quello giusto? (solo pagamenti di QUESTO
        evento, solo quelli andati a buon fine, gli altri contati e basta,
        tutte le pagine lette)

   Stripe qui è finto — `global.fetch` è sostituito — quindi si prova tutto
   senza toccare un pagamento vero. Zero dipendenze: è solo Node.

   Va rilanciato dopo ogni modifica alla funzione. Non gira su Vercel: sta in
   .vercelignore insieme a build.mjs e agli altri banchi di prova.
   ═══════════════════════════════════════════════════════════════════════════ */
import handler from "./api/iscritti-color-runner.mjs";

const CHIAVE = "chiave-di-prova-degli-organizzatori";
const EVENTO = "color-runner-2026-09-20";

const risposta = (stato, corpo) => ({
  ok: stato >= 200 && stato < 300,
  status: stato,
  json: async () => corpo,
});

/* Una sessione Stripe ridotta a quello che la funzione guarda davvero. */
const sessione = (n, extra = {}) => ({
  id: "cs_test_" + n,
  created: 1789000000 + n * 60,
  payment_status: "paid",
  amount_total: 1000,
  customer_details: { email: `tizio${n}@example.com` },
  metadata: {
    evento: EVENTO,
    nome: "Nome" + n,
    cognome: "Cognome" + n,
    codice_fiscale: "RSSMRA85T10A562S",
    indirizzo: "Via Sette Frati " + n,
    telefono: "—",
    note: "—",
    consenso: "2026-08-25T10:00:00.000Z",
  },
  ...extra,
});

/* Le pagine che il finto Stripe restituirà, in ordine. */
function stubFetch(pagine) {
  let i = 0;
  return async (url) => {
    if (!String(url).includes("/checkout/sessions?")) {
      throw new Error("URL non previsto dal banco di prova: " + url);
    }
    const p = pagine[i++] || { data: [], has_more: false };
    return risposta(200, p);
  };
}

function finestra() {
  const r = {
    codice: 0,
    corpo: null,
    testate: {},
    setHeader(k, v) { r.testate[k.toLowerCase()] = v; },
    status(c) { r.codice = c; return r; },
    json(c) { r.corpo = c; return r; },
  };
  return r;
}

let passate = 0;
let fallite = 0;

async function prova(nome, { chiave, headerChiave, metodo = "GET", env = {}, pagine = [], atteso }) {
  process.env.STRIPE_SECRET_KEY = "sk_test_finta";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  for (const [k, v] of Object.entries(env)) {
    if (v === null) delete process.env[k];
    else process.env[k] = v;
  }

  global.fetch = stubFetch(pagine);

  const req = {
    method: metodo,
    query: chiave === undefined ? {} : { chiave },
    headers: headerChiave === undefined ? {} : { "x-chiave": headerChiave },
  };
  const res = finestra();
  await handler(req, res);

  const problemi = [];
  if (atteso.codice !== undefined && res.codice !== atteso.codice) {
    problemi.push(`codice ${res.codice}, atteso ${atteso.codice}`);
  }
  if (atteso.iscritti !== undefined) {
    const n = (res.corpo?.iscritti || []).length;
    if (n !== atteso.iscritti) problemi.push(`${n} iscritti, attesi ${atteso.iscritti}`);
  }
  if (atteso.incompleti !== undefined && res.corpo?.incompleti !== atteso.incompleti) {
    problemi.push(`${res.corpo?.incompleti} incompleti, attesi ${atteso.incompleti}`);
  }
  if (atteso.totaleCent !== undefined && res.corpo?.totaleCent !== atteso.totaleCent) {
    problemi.push(`totale ${res.corpo?.totaleCent}, atteso ${atteso.totaleCent}`);
  }
  if (atteso.nienteDati && res.corpo?.iscritti) {
    problemi.push("ha risposto con un elenco quando non doveva rispondere affatto");
  }
  if (atteso.nonInCache && res.testate["cache-control"] !== "no-store, max-age=0") {
    problemi.push(`Cache-Control «${res.testate["cache-control"]}»`);
  }

  if (problemi.length) {
    fallite++;
    console.log(`  NO   ${nome}\n       ${problemi.join("; ")}`);
  } else {
    passate++;
    console.log(`  ok   ${nome}`);
  }
}

console.log("\n── La porta ───────────────────────────────────────────────────");

await prova("nessuna chiave → 401, nessun dato", {
  atteso: { codice: 401, nienteDati: true },
});

await prova("chiave sbagliata → 401, nessun dato", {
  chiave: "prova-a-indovinare",
  atteso: { codice: 401, nienteDati: true },
});

await prova("chiave giusta ma più corta di un carattere → 401", {
  chiave: CHIAVE.slice(0, -1),
  atteso: { codice: 401, nienteDati: true },
});

await prova("chiave giusta con uno spazio davanti → passa (si ripulisce)", {
  chiave: "  " + CHIAVE + "  ",
  pagine: [{ data: [sessione(1)], has_more: false }],
  atteso: { codice: 200, iscritti: 1 },
});

await prova("ISCRITTI_CHIAVE non impostata → 503, non «entrano tutti»", {
  chiave: CHIAVE,
  env: { ISCRITTI_CHIAVE: null },
  atteso: { codice: 503, nienteDati: true },
});

await prova("STRIPE_SECRET_KEY non impostata → 503", {
  chiave: CHIAVE,
  env: { STRIPE_SECRET_KEY: null },
  atteso: { codice: 503, nienteDati: true },
});

await prova("POST invece di GET → 405", {
  chiave: CHIAVE,
  metodo: "POST",
  atteso: { codice: 405, nienteDati: true },
});

await prova("la chiave si può passare anche nell'intestazione", {
  headerChiave: CHIAVE,
  pagine: [{ data: [sessione(1)], has_more: false }],
  atteso: { codice: 200, iscritti: 1 },
});

console.log("\n── L'elenco ───────────────────────────────────────────────────");

await prova("solo chi ha pagato entra; gli altri si contano", {
  chiave: CHIAVE,
  pagine: [
    {
      data: [
        sessione(1),
        sessione(2, { payment_status: "unpaid" }),
        sessione(3),
        sessione(4, { payment_status: "no_payment_required" }),
      ],
      has_more: false,
    },
  ],
  atteso: { codice: 200, iscritti: 2, incompleti: 2, totaleCent: 2000 },
});

await prova("i pagamenti di un altro evento non c'entrano niente", {
  chiave: CHIAVE,
  pagine: [
    {
      data: [
        sessione(1),
        sessione(2, { metadata: { evento: "sagra-2027", nome: "Tizio" } }),
        sessione(3, { metadata: {} }),
      ],
      has_more: false,
    },
  ],
  atteso: { codice: 200, iscritti: 1, incompleti: 0 },
});

await prova("più pagine: le legge tutte", {
  chiave: CHIAVE,
  pagine: [
    { data: [sessione(1), sessione(2)], has_more: true },
    { data: [sessione(3), sessione(4)], has_more: true },
    { data: [sessione(5)], has_more: false },
  ],
  atteso: { codice: 200, iscritti: 5, totaleCent: 5000 },
});

await prova("nessun iscritto → elenco vuoto, non un errore", {
  chiave: CHIAVE,
  pagine: [{ data: [], has_more: false }],
  atteso: { codice: 200, iscritti: 0, incompleti: 0, totaleCent: 0 },
});

await prova("l'elenco non finisce in nessuna cache", {
  chiave: CHIAVE,
  pagine: [{ data: [sessione(1)], has_more: false }],
  atteso: { codice: 200, nonInCache: true },
});

console.log("\n── Stripe che non risponde ────────────────────────────────────");

global.fetch = async () => risposta(500, { error: { message: "Stripe giù" } });
{
  process.env.STRIPE_SECRET_KEY = "sk_test_finta";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  const res = finestra();
  await handler({ method: "GET", query: { chiave: CHIAVE }, headers: {} }, res);
  if (res.codice === 502 && !res.corpo?.iscritti) {
    passate++;
    console.log("  ok   Stripe giù → 502, e nessun mezzo elenco spacciato per intero");
  } else {
    fallite++;
    console.log(`  NO   Stripe giù → codice ${res.codice}`);
  }
}

/* L'ultima è la più importante di tutte, e non prova la funzione: prova che
   il primo iscritto del banco abbia davvero dentro il codice fiscale. Se un
   giorno qualcuno «semplificasse» i metadata, i controlli qui sopra
   passerebbero lo stesso su un elenco di schede vuote. */
{
  process.env.STRIPE_SECRET_KEY = "sk_test_finta";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  global.fetch = stubFetch([{ data: [sessione(7)], has_more: false }]);
  const res = finestra();
  await handler({ method: "GET", query: { chiave: CHIAVE }, headers: {} }, res);
  const i = res.corpo?.iscritti?.[0] || {};
  const pieno = i.nome && i.cognome && i.codiceFiscale && i.indirizzo && i.email && i.quandoISO;
  const trattini = i.telefono === "" && i.note === "";
  if (pieno && trattini) {
    passate++;
    console.log("  ok   la scheda arriva completa, e i «—» dei campi vuoti restano vuoti");
  } else {
    fallite++;
    console.log(`  NO   scheda incompleta: ${JSON.stringify(i)}`);
  }
}

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
