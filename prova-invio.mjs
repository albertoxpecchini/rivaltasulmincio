/* ═══════════════════════════════════════════════════════════════════════════
   Prova di spedizione VERA — `node prova-invio.mjs tuo@indirizzo.it`

   prova-conferma.mjs risponde alla domanda «la funzione decide giusto?» con
   PayPal e la posta finti. Questo file risponde all'altra metà, quella che
   nessuna finzione può coprire: la mail esce davvero da Resend, arriva, e in
   Gmail e su un telefono si vede come deve.

   Manda una mail sola, all'indirizzo che gli si dà, con dati inventati.
   Non tocca PayPal, non tocca pagamenti, non tocca iscritti: parte da una
   fattura finta e passa dalla stessa funzione che compone le mail vere —
   `ricevuta()` di api/_posta.mjs, importata e non ricopiata — così quello
   che si vede arrivare è esattamente quello che arriverà a chi si iscrive.

   Tre mail da provare, e vanno provate tutte e tre:

     ricevuta    chi ha pagato online
     contanti    chi paga al ritrovo — quella che DEVE dire che non è pagata
     fallita     chi non è arrivato in fondo al pagamento

   Serve la chiave di Resend nell'ambiente della propria shell:

     PowerShell   $env:RESEND_API_KEY = "re_…"
     bash         export RESEND_API_KEY="re_…"

   e, se in Resend è verificato un sottodominio invece del dominio nudo,
   anche POSTA_MITTENTE con lo stesso indirizzo che si metterà su Vercel.

   Va fatto girare PRIMA che si iscriva qualcuno davvero: è l'unico modo di
   scoprire un mittente rifiutato senza che il conto lo paghi il primo che
   tira fuori dieci euro.

   Non gira su Vercel: sta in .vercelignore insieme a build.mjs e serve.mjs.
   ═══════════════════════════════════════════════════════════════════════════ */
import { spedisci, riempi, ricevuta, MODELLO_FALLITA, ORGANIZZATORI } from "./api/_posta.mjs";

const a = process.argv[2];
const quale = (process.argv[3] || "ricevuta").toLowerCase();

if (!a || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) {
  console.error(`
  Uso:  node prova-invio.mjs <indirizzo> [ricevuta|contanti|fallita]

    node prova-invio.mjs io@example.it              la ricevuta di chi ha pagato
    node prova-invio.mjs io@example.it contanti     chi paga al ritrovo
    node prova-invio.mjs io@example.it fallita      l'avviso di mancato pagamento
`);
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error(`
  Manca RESEND_API_KEY nell'ambiente.

    PowerShell   $env:RESEND_API_KEY = "re_…"
    bash         export RESEND_API_KEY="re_…"
`);
  process.exit(1);
}

/* Una fattura come quella che scrive api/_paypal.mjs: una maggiorenne più due
   minori a carico, 20 € in tutto. Un gruppo e non una persona sola, perché è
   il caso in cui la mail ha più cose da sbagliare — l'elenco dei nomi e la
   riga della seconda fascia. */
const voce = (ruolo, nome, cognome, nascita, cf, euro) => ({
  name: `${nome} ${cognome} — ${ruolo === "A" ? "maggiorenne" : "dai 6 ai 17 anni"}`,
  description: [ruolo, nome, cognome, nascita, cf].join("|"),
  quantity: "1",
  unit_amount: { currency_code: "EUR", value: euro },
});

const FATTURA = {
  items: [
    voce("A", "Rebecca", "Rossi", "1985-03-11", "RSSRCC85C51F205X", "10.00"),
    voce("M", "Luca", "Rossi", "2015-04-02", "—", "5.00"),
    voce("M", "Anna", "Rossi", "2018-11-20", "—", "5.00"),
  ],
};

let mail;

if (quale === "fallita") {
  mail = {
    oggetto: "[PROVA] Iscrizione non completata — Color Walk, 20 settembre",
    html: riempi(MODELLO_FALLITA, {
      NOME: "Rebecca",
      MOTIVO: "il pagamento non è stato completato.",
    }),
    testo:
      "PROVA. Ciao Rebecca, il pagamento della quota della Color Walk non è " +
      "andato a buon fine. Non ti abbiamo preso niente.",
  };
} else {
  const composta = ricevuta({ fattura: FATTURA, pagato: quale !== "contanti" });
  mail = {
    oggetto: "[PROVA] " + composta.oggetto,
    html: composta.html,
    testo: "PROVA — " + composta.testo,
  };
}

console.log(`
  mittente     ${process.env.POSTA_MITTENTE || "(predefinito: color-walk@rivaltasulmincio.it)"}
  rispondi a   ${ORGANIZZATORI || "(nessuno — _build/email/evento.json è ancora senza organizzatori)"}
  a            ${a}
  modello      ${quale === "fallita" ? "mancato pagamento" : quale === "contanti" ? "iscritto, da pagare al ritrovo" : "ricevuta"}
`);

try {
  const id = await spedisci({ a, ...mail });
  console.log(`  ✓ consegnata a Resend${id ? ` (id ${id})` : ""}.`);
  console.log(`    Guardala su un telefono e in Gmail, non solo sul portatile:`);
  console.log(`    è lì che le mail si rompono.\n`);
} catch (errore) {
  console.error(`\n  ✗ non spedita: ${errore.message}\n`);
  process.exit(1);
}
