/* ═══════════════════════════════════════════════════════════════════════════
   Prova di spedizione VERA — `node prova-invio.mjs tuo@indirizzo.it`

   prova-conferma.mjs risponde alla domanda «la funzione decide giusto?» con
   Stripe e la posta finti. Questo file risponde all'altra metà, quella che
   nessuna finzione può coprire: la mail esce davvero da Resend, arriva, e in
   Gmail e su un telefono si vede come deve.

   Manda una mail sola, all'indirizzo che gli si dà, con dati inventati.
   Non tocca Stripe, non tocca pagamenti, non tocca iscritti: prende gli
   stessi due modelli e la stessa funzione di spedizione che usa il webhook —
   importati da api/conferma-color-walk.mjs, non ricopiati — così quello che
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
import { spedisci, riempi, bloccoRisotto, coperti, MODELLO_RICEVUTA, MODELLO_FALLITA, ORGANIZZATORI } from "./api/conferma-color-walk.mjs";

const a = process.argv[2];
const quale = (process.argv[3] || "ricevuta").toLowerCase();
/* Quarto argomento: quanti coperti alla risottata. 0 (o assente) = non
   prenotata. Serve a vedere nella prova le due righe della ricevuta. */
const risottoN = Math.min(10, Math.max(0, Math.floor(Number(process.argv[4])) || 0));

if (!a || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) {
  console.error(`
  Uso:  node prova-invio.mjs <indirizzo> [ricevuta|fallita] [coperti risottata]

    node prova-invio.mjs io@example.it              la ricevuta, risottata non prenotata
    node prova-invio.mjs io@example.it ricevuta 3   la ricevuta, risottata per 3
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
        oggetto: "[PROVA] Iscrizione non completata — Color Walk, 20 settembre",
        html: riempi(MODELLO_FALLITA, {
          NOME: "Rebecca",
          MOTIVO: "la pagina di pagamento si è chiusa prima che il pagamento fosse completato.",
        }),
        testo:
          "PROVA. Ciao Rebecca, il pagamento della quota della Color Walk non è " +
          "andato a buon fine. Non ti abbiamo preso niente.",
      }
    : {
        oggetto: "[PROVA] Iscrizione confermata — Color Walk, 20 settembre",
        html: riempi(MODELLO_RICEVUTA, {
          NOME: "Rebecca",
          DATA: data,
          IMPORTO_QUOTA: "10,00 €",
          IMPORTO_COMMISSIONI: "1,00 €",
          IMPORTO: "11,00 €",
        }).replace("{{RISOTTO}}", () => bloccoRisotto(risottoN)),
        testo:
          "PROVA. Ciao Rebecca, la tua iscrizione alla Color Walk del 20 settembre " +
          `è registrata e la quota è pagata. 10,00 € di quota + 1,00 € di commissioni di servizio = 11,00 € il ${data}.

` +
          (risottoN
            ? `Risottata finale: prenotata, ${coperti(risottoN)} a tuo nome.`
            : "Risottata finale: non prenotata."),
      };

console.log(`
  mittente     ${process.env.POSTA_MITTENTE || "(predefinito: color-walk@rivaltasulmincio.it)"}
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
