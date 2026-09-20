/* ═══════════════════════════════════════════════════════════════════════════
   api/_posta-sagra.mjs — la mail di conferma della prenotazione al risotto.

   Non è un endpoint: il trattino basso davanti al nome dice a Vercel di non
   farne una funzione.

   Sta separata da api/_posta.mjs, che è quella della Color Walk, per una
   ragione sola: quella è lunga, piena di ricevute, quote e stati del
   pagamento, e i suoi modelli li genera il build da _build/email/. Qui non
   c'è niente da pagare e il messaggio è corto — sei righe e un riepilogo.
   Infilarlo là dentro voleva dire toccare un file che funziona per
   aggiungerci un caso che non c'entra.

   ── Il mittente ──────────────────────────────────────────────────────────
   POSTA_MITTENTE_SAGRA se c'è; se no quello della Color Walk, che è già
   verificato su Resend. Un dominio verificato è quello che decide se la mail
   arriva o finisce nello spam, quindi meglio riusare quello buono che
   inventarne uno che nessuno ha configurato.
   ═══════════════════════════════════════════════════════════════════════════ */

const MITTENTE_PREDEFINITO =
  process.env.POSTA_MITTENTE ||
  "Rivalta sul Mincio <color-walk@rivaltasulmincio.it>";

const ATTESA_MS = 6000;

const scampa = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* «1 coperto», «4 coperti»: la mail la legge una persona, non un modulo. */
const coperti = (n) => `${n} ${n === 1 ? "coperto" : "coperti"}`;

export function modelloConferma({ nome, cognome, coperti: quanti, id }) {
  const chi = `${nome} ${cognome}`.trim();
  const quantiTesto = coperti(quanti);

  const testo = [
    `Ciao ${nome},`,
    ``,
    `la tua prenotazione per il risotto della Sagra dei Patroni è registrata.`,
    ``,
    `  Quando   sabato 26 settembre 2026, a seguire dopo la regata delle 18:00`,
    `  Dove     Rivalta sul Mincio`,
    `  Coperti  ${quantiTesto}`,
    `  A nome   ${chi}`,
    ``,
    `Il risotto è offerto dall'AVIS di Rivalta: non c'è niente da pagare.`,
    ``,
    `Se cambia il numero delle persone, o se non riuscite più a venire,`,
    `rispondi a questa mail: chi cucina conta su questi numeri.`,
    ``,
    `Il programma dei due giorni: https://www.rivaltasulmincio.it/sagra-patroni`,
    ``,
    id ? `Prenotazione n. ${id}` : ``,
  ].join("\n");

  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prenotazione registrata — Sagra dei Patroni</title>
</head>
<body style="margin:0; padding:24px 12px; background:#f6f3ef; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#1a1614;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#fcfbf9; border:1px solid #e9e4dc; border-radius:12px;">
    <tr><td style="padding:26px 26px 6px;">
      <p style="margin:0 0 2px; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:#7a1f34; font-weight:600;">Sagra dei Patroni</p>
      <h1 style="margin:0 0 14px; font-size:22px; font-weight:600; line-height:1.25; color:#1a1614;">Prenotazione registrata</h1>
      <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#554d46;">Ciao ${scampa(nome)}, la tua prenotazione per il <strong style="color:#1a1614;">risotto</strong> è a posto.</p>
    </td></tr>
    <tr><td style="padding:0 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f3ef; border-radius:10px;">
        <tr><td style="padding:16px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px; line-height:1.6;">
            <tr><td style="padding:3px 0; color:#726960; width:92px;">Quando</td><td style="padding:3px 0; color:#1a1614;"><strong>Sabato 26 settembre 2026</strong><br><span style="color:#726960;">a seguire, dopo la regata delle 18:00</span></td></tr>
            <tr><td style="padding:3px 0; color:#726960;">Dove</td><td style="padding:3px 0; color:#1a1614;">Rivalta sul Mincio</td></tr>
            <tr><td style="padding:3px 0; color:#726960;">Coperti</td><td style="padding:3px 0; color:#1a1614;"><strong>${scampa(quantiTesto)}</strong></td></tr>
            <tr><td style="padding:3px 0; color:#726960;">A nome</td><td style="padding:3px 0; color:#1a1614;">${scampa(chi)}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 26px 4px;">
      <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#554d46;">Il risotto è <strong style="color:#1a1614;">offerto dall'AVIS di Rivalta</strong>: non c'è niente da pagare.</p>
      <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#554d46;">Se cambia il numero delle persone, o se non riuscite più a venire, <strong style="color:#1a1614;">rispondi a questa mail</strong>: chi cucina conta su questi numeri.</p>
      <p style="margin:0 0 18px; font-size:14px; line-height:1.6;"><a href="https://www.rivaltasulmincio.it/sagra-patroni" style="color:#7a1f34; font-weight:600;">Il programma dei due giorni</a></p>
    </td></tr>
    <tr><td style="padding:0 26px 22px; border-top:1px solid #e9e4dc;">
      <p style="margin:12px 0 0; font-size:12px; line-height:1.55; color:#948a7d;">${id ? `Prenotazione n. ${scampa(id)} · ` : ""}rivaltasulmincio.it</p>
    </td></tr>
  </table>
</body></html>`;

  return { oggetto: `Prenotazione registrata — risotto della Sagra, ${quantiTesto}`, html, testo };
}

export async function spedisciConfermaSagra(dati) {
  const chiave = process.env.RESEND_API_KEY;
  if (!chiave) throw new Error("RESEND_API_KEY non configurata");

  const mittente = process.env.POSTA_MITTENTE_SAGRA || MITTENTE_PREDEFINITO;
  const { oggetto, html, testo } = modelloConferma(dati);

  const risposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mittente,
      to: [dati.email],
      subject: oggetto,
      html,
      text: testo,
      /* «Rispondi a questa mail» dev'essere vero: se l'indirizzo degli
         organizzatori c'è, le risposte vanno lì. */
      ...(process.env.POSTA_ORGANIZZATORI
        ? { reply_to: process.env.POSTA_ORGANIZZATORI }
        : {}),
    }),
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  const esito = await risposta.json().catch(() => ({}));
  if (!risposta.ok) {
    throw new Error(`Resend ${risposta.status}: ${JSON.stringify(esito).slice(0, 200)}`);
  }
  return esito?.id || "";
}
