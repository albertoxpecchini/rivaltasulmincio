/* ═══════════════════════════════════════════════════════════════════════════
   _build/fatture-in-bozza.mjs — chi è iscritto ma la cui fattura è rimasta
   indietro.

   Nasce il 16 settembre 2026, quattro giorni prima della Color Walk, la sera
   in cui PayPal ha cominciato a rifiutare ogni `/send` con un rifiuto muto.
   Da quel momento l'iscrizione tira dritto lo stesso — chi si iscrive entra e
   chi paga paga — ma la fattura resta bozza, e su una bozza il pagamento non
   si può segnare. Questo elenco serve a sapere quante sono e di chi, per
   rimetterle a posto quando PayPal torna a volerlo.

   NON TOCCA NIENTE. Legge e stampa, e basta: si può lanciare in mezzo alle
   iscrizioni senza il timore di spostare qualcosa. Per spedire davvero le
   fatture c'è `--spedisci`, che va chiesto a voce alta.

   Si lancia dalla radice del progetto, con le chiavi VERE nell'ambiente:

     PAYPAL_CLIENT_ID=… PAYPAL_CLIENT_SECRET=… node _build/fatture-in-bozza.mjs

   Il `.env` di questa cartella punta alla sandbox e non serve a niente qui:
   le iscrizioni vere stanno sul conto live, e vanno chieste a quello. */

import { tutteLeFatture, spedisciFattura, leggiMemo } from "../api/_paypal.mjs";

const SPEDISCI = process.argv.includes("--spedisci");

/* Lo stato che ci interessa è uno solo: `DRAFT`. È quello che `/send` non è
   riuscito a cambiare, ed è quello su cui né il webhook né il tasto «segna
   incassati» possono scrivere. Tutto il resto — spedite, pagate, annullate —
   sta già dove deve stare. */
const bozza = (f) => String(f?.status || "") === "DRAFT";

const euro = (f) => {
  const v = f?.amount?.value ?? f?.detail?.total_amount?.value;
  return v ? `${v} €` : "—";
};

const chi = (f) => {
  const b = f?.primary_recipients?.[0]?.billing_info || {};
  const nome = [b.name?.given_name, b.name?.surname].filter(Boolean).join(" ");
  return { nome: nome || "(senza nome)", email: b.email_address || "(senza indirizzo)" };
};

async function principale() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("Mancano PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET — e servono quelle VERE, non la sandbox.");
    process.exit(1);
  }

  const tutte = await tutteLeFatture();
  const ferme = tutte.filter(bozza);

  console.log(`\nFatture in tutto: ${tutte.length} — rimaste in bozza: ${ferme.length}\n`);

  if (!ferme.length) {
    console.log("Nessuna bozza: non c'è niente da rimettere a posto.\n");
    return;
  }

  /* Il modo di pagare cambia cosa vuol dire trovarla qui, e va detto perché
     sono due guasti diversi: per i contanti la bozza è il tasto «segna
     incassati» che non funziona; per l'online è un pagamento che può essere
     già arrivato senza che la fattura lo sappia. */
  for (const f of ferme) {
    const { nome, email } = chi(f);
    const { modalita } = leggiMemo(f?.detail?.memo);
    const numero = f?.detail?.invoice_number || "(senza numero)";
    console.log(`  ${numero}  ${euro(f).padStart(8)}  ${(modalita || "?").padEnd(8)}  ${nome} <${email}>`);
  }

  const contanti = ferme.filter((f) => leggiMemo(f?.detail?.memo).modalita === "contanti").length;
  console.log(`\n  di cui in contanti: ${contanti} — online: ${ferme.length - contanti}\n`);

  if (!SPEDISCI) {
    console.log("Per provare a spedirle davvero: aggiungere --spedisci\n");
    return;
  }

  console.log("Spedizione in corso…\n");
  let fatte = 0;
  for (const f of ferme) {
    const numero = f?.detail?.invoice_number || f.id;
    try {
      await spedisciFattura(f.id);
      fatte++;
      console.log(`  ✓ ${numero}`);
    } catch (errore) {
      console.log(`  ✗ ${numero} — ${errore.message}`);
    }
  }
  console.log(`\nSpedite: ${fatte} su ${ferme.length}.\n`);
}

principale().catch((errore) => {
  console.error(`\nNon è riuscito: ${errore.message}\n`);
  process.exit(1);
});
