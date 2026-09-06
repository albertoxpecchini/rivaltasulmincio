/* ═══════════════════════════════════════════════════════════════════════════
   Chi si iscrive: le persone, lette e controllate — api/_persone.mjs

   Sta qui e non dentro l'endpoint dell'iscrizione perché le porte sono due:
   il modulo online, e la pagina di chi organizza quando ricopia un modulo
   cartaceo. Due porte con due validazioni sarebbero due idee diverse di chi
   può iscriversi, e la seconda si scoprirebbe sbagliata il giorno che
   qualcuno arriva al banchetto con un codice fiscale che il sito accetta e
   la carta no. Una sola, e la usano tutte e due.

   Qui dentro non c'è niente di PayPal e niente di HTTP: si entra con quello
   che una persona ha scritto e si esce con una persona pulita, o con un
   errore in italiano già pronto da mostrare.
   ═══════════════════════════════════════════════════════════════════════════ */
import { maiuscole, pulisci } from "./_paypal.mjs";

/* Il giorno della camminata. Le età si contano a questa data e non a oggi:
   chi compie 18 anni il 19 settembre si iscrive da sé, e chi ne compie 18 il
   21 è ancora un minore a carico di qualcuno. */
export const GIORNO_EVENTO = "2026-09-20";

/* L'indirizzo, nella sola forma che si può controllare senza scrivergli. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Sedici caratteri fra lettere e cifre, e basta. Il controllo severo — quello
   del carattere di controllo — lo fa la pagina, che può spiegare a chi scrive
   cosa non torna e farglielo correggere. Qui si guarda solo la forma, di
   proposito: un codice legittimo ma fuori dall'ordinario respinto da questa
   funzione diventerebbe una persona che non riesce a iscriversi e non sa
   perché, con la pagina che le diceva che andava bene. */
export const CF_RE = /^[A-Z0-9]{16}$/;
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ── Età e codice fiscale ─────────────────────────────────────────────────
   Il codice fiscale non serve alla polizza — non c'è polizza. Serve a dare
   una certezza in più su chi si sta assumendo delle responsabilità: un nome
   falso è gratis, un codice fiscale falso che torna anche con la data di
   nascita dichiarata è un'altra cosa.

   Perciò qui il codice non si legge solo nella forma: si controlla che la
   data che porta dentro sia quella dichiarata nel modulo. È il confronto
   che rende il campo utile, ed è il motivo per cui lo si chiede ancora. */

/* Il mese di nascita, nei codici fiscali, è una lettera sola. */
const MESI_CF = "ABCDEHLMPRST";

/* L'omocodia: quando due persone otterrebbero lo stesso codice, l'Agenzia
   sostituisce una o più cifre con una lettera secondo questa tabella. Un
   codice omocodico è legittimo quanto gli altri e va letto come gli altri,
   altrimenti si respinge una persona vera che non capisce perché. */
const OMOCODIA = { L: 0, M: 1, N: 2, P: 3, Q: 4, R: 5, S: 6, T: 7, U: 8, V: 9 };
const cifra = (c) => (c >= "0" && c <= "9" ? Number(c) : OMOCODIA[c]);

/* Le due cifre di una posizione numerica del codice, omocodia sciolta.
   `null` se non sono cifre né lettere sostitutive: il codice è illeggibile
   e il confronto con la data dichiarata non si può fare. */
function numero(codice, da) {
  const alta = cifra(codice[da]);
  const bassa = cifra(codice[da + 1]);
  if (alta === undefined || bassa === undefined) return null;
  return alta * 10 + bassa;
}

/* Vero se il codice fiscale porta dentro proprio quella data di nascita.
   L'anno nel codice sono due cifre: si confronta con le ultime due
   dell'anno dichiarato, e il secolo lo dà la data del modulo — così non
   c'è nessuna ambiguità da indovinare. Il giorno delle donne è aumentato
   di 40, ed è l'unico posto in cui il sesso entra in questo controllo. */
function codiceCombaciaConData(codice, iso) {
  const anno = numero(codice, 6);
  const mese = MESI_CF.indexOf(codice[8]) + 1;
  const giornoGrezzo = numero(codice, 9);
  if (anno === null || mese === 0 || giornoGrezzo === null) return false;

  const giorno = giornoGrezzo > 40 ? giornoGrezzo - 40 : giornoGrezzo;
  const [annoIso, meseIso, giornoIso] = iso.split("-").map(Number);

  return anno === annoIso % 100 && mese === meseIso && giorno === giornoIso;
}

/* Una data vera, non solo una stringa nella forma giusta: il 31 febbraio
   passa la regex e non passa di qui. */
export function dataValida(iso) {
  if (!DATA_RE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/* Gli anni compiuti alla data della camminata. */
export function etaAllEvento(iso) {
  const [a, m, g] = iso.split("-").map(Number);
  const [ae, me, ge] = GIORNO_EVENTO.split("-").map(Number);
  let anni = ae - a;
  if (me < m || (me === m && ge < g)) anni -= 1;
  return anni;
}

/* Un partecipante letto dal modulo, controllato e restituito pulito.
   `minimo`/`massimo` sono la fascia d'età ammessa per il posto che occupa:
   18-120 per chi si iscrive, 6-17 per chi porta con sé. L'errore torna
   come stringa in italiano, pronto da mostrare. */
export function leggiPersona(grezza, { minimo, massimo, chi, cfObbligatorio, capofila = false }) {
  /* La maiuscola si mette qui, all'ingresso, così è già a posto sulla
     fattura, nella mail e in elenco — e non in tre posti diversi che prima o
     poi non si assomigliano più. */
  const nome = maiuscole(pulisci(grezza?.nome, 80));
  const cognome = maiuscole(pulisci(grezza?.cognome, 80));
  const dataNascita = pulisci(grezza?.dataNascita, 10);
  const codiceFiscale = pulisci(grezza?.codiceFiscale, 16).toUpperCase();

  if (!nome || !cognome) return { errore: `${chi}: nome o cognome mancanti` };
  if (!dataValida(dataNascita)) return { errore: `${chi}: data di nascita mancante o non valida` };

  const eta = etaAllEvento(dataNascita);
  if (eta < minimo) {
    /* Tre casi e non due. A chi sta compilando si spiega come funziona; a un
       maggiorenne che non lo è si dice dove va messo, perché il posto giusto
       nello stesso modulo c'è già e nessuno deve ricominciare da capo. */
    if (minimo !== 18) {
      return { errore: `${chi}: sotto i 6 anni non serve iscriversi, si partecipa gratis` };
    }
    return {
      errore: capofila
        ? "per iscriversi bisogna essere maggiorenni: i minori li iscrive un adulto insieme a sé"
        : `${chi}: il giorno della camminata non ha ancora 18 anni — va messo fra i minori che cammini con te`,
    };
  }
  if (eta > massimo) {
    return {
      errore:
        massimo === 17
          ? `${chi}: ha 18 anni o più il giorno della camminata, va iscritto con la quota intera`
          : `${chi}: data di nascita non plausibile`,
    };
  }

  if (codiceFiscale || cfObbligatorio) {
    if (!CF_RE.test(codiceFiscale)) return { errore: `${chi}: codice fiscale mancante o non valido` };
    if (!codiceCombaciaConData(codiceFiscale, dataNascita)) {
      return { errore: `${chi}: il codice fiscale non corrisponde alla data di nascita` };
    }
  }

  return { persona: { nome, cognome, dataNascita, codiceFiscale } };
}
