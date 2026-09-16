/* ═══════════════════════════════════════════════════════════════════════════
   api/_supabase.mjs — il posto dove stanno le prenotazioni del risotto.

   Non è un endpoint: il trattino basso davanti al nome dice a Vercel di non
   farne una funzione.

   ── Perché un database, qui, e non per la Color Walk ─────────────────────
   La camminata non ha un database e non ne ha bisogno: ogni iscrizione è una
   fattura PayPal, e l'elenco degli iscritti è l'elenco delle fatture. I dati
   stanno dentro il pagamento, quindi non c'è una seconda copia da tenere
   allineata — che è la ragione per cui quella soluzione è buona.

   Il risotto lo offre l'AVIS: è gratis. Niente pagamento vuol dire niente
   fattura, e quindi niente posto dove i dati si salvino da sé. Serve un
   registro vero, ed è questo.

   ── Come si parla con Supabase ───────────────────────────────────────────
   Con `fetch` e basta, via PostgREST — nessuna dipendenza aggiunta al
   progetto. Il client ufficiale `@supabase/supabase-js` farebbe le stesse
   tre chiamate che servono qui (inserisci, conta, elenca) portandosi dietro
   un pacchetto intero: per tre chiamate non vale il peso, e questo progetto
   in produzione non installa niente (vedi vercel.json).

   ── Le chiavi, e quale si usa dove ───────────────────────────────────────
   Su Vercel vanno messe a mano:

     SUPABASE_URL          https://<progetto>.supabase.co
     SUPABASE_SERVICE_KEY  la chiave `service_role`

   La `service_role` scavalca le regole di riga (RLS) e vale come una
   password del database: sta SOLO qui, nelle funzioni del server, e non
   finisce mai in una pagina. Nel browser non ci va nemmeno la `anon`, perché
   il browser con Supabase non ci parla: chiama /api/prenotazione-sagra, che
   è la sola porta.

   ── La tabella ───────────────────────────────────────────────────────────
   Da creare una volta sola, nell'SQL editor di Supabase:

     create table prenotazioni_sagra (
       id          bigint generated always as identity primary key,
       creata      timestamptz not null default now(),
       nome        text not null,
       cognome     text not null,
       email       text not null,
       telefono    text,
       coperti     int  not null check (coperti between 1 and 20),
       nota        text,
       disdetta    timestamptz
     );

     -- Nessuno entra dal browser: solo le funzioni, con la service_role.
     alter table prenotazioni_sagra enable row level security;

   `coperti` è il totale delle persone a tavola, chi prenota compreso: è il
   numero che serve a chi cucina, ed è quello che si chiede nel modulo.

   `disdetta` invece di cancellare la riga: una prenotazione disdetta è un
   fatto successo, e chi cucina vuole poter vedere che quei due coperti prima
   c'erano. Le righe con `disdetta` non nulla non si contano.
   ═══════════════════════════════════════════════════════════════════════════ */

export const TABELLA = "prenotazioni_sagra";

/* Il tetto dei coperti per una prenotazione sola. Non è il tetto della
   festa — quello non c'è, il risotto si fa per tutti: è il limite oltre il
   quale un numero è quasi certamente un errore di battitura. Chi porta
   davvero venticinque persone lo dice a voce. */
export const MAX_COPERTI = 20;

const ATTESA_MS = 8000;

/* Le due variabili, lette a ogni chiamata e non all'avvio: su Vercel una
   funzione fredda che parte senza configurazione deve poterlo dire, non
   morire importando il modulo. */
function credenziali() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const chiave = process.env.SUPABASE_SERVICE_KEY || "";
  return { url, chiave, pronto: Boolean(url && chiave) };
}

export function configurato() {
  return credenziali().pronto;
}

async function chiama(percorso, opzioni = {}) {
  const { url, chiave, pronto } = credenziali();
  if (!pronto) throw new Error("Supabase non configurato");

  const risposta = await fetch(`${url}/rest/v1/${percorso}`, {
    ...opzioni,
    headers: {
      apikey: chiave,
      Authorization: `Bearer ${chiave}`,
      "Content-Type": "application/json",
      ...opzioni.headers,
    },
    signal: AbortSignal.timeout(ATTESA_MS),
  });

  if (!risposta.ok) {
    const dettaglio = await risposta.text().catch(() => "");
    throw new Error(`Supabase ${risposta.status}: ${dettaglio.slice(0, 300)}`);
  }
  return risposta;
}

/* Scrive una prenotazione e restituisce la riga appena nata, con il suo id:
   serve alla mail di conferma, che lo scrive in fondo. */
export async function salvaPrenotazione(dati) {
  const risposta = await chiama(TABELLA, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([dati]),
  });
  const righe = await risposta.json();
  return Array.isArray(righe) ? righe[0] : righe;
}

/* Quante prenotazioni ha già fatto questo indirizzo. Serve a fermare chi
   preme due volte il tasto, non a vietare a una famiglia di prenotare in
   due momenti diversi: il limite è alto e il messaggio lo spiega. */
export async function quantePerEmail(email) {
  const filtro = `email=eq.${encodeURIComponent(email.toLowerCase())}&disdetta=is.null`;
  const risposta = await chiama(`${TABELLA}?${filtro}&select=id`, {
    headers: { Prefer: "count=exact", Range: "0-0" },
  });
  const intervallo = risposta.headers.get("content-range") || "";
  const totale = Number(intervallo.split("/")[1]);
  return Number.isFinite(totale) ? totale : 0;
}

/* Tutte le prenotazioni, dalla più recente: è quello che legge /iscritti. */
export async function tutteLePrenotazioni() {
  const risposta = await chiama(
    `${TABELLA}?select=id,creata,nome,cognome,email,telefono,coperti,nota,disdetta&order=creata.desc`,
  );
  return risposta.json();
}

/* ═══════════════════════════════════════════════════════════════════════════
   Il contante della Color Walk, che PayPal non comanda più
   ═══════════════════════════════════════════════════════════════════════════

   Qui sopra c'è scritto che la camminata un database non ce l'ha e non ne ha
   bisogno, perché ogni iscrizione è una fattura. Per le ISCRIZIONI resta
   vero. Per gli INCASSI IN CONTANTI non più, e la sera del 16 settembre si è
   visto perché.

   Quel giorno l'Invoicing di PayPal ha cominciato a rifiutare a intermittenza:
   la stessa identica fattura, spedita due volte a dieci minuti di distanza,
   una volta passava e una volta no, con un `REQUEST_REJECTED` che non spiega
   niente. E siccome segnare un pagamento richiede che la fattura sia fuori
   dalla bozza, ogni spunta «segna incassati» poteva fallire — a caso.

   Il 20 mattina, davanti alla chiesa, ci sono decine di contanti da spuntare
   uno per uno mentre la gente aspetta. Un tasto che «a volte funziona» lì non
   è un difetto: è la coda che si ferma.

   Quindi i soldi contanti li tiene questa tabella, e non PayPal. Il principio
   è quello che il codice già usava per i moduli cartacei: quei soldi sono nel
   cassetto, li ha contati una persona, e la fattura è soltanto il posto dove
   li stavamo annotando. Se PayPal non vuole annotarli, il fatto non cambia.

   PayPal resta, e resta indispensabile, per una cosa sola: FAR PAGARE ONLINE.
   Lì i soldi passano davvero da lui ed è lui a sapere se sono arrivati.

   ── La tabella ───────────────────────────────────────────────────────────
   Da creare una volta sola, nell'SQL editor di Supabase:

     create table incassi_contanti (
       id        bigint generated always as identity primary key,
       creata    timestamptz not null default now(),
       evento    text not null,
       numero    text not null,
       fattura   text,
       importo   int  not null,
       nota      text,
       annullato timestamptz
     );

     -- Due spunte sulla stessa iscrizione non fanno due incassi.
     create unique index incassi_contanti_uno_per_iscrizione
       on incassi_contanti (evento, numero) where annullato is null;

     alter table incassi_contanti enable row level security;

   `numero` è il numero della fattura (`CW-T-…`, `CW-CART-…`): è l'identità
   dell'iscrizione, quella che si legge in elenco e si ridice a voce. `fattura`
   è l'identificativo interno di PayPal, tenuto solo per ritrovarla dopo.

   `importo` in CENTESIMI, come tutto il resto del sistema: un euro scritto a
   virgola prima o poi diventa un totale che non torna.

   L'indice unico è la difesa contro la doppia spunta, e vale nell'istante in
   cui il database scrive — non dopo una ricerca che può arrivare in ritardo.
   Vale solo sulle righe non annullate, così un incasso tolto per sbaglio si
   può rifare.

   `annullato` invece di cancellare: un incasso tolto è un fatto successo, e
   chi tiene la cassa vuole poterlo vedere. */
export const INCASSI = "incassi_contanti";

/* Segnare un contante incassato. Se c'era già, non è un errore: sono due
   persone al banchetto che hanno spuntato la stessa, o un dito che ha premuto
   due volte. Si risponde di sì, perché il mondo è nello stato che si voleva. */
export async function segnaContante({ evento, numero, fattura, importoCent, nota }) {
  try {
    const risposta = await chiama(INCASSI, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([
        { evento, numero, fattura: fattura || null, importo: importoCent, nota: nota || null },
      ]),
    });
    const righe = await risposta.json();
    return { segnato: true, gia: false, riga: Array.isArray(righe) ? righe[0] : righe };
  } catch (errore) {
    /* 23505 è il codice con cui Postgres dice «c'è già»: l'indice unico ha
       fatto il suo mestiere, e quello che volevamo è già vero. */
    if (/23505|duplicate key/i.test(errore.message)) return { segnato: true, gia: true };
    throw errore;
  }
}

/* Togliere un incasso segnato per sbaglio. */
export async function annullaContante({ evento, numero }) {
  const filtro = `evento=eq.${encodeURIComponent(evento)}&numero=eq.${encodeURIComponent(numero)}&annullato=is.null`;
  const risposta = await chiama(`${INCASSI}?${filtro}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ annullato: new Date().toISOString() }),
  });
  const righe = await risposta.json();
  return Array.isArray(righe) ? righe.length > 0 : Boolean(righe);
}

/* I numeri delle iscrizioni incassate in contanti, per un evento.

   Torna un `Set`, perché chi chiama fa una domanda sola — «questa è pagata?» —
   una volta per ogni riga dell'elenco, e farla su un insieme costa niente.

   Se Supabase non è configurato o non risponde, torna un insieme vuoto invece
   di rompere: l'elenco senza i contanti è un elenco incompleto, ma un elenco
   che non si apre il 20 mattina è molto peggio. Chi chiama lo sa e lo dice. */
export async function contantiIncassati(evento) {
  const filtro = `evento=eq.${encodeURIComponent(evento)}&annullato=is.null`;
  const risposta = await chiama(`${INCASSI}?${filtro}&select=numero,importo,creata`);
  const righe = await risposta.json();
  return new Map((righe || []).map((r) => [String(r.numero), r]));
}

/* Segna una prenotazione come disdetta. Non cancella la riga: vedi sopra. */
export async function disdiciPrenotazione(id) {
  const risposta = await chiama(`${TABELLA}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ disdetta: new Date().toISOString() }),
  });
  const righe = await risposta.json();
  return Array.isArray(righe) ? righe[0] : righe;
}
