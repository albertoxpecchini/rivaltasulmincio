/* ═══════════════════════════════════════════════════════════════════════════
   Prova di spedizione VERA — `node prova-invio.mjs tuo@indirizzo.it`

   prova-conferma.mjs risponde alla domanda «la funzione decide giusto?» con
   Stripe e la posta finti. Questo file risponde all'altra metà, quella che
   nessuna finzione può coprire: la mail esce davvero da Resend, arriva, e in
   Gmail e su un telefono si vede come deve.

   Manda una mail sola, all'indirizzo che gli si dà, con dati inventati.
   Non tocca Stripe, non tocca pagamenti, non tocca iscritti: prende gli
   stessi due modelli e la stessa funzione di spedizione che usa il webhook —
   importati da api/conferma-color-runner.mjs, non ricopiati — così quello che
   si vede arrivare è esattamente quello che arriverà a chi paga.

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
import { spedisci, riempi, MODELLO_RICEVUTA, MODELLO_FALLITA, ORGANIZZATORI } from "./api/conferma-color-runner.mjs";

const a = process.argv[2];
const quale = (process.argv[3] || "ricevuta").toLowerCase();

if (!a || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) {
  console.error(`
  Uso:  node prova-invio.mjs <indirizzo> [ricevuta|fallita]

    node prova-invio.mjs io@example.it            la ricevuta di chi ha pagato
    node prova-invio.mjs io@example.it fallita    l'avviso di mancato pagamento
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

/* Gli stessi valori che il webhook calcola dalla sessione di Stripe, qui
   scritti a mano. La data è adesso, formattata come la formatta lui. */
const data = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Rome",
}).format(new Date());

const mail =
  quale === "fallita"
    ? {
        oggetto: "[PROVA] Iscrizione non completata — Color Runner, 20 settembre",
        html: riempi(MODELLO_FALLITA, {
          NOME: "Rebecca",
          MOTIVO: "la pagina di pagamento si è chiusa prima che il pagamento fosse completato.",
        }),
        testo:
          "PROVA. Ciao Rebecca, il pagamento della quota della Color Runner non è " +
          "andato a buon fine. Non ti abbiamo preso niente.",
      }
    : {
        oggetto: "[PROVA] Iscrizione confermata — Color Runner, 20 settembre",
        html: riempi(MODELLO_RICEVUTA, { NOME: "Rebecca", DATA: data, IMPORTO: "10,00 €" }),
        testo:
          "PROVA. Ciao Rebecca, la tua iscrizione alla Color Runner del 20 settembre " +
          `è registrata e la quota è pagata. 10,00 € il ${data}.`,
      };

console.log(`
  mittente     ${process.env.POSTA_MITTENTE || "(predefinito: color-runner@rivaltasulmincio.it)"}
  rispondi a   ${ORGANIZZATORI || "(nessuno — _build/email/evento.json è ancora senza organizzatori)"}
  a            ${a}
  modello      ${quale === "fallita" ? "mancato pagamento" : "ricevuta"}
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
