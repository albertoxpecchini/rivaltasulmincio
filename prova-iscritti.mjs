/* ═══════════════════════════════════════════════════════════════════════════
   Banco di prova per api/iscritti-color-walk.mjs — `node prova-iscritti.mjs`.

   Questa funzione è l'unica del sito che, se sbaglia, consegna a uno
   sconosciuto il codice fiscale e la data di nascita di chi si è iscritto,
   e i nomi dei minori che ha iscritto con sé.
   Le domande a cui questo file risponde sono quindi tre, nell'ordine:

     1. la porta regge? (chiave assente, sbagliata, di lunghezza diversa,
        variabile d'ambiente non impostata)
     2. e quando regge, l'elenco è quello giusto? (solo iscrizioni di QUESTO
        evento, chi paga al ritrovo dentro e non fra i mancati pagamenti, gli
        abbandoni contati e basta, tutte le pagine lette)
     3. il tasto «incassato» segna la persona giusta, e nient'altro?

   PayPal qui è finto — `global.fetch` è sostituito — quindi si prova tutto
   senza toccare un pagamento vero. Zero dipendenze: è solo Node.

   Va rilanciato dopo ogni modifica alla funzione. Non gira su Vercel: sta in
   .vercelignore insieme a build.mjs e agli altri banchi di prova.
   ═══════════════════════════════════════════════════════════════════════════ */
import handler from "./api/iscritti-color-walk.mjs";

const CHIAVE = "chiave-di-prova-degli-organizzatori";
const EVENTO = "color-walk-2026-09-20";

const risposta = (stato, corpo) => ({
  ok: stato >= 200 && stato < 300,
  status: stato,
  json: async () => corpo,
  text: async () => JSON.stringify(corpo),
});

/* Una fattura PayPal ridotta a quello che la funzione guarda davvero: una
   maggiorenne più un minore a carico, così si prova anche che un'iscrizione
   vale più di una persona. */
const fattura = (n, { detail, ...extra } = {}) => ({
  id: "INV2-" + n,
  status: "MARKED_AS_PAID",
  primary_recipients: [
    { billing_info: { name: { given_name: "Nome" + n, surname: "Cognome" + n }, email_address: `tizio${n}@example.com` } },
  ],
  amount: { currency_code: "EUR", value: "15.00" },
  items: [
    {
      description: `A|Nome${n}|Cognome${n}|1985-12-10|RSSMRA85T10A562S`,
      quantity: "1",
      unit_amount: { currency_code: "EUR", value: "10.00" },
    },
    {
      description: `M|Figlio${n}|Cognome${n}|2015-04-02|—`,
      quantity: "1",
      unit_amount: { currency_code: "EUR", value: "5.00" },
    },
  ],
  ...extra,
  /* `detail` si fonde campo per campo e non si sostituisce in blocco: una
     prova che voglia cambiare solo il memo non deve portarsi via il marchio
     dell'evento, o la fattura sparisce dall'elenco e la prova passa per il
     motivo sbagliato. */
  detail: {
    invoice_number: "CW-prova-" + n,
    invoice_date: "2026-09-02",
    reference: EVENTO,
    memo: "paypal|—|2026-08-25T10:00:00.000Z|—",
    metadata: { create_time: new Date(1789000000000 + n * 60000).toISOString() },
    ...detail,
  },
});

/* Chi paga al ritrovo: la fattura c'è, i soldi no. */
const inContanti = (n, { detail, ...extra } = {}) =>
  fattura(n, {
    status: "UNPAID",
    ...extra,
    detail: { memo: "contanti|3331234567|2026-08-25T10:00:00.000Z|—", ...detail },
  });

/* Chi ha aperto il pagamento online e non è arrivato in fondo. */
const abbandonata = (n) => fattura(n, { status: "UNPAID" });

/* Le pagine che il finto PayPal restituirà, in ordine. `scritte` raccoglie le
   POST: è lì che si guarda se il tasto «incassato» ha davvero scritto. */
let scritte;

function stubFetch(pagine, { rotto = false } = {}) {
  let i = 0;
  return async (url, o = {}) => {
    const u = String(url);
    if (u.includes("/v1/oauth2/token")) return risposta(200, { access_token: "gettone", expires_in: 3600 });

    /* L'elenco vero e proprio: è da qui che /iscritti legge, perché la
       ricerca non restituisce le voci delle fatture. */
    if (u.includes("/v2/invoicing/invoices?")) {
      if (rotto) return risposta(500, { message: "PayPal giù" });
      const p = pagine[i++] || [];
      return risposta(200, { items: p });
    }

    if (u.includes("/search-invoices")) {
      if (rotto) return risposta(500, { message: "PayPal giù" });
      const filtro = JSON.parse(o.body || "{}");
      const p = pagine[i++] || [];
      const trovate = filtro.invoice_number
        ? p.filter((f) => f.detail.invoice_number === filtro.invoice_number)
        : p;
      return risposta(200, { items: trovate });
    }

    if (u.includes("/payments") && o.method === "POST") {
      scritte.push({ url: u, corpo: JSON.parse(o.body) });
      return risposta(200, {});
    }

    if (u.includes("/v2/invoicing/invoices/")) {
      const id = u.split("/").pop();
      const trovata = pagine.flat().find((f) => f.id === id);
      return trovata ? risposta(200, trovata) : risposta(404, { name: "RESOURCE_NOT_FOUND" });
    }

    throw new Error("URL non previsto dal banco di prova: " + u);
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

async function prova(nome, { chiave, headerChiave, metodo = "GET", corpo, env = {}, pagine = [], rotto = false, atteso }) {
  process.env.PAYPAL_CLIENT_ID = "finto";
  process.env.PAYPAL_CLIENT_SECRET = "finto";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  for (const [k, v] of Object.entries(env)) {
    if (v === null) delete process.env[k];
    else process.env[k] = v;
  }

  scritte = [];
  global.fetch = stubFetch(pagine, { rotto });

  const req = {
    method: metodo,
    body: corpo,
    query: chiave === undefined ? {} : { chiave },
    headers: headerChiave === undefined ? {} : { "x-chiave": headerChiave },
  };
  const res = finestra();
  await handler(req, res);

  const problemi = [];
  const chiedi = (campo, valore) => {
    if (atteso[campo] !== undefined && valore !== atteso[campo]) {
      problemi.push(`${campo} ${JSON.stringify(valore)}, atteso ${JSON.stringify(atteso[campo])}`);
    }
  };

  chiedi("codice", res.codice);
  chiedi("incompleti", res.corpo?.incompleti);
  chiedi("incassatoCent", res.corpo?.incassatoCent);
  chiedi("daIncassareCent", res.corpo?.daIncassareCent);
  chiedi("persone", res.corpo?.persone);
  chiedi("illeggibili", res.corpo?.illeggibili);
  chiedi("letti", res.corpo?.letti);
  if (atteso.iscritti !== undefined) {
    const n = (res.corpo?.iscritti || []).length;
    if (n !== atteso.iscritti) problemi.push(`${n} iscritti, attesi ${atteso.iscritti}`);
  }
  if (atteso.nienteDati && res.corpo?.iscritti) {
    problemi.push("ha risposto con un elenco quando non doveva rispondere affatto");
  }
  if (atteso.nonInCache && res.testate["cache-control"] !== "no-store, max-age=0") {
    problemi.push(`Cache-Control «${res.testate["cache-control"]}»`);
  }
  if (atteso.scritte !== undefined && scritte.length !== atteso.scritte) {
    problemi.push(`${scritte.length} scritture, attese ${atteso.scritte}`);
  }
  if (atteso.metodoPagamento && scritte[0]?.corpo?.method !== atteso.metodoPagamento) {
    problemi.push(`metodo ${scritte[0]?.corpo?.method}, atteso ${atteso.metodoPagamento}`);
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
  pagine: [[fattura(1)]],
  atteso: { codice: 200, iscritti: 1 },
});

await prova("ISCRITTI_CHIAVE non impostata → 503, non «entrano tutti»", {
  chiave: CHIAVE,
  env: { ISCRITTI_CHIAVE: null },
  atteso: { codice: 503, nienteDati: true },
});

/* Lo spazio che resta attaccato incollando il valore nel pannello di Vercel
   non si vede da nessuna parte, e chiuderebbe la porta a chi la chiave ce
   l'ha giusta. */
await prova("ISCRITTI_CHIAVE con uno spazio in coda → la chiave giusta apre lo stesso", {
  chiave: CHIAVE,
  env: { ISCRITTI_CHIAVE: CHIAVE + " " },
  pagine: [[fattura(1)]],
  atteso: { codice: 200, iscritti: 1 },
});

/* E una fatta di soli spazi è una serratura che non c'è, non una che si apre
   scrivendo niente. */
await prova("ISCRITTI_CHIAVE di soli spazi → 503, non una porta aperta col vuoto", {
  chiave: "",
  env: { ISCRITTI_CHIAVE: "   " },
  atteso: { codice: 503, nienteDati: true },
});

await prova("PUT → 405", {
  chiave: CHIAVE,
  metodo: "PUT",
  atteso: { codice: 405, nienteDati: true },
});

await prova("la chiave si può passare anche nell'intestazione", {
  headerChiave: CHIAVE,
  pagine: [[fattura(1)]],
  atteso: { codice: 200, iscritti: 1 },
});

console.log("\n── L'elenco ───────────────────────────────────────────────────");

/* La differenza che conta il giorno della camminata: chi paga al ritrovo è
   iscritto e va in elenco con nome e cognome, chi ha abbandonato il
   pagamento online no — si conta e basta. */
await prova("chi paga al ritrovo è in elenco; chi ha abbandonato si conta e basta", {
  chiave: CHIAVE,
  pagine: [[fattura(1), inContanti(2), abbandonata(3), fattura(4)]],
  atteso: {
    codice: 200,
    iscritti: 3,
    incompleti: 1,
    incassatoCent: 3000,
    daIncassareCent: 1500,
    persone: 6,
  },
});

/* Annullata vuol dire che non c'è più, chiunque l'abbia annullata: una prova,
   un doppione, chi aveva prenotato in contanti e non si è presentato, o il
   webhook dopo un pagamento rifiutato. Non deve restare in nessun conteggio,
   o è un numero gonfio che non si toglie più. */
await prova("un pagamento online annullato sparisce, non si conta", {
  chiave: CHIAVE,
  pagine: [[fattura(1), fattura(2, { status: "CANCELLED" })]],
  atteso: { codice: 200, iscritti: 1, incompleti: 0 },
});

await prova("un'iscrizione in contanti annullata sparisce, non si conta", {
  chiave: CHIAVE,
  pagine: [[fattura(1), inContanti(2, { status: "CANCELLED" })]],
  atteso: { codice: 200, iscritti: 1, incompleti: 0 },
});

/* Quello che invece si conta: aperto online, mai concluso e mai chiuso. */
await prova("un pagamento online mai concluso resta fra le «a metà»", {
  chiave: CHIAVE,
  pagine: [[fattura(1), abbandonata(2)]],
  atteso: { codice: 200, iscritti: 1, incompleti: 1 },
});

/* Una fattura senza voci non dice chi è iscritto. Prima spariva in silenzio,
   e sulla pagina «0 persone» era indistinguibile da «non si è iscritto
   nessuno» — per una persona che invece era lì. Adesso la riga compare, e si
   conta come una persona, perché una persona lo è. */
await prova("una fattura illeggibile compare lo stesso e si conta", {
  chiave: CHIAVE,
  pagine: [[fattura(1), inContanti(2, { items: [] })]],
  atteso: { codice: 200, iscritti: 2, illeggibili: 1, letti: 2, persone: 3 },
});

await prova("le fatture di un altro evento non c'entrano niente", {
  chiave: CHIAVE,
  pagine: [[fattura(1), fattura(2, { detail: { reference: "sagra-2027" } })]],
  atteso: { codice: 200, iscritti: 1, incompleti: 0 },
});

await prova("più pagine: le legge tutte", {
  chiave: CHIAVE,
  pagine: [
    Array.from({ length: 100 }, (_, k) => fattura(k + 1)),
    [fattura(101), fattura(102)],
  ],
  atteso: { codice: 200, iscritti: 102 },
});

await prova("nessun iscritto → elenco vuoto, non un errore", {
  chiave: CHIAVE,
  pagine: [[]],
  atteso: { codice: 200, iscritti: 0, incompleti: 0, incassatoCent: 0, daIncassareCent: 0 },
});

await prova("l'elenco non finisce in nessuna cache", {
  chiave: CHIAVE,
  pagine: [[fattura(1)]],
  atteso: { codice: 200, nonInCache: true },
});

await prova("PayPal giù → 502, e nessun mezzo elenco spacciato per intero", {
  chiave: CHIAVE,
  rotto: true,
  atteso: { codice: 502, nienteDati: true },
});

console.log("\n── Il contante che arriva al banchetto ────────────────────────");

await prova("segna incassato → una scrittura sola, metodo contanti", {
  chiave: CHIAVE,
  metodo: "POST",
  corpo: { fattura: "INV2-2" },
  pagine: [[inContanti(2)]],
  atteso: { codice: 200, scritte: 1, metodoPagamento: "CASH" },
});

await prova("segnare due volte non scrive due volte", {
  chiave: CHIAVE,
  metodo: "POST",
  corpo: { fattura: "INV2-1" },
  pagine: [[fattura(1)]],
  atteso: { codice: 200, scritte: 0 },
});

await prova("una fattura che non esiste → 404, e non si scrive niente", {
  chiave: CHIAVE,
  metodo: "POST",
  corpo: { fattura: "INV2-INVENTATA" },
  pagine: [[fattura(1)]],
  atteso: { codice: 404, scritte: 0 },
});

/* La chiave apre l'elenco della Color Walk, non il permesso di segnare
   pagata una qualunque fattura che ci sia sul conto PayPal. */
await prova("una fattura di un altro evento non si tocca", {
  chiave: CHIAVE,
  metodo: "POST",
  corpo: { fattura: "INV2-9" },
  pagine: [[fattura(9, { status: "UNPAID", detail: { reference: "sagra-2027" } })]],
  atteso: { codice: 404, scritte: 0 },
});

await prova("senza dire quale iscrizione → 400", {
  chiave: CHIAVE,
  metodo: "POST",
  corpo: {},
  atteso: { codice: 400, scritte: 0 },
});

/* Le iscrizioni registrate prima della regola delle maiuscole stanno sulle
   fatture com'erano state scritte, e non si riscrivono: la maiuscola gliela
   rimette la lettura. */
{
  process.env.PAYPAL_CLIENT_ID = "finto";
  process.env.PAYPAL_CLIENT_SECRET = "finto";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  scritte = [];
  const minuscola = inContanti(8);
  minuscola.items[0].description = "A|primo|pecchini|1964-09-23|PCCPRM64P23E897V";
  global.fetch = stubFetch([[minuscola]]);
  const res = finestra();
  await handler({ method: "GET", query: { chiave: CHIAVE }, headers: {} }, res);
  const i = res.corpo?.iscritti?.[0] || {};
  if (i.nome === "Primo" && i.cognome === "Pecchini") {
    passate++;
    console.log("  ok   un nome scritto minuscolo prima di questa regola si legge con la maiuscola");
  } else {
    fallite++;
    console.log(`  NO   maiuscole in lettura: «${i.nome} ${i.cognome}», atteso «Primo Pecchini»`);
  }
}

/* L'ultima è la più importante di tutte, e non prova la funzione: prova che
   la scheda abbia davvero dentro il codice fiscale, il minore e lo stato del
   pagamento. Se un giorno qualcuno «semplificasse» le voci della fattura, i
   controlli qui sopra passerebbero lo stesso su un elenco di schede vuote. */
{
  process.env.PAYPAL_CLIENT_ID = "finto";
  process.env.PAYPAL_CLIENT_SECRET = "finto";
  process.env.ISCRITTI_CHIAVE = CHIAVE;
  scritte = [];
  global.fetch = stubFetch([[inContanti(7)]]);
  const res = finestra();
  await handler({ method: "GET", query: { chiave: CHIAVE }, headers: {} }, res);
  const i = res.corpo?.iscritti?.[0] || {};
  const pieno =
    i.nome === "Nome7" &&
    i.cognome === "Cognome7" &&
    i.codiceFiscale === "RSSMRA85T10A562S" &&
    i.dataNascita === "1985-12-10" &&
    i.email === "tizio7@example.com" &&
    i.quandoISO;
  const dalMemo = i.telefono === "3331234567" && i.note === "" && i.consenso === "2026-08-25T10:00:00.000Z";
  const m = i.minori?.[0] || {};
  const conMinore = m.nome === "Figlio7" && m.dataNascita === "2015-04-02" && m.codiceFiscale === "";
  const stato = i.pagato === false && i.pagamento === "contanti" && i.numero === "CW-prova-7";
  const persone = res.corpo?.persone === 2 && res.corpo?.tetto === 300;

  if (pieno && dalMemo && conMinore && stato && persone) {
    passate++;
    console.log("  ok   la scheda arriva completa: minore a carico, «—» vuoti, e come paga");
  } else {
    fallite++;
    console.log(`  NO   scheda incompleta: ${JSON.stringify(i)} — persone: ${res.corpo?.persone}`);
  }
}

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
