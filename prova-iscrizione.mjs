/* Prova di /api/iscrizione-color-walk — l'iscrizione di gruppo.
 *
 *   node prova-iscrizione.mjs
 *
 * PayPal non viene mai chiamato: `fetch` è sostituito da un banco di prova
 * che intercetta quello che gli viene mandato e lo restituisce da guardare.
 * Quello che si controlla è la parte che decide chi entra e a che prezzo — le
 * due quote, il conto dei minori, la scelta di come pagare, e i «no» che la
 * funzione deve dire anche quando la pagina glieli manda buoni, perché la
 * pagina la può scavalcare chiunque.
 */
import handler from "./api/iscrizione-color-walk.mjs";

process.env.PAYPAL_CLIENT_ID = "finto";
process.env.PAYPAL_CLIENT_SECRET = "finto";
process.env.RESEND_API_KEY = "re_finta";

/* Quello che è stato mandato a PayPal e alla posta durante l'ultima prova.
   `fattura` è il corpo della fattura creata: è lì che finiscono i dati di chi
   si iscrive, ed è quello che questo banco di prova guarda. */
let inviato;

global.fetch = async (url, o = {}) => {
  const u = String(url);
  const corpo = o.body && o.body[0] === "{" ? JSON.parse(o.body) : null;
  inviato.chiamate.push(`${o.method || "GET"} ${u.replace(/^https:\/\/api-m\.paypal\.com/, "")}`);

  if (u.includes("/v1/oauth2/token")) return risposta({ access_token: "gettone", expires_in: 3600 });
  if (u.includes("/search-invoices")) return risposta({ items: inviato.gia });
  if (u.endsWith("/v2/invoicing/invoices")) {
    inviato.fattura = corpo;
    return risposta({ id: "INV2-PROVA" });
  }
  if (u.includes("/send")) return risposta({});
  if (u.includes("/v2/checkout/orders")) {
    inviato.ordine = corpo;
    return risposta({ id: "ORDINEPROVA00001", links: [{ rel: "payer-action", href: "https://www.paypal.com/checkoutnow?token=ORDINEPROVA00001" }] });
  }
  if (u.includes("resend")) {
    inviato.mail = JSON.parse(o.body);
    return risposta({ id: "email_1" });
  }
  throw new Error("URL non previsto dal banco di prova: " + u);
};

const risposta = (corpo) => ({
  ok: true,
  status: 200,
  json: async () => corpo,
  text: async () => JSON.stringify(corpo),
});

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
  pagamento: "paypal",
};

let passate = 0;
let fallite = 0;

async function prova(nome, corpo, atteso, { gia = [] } = {}) {
  inviato = { fattura: null, ordine: null, mail: null, chiamate: [], gia };
  const res = finestra();
  await handler({ method: "POST", body: corpo }, res);
  const ok = atteso(res, inviato);
  console.log(`  ${ok ? "ok  " : "NO  "} ${nome}`);
  if (!ok) {
    console.log(`        ottenuto ${res.codice} ${JSON.stringify(res.corpo)}`);
    console.log(`        fattura  ${JSON.stringify(inviato.fattura?.items)}`);
  }
  ok ? passate++ : fallite++;
}

/* Le voci della fattura sono una per persona: ruolo, nome, cognome, data,
   codice fiscale. È la forma che rilegge tutto il resto del progetto. */
const voci = (i) => (i.fattura?.items || []).map((v) => v.description);
const importi = (i) => (i.fattura?.items || []).map((v) => v.unit_amount.value);

console.log("\n── L'iscrizione di gruppo ─────────────────────────────────────");

await prova(
  "da sola → 10 €, una voce sola sulla fattura",
  BASE,
  (r, i) =>
    r.codice === 200 &&
    r.corpo.url.includes("paypal.com") &&
    voci(i).length === 1 &&
    voci(i)[0] === "A|Maria|Rossi|1985-12-10|RSSMRA85T10A562S" &&
    importi(i)[0] === "10.00"
);

await prova(
  "con due minori → 10 + 2×5, una voce per ciascuno",
  {
    ...BASE,
    minori: [
      { nome: "Luca", cognome: "Rossi", dataNascita: "2015-04-02" },
      { nome: "Anna", cognome: "Rossi", dataNascita: "2018-11-20" },
    ],
  },
  (r, i) =>
    r.codice === 200 &&
    voci(i).length === 3 &&
    voci(i)[1] === "M|Luca|Rossi|2015-04-02|—" &&
    voci(i)[2] === "M|Anna|Rossi|2018-11-20|—" &&
    importi(i).join(",") === "10.00,5.00,5.00"
);

await prova(
  "l'ordine porta il numero della fattura, non i dati di nessuno",
  BASE,
  (r, i) =>
    r.codice === 200 &&
    i.ordine.purchase_units[0].invoice_id === i.fattura.detail.invoice_number &&
    i.ordine.purchase_units[0].custom_id === "color-walk-2026-09-20" &&
    i.ordine.purchase_units[0].amount.value === "10.00"
);

await prova(
  "il numero della fattura sta nei 25 caratteri che PayPal concede",
  BASE,
  (r, i) => r.codice === 200 && i.fattura.detail.invoice_number.length <= 25
);

await prova(
  "telefono, note e ora del consenso nel memo riservato, non nelle voci",
  { ...BASE, telefono: "3331234567", note: "Arrivo un po' dopo" },
  (r, i) =>
    r.codice === 200 &&
    i.fattura.detail.memo.startsWith("paypal|3331234567|") &&
    i.fattura.detail.memo.endsWith("|Arrivo un po' dopo") &&
    !voci(i).join(" ").includes("3331234567")
);

await prova(
  "nessuna voce di commissioni sulla fattura",
  BASE,
  (r, i) => r.codice === 200 && !JSON.stringify(i.fattura).toLowerCase().includes("commission")
);

console.log("\n── Chi paga al ritrovo ────────────────────────────────────────");

await prova(
  "contanti → nessun ordine, e la mail parte subito",
  { ...BASE, pagamento: "contanti" },
  (r, i) =>
    r.codice === 200 &&
    r.corpo.contanti === true &&
    r.corpo.spedita === true &&
    r.corpo.totaleCent === 1000 &&
    !r.corpo.url &&
    i.ordine === null &&
    i.fattura.detail.memo.startsWith("contanti|")
);

/* La mail di chi paga al ritrovo deve dire, senza girarci intorno, che quei
   soldi NON sono stati pagati. È il punto di tutta questa modalità: chi la
   riceve deve arrivare con i contanti in mano. */
await prova(
  "la mail dei contanti dice che non è pagato, e quanto portare",
  { ...BASE, pagamento: "contanti", minori: [{ nome: "Luca", cognome: "Rossi", dataNascita: "2015-04-02" }] },
  (r, i) => {
    const testo = (i.mail?.html || "") + "\n" + (i.mail?.text || "");
    return (
      r.codice === 200 &&
      /non è ancora pagata/i.test(testo) &&
      /15,00/.test(testo) &&
      /contanti/i.test(testo) &&
      !testo.includes("{{") &&
      !testo.includes("<!--se:") &&
      !/pagamento è andato a buon fine/.test(testo)
    );
  }
);

await prova(
  "l'oggetto della mail dei contanti non dice «confermata»",
  { ...BASE, pagamento: "contanti" },
  (r, i) => r.codice === 200 && /da pagare/i.test(i.mail.subject) && !/^Iscrizione confermata/.test(i.mail.subject)
);

await prova("modo di pagare non dichiarato → no", { ...BASE, pagamento: "" }, (r) =>
  r.codice === 400 && /come pagare/.test(r.corpo.errore)
);

await prova("modo di pagare inventato → no", { ...BASE, pagamento: "assegno" }, (r) =>
  r.codice === 400 && /come pagare/.test(r.corpo.errore)
);

console.log("\n── Il tetto delle iscrizioni non pagate ───────────────────────");

const nonPagata = { id: "INV2-X", status: "UNPAID", detail: { reference: "color-walk-2026-09-20" } };

await prova(
  "due non pagate allo stesso indirizzo → la terza passa",
  { ...BASE, pagamento: "contanti" },
  (r) => r.codice === 200,
  { gia: [nonPagata, { ...nonPagata, id: "INV2-Y" }] }
);

await prova(
  "tre non pagate allo stesso indirizzo → la quarta no",
  { ...BASE, pagamento: "contanti" },
  (r) => r.codice === 429 && /non ancora pagate/.test(r.corpo.errore),
  { gia: [nonPagata, { ...nonPagata, id: "INV2-Y" }, { ...nonPagata, id: "INV2-Z" }] }
);

await prova(
  "tre già pagate non contano: quelle sono iscrizioni vere",
  { ...BASE, pagamento: "contanti" },
  (r) => r.codice === 200,
  {
    gia: [
      { ...nonPagata, status: "MARKED_AS_PAID" },
      { ...nonPagata, id: "INV2-Y", status: "MARKED_AS_PAID" },
      { ...nonPagata, id: "INV2-Z", status: "PAID" },
    ],
  }
);

/* Chi ha appena fatto pulizia deve poter rientrare. Le annullate le tiene
   fuori già il filtro mandato a PayPal, ma quello lo applica lui: se un
   giorno lo ignorasse, questo tetto si trasformerebbe in una porta sbarrata
   proprio a chi ha sistemato le cose, e senza spiegazione. */
await prova(
  "tre annullate non contano: chi ha fatto pulizia rientra",
  { ...BASE, pagamento: "contanti" },
  (r) => r.codice === 200,
  {
    gia: [
      { ...nonPagata, status: "CANCELLED" },
      { ...nonPagata, id: "INV2-Y", status: "CANCELLED" },
      { ...nonPagata, id: "INV2-Z", status: "CANCELLED" },
    ],
  }
);

console.log("\n── Chi la funzione non fa passare ─────────────────────────────");

await prova("il campo trappola pieno → non si registra niente", { ...BASE, sito: "https://spam.example" }, (r, i) =>
  r.codice === 400 && i.fattura === null
);

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

/* La barra verticale separa i campi dentro una voce: un cognome che ne
   contenesse una spezzerebbe in due la riga di quella persona quando la si
   rilegge, e nessuno se ne accorgerebbe fino al ritiro delle sacche. */
await prova(
  "una barra verticale dentro un nome non spezza la voce",
  { ...BASE, nome: "Maria|Luisa" },
  (r, i) => r.codice === 200 && voci(i)[0].split("|").length === 5
);

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
