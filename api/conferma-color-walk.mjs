/* ═══════════════════════════════════════════════════════════════════════════
   /api/conferma-color-walk — la mail che chiude l'iscrizione alla Color
   Walk. Una sola, e quella giusta:

     · quota incassata      → la ricevuta, con nome, la quota, le commissioni
                              di servizio, il totale e la data
     · iscrizione a metà    → l'avviso che il pagamento non è andato a buon
                              fine e che non è stato addebitato niente

   Non è un endpoint che chiama il sito: lo chiama Stripe. È il webhook a cui
   Stripe manda gli avvisi su cosa è successo a ogni sessione di pagamento.

   ── Perché non lo fa la pagina al ritorno dal pagamento ──────────────────
   Perché al ritorno dal pagamento non ci si torna sempre. Si chiude la
   scheda, finisce la batteria, il treno entra in galleria mentre Stripe sta
   rimandando indietro il browser: il pagamento è fatto e la pagina non lo
   sa. Se la mail partisse da lì, chi ha pagato resterebbe senza conferma —
   e la conferma è la cosa che dimostra l'iscrizione.

   Stripe invece l'avviso lo manda da server a server, e se non gli si
   risponde 2xx lo rimanda: ogni pochi minuti, poi ogni poche ore, per tre
   giorni. Ecco perché qui sotto un errore nello spedire diventa una risposta
   500 e non un log: è il modo di dire a Stripe «riprova», ed è ciò che rende
   la mail una cosa che prima o poi arriva invece di una cosa che parte una
   volta e speriamo bene.

   ── Perché la mail non crede a quello che riceve ─────────────────────────
   L'avviso di Stripe arriva su un indirizzo pubblico: lo può chiamare
   chiunque, con dentro scritto quello che gli pare. Due controlli, in fila:

     1. la firma. Stripe firma ogni avviso con un segreto condiviso
        (STRIPE_WEBHOOK_SECRET); qui si ricalcola l'HMAC sul corpo grezzo e
        si confronta. È il motivo per cui `bodyParser` è spento: il corpo va
        letto byte per byte com'è arrivato, perché anche solo riscriverne gli
        spazi cambierebbe la firma;

     2. e comunque, del corpo dell'avviso si prende UNA cosa sola —
        l'identificativo della sessione. Se ha pagato, e quanto, e a che nome,
        non lo dice l'avviso: lo si va a chiedere a Stripe con la chiave
        segreta. Anche un avviso falso perfettamente firmato non riuscirebbe
        a far partire una ricevuta per un pagamento che non c'è.

   ── Perché non arriva due volte ──────────────────────────────────────────
   Una volta spedita la ricevuta, la funzione lascia un segno sul pagamento
   (metadata `ricevuta` sul PaymentIntent) e al giro dopo lo rilegge. Serve
   perché lo stesso pagamento può generare più di un avviso, e perché i
   rinvii di Stripe sono fatti apposta per ripetersi.

   ── Da mettere a mano, su Vercel ─────────────────────────────────────────
     STRIPE_SECRET_KEY      la stessa di /api/iscrizione-color-walk
     STRIPE_WEBHOOK_SECRET  whsec_… lo dà Stripe quando si crea il webhook
     RESEND_API_KEY         la chiave del servizio che spedisce
     POSTA_MITTENTE         (facoltativa) l'indirizzo del mittente

   Il testo delle mail non è scritto qui: sta in _build/email/, e `node
   build.mjs` lo compila in fondo a questo file, fra i due marcatori.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createHmac, timingSafeEqual } from "node:crypto";

/* Il corpo va letto grezzo o la firma non torna. Su Vercel il corpo lo
   preparerebbe la piattaforma, riscrivendolo: questa riga glielo impedisce. */
export const config = { api: { bodyParser: false } };

const SITE = "https://www.rivaltasulmincio.it";

/* Marchio che il POST di /api/iscrizione-color-walk mette su ogni sessione
   che crea. Serve a non rispondere agli avvisi di pagamenti che un domani
   nasceranno per altro: quelli non li riguarda questa mail. */
const EVENTO = "color-walk-2026-09-20";

const OGGETTO_RICEVUTA = "Iscrizione confermata — Color Walk, 20 settembre";
const OGGETTO_FALLITA = "Iscrizione non completata — Color Walk, 20 settembre";

const MITTENTE_PREDEFINITO = "Color Walk — Rivalta sul Mincio <color-walk@rivaltasulmincio.it>";

/* Cinque minuti, la tolleranza consigliata da Stripe: oltre, un avviso vero
   intercettato da qualcuno e rigiocato più tardi non viene più accettato. */
const TOLLERANZA_S = 300;

const ATTESA_MS = 6000;

/* ── Le due porte verso l'esterno ─────────────────────────────────────────
   Una per Stripe e una per la posta, ciascuna con la sua autorizzazione e il
   suo timeout scritti in un posto solo. */
async function stripe(chiave, percorso, corpo) {
  const risposta = await fetch(`https://api.stripe.com/v1/${percorso}`, {
    method: corpo ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${chiave}:`).toString("base64")}`,
      ...(corpo ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: corpo ? corpo.toString() : undefined,
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  const dati = await risposta.json();
  if (!risposta.ok) throw new Error(dati?.error?.message || `Stripe ha risposto ${risposta.status}`);
  return dati;
}

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
const escape = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function riempi(modello, valori) {
  let html = modello;
  for (const [chiave, valore] of Object.entries(valori)) {
    html = html.split(`{{${chiave}}}`).join(escape(valore));
  }
  /* Rete di sicurezza per un caso che non dovrebbe darsi — il nome è
     obbligatorio nel modulo: senza, resterebbe «Ciao , la tua iscrizione». */
  return html.replace(/Ciao <strong[^>]*>\s*<\/strong>,\s*/, "Ciao, ");
}

const dataItaliana = (secondi) =>
  new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(new Date((secondi || Math.floor(Date.now() / 1000)) * 1000));

const importoItaliano = (centesimi, valuta) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: String(valuta || "eur").toUpperCase(),
  }).format((centesimi || 0) / 100);

/* ── La riga della risottata ──────────────────────────────────────────────
   Nel modello della ricevuta c'è {{RISOTTO}} su una riga sua. Per chi non ha
   prenotato la risottata al suo posto non va niente; per chi l'ha prenotata va
   questa sotto-lastra, nello stesso stile del riepilogo del pagamento. `n` è un
   intero già stretto fra 1 e 10 in fase d'iscrizione: qui lo si ristringe
   comunque, perché un metadata si può anche modificare a mano nel dashboard. */
export const coperti = (n) => (n === 1 ? "1 coperto" : `${n} coperti`);

export function bloccoRisotto(n) {
  const q = Math.min(10, Math.max(1, Math.floor(Number(n)) || 1));
  return `<tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="e-sub" style="background:#f6f6f6; border:1px solid #e8e8e8; border-radius:10px; clip-path:polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);">
            <tr>
            <td style="padding:20px 22px;">
              <div class="e-fg-m" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#8f8f8f;">
                Risottata finale
              </div>
              <p class="e-fg-l" style="margin:12px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.6; color:#525252;">
                Ti abbiamo segnato per la risottata dopo la camminata: <strong class="e-fg" style="color:#171717; font-weight:600;">${coperti(q)}</strong> a tuo nome.
              </p>
              <p class="e-fg-lr" style="margin:10px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:13px; line-height:1.7; color:#6f6f6f;">
                È su prenotazione e non si paga adesso. Se il numero cambia, o non ti fermi più, rispondi a questa mail e lo sistemiamo.
              </p>
            </td>
            </tr>
          </table>
        </td>
        </tr>`;
}

/* ── La firma ─────────────────────────────────────────────────────────────
   L'intestazione ha la forma `t=1700000000,v1=abc…`, e i `v1` possono essere
   più d'uno mentre si cambia il segreto senza fermare niente: basta che uno
   torni. Il confronto è a tempo costante — su una stringa che si confronta
   carattere per carattere, quanto ci si mette a dire di no è già mezza
   risposta. */
function firmaValida(grezzo, intestazione, segreto) {
  const campi = String(intestazione || "")
    .split(",")
    .map((p) => p.split("="))
    .filter((p) => p.length === 2);

  const t = campi.find(([k]) => k.trim() === "t")?.[1]?.trim();
  const firme = campi.filter(([k]) => k.trim() === "v1").map(([, v]) => v.trim());
  if (!t || !firme.length) return false;

  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > TOLLERANZA_S) return false;

  const atteso = createHmac("sha256", segreto).update(`${t}.${grezzo}`, "utf8").digest("hex");
  const attesoBuf = Buffer.from(atteso, "utf8");

  return firme.some((firma) => {
    const buf = Buffer.from(firma, "utf8");
    return buf.length === attesoBuf.length && timingSafeEqual(buf, attesoBuf);
  });
}

const corpoGrezzo = async (req) => {
  const pezzi = [];
  for await (const pezzo of req) pezzi.push(pezzo);
  return Buffer.concat(pezzi).toString("utf8");
};

/* ── Il registro dei già fatti ────────────────────────────────────────────
   Non c'è un database e non se ne vuole uno: il segno di «mail spedita» sta
   sul pagamento stesso, nei metadata del PaymentIntent, che Stripe conserva e
   lascia rileggere. Scriverlo può fallire senza che sia grave — al peggio una
   mail arriva due volte — quindi non fa mai cadere il resto. */
const giaFatto = (pi, campo) => Boolean(pi?.metadata?.[campo]);

async function segna(chiave, pi, campo) {
  if (!pi?.id) return;
  try {
    const parametri = new URLSearchParams();
    parametri.set(`metadata[${campo}]`, new Date().toISOString());
    await stripe(chiave, `payment_intents/${encodeURIComponent(pi.id)}`, parametri);
  } catch (errore) {
    console.error("segno non scritto sul pagamento:", errore.message);
  }
}

/* ── Ha già pagato in un altro modo? ──────────────────────────────────────
   Chi lascia a metà un pagamento e poi ne fa un altro che va a buon fine si
   ritroverebbe, alla scadenza del primo, una mail che gli dice che non è
   iscritto: falsa, e proprio a chi ha pagato. Prima di quella mail si guarda
   quindi se a quell'indirizzo risulta una sessione pagata.

   Se la domanda non si riesce a farla, la mail NON parte: dire per sbaglio
   «non sei iscritto» a chi ha pagato è un danno; non dire niente a chi non ha
   pagato è, al massimo, un'occasione persa. Nel dubbio, si sta zitti. */
async function haPagatoAltrove(chiave, email, escludi) {
  const cerca = async (query) => {
    const dati = await stripe(chiave, `checkout/sessions?${query}`);
    return (dati?.data || []).some(
      (s) =>
        s.id !== escludi &&
        s.payment_status === "paid" &&
        String(s.customer_details?.email || "").toLowerCase() === email
    );
  };

  try {
    return await cerca(`limit=100&customer_details[email]=${encodeURIComponent(email)}`);
  } catch (errore) {
    /* Il filtro per indirizzo è comodo ma non è detto che ci sia sempre: se
       Stripe lo rifiuta si guardano le ultime cento sessioni e si filtra qui.
       Per un evento di paese sono abbondantemente tutte. */
    console.error("filtro per indirizzo non disponibile:", errore.message);
    return cerca("limit=100");
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Il gestore
   ═══════════════════════════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  const chiave = process.env.STRIPE_SECRET_KEY;
  const segreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!chiave) return res.status(500).json({ errore: "pagamento non ancora configurato" });

  let grezzo = await corpoGrezzo(req);
  let firmabile = true;

  /* Se `bodyParser: false` non venisse rispettato, il corpo l'avrebbe già
     letto la piattaforma e il flusso qui arriverebbe vuoto. Ricomporlo da
     `req.body` non ridà la stessa sequenza di byte, quindi la firma non
     tornerebbe più: si smette di controllarla, non di lavorare. Fermarsi
     vorrebbe dire non spedire mai più una ricevuta a nessuno, e in silenzio.
     Quello che decide — pagata sì o no, e a che indirizzo — si rilegge
     comunque da Stripe con la chiave segreta, che è la garanzia vera. */
  if (!grezzo && req.body) {
    grezzo = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    firmabile = false;
    console.error(
      "corpo già consumato dalla piattaforma: firma non verificabile. " +
        "Controllare che `export const config = { api: { bodyParser: false } }` sia in vigore."
    );
  }

  if (!grezzo) return res.status(400).json({ errore: "corpo vuoto" });

  if (segreto && firmabile && !firmaValida(grezzo, req.headers["stripe-signature"], segreto)) {
    return res.status(400).json({ errore: "firma non valida" });
  }
  if (!segreto) {
    /* Senza segreto la firma non si può controllare. Non è motivo per
       fermarsi — quello che conta lo si rilegge comunque da Stripe con la
       chiave segreta — ma è un buco da chiudere, e nei log si vede. */
    console.error("STRIPE_WEBHOOK_SECRET assente: avviso accettato senza verificarne la firma");
  }

  let avviso;
  try {
    avviso = JSON.parse(grezzo);
  } catch {
    return res.status(400).json({ errore: "corpo non leggibile" });
  }

  const tipo = String(avviso?.type || "");
  const id = String(avviso?.data?.object?.id || "");

  /* Di tutto l'avviso si tiene questo e basta: com'è andata lo dice Stripe
     quando glielo si chiede, non chi ha bussato alla porta. */
  if (!tipo.startsWith("checkout.session.") || !/^cs_[A-Za-z0-9_]+$/.test(id)) {
    return res.status(200).json({ ignorato: tipo || "avviso senza tipo" });
  }

  try {
    const sessione = await stripe(
      chiave,
      `checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent&expand[]=line_items`
    );

    const marchio = sessione.metadata?.evento;
    if (marchio && marchio !== EVENTO) {
      return res.status(200).json({ ignorato: "sessione di un altro evento" });
    }

    const email = String(sessione.customer_details?.email || sessione.customer_email || "")
      .trim()
      .toLowerCase();
    if (!email) return res.status(200).json({ ignorato: "sessione senza indirizzo" });

    const nome =
      String(sessione.metadata?.nome || "").trim() ||
      String(sessione.customer_details?.name || "").trim().split(/\s+/)[0] ||
      "";

    const pi = typeof sessione.payment_intent === "object" ? sessione.payment_intent : null;

    /* ── Ha pagato ──────────────────────────────────────────────────────
       Il ramo in cui la mail DEVE partire, e su cui si decide guardando
       `payment_status` letto adesso da Stripe: non il tipo dell'avviso, non
       il corpo che è arrivato, non l'indirizzo da cui si è tornati. */
    if (sessione.payment_status === "paid") {
      if (giaFatto(pi, "ricevuta")) {
        return res.status(200).json({ ignorato: "ricevuta già spedita" });
      }

      /* Le due voci arrivano da Stripe, non ricopiate a mano: la quota e —
         separata — la commissione di servizio. Se una sessione tornasse senza
         il dettaglio (una vecchia sessione a voce unica rimasta in coda), la
         ricevuta ripiega su «tutto quota, zero commissioni»: resta valida. */
      const voci = Array.isArray(sessione.line_items?.data) ? sessione.line_items.data : [];
      const voceCommissioni = voci.find((v) => /commission/i.test(v.description || ""));
      const commissioniCent = voceCommissioni?.amount_total ?? 0;
      const quotaCent =
        voci.find((v) => v !== voceCommissioni)?.amount_total ??
        (sessione.amount_total || 0) - commissioniCent;

      const importoQuota = importoItaliano(quotaCent, sessione.currency);
      const importoCommissioni = importoItaliano(commissioniCent, sessione.currency);
      const importo = importoItaliano(sessione.amount_total, sessione.currency);
      const data = dataItaliana(pi?.created || avviso.created);

      /* La risottata: "si" più un numero di coperti, o niente. Sta nei metadata
         della sessione, messo lì all'iscrizione. Nella mail diventa una riga in
         più (HTML) e un paragrafo in più (testo) — solo per chi l'ha prenotata. */
      const risotto = sessione.metadata?.risotto === "si";
      const risottoN = Math.min(10, Math.max(1, Math.floor(Number(sessione.metadata?.risotto_persone)) || 1));

      const html = riempi(MODELLO_RICEVUTA, {
        NOME: nome,
        DATA: data,
        IMPORTO_QUOTA: importoQuota,
        IMPORTO_COMMISSIONI: importoCommissioni,
        IMPORTO: importo,
      }).replace("{{RISOTTO}}", () => (risotto ? bloccoRisotto(risottoN) : ""));

      await spedisci({
        a: email,
        oggetto: OGGETTO_RICEVUTA,
        html,
        testo:
          `Ciao ${nome || ""}, la tua iscrizione alla Color Walk del 20 settembre è ` +
          `registrata e la quota è pagata.\n\n` +
          `Iscrizione Color Walk — 20 settembre: ${importoQuota}\n` +
          `Commissioni di servizio: ${importoCommissioni}\n` +
          `Totale, pagato con carta il ${data}: ${importo}\n\n` +
          `Le commissioni di servizio coprono quanto trattiene il circuito di ` +
          `pagamento: all'organizzazione arriva la quota intera.\n\n` +
          (risotto
            ? `Risottata finale: ti abbiamo segnato ${coperti(risottoN)} a tuo nome. ` +
              `È su prenotazione e non si paga adesso; se il numero cambia, rispondi a questa mail.\n\n`
            : "") +
          `Questa mail è la tua conferma: tienila, non serve stamparla.\n` +
          `Ci vediamo il 20!\n\n` +
          `Il gruppo del Palio delle Contrade — Rivalta sul Mincio\n${SITE}`,
      });

      /* Prima si spedisce, poi si segna. Al contrario, un segno scritto e una
         spedizione fallita darebbero una mail che non parte più: meglio il
         rischio remoto di una copia in più che la certezza di uno zero. */
      await segna(chiave, pi, "ricevuta");
      return res.status(200).json({ spedita: "ricevuta" });
    }

    /* ── Non ha pagato ──────────────────────────────────────────────────
       Solo su avvisi che chiudono la partita. Una carta rifiutata mentre si è
       ancora sulla pagina di Stripe non arriva fin qui, ed è giusto così: lì
       si ritenta subito, e una mail a ogni tentativo sarebbe molestia. */
    const finita = tipo === "checkout.session.expired" || tipo === "checkout.session.async_payment_failed";
    if (!finita) {
      return res.status(200).json({ ignorato: `${tipo} senza pagamento concluso` });
    }

    if (giaFatto(pi, "avviso_fallita")) {
      return res.status(200).json({ ignorato: "avviso già spedito" });
    }

    let pagatoAltrove;
    try {
      pagatoAltrove = await haPagatoAltrove(chiave, email, id);
    } catch (errore) {
      console.error("controllo altri pagamenti fallito, avviso non spedito:", errore.message);
      return res.status(200).json({ ignorato: "impossibile escludere un pagamento riuscito" });
    }
    if (pagatoAltrove) {
      return res.status(200).json({ ignorato: "stesso indirizzo, pagamento riuscito altrove" });
    }

    const motivo =
      tipo === "checkout.session.expired"
        ? "la pagina di pagamento si è chiusa prima che il pagamento fosse completato."
        : "il pagamento è stato rifiutato.";

    await spedisci({
      a: email,
      oggetto: OGGETTO_FALLITA,
      html: riempi(MODELLO_FALLITA, { NOME: nome, MOTIVO: motivo }),
      testo:
        `Ciao ${nome || ""}, il pagamento della quota della Color Walk non è andato ` +
        `a buon fine: ${motivo} La tua iscrizione non è registrata e il posto non è tenuto.\n\n` +
        `Non ti abbiamo preso niente: sul conto non arriva nessun addebito.\n\n` +
        `Se vuoi riprovare, il modulo è qui: ${SITE}/color-walk\n\n` +
        `Il gruppo del Palio delle Contrade — Rivalta sul Mincio`,
    });

    await segna(chiave, pi, "avviso_fallita");
    return res.status(200).json({ spedita: "avviso di mancato pagamento" });
  } catch (errore) {
    /* 500, non 200. È la richiesta a Stripe di riprovare: finché non si
       risponde 2xx l'avviso torna, per tre giorni. Una chiave sbagliata o un
       servizio di posta giù smettono così di essere una mail persa e
       diventano una mail in ritardo. */
    console.error("conferma non spedita:", errore);
    return res.status(500).json({ errore: String(errore.message || errore) });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   I due modelli, compilati da `node build.mjs` a partire da _build/email/.
   Tutto quello che sta fra i marcatori è generato: si modifica l'HTML di là.
   ═══════════════════════════════════════════════════════════════════════════ */
/* build:modelli:inizio */
/* Generato da build.mjs — NON modificare a mano.
   I sorgenti sono _build/email/ricevuta-color-walk.html,
   _build/email/fallita-color-walk.html e _build/email/evento.json. */

export const ORGANIZZATORI = "";

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
  La tua iscrizione alla Color Walk del 20 settembre è registrata e la quota è pagata.
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
            Iscrizione confermata
          </div>
          <h1 class="e-fg" style="margin:12px 0 0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:28px; line-height:1.25; font-weight:600; color:#171717;">
            Color&nbsp;Walk — 20 settembre
          </h1>
        </td>
        </tr>

        <tr>
        <td class="e-pad" style="padding:20px 40px 0;">
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:16px; line-height:1.6; color:#525252;">
            Ciao <strong class="e-fg" style="color:#171717; font-weight:600;">{{NOME}}</strong>, la tua iscrizione è registrata e la quota è stata pagata. Questa mail è la tua conferma: tienila, non serve stamparla.
          </p>
        </td>
        </tr>



        <tr>
        <td class="e-pad" style="padding:28px 40px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="e-sub" style="background:#f6f6f6; border:1px solid #e8e8e8; border-radius:10px; clip-path:polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);">
            <tr>
            <td style="padding:20px 22px;">

              <div class="e-fg-m" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#8f8f8f;">
                Riepilogo del pagamento
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                <tr>
                <td class="e-stack e-fg-l" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.5; color:#525252;">
                  Iscrizione Color Walk — 20 settembre
                </td>
                <td class="e-stack e-stack-r e-fg-l" align="right" style="font-family:'Roboto Mono','Courier New',monospace; font-size:15px; color:#525252; white-space:nowrap;">
                  {{IMPORTO_QUOTA}}
                </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                <tr>
                <td class="e-stack e-fg-l" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.5; color:#525252;">
                  Commissioni di servizio
                </td>
                <td class="e-stack e-stack-r e-fg-l" align="right" style="font-family:'Roboto Mono','Courier New',monospace; font-size:15px; color:#525252; white-space:nowrap;">
                  {{IMPORTO_COMMISSIONI}}
                </td>
                </tr>
              </table>

              <div class="e-rule" style="height:1px; line-height:1px; font-size:0; background:#e8e8e8; margin:16px 0;">&nbsp;</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td class="e-stack e-fg" style="font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; font-weight:600; line-height:1.5; color:#171717;">
                  Totale
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
                  Le <span class="e-fg-l" style="color:#525252;">commissioni di servizio</span> coprono quanto trattiene il circuito di pagamento: all'organizzazione arriva la quota intera.<br>
                  Pagato con carta il <span class="e-fg-l" style="color:#525252;">{{DATA}}</span> — pagamento gestito da Stripe, il sito non vede né conserva i dati della carta.
                </td>
                </tr>
              </table>

            </td>
            </tr>
          </table>
        </td>
        </tr>

        {{RISOTTO}}

        <tr>
        <td class="e-pad" style="padding:32px 40px 0;">
          <h2 class="e-fg" style="margin:0 0 10px; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:17px; font-weight:600; color:#171717;">
            Dove e quando
          </h2>
          <p class="e-fg-l" style="margin:0; font-family:'Titillium Web',Geneva,Tahoma,sans-serif; font-size:15px; line-height:1.7; color:#525252;">
            Domenica 20 settembre — ritrovo dalle <strong class="e-fg" style="color:#171717; font-weight:600;">15:30</strong> in <strong class="e-fg" style="color:#171717; font-weight:600;">Piazza Chiesa, davanti alla chiesa</strong>, da dove parte il giro per il paese.<br>
            <span class="e-fg-lr" style="color:#6f6f6f;">Non è una gara: si cammina o si corre come si preferisce.</span>
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
