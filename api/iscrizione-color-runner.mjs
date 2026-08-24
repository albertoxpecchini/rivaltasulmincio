/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscrizione-color-runner — crea una sessione di pagamento Stripe per
   l'iscrizione alla Color Runner del 20 settembre.

   Bozza di lavoro: quota, valuta e descrizione sono placeholder finché il
   gruppo del Palio non conferma i dettagli — sono le tre costanti qui sotto,
   l'unico punto da toccare quando arrivano i numeri definitivi.

   Chiama direttamente l'API REST di Stripe via fetch, senza il pacchetto
   npm `stripe`: stesso principio di zero-dipendenze del resto del sito,
   stesso stile di /api/meteo.mjs. I dati del modulo (nome, cognome,
   telefono, note) viaggiano come metadata della sessione: compaiono così
   nel dashboard Stripe accanto al pagamento, senza bisogno di un database
   o un foglio a parte.

   La chiave segreta vive solo in una variabile d'ambiente su Vercel
   (STRIPE_SECRET_KEY) — non è mai scritta qui né altrove nel repo.
   ═══════════════════════════════════════════════════════════════════════════ */

const QUOTA_CENT = 1000; // 10,00 € — placeholder, da confermare col gruppo del Palio
const VALUTA = "eur";
const DESCRIZIONE_PRODOTTO = "Iscrizione Color Runner — 20 settembre";

const SITE = "https://www.rivaltasulmincio.it";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pulisci = (v, max) => String(v ?? "").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  const chiave = process.env.STRIPE_SECRET_KEY;
  if (!chiave) {
    return res.status(500).json({ errore: "pagamento non ancora configurato" });
  }

  const nome = pulisci(req.body?.nome, 80);
  const cognome = pulisci(req.body?.cognome, 80);
  const email = pulisci(req.body?.email, 200);
  const telefono = pulisci(req.body?.telefono, 40) || "—";
  const note = pulisci(req.body?.note, 300) || "—";

  if (!nome || !cognome || !EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "nome, cognome o email mancanti o non validi" });
  }

  /* Stripe Checkout vuole i parametri in x-www-form-urlencoded, con la
     notazione a parentesi quadre per gli oggetti annidati (line_items,
     price_data, metadata): è la stessa forma richiesta a chi lo chiama da
     curl o da un backend senza SDK. */
  const parametri = new URLSearchParams();
  parametri.set("mode", "payment");
  parametri.set("customer_email", email);
  parametri.set("success_url", `${SITE}/color-runner?stato=ok`);
  parametri.set("cancel_url", `${SITE}/color-runner?stato=annullato`);
  parametri.set("line_items[0][quantity]", "1");
  parametri.set("line_items[0][price_data][currency]", VALUTA);
  parametri.set("line_items[0][price_data][unit_amount]", String(QUOTA_CENT));
  parametri.set("line_items[0][price_data][product_data][name]", DESCRIZIONE_PRODOTTO);
  parametri.set("metadata[nome]", nome);
  parametri.set("metadata[cognome]", cognome);
  parametri.set("metadata[telefono]", telefono);
  parametri.set("metadata[note]", note);

  try {
    const risposta = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${chiave}:`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: parametri.toString(),
      signal: AbortSignal.timeout(10000),
    });

    const dati = await risposta.json();
    if (!risposta.ok) throw new Error(dati?.error?.message || `Stripe ha risposto ${risposta.status}`);

    return res.status(200).json({ url: dati.url });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}
