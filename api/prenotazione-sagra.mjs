/* ═══════════════════════════════════════════════════════════════════════════
   /api/prenotazione-sagra — chi prenota il risotto della Sagra dei Patroni.

   Una sola POST: nome, cognome, email, quanti coperti. Si salva la riga su
   Supabase e si manda la mail di conferma. Non c'è niente da pagare — il
   risotto lo offre l'AVIS di Rivalta — quindi qui dentro non compare PayPal,
   nessuna quota e nessuna ricevuta: si conta chi viene, e basta.

   ── Cosa si chiede, e cosa no ────────────────────────────────────────────
   Nome, cognome, email e coperti. Il telefono è facoltativo, la nota pure.

   NON si chiede il codice fiscale, né la data di nascita, né i nomi delle
   persone che uno porta con sé. La Color Walk li chiede perché lì c'è una
   responsabilità da assumersi e delle sacche nominali da consegnare; qui si
   deve solo sapere quante porzioni fare. Chiedere un dato che non serve è
   un dato in più da custodire e da perdere.

   ── Il numero che conta è UNO ────────────────────────────────────────────
   `coperti` è il totale delle persone a tavola, chi prenota COMPRESO. Non
   «quanti ne porti oltre a te»: quella domanda si sbaglia a leggere, e si
   sbaglia sempre nella stessa direzione — uno in meno. Il modulo lo dice a
   parole e questa funzione si fida di quel numero così com'è.

   ── Da mettere a mano, su Vercel ─────────────────────────────────────────
     SUPABASE_URL          https://<progetto>.supabase.co
     SUPABASE_SERVICE_KEY  la chiave service_role
     RESEND_API_KEY        per la mail di conferma (già c'è per la Color Walk)
   ═══════════════════════════════════════════════════════════════════════════ */
import { MAX_COPERTI, configurato, quantePerEmail, salvaPrenotazione } from "./_supabase.mjs";
import { spedisciConfermaSagra } from "./_posta-sagra.mjs";

/* La stessa forma dell'indirizzo che usa la Color Walk: l'unica cosa che si
   può controllare senza scrivergli davvero. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Oltre questo numero di prenotazioni attive dallo stesso indirizzo si dice
   di no. Non è un sospetto: è che chi preme due volte il tasto non se ne
   accorge, e a chi cucina arrivano coperti doppi. Cinque lascia spazio a una
   famiglia che prenota in momenti diversi. */
const MAX_PER_EMAIL = 5;

const pulisci = (v, max) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

function rispondi(res, codice, corpo) {
  res.status(codice);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(corpo));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return rispondi(res, 405, { errore: "Metodo non ammesso." });
  }

  if (!configurato()) {
    /* Meglio dirlo che fingere che sia andata: chi prenota deve sapere che
       la sua prenotazione NON è registrata. */
    return rispondi(res, 503, {
      errore:
        "Le prenotazioni non sono ancora attive. Riprova più tardi, oppure " +
        "dillo a voce a chi organizza.",
    });
  }

  let corpo = req.body;
  if (typeof corpo === "string") {
    try { corpo = JSON.parse(corpo); } catch { corpo = null; }
  }
  if (!corpo || typeof corpo !== "object") {
    return rispondi(res, 400, { errore: "Richiesta non leggibile." });
  }

  const nome = pulisci(corpo.nome, 60);
  const cognome = pulisci(corpo.cognome, 60);
  const email = pulisci(corpo.email, 160).toLowerCase();
  const telefono = pulisci(corpo.telefono, 32);
  const nota = pulisci(corpo.nota, 300);
  const coperti = Number(corpo.coperti);

  if (!nome) return rispondi(res, 400, { errore: "Manca il nome.", campo: "nome" });
  if (!cognome) return rispondi(res, 400, { errore: "Manca il cognome.", campo: "cognome" });
  if (!EMAIL_RE.test(email)) {
    return rispondi(res, 400, {
      errore: "L'indirizzo email non sembra giusto: serve per la conferma.",
      campo: "email",
    });
  }
  if (!Number.isInteger(coperti) || coperti < 1) {
    return rispondi(res, 400, {
      errore: "Quante persone siete a tavola? Contati anche tu.",
      campo: "coperti",
    });
  }
  if (coperti > MAX_COPERTI) {
    return rispondi(res, 400, {
      errore:
        `Da qui si prenota fino a ${MAX_COPERTI} coperti per volta. Se siete di più, ` +
        `dillo direttamente a chi organizza: vi tengono il posto lo stesso.`,
      campo: "coperti",
    });
  }

  /* Il doppio invio: se questo indirizzo ha già prenotato parecchie volte,
     quasi sempre è lo stesso tasto premuto più volte. */
  try {
    if ((await quantePerEmail(email)) >= MAX_PER_EMAIL) {
      return rispondi(res, 409, {
        errore:
          "Da questo indirizzo risultano già diverse prenotazioni. Se è un errore " +
          "o se devi cambiare il numero dei coperti, scrivi a chi organizza.",
        campo: "email",
      });
    }
  } catch (errore) {
    console.error("prenotazione-sagra: conteggio fallito", errore);
    /* Se il conteggio non riesce si va avanti: meglio una prenotazione
       doppia che una persona respinta per un guasto nostro. */
  }

  let riga;
  try {
    riga = await salvaPrenotazione({
      nome, cognome, email,
      telefono: telefono || null,
      coperti,
      nota: nota || null,
    });
  } catch (errore) {
    console.error("prenotazione-sagra: salvataggio fallito", errore);
    return rispondi(res, 502, {
      errore:
        "Non siamo riusciti a registrare la prenotazione. Riprova fra poco: " +
        "se continua a non funzionare, dillo a voce a chi organizza.",
    });
  }

  /* La mail è importante ma non è la prenotazione: se Resend è giù, la riga
     è già salva e chi cucina la vede lo stesso. Si dice a chi ha prenotato
     che la conferma non è partita, invece di far finta di niente. */
  let mailPartita = true;
  try {
    await spedisciConfermaSagra({ ...riga, nome, cognome, email, coperti });
  } catch (errore) {
    console.error("prenotazione-sagra: mail non partita", errore);
    mailPartita = false;
  }

  return rispondi(res, 200, {
    ok: true,
    id: riga?.id ?? null,
    coperti,
    mailPartita,
  });
}
