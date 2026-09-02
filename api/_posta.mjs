/* ═══════════════════════════════════════════════════════════════════════════
   api/_posta.mjs — le mail della Color Walk: i modelli, e la porta da cui
   escono.

   Non è un endpoint: il trattino basso davanti al nome dice a Vercel di non
   farne una funzione.

   Stavano dentro api/conferma-color-walk.mjs, quando il webhook era l'unico
   posto da cui partisse una mail. Non lo è più: chi sceglie di pagare in
   contanti al ritrovo riceve la sua mail direttamente da
   api/iscrizione-color-walk.mjs, nel momento in cui compila il modulo, senza
   che nessun pagamento debba succedere prima. Due funzioni che spediscono, un
   solo posto in cui è scritto come — e soprattutto un solo posto in cui i
   modelli esistono, così una correzione al testo vale per tutte e due.

   ── I modelli non si scrivono qui ────────────────────────────────────────
   Il blocco in fondo, fra i due marcatori, lo genera `node build.mjs` a
   partire da _build/email/. Si modifica l'HTML di là e si rifà il build:
   modificarlo qui non serve, il build successivo lo riscrive.

   Il giro esiste perché _build/ è in .vercelignore — su Vercel quei file non
   arrivano — e perché una mail si guarda aprendola nel browser, non
   leggendola dentro una stringa.

   ── Da mettere a mano, su Vercel ─────────────────────────────────────────
     RESEND_API_KEY   la chiave del servizio che spedisce
     POSTA_MITTENTE   (facoltativa) l'indirizzo del mittente
   ═══════════════════════════════════════════════════════════════════════════ */

import { personeDa, QUOTA_ADULTO_CENT } from "./_paypal.mjs";

const MITTENTE_PREDEFINITO = "Color Walk — Rivalta sul Mincio <color-walk@rivaltasulmincio.it>";

const ATTESA_MS = 6000;

export async function spedisci({ a, oggetto, html, testo }) {
  const chiave = process.env.RESEND_API_KEY;
  if (!chiave) throw new Error("RESEND_API_KEY non configurata");

  const mittente = process.env.POSTA_MITTENTE || MITTENTE_PREDEFINITO;

  const risposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mittente,
      to: [a],
      subject: oggetto,
      html,
      text: testo,
      /* Il piede delle mail dice «rispondi pure a questo messaggio»: se un
         indirizzo degli organizzatori c'è, quella frase deve essere vera. */
      ...(ORGANIZZATORI ? { reply_to: ORGANIZZATORI } : {}),
    }),
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  const dati = await risposta.json().catch(() => ({}));
  if (risposta.ok) return dati?.id || "";

  /* Il rifiuto più probabile, e il più insidioso perché non si legge da sé:
     il dominio del mittente non è fra quelli verificati. Succede quando in
     Resend si verifica un sottodominio (send.rivalta…) e POSTA_MITTENTE è
     rimasto sul dominio nudo, o viceversa. Detto così si aggiusta leggendo
     il log; detto com'era, si apriva un'indagine. */
  const nota =
    risposta.status === 403 || risposta.status === 422
      ? ` — mittente rifiutato: «${mittente}». Il dominio dopo la @ dev'essere` +
        ` esattamente uno di quelli verificati in Resend → Domains. Si corregge` +
        ` con la variabile POSTA_MITTENTE su Vercel (e un rideploy).`
      : "";

  throw new Error((dati?.message || `il servizio di posta ha risposto ${risposta.status}`) + nota);
}

/* ── Riempire un modello ──────────────────────────────────────────────────
   I nomi arrivano da un modulo pubblico e finiscono dentro dell'HTML: chi
   scrive `<b>` nel campo nome deve vedersi arrivare `<b>`, non del grassetto,
   e chi ci prova con qualcosa di peggio non deve combinare niente. */
export const escape = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ── I pezzi che ci sono solo a volte ────────────────────────────────────
   <!--se:chiave--> … <!--/se--> : un blocco che resta o sparisce a seconda
   di com'è fatta questa singola iscrizione. Non è lo stesso meccanismo delle
   sezioni di build.mjs — quelle dipendono da evento.json, uguale per tutti, e
   si decidono una volta sola quando si compila il modello. Queste dipendono
   da chi ha compilato il modulo: la riga dei 6-17 anni esiste nella ricevuta
   di una famiglia e non in quella di chi cammina da solo, e le righe del
   «pagato» esistono al posto di quelle del «da pagare al ritrovo». */
export function condiziona(modello, condizioni) {
  let html = modello;
  for (const [chiave, tienilo] of Object.entries(condizioni)) {
    const blocco = new RegExp(`[ \\t]*<!--se:${chiave}-->\\r?\\n?([\\s\\S]*?)<!--/se-->\\r?\\n?`, "g");
    html = html.replace(blocco, (_, dentro) => (tienilo ? dentro : ""));
  }
  return html;
}

export function riempi(modello, valori) {
  let html = modello;
  for (const [chiave, valore] of Object.entries(valori)) {
    html = html.split(`{{${chiave}}}`).join(escape(valore));
  }
  /* Rete di sicurezza per un caso che non dovrebbe darsi — il nome è
     obbligatorio nel modulo: senza, resterebbe «Ciao , la tua iscrizione». */
  return html.replace(/Ciao <strong[^>]*>\s*<\/strong>,\s*/, "Ciao, ");
}

/* ── La ricevuta, composta una volta sola ─────────────────────────────────
   La stessa mail la spediscono in due: il webhook quando l'incasso online è
   andato a buon fine, e l'iscrizione quando qualcuno sceglie di pagare in
   contanti al ritrovo. Cambia una cosa — se quei soldi ci sono già o no — e
   tutto il resto è identico: chi è iscritto, le quote per fascia, il totale,
   il giorno e il luogo.

   Comporla qui, e non due volte nei due chiamanti, è quello che impedisce
   alle due mail di divergere: il giorno che si corregge una cifra o una
   frase, si corregge per tutti e due.

   Nome, quote e importi non vengono passati da chi chiama: si rileggono
   dalla fattura, che è il posto dove sono scritti. Una ricevuta che
   raccontasse numeri diversi da quelli che l'organizzatore vede in elenco
   sarebbe peggio di una ricevuta che non parte. */
export function ricevuta({ fattura, pagato, quando }) {
  const { adulto, minori } = personeDa(fattura);
  const nome = adulto?.nome || "";

  const centAdulto = adulto?.importoCent ?? QUOTA_ADULTO_CENT;
  const centRagazzi = minori.reduce((s, m) => s + m.importoCent, 0);
  const totale = centAdulto + centRagazzi;

  const voceAdulti = "Iscrizione — 1 maggiorenne";
  const voceRagazzi = `Iscrizione — ${minori.length} ${minori.length === 1 ? "ragazzo" : "ragazzi"} dai 6 ai 17 anni`;

  const importoAdulti = importoItaliano(centAdulto);
  const importoRagazzi = importoItaliano(centRagazzi);
  const importo = importoItaliano(totale);
  const data = dataItaliana(quando);

  const partecipanti = [adulto, ...minori]
    .filter(Boolean)
    .map((p) => `${p.nome} ${p.cognome}`.trim())
    .filter(Boolean)
    .join(" · ");

  const html = riempi(
    condiziona(MODELLO_RICEVUTA, { ragazzi: minori.length > 0, pagato, daPagare: !pagato }),
    {
      NOME: nome,
      DATA: data,
      PARTECIPANTI: partecipanti,
      VOCE_ADULTI: voceAdulti,
      IMPORTO_ADULTI: importoAdulti,
      VOCE_RAGAZZI: voceRagazzi,
      IMPORTO_RAGAZZI: importoRagazzi,
      IMPORTO: importo,
    }
  );

  /* La versione senza HTML non è un ripiego per i client vecchi: è quello
     che leggono gli assistenti vocali e quello che resta se le immagini e
     gli stili non arrivano. Dice le stesse cose nello stesso ordine. */
  const testo =
    `Ciao ${nome}, ` +
    (pagato
      ? "la tua iscrizione alla Color Walk del 20 settembre è registrata e il pagamento è andato a buon fine.\n\n"
      : "la tua iscrizione alla Color Walk del 20 settembre è registrata e il tuo posto è tenuto. " +
        "LA QUOTA NON È ANCORA PAGATA: hai scelto di pagarla in contanti al ritrovo, prima della partenza.\n\n") +
    `${voceAdulti}: ${importoAdulti}\n` +
    (minori.length ? `${voceRagazzi}: ${importoRagazzi}\n` : "") +
    (pagato
      ? `Totale, pagato con PayPal il ${data}: ${importo}\n\n`
      : `Da pagare al ritrovo, in contanti: ${importo}\n\n` +
        `Porta ${importo} in contanti e cercaci al banchetto delle iscrizioni: si paga lì, prima di partire. ` +
        `Se possibile porta la cifra giusta, il resto al banchetto è sempre poco.\n\n`) +
    `Chi è iscritto: ${partecipanti}\n\n` +
    `La quota va per intero all'Associazione San Filippo Neri ANSPI APS-ETS ` +
    `di Rodigo, che organizza la camminata.\n\n` +
    `Questa mail è la tua ${pagato ? "conferma" : "iscrizione"}: tienila, non serve stamparla.\n` +
    `Ci vediamo il 20!\n\n` +
    `Il gruppo del Palio delle Contrade — Rivalta sul Mincio\nhttps://www.rivaltasulmincio.it`;

  return {
    oggetto: pagato
      ? "Iscrizione confermata — Color Walk, 20 settembre"
      : "Iscrizione registrata, quota da pagare al ritrovo — Color Walk, 20 settembre",
    html,
    testo,
    nome,
    persone: 1 + minori.length,
    totaleCent: totale,
  };
}

export const dataItaliana = (quando) =>
  new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(quando ? new Date(quando) : new Date());

export const importoItaliano = (centesimi) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format((centesimi || 0) / 100);

/* ═══════════════════════════════════════════════════════════════════════════
   I modelli, compilati da `node build.mjs` a partire da _build/email/.
   Tutto quello che sta fra i marcatori è generato: si modifica l'HTML di là.
   ═══════════════════════════════════════════════════════════════════════════ */
/* build:modelli:inizio */
/* Generato da build.mjs — NON modificare a mano.
   I sorgenti sono _build/email/ricevuta-color-walk.html,
   _build/email/fallita-color-walk.html e _build/email/evento.json. */

export const ORGANIZZATORI = "color-walk@rivaltasulmincio.it";

export const MODELLO_RICEVUTA = `<!DOCTYPE html>
<html lang="it" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Iscrizione confermata — Color Walk, 20 settembre</title>


<style>
  /* Il tema scuro nativo del sito, per i client che lo sanno leggere (Apple
     Mail, iOS). Gli stili in linea vincono sempre, quindi qui serve
     !important. Gmail ignora questo blocco e inverte i colori per conto suo:
     è un limite del client, non una cosa che si aggiusta scrivendo meglio. */
  @media (prefers-color-scheme: dark) {
    .e-ground  { background: #141414 !important; }
    .e-card    { background: #1c1c1c !important; border-color: #343434 !important; }
    .e-sub     { background: #222222 !important; border-color: #343434 !important; }
    .e-fg      { color: #ededed !important; }
    .e-fg-l    { color: #b4b4b4 !important; }
    .e-fg-lr   { color: #969696 !important; }
    .e-fg-m    { color: #707070 !important; }
    .e-brand   { color: #1abeff !important; }
    .e-rule    { border-color: #2a2a2a !important; background: #2a2a2a !important; }
    .e-btn     { background: #004261 !important; border-color: #1abeff !important; }
    .e-btn a   { color: #ffffff !important; }
  }
  /* Su schermo stretto la lastra respira meno ai lati e la riga
     voce/importo del riepilogo va a capo invece di stringersi. */
  @media only screen and (max-width: 620px) {
    .e-pad     { padding-left: 22px !important; padding-right: 22px !important; }
    .e-stack   { display: block !important; width: 100% !important; text-align: left !important; }
    .e-stack-r { padding-top: 4px !important; }
  }
  a { text-decoration: none; }
</style>
</head>

<body class="e-ground" style="margin:0; padding:0; background:#f0f0f0; -webkit-font-smoothing:antialiased;">

<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
<!--se:pagato-->
  La tua iscrizione alla Color Walk del 20 settembre è registrata e il pagamento è andato a buon fine.
<!--/se-->
<!--se:daPagare-->
  La tua iscrizione alla Color Walk del 20 settembre è registrata: la quota si paga al ritrovo, in contanti.
<!--/se-->
</div>

<table role="presentation" class="e-ground" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;">
<tr>
<td align="center" style="padding:32px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

    <tr>
    <td class="e-card" style="background:#fcfcfc; border:1px solid #dbdbdb; border-radius:12px; box-shadow:0 4px 20px -6px rgba(0,0,0,.1); clip-path:polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <tr>
        <td class="e-pad" style="padding:40px 40px 0;">
          <div class="e-brand" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:12px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#0a6285;">
<!--se:pagato-->
            Iscrizione confermata
<!--/se-->
<!--se:daPagare-->
            Iscrizione registrata — quota da pagare
<!--/se-->
          </div>
          <h1 class="e-fg" style="margin:12px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:28px; line-height:1.25; font-weight:600; color:#171717;">
            Color&nbsp;Walk — 20 settembre
          </h1>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:20px 40px 0;">
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:16px; line-height:1.6; color:#525252;">
<!--se:pagato-->
            Ciao <strong class="e-fg" style="color:#171717; font-weight:600;">{{NOME}}</strong>, la tua iscrizione è registrata e il pagamento è andato a buon fine. Questa mail è la tua conferma: tienila, non serve stamparla.
<!--/se-->
<!--se:daPagare-->
            Ciao <strong class="e-fg" style="color:#171717; font-weight:600;">{{NOME}}</strong>, la tua iscrizione è registrata e il tuo posto è tenuto. <strong class="e-fg" style="color:#171717; font-weight:600;">La quota non è ancora pagata</strong>: hai scelto di pagarla in contanti al ritrovo, prima della partenza. Questa mail è la tua iscrizione: tienila, non serve stamparla.
<!--/se-->
          </p>
        </td>
        </tr>



        <tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="e-sub" style="background:#f6f6f6; border:1px solid #e8e8e8; border-radius:10px; clip-path:polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);">
            <tr>
            <td style="padding:20px 22px;">

              <div class="e-fg-m" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#8f8f8f;">
<!--se:pagato-->
                Riepilogo del pagamento
<!--/se-->
<!--se:daPagare-->
                Riepilogo della quota
<!--/se-->
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                <tr>
                <td class="e-stack e-fg-l" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.5; color:#525252;">
                  {{VOCE_ADULTI}}
                </td>
                <td class="e-stack e-stack-r e-fg-l" align="right" style="font-family:'Roboto Mono','Courier New',monospace; font-size:15px; color:#525252; white-space:nowrap;">
                  {{IMPORTO_ADULTI}}
                </td>
                </tr>
              </table>
<!--se:ragazzi-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                <tr>
                <td class="e-stack e-fg-l" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.5; color:#525252;">
                  {{VOCE_RAGAZZI}}
                </td>
                <td class="e-stack e-stack-r e-fg-l" align="right" style="font-family:'Roboto Mono','Courier New',monospace; font-size:15px; color:#525252; white-space:nowrap;">
                  {{IMPORTO_RAGAZZI}}
                </td>
                </tr>
              </table>
<!--/se-->

              <div class="e-rule" style="height:1px; line-height:1px; font-size:0; background:#e8e8e8; margin:16px 0;">&nbsp;</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td class="e-stack e-fg" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; font-weight:600; line-height:1.5; color:#171717;">
<!--se:pagato-->
                  Totale
<!--/se-->
<!--se:daPagare-->
                  Da pagare al ritrovo
<!--/se-->
                </td>
                <td class="e-stack e-stack-r e-fg" align="right" style="font-family:'Roboto Mono','Courier New',monospace; font-size:17px; font-weight:700; color:#171717; white-space:nowrap;">
                  {{IMPORTO}}
                </td>
                </tr>
              </table>

              <div class="e-rule" style="height:1px; line-height:1px; font-size:0; background:#e8e8e8; margin:16px 0;">&nbsp;</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td class="e-fg-lr" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:13px; line-height:1.7; color:#6f6f6f;">
                  <span class="e-fg-m" style="color:#8f8f8f;">Chi è iscritto:</span> <span class="e-fg-l" style="color:#525252;">{{PARTECIPANTI}}</span><br>
<!--se:pagato-->
                  Pagato con PayPal il <span class="e-fg-l" style="color:#525252;">{{DATA}}</span> — il pagamento lo gestisce PayPal, il sito non vede né conserva i dati della carta. La quota va per intero all'Associazione San Filippo Neri ANSPI APS-ETS di Rodigo, che organizza la camminata.
<!--/se-->
<!--se:daPagare-->
                  Iscrizione registrata il <span class="e-fg-l" style="color:#525252;">{{DATA}}</span>. <strong class="e-fg" style="color:#171717; font-weight:600;">Porta {{IMPORTO}} in contanti</strong> e cercaci al banchetto delle iscrizioni: si paga lì, prima di partire. Se possibile porta la cifra giusta, il resto al banchetto è sempre poco. La quota va per intero all'Associazione San Filippo Neri ANSPI APS-ETS di Rodigo, che organizza la camminata.
<!--/se-->
                </td>
                </tr>
              </table>

            </td>
            </tr>
          </table>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:32px 40px 0;">
          <h2 class="e-fg" style="margin:0 0 10px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:17px; font-weight:600; color:#171717;">
            Dove e quando
          </h2>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Domenica 20 settembre — ritrovo alle <strong class="e-fg" style="color:#171717; font-weight:600;">15:30</strong> in <strong class="e-fg" style="color:#171717; font-weight:600;">Piazza Chiesa, davanti alla chiesa</strong>, partenza alle <strong class="e-fg" style="color:#171717; font-weight:600;">16:00</strong> per il giro del paese.<br>
            <span class="e-fg-lr" style="color:#6f6f6f;">Non è una gara: si cammina a passo libero, senza cronometro.</span><br>
            <span class="e-fg-lr" style="color:#6f6f6f;">A fine camminata, aperitivo in piazza per tutti: non si prenota, ci si ferma e si brinda.</span>
          </p>
        </td>
        </tr>


        <tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <h2 class="e-fg" style="margin:0 0 10px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:17px; font-weight:600; color:#171717;">
            Cosa portare
          </h2>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Una maglia bianca — è su quella che i colori si vedono — e vestiti e scarpe che possono macchiarsi per sempre. Utili occhiali da sole e una bandana per naso e bocca quando si attraversa una postazione di colore.<br>
            <span class="e-fg-lr" style="color:#6f6f6f;">Al ritrovo trovi: la sacca, il sacchetto di polveri colorate e, a fine camminata, l'aperitivo in piazza — tutto compreso nella quota</span>
          </p>
        </td>
        </tr>


        <tr>
        <td class="e-pad" style="padding:14px 40px 0;">
          <p class="e-fg-lr" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#6f6f6f;">
            Il resto — percorso e cosa portare — te lo scriviamo a questo stesso indirizzo appena è deciso. Non devi fare nulla: il tuo posto è già registrato.
          </p>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <h2 class="e-fg" style="margin:0 0 10px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:17px; font-weight:600; color:#171717;">
            Se non puoi più venire
          </h2>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Scrivici entro il <strong class="e-fg" style="color:#171717; font-weight:600;">13 settembre</strong>. La quota non si rimborsa, ma fino a sette giorni prima l'iscrizione si può passare a un'altra persona della stessa fascia d'età, senza costi. Se piove, la camminata è rinviata a domenica 27 settembre e l'iscrizione resta valida senza fare niente: chi a quella data non può esserci ci scrive entro il 25 settembre e la quota viene restituita.
          </p>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:30px 40px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td class="e-btn" style="background:#72c7e3; border:1px solid #2d94c1; border-radius:6px;">
              <a href="mailto:color-walk@rivaltasulmincio.it" style="display:inline-block; padding:10px 20px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:14px; font-weight:600; color:#101010;">
                Scrivi alle organizzatrici
              </a>
            </td>
            </tr>
          </table>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:30px 40px 40px;">
          <div class="e-rule" style="height:1px; line-height:1px; font-size:0; background:#e8e8e8; margin:0 0 22px;">&nbsp;</div>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Ci vediamo il 20!<br>
            <strong class="e-fg" style="color:#171717; font-weight:600;">Il gruppo del Palio delle Contrade</strong><br>
            <span class="e-fg-lr" style="color:#6f6f6f;">Rivalta sul Mincio</span>
          </p>
        </td>
        </tr>

      </table>
    </td>
    </tr>

    <tr>
    <td style="padding:22px 12px 0;" align="center">
      <p class="e-fg-m" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:12px; line-height:1.7; color:#8f8f8f;">
        Hai ricevuto questa mail perché ti sei iscritto alla Color Walk su
        <a class="e-brand" href="https://www.rivaltasulmincio.it" style="color:#0a6285;">rivaltasulmincio.it</a>.<br>
        Non è una lista di invio: non ti arriverà altro. Per qualsiasi cosa, rispondi pure a questo messaggio.
      </p>
      <p class="e-fg-m" style="margin:14px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:11px; line-height:1.6; color:#8f8f8f;">
        Questa è una conferma d'iscrizione, non una ricevuta fiscale.
      </p>
    </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
`;

export const MODELLO_FALLITA = `<!DOCTYPE html>
<html lang="it" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Iscrizione non completata — Color Walk, 20 settembre</title>


<style>
  @media (prefers-color-scheme: dark) {
    .e-ground  { background: #141414 !important; }
    .e-card    { background: #1c1c1c !important; border-color: #343434 !important; }
    .e-sub     { background: #222222 !important; border-color: #343434 !important; }
    .e-fg      { color: #ededed !important; }
    .e-fg-l    { color: #b4b4b4 !important; }
    .e-fg-lr   { color: #969696 !important; }
    .e-fg-m    { color: #707070 !important; }
    .e-brand   { color: #1abeff !important; }
    .e-rule    { border-color: #2a2a2a !important; background: #2a2a2a !important; }
    .e-btn     { background: #004261 !important; border-color: #1abeff !important; }
    .e-btn a   { color: #ffffff !important; }
  }
  @media only screen and (max-width: 620px) {
    .e-pad     { padding-left: 22px !important; padding-right: 22px !important; }
  }
  a { text-decoration: none; }
</style>
</head>

<body class="e-ground" style="margin:0; padding:0; background:#f0f0f0; -webkit-font-smoothing:antialiased;">

<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
  L'iscrizione alla Color Walk non è stata completata e non ti è stato addebitato nulla.
</div>

<table role="presentation" class="e-ground" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;">
<tr>
<td align="center" style="padding:32px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

    <tr>
    <td class="e-card" style="background:#fcfcfc; border:1px solid #dbdbdb; border-radius:12px; box-shadow:0 4px 20px -6px rgba(0,0,0,.1); clip-path:polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <tr>
        <td class="e-pad" style="padding:40px 40px 0;">
          <div class="e-brand" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:12px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#0a6285;">
            Iscrizione non completata
          </div>
          <h1 class="e-fg" style="margin:12px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:28px; line-height:1.25; font-weight:600; color:#171717;">
            Color&nbsp;Walk — 20 settembre
          </h1>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:20px 40px 0;">
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:16px; line-height:1.6; color:#525252;">
            Ciao <strong class="e-fg" style="color:#171717; font-weight:600;">{{NOME}}</strong>, il pagamento della quota non è andato a buon fine: {{MOTIVO}} La tua iscrizione <strong class="e-fg" style="color:#171717; font-weight:600;">non è registrata</strong> e il posto non è tenuto.
          </p>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="e-sub" style="background:#f6f6f6; border:1px solid #e8e8e8; border-radius:10px; clip-path:polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);">
            <tr>
            <td style="padding:20px 22px;">

              <div class="e-fg-m" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#8f8f8f;">
                Nessun addebito
              </div>

              <p class="e-fg-l" style="margin:12px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.6; color:#525252;">
                Non ti abbiamo preso niente: sul conto non arriva nessun addebito.
              </p>
              <p class="e-fg-lr" style="margin:10px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:13px; line-height:1.7; color:#6f6f6f;">
                Se nell'estratto conto vedi comparire e sparire gli 11&nbsp;€, è la
                trattenuta che la banca fa al primo tentativo e scioglie da sé in
                qualche giorno: non è un pagamento e non va chiesta indietro.
              </p>

            </td>
            </tr>
          </table>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:32px 40px 0;">
          <h2 class="e-fg" style="margin:0 0 10px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:17px; font-weight:600; color:#171717;">
            Se vuoi riprovare
          </h2>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Il modulo è dov'era e ci vuole un minuto: si ricompila da capo, si paga, e la conferma ti arriva qui. Finché ci sono posti, l'iscrizione resta aperta.
          </p>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:24px 40px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td class="e-btn" style="background:#72c7e3; border:1px solid #2d94c1; border-radius:6px;">
              <a href="https://www.rivaltasulmincio.it/color-walk" style="display:inline-block; padding:10px 20px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:14px; font-weight:600; color:#101010;">
                Riprova l'iscrizione
              </a>
            </td>
            </tr>
          </table>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:22px 40px 0;">
          <p class="e-fg-lr" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:14px; line-height:1.7; color:#6f6f6f;">
            Se invece il pagamento ti risulta fatto, non rifarlo: scrivi a
            <a class="e-brand" href="mailto:color-walk@rivaltasulmincio.it" style="color:#0a6285;">color-walk@rivaltasulmincio.it</a> e controlliamo noi.
          </p>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:30px 40px 40px;">
          <div class="e-rule" style="height:1px; line-height:1px; font-size:0; background:#e8e8e8; margin:0 0 22px;">&nbsp;</div>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Speriamo di vederti il 20!<br>
            <strong class="e-fg" style="color:#171717; font-weight:600;">Il gruppo del Palio delle Contrade</strong><br>
            <span class="e-fg-lr" style="color:#6f6f6f;">Rivalta sul Mincio</span>
          </p>
        </td>
        </tr>

      </table>
    </td>
    </tr>

    <tr>
    <td style="padding:22px 12px 0;" align="center">
      <p class="e-fg-m" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:12px; line-height:1.7; color:#8f8f8f;">
        Hai ricevuto questa mail perché hai cominciato un'iscrizione alla Color Walk su
        <a class="e-brand" href="https://www.rivaltasulmincio.it" style="color:#0a6285;">rivaltasulmincio.it</a>.<br>
        Non è una lista di invio: non ti arriverà altro. Per qualsiasi cosa, rispondi pure a questo messaggio.
      </p>
    </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
`;

/* build:modelli:fine */
