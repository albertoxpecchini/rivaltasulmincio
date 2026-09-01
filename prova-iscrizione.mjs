/* Prova di /api/iscrizione-color-walk — l'iscrizione di gruppo.
 *
 *   node prova-iscrizione.mjs
 *
 * Stripe non viene mai chiamato: `fetch` è sostituito da un banco di prova
 * che intercetta i parametri e li restituisce da guardare. Quello che si
 * controlla è la parte che decide chi entra e a che prezzo — le due quote,
 * il conto dei minori, e i «no» che la funzione deve dire anche quando la
 * pagina glieli manda buoni, perché la pagina la può scavalcare chiunque.
 */
import handler from "./api/iscrizione-color-walk.mjs";

process.env.STRIPE_SECRET_KEY = "sk_test_finto";

let ultimo = null;
global.fetch = async (url, o) => {
  ultimo = new URLSearchParams(o.body);
  return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/x" }) };
};

const finestra = () => {
  const r = {};
  r.status = (c) => ((r.codice = c), r);
  r.json = (b) => ((r.corpo = b), r);
  r.setHeader = () => {};
  return r;
};

/* Maria Rossi, nata il 10 dicembre 1985: il codice fiscale porta dentro
   proprio quella data, ed è quello che la funzione va a controllare. */
const BASE = {
  nome: "Maria",
  cognome: "Rossi",
  dataNascita: "1985-12-10",
  codiceFiscale: "RSSMRA85T10A562S",
  email: "maria@example.com",
  consenso: true,
};

let passate = 0;
let fallite = 0;

async function prova(nome, corpo, atteso) {
  ultimo = null;
  const res = finestra();
  await handler({ method: "POST", body: corpo }, res);
  const ok = atteso(res, ultimo);
  console.log(`  ${ok ? "ok  " : "NO  "} ${nome}`);
  if (!ok) console.log(`        ottenuto ${res.codice} ${JSON.stringify(res.corpo)}`);
  ok ? passate++ : fallite++;
}

console.log("\n── L'iscrizione di gruppo ─────────────────────────────────────");

await prova(
  "da sola → 10 €, una voce sola sul Checkout",
  BASE,
  (r, u) =>
    r.codice === 200 &&
    u.get("line_items[0][price_data][unit_amount]") === "1000" &&
    !u.get("line_items[1][quantity]") &&
    u.get("metadata[n_minori]") === "0"
);

await prova(
  "con due minori → 10 + 2×5, e i minori nei metadata",
  {
    ...BASE,
    minori: [
      { nome: "Luca", cognome: "Rossi", dataNascita: "2015-04-02" },
      { nome: "Anna", cognome: "Rossi", dataNascita: "2018-11-20" },
    ],
  },
  (r, u) =>
    r.codice === 200 &&
    u.get("line_items[1][quantity]") === "2" &&
    u.get("line_items[1][price_data][unit_amount]") === "500" &&
    u.get("metadata[n_minori]") === "2" &&
    u.get("metadata[minore_1]") === "Luca|Rossi|2015-04-02|—" &&
    u.get("metadata[minore_2]") === "Anna|Rossi|2018-11-20|—"
);

await prova(
  "l'indirizzo di residenza non si chiede più, e non viaggia",
  BASE,
  (r, u) => r.codice === 200 && u.get("metadata[indirizzo]") === null
);

await prova(
  "nessuna voce di commissioni sul Checkout",
  BASE,
  (r, u) => r.codice === 200 && !u.toString().toLowerCase().includes("commission")
);

console.log("\n── Chi la funzione non fa passare ─────────────────────────────");

await prova("minorenne che prova a iscriversi da sé", { ...BASE, dataNascita: "2010-01-01" }, (r) =>
  r.codice === 400 && /maggiorenn/.test(r.corpo.errore)
);

await prova(
  "codice fiscale che dice una data diversa da quella dichiarata",
  { ...BASE, dataNascita: "1985-12-11" },
  (r) => r.codice === 400 && /non corrisponde/.test(r.corpo.errore)
);

await prova("data che non esiste — 31 febbraio", { ...BASE, dataNascita: "1985-02-31" }, (r) => r.codice === 400);

await prova(
  "minore sotto i 6 anni: non si iscrive, si viene e basta",
  { ...BASE, minori: [{ nome: "Bea", cognome: "Rossi", dataNascita: "2021-05-01" }] },
  (r) => r.codice === 400 && /gratis/.test(r.corpo.errore)
);

await prova(
  "«minore» che il 20 settembre ha 18 anni: quota intera",
  { ...BASE, minori: [{ nome: "Ivo", cognome: "Rossi", dataNascita: "2008-09-20" }] },
  (r) => r.codice === 400 && /quota intera/.test(r.corpo.errore)
);

await prova(
  "nove minori in un colpo solo",
  { ...BASE, minori: Array.from({ length: 9 }, (_, i) => ({ nome: "M" + i, cognome: "Rossi", dataNascita: "2015-04-02" })) },
  (r) => r.codice === 400 && /massimo 8/.test(r.corpo.errore)
);

await prova("senza la dichiarazione di responsabilità", { ...BASE, consenso: false }, (r) =>
  r.codice === 400 && /dichiarazione/.test(r.corpo.errore)
);

await prova("senza email valida", { ...BASE, email: "non-una-email" }, (r) => r.codice === 400);

console.log("\n── I casi limite dell'età, contati al 20 settembre ────────────");

await prova(
  "minore di 17 anni e 364 giorni: passa",
  { ...BASE, minori: [{ nome: "Ivo", cognome: "Rossi", dataNascita: "2008-09-21" }] },
  (r) => r.codice === 200
);

await prova(
  "minore che compie 6 anni proprio il 20: passa",
  { ...BASE, minori: [{ nome: "Bea", cognome: "Rossi", dataNascita: "2020-09-20" }] },
  (r) => r.codice === 200
);

await prova(
  "minore che li compie il giorno dopo: no",
  { ...BASE, minori: [{ nome: "Bea", cognome: "Rossi", dataNascita: "2020-09-21" }] },
  (r) => r.codice === 400 && /gratis/.test(r.corpo.errore)
);

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
