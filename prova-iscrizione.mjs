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

/* Dal telefono si scrive tutto minuscolo, e l'autocapitalize del modulo è un
   suggerimento che le tastiere ignorano quando gli pare. Il nome va a finire
   su una ricevuta e su un elenco letto ad alta voce al banchetto. */
await prova(
  "nome e cognome prendono la maiuscola, comunque siano scritti",
  { ...BASE, nome: "maria", cognome: "DE ROSSI" },
  (r, i) =>
    r.codice === 200 &&
    voci(i)[0] === "A|Maria|De Rossi|1985-12-10|RSSMRA85T10A562S" &&
    i.fattura.items[0].name.startsWith("Maria De Rossi") &&
    i.fattura.primary_recipients[0].billing_info.name.given_name === "Maria"
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


/* Il contante è l'unica strada dove il totale viaggia a mano fino alla
   risposta invece di essere sommato da PayPal dalle voci: se il conto degli
   adulti si perde per strada, si perde proprio qui. E la mail deve dire due
   maggiorenni, perché è quella che chi organizza si vedrà mostrare al
   banchetto la mattina del 20. */
await prova(
  "contanti con due maggiorenni e un minore → 25 € da portare, tre persone",
  {
    ...BASE,
    pagamento: "contanti",
    adulti: [{ nome: "Marco", cognome: "Rossi", dataNascita: "1983-07-19", codiceFiscale: "RSSMRC83L19F205K" }],
    minori: [{ nome: "Luca", cognome: "Rossi", dataNascita: "2015-04-02" }],
  },
  (r, i) => {
    const testo = (i.mail?.html || "") + "\n" + (i.mail?.text || "");
    return (
      r.codice === 200 &&
      r.corpo.contanti === true &&
      r.corpo.totaleCent === 2500 &&
      r.corpo.persone === 3 &&
      /2 maggiorenni/.test(testo) &&
      /Marco Rossi/.test(testo) &&
      /25,00/.test(testo) &&
      /girala a chi cammina con te/.test(testo) &&
      !testo.includes("{{") &&
      !testo.includes("<!--se:")
    );
  }
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
      !/girala/.test(testo) &&
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

console.log("\n── Due maggiorenni in una sola iscrizione ─────────────────────");

/* Codici fiscali che combaciano davvero con la data: è quello che la
   funzione controlla, e una prova con un codice qualunque proverebbe solo
   che il controllo non c'è. */
const MARCO = { nome: "Marco", cognome: "Rossi", dataNascita: "1983-07-19", codiceFiscale: "RSSMRC83L19F205K" };
const GIULIA = { nome: "Giulia", cognome: "Verdi", dataNascita: "1990-03-11", codiceFiscale: "VRDGLI90C51F205Z" };
const PIERO = { nome: "Piero", cognome: "Bianchi", dataNascita: "1975-11-05", codiceFiscale: "BNCPRI75S05F205Q" };
const ELENA = { nome: "Elena", cognome: "Neri", dataNascita: "1992-08-30", codiceFiscale: "NRELNE92M70F205W" };

await prova(
  "due maggiorenni → 20 €, due voci, la seconda con la B",
  { ...BASE, adulti: [MARCO] },
  (r, i) =>
    r.codice === 200 &&
    voci(i).length === 2 &&
    voci(i)[0] === "A|Maria|Rossi|1985-12-10|RSSMRA85T10A562S" &&
    voci(i)[1] === "B|Marco|Rossi|1983-07-19|RSSMRC83L19F205K" &&
    importi(i).join(",") === "10.00,10.00" &&
    i.ordine.purchase_units[0].amount.value === "20.00"
);

await prova(
  "due maggiorenni e due minori → 30 €, quattro voci nell'ordine giusto",
  {
    ...BASE,
    adulti: [MARCO],
    minori: [
      { nome: "Luca", cognome: "Rossi", dataNascita: "2015-04-02" },
      { nome: "Anna", cognome: "Rossi", dataNascita: "2018-11-20" },
    ],
  },
  (r, i) =>
    r.codice === 200 &&
    voci(i).length === 4 &&
    voci(i).map((v) => v[0]).join("") === "ABMM" &&
    importi(i).join(",") === "10.00,10.00,5.00,5.00" &&
    i.ordine.purchase_units[0].amount.value === "30.00"
);

/* Il tetto: quattro maggiorenni passano, cinque no. Il capofila è dentro il
   conto, quindi gli accompagnati sono tre. */
await prova(
  "quattro maggiorenni: passano",
  { ...BASE, adulti: [MARCO, GIULIA, PIERO] },
  (r, i) => r.codice === 200 && voci(i).length === 4 && i.ordine.purchase_units[0].amount.value === "40.00"
);

await prova(
  "cinque maggiorenni: no, e nessuna fattura",
  { ...BASE, adulti: [MARCO, GIULIA, PIERO, ELENA] },
  (r, i) => r.codice === 400 && /massimo 4 maggiorenni/.test(r.corpo.errore) && i.fattura === null
);

console.log("\n── I «no» sul secondo maggiorenne ─────────────────────────────");

await prova(
  "senza codice fiscale: no — a lui è obbligatorio come al capofila",
  { ...BASE, adulti: [{ nome: "Marco", cognome: "Rossi", dataNascita: "1983-07-19" }] },
  (r, i) => r.codice === 400 && /codice fiscale/.test(r.corpo.errore) && i.fattura === null
);

await prova(
  "codice fiscale che non torna con la sua data: no",
  { ...BASE, adulti: [{ ...MARCO, dataNascita: "1983-07-20" }] },
  (r) => r.codice === 400 && /non corrisponde alla data/.test(r.corpo.errore)
);

/* Il messaggio dev'essere quello scritto per lui: quello del capofila gli
   direbbe che «i minori li iscrive un adulto», che è vero e non gli serve. */
await prova(
  "un minorenne mandato fra gli adulti: no, e gli si dice dove va messo",
  { ...BASE, adulti: [{ nome: "Ivo", cognome: "Rossi", dataNascita: "2009-04-02", codiceFiscale: "MNRLCU09D02F205T" }] },
  (r) => r.codice === 400 && /Adulto 2/.test(r.corpo.errore) && /fra i minori/.test(r.corpo.errore)
);

await prova(
  "lo stesso codice fiscale del capofila: no, o paga 10 € per una persona sola",
  { ...BASE, adulti: [{ nome: "Maria", cognome: "Rossi", dataNascita: "1985-12-10", codiceFiscale: "RSSMRA85T10A562S" }] },
  (r) => r.codice === 400 && /già in questa iscrizione/.test(r.corpo.errore)
);

await prova(
  "lo stesso codice fiscale due volte fra gli accompagnati: no",
  { ...BASE, adulti: [MARCO, { ...MARCO, nome: "Marc" }] },
  (r) => r.codice === 400 && /Adulto 3/.test(r.corpo.errore) && /già in questa iscrizione/.test(r.corpo.errore)
);

console.log("\n── Quando «adulti» arriva storto ──────────────────────────────");

/* La pagina la può scavalcare chiunque: quello che arriva non è per forza un
   elenco. Nessuno di questi casi deve buttare giù la funzione. */
await prova(
  "«adulti» è una stringa: si ignora, e chi compila si iscrive lo stesso",
  { ...BASE, adulti: "Marco" },
  (r, i) => r.codice === 200 && voci(i).length === 1
);

await prova(
  "«adulti» è null: si ignora",
  { ...BASE, adulti: null },
  (r, i) => r.codice === 200 && voci(i).length === 1
);

await prova(
  "«adulti» è un elenco di niente: un no pulito, non un guasto",
  { ...BASE, adulti: [null] },
  (r, i) => r.codice === 400 && /Adulto 2/.test(r.corpo.errore) && i.fattura === null
);

await prova(
  "«adulti» pieno di spazzatura: un no pulito",
  { ...BASE, adulti: [{ nome: 42, cognome: [], dataNascita: {}, codiceFiscale: true }] },
  (r, i) => r.codice === 400 && i.fattura === null
);

await prova(
  "«adulti» vuoto: identico a un'iscrizione da sola",
  { ...BASE, adulti: [] },
  (r, i) =>
    r.codice === 200 &&
    voci(i).length === 1 &&
    voci(i)[0] === "A|Maria|Rossi|1985-12-10|RSSMRA85T10A562S" &&
    i.ordine.purchase_units[0].amount.value === "10.00"
);

console.log(`\n${passate} passate, ${fallite} fallite\n`);
process.exit(fallite ? 1 : 0);
