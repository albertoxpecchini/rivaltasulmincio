/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscrizione-color-walk — l'iscrizione alla Color Walk del
   20 settembre: raccolta dati e, per chi vuole, incasso della quota.

   Fa due mestieri, secondo il metodo con cui lo si chiama:

     POST  il modulo manda i dati di chi si iscrive — che deve essere
           maggiorenne — più quelli dei minori che porta con sé, il consenso
           spuntato e come intende pagare. Qui nasce la fattura, e da lì in
           poi le due strade si dividono.

     GET   ?ordine=…  al ritorno dal pagamento online la pagina chiede
           «questo ordine è stato davvero pagato?». Serve perché l'indirizzo
           di ritorno lo può digitare chiunque: senza questo controllo
           basterebbe aprire /color-walk?stato=ok per vedersi dire
           «iscrizione ricevuta» senza aver pagato una lira.

   ── I due modi di pagare ──────────────────────────────────────────────────
   Si può pagare subito, online, oppure in contanti al ritrovo — davanti alla
   chiesa alle 15:30 del 20 settembre, prima della partenza. In tutti e due i
   casi l'iscrizione è registrata nello stesso momento e nello stesso posto:
   una fattura PayPal, che nasce qui. Quello che cambia è se è saldata.

   Chi paga in contanti riceve la sua mail subito, e quella mail dice a
   chiare lettere che la quota NON è pagata e quanto deve portare. Non è un
   dettaglio di cortesia: è la differenza fra una persona che si presenta con
   i soldi in mano e una coda di venti persone che scoprono al banchetto di
   dover pagare.

   ── Un'iscrizione è un gruppo, non una persona ─────────────────────────
   La regola decisa da chi organizza: ognuno è tutore di sé stesso, e il
   maggiorenne che si iscrive è tutore dei minori a suo carico che iscrive
   insieme a sé. Da lì scendono due conseguenze che questo file fa
   rispettare, e non solo il modulo: chi compila deve avere almeno 18 anni
   compiuti il giorno della camminata, e un minore non può esistere qui
   dentro senza l'adulto che lo porta.

   La quota è la somma: 10 € il maggiorenne, 5 € ognuno dei 6-17 anni. Sotto
   i 6 anni non ci si iscrive — si partecipa e basta — ed è il motivo per cui
   una data di nascita troppo recente viene respinta invece che fatta pagare.

   Le commissioni del circuito di pagamento non compaiono da nessuna parte:
   né qui, né sulle pagine di PayPal, né nella ricevuta. Sono un costo
   dell'organizzazione, non una voce a carico di chi si iscrive.
   ═══════════════════════════════════════════════════════════════════════════ */
import {
  MAX_MINORI,
  MODALITA,
  QUOTA_ADULTO_CENT,
  QUOTA_MINORE_CENT,
  componiFattura,
  creaFattura,
  creaOrdine,
  incassaOrdine,
  leggiOrdine,
  numeroFattura,
  personeDa,
  pulisci,
  saldata,
  spedisciFattura,
  cercaFatture,
} from "./_paypal.mjs";
import { ricevuta, spedisci } from "./_posta.mjs";

/* Il giorno della camminata. Le età si contano a questa data e non a oggi:
   chi compie 18 anni il 19 settembre si iscrive da sé, e chi ne compie 18 il
   21 è ancora un minore a carico di qualcuno. */
const GIORNO_EVENTO = "2026-09-20";

/* Le iscrizioni online si chiudono alle 23:59 del 18 settembre — due giorni
   prima della camminata, il tempo di preparare le sacche e i sacchetti di
   polvere. Chi arriva dopo si iscrive sul posto, col modulo cartaceo e in
   contanti.
   `+02:00` è l'ora legale italiana di settembre: senza il fuso, un server a
   Londra taglierebbe un'ora prima. Passata questa data la POST risponde 403 e
   non registra niente; la GET di verifica resta aperta, perché chi ha pagato
   all'ultimo minuto torna dal pagamento dopo la mezzanotte. */
const CHIUSURA_ISO = "2026-09-18T23:59:59+02:00";
const CHIUSURA_MS = Date.parse(CHIUSURA_ISO);

const SITE = "https://www.rivaltasulmincio.it";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Sedici caratteri fra lettere e cifre, e basta. Il controllo severo — quello
   del carattere di controllo — lo fa la pagina, che può spiegare a chi scrive
   cosa non torna e farglielo correggere. Qui si guarda solo la forma, di
   proposito: un codice legittimo ma fuori dall'ordinario respinto da questa
   funzione diventerebbe una persona che non riesce a iscriversi e non sa
   perché, con la pagina che le diceva che andava bene. */
const CF_RE = /^[A-Z0-9]{16}$/;
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

/* Gli identificativi degli ordini PayPal: diciassette caratteri fra lettere
   maiuscole e cifre. Serve a non andare a chiedere a PayPal notizie di una
   stringa che un ordine non è, scritta a mano nella barra del browser. */
const ORDINE_RE = /^[A-Z0-9]{10,25}$/;

/* ── Quante iscrizioni non pagate può avere lo stesso indirizzo ────────────
   Finché si pagava solo con la carta, a fare da filtro era il pagamento: chi
   compilava il modulo per scherzo si fermava davanti alla richiesta dei
   soldi. Con i contanti quel filtro non c'è più — ci si iscrive senza pagare
   niente — e il tetto dell'evento è di trecento persone: riempirlo di nomi
   falsi diventerebbe questione di un pomeriggio.

   Tre iscrizioni non ancora saldate per indirizzo è una misura, non una
   fortezza: una famiglia che si iscrive in tre riprese ci sta dentro, e chi
   ne vuole trecento deve trovarsi cento indirizzi email veri. Per una
   camminata di paese è la proporzione giusta; una serratura vera vorrebbe
   una conferma via mail prima dell'iscrizione, e allontanerebbe più
   iscritti veri di quanti finti ne fermerebbe. */
const MAX_NON_PAGATE = 3;
const STATI_NON_PAGATE = ["DRAFT", "SENT", "UNPAID", "PAYMENT_PENDING", "PARTIALLY_PAID"];

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
function dataValida(iso) {
  if (!DATA_RE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/* Gli anni compiuti alla data della camminata. */
function etaAllEvento(iso) {
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
function leggiPersona(grezza, { minimo, massimo, chi, cfObbligatorio }) {
  const nome = pulisci(grezza?.nome, 80);
  const cognome = pulisci(grezza?.cognome, 80);
  const dataNascita = pulisci(grezza?.dataNascita, 10);
  const codiceFiscale = pulisci(grezza?.codiceFiscale, 16).toUpperCase();

  if (!nome || !cognome) return { errore: `${chi}: nome o cognome mancanti` };
  if (!dataValida(dataNascita)) return { errore: `${chi}: data di nascita mancante o non valida` };

  const eta = etaAllEvento(dataNascita);
  if (eta < minimo) {
    return {
      errore:
        minimo === 18
          ? "per iscriversi bisogna essere maggiorenni: i minori li iscrive un adulto insieme a sé"
          : `${chi}: sotto i 6 anni non serve iscriversi, si partecipa gratis`,
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

export default async function handler(req, res) {
  if (req.method === "GET") return verifica(req, res);
  if (req.method === "POST") return iscrivi(req, res);

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ errore: "metodo non consentito" });
}

/* ── Il ritorno dal pagamento ─────────────────────────────────────────────
   Due cose, in quest'ordine. Prima si incassa: PayPal, quando chi paga
   approva, non prende ancora niente, e i soldi si muovono solo quando
   glielo si chiede. Poi si guarda com'è andata e lo si dice alla pagina.

   Incassare qui e anche nel webhook non è una svista: è che al ritorno dal
   pagamento non ci si torna sempre, e la seconda richiesta di incasso PayPal
   la riconosce e non la esegue due volte.

   L'identificativo dell'ordine non è indovinabile, quindi chi ce l'ha è chi
   ha appena pagato: gli si può dire il suo nome e quante persone ha
   iscritto. Fuori di lì non esce niente — né l'email né il codice fiscale né
   gli altri campi. */
async function verifica(req, res) {
  const id = pulisci(req.query?.ordine, 40).toUpperCase();
  if (!ORDINE_RE.test(id)) {
    return res.status(400).json({ errore: "ordine non valido" });
  }

  try {
    const incassato = await incassaOrdine(id);
    /* Se l'incasso era già stato fatto, quello che torna è il rifiuto
       tollerato e non l'ordine: lo si rilegge, perché è dall'ordine che si
       capisce se i soldi ci sono. */
    const ordine = incassato?.giaFatto ? await leggiOrdine(id) : incassato;

    const voci = ordine?.purchase_units?.[0]?.items || [];
    const { adulto, minori } = personeDa({ items: voci });

    return res.status(200).json({
      pagato: ordine?.status === "COMPLETED",
      nome: adulto?.nome || "",
      persone: adulto ? 1 + minori.length : 0,
    });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}

/* ── L'iscrizione ─────────────────────────────────────────────────────────
   La fattura nasce prima di qualunque pagamento, ed è il registro: da lì in
   poi chi paga online viene mandato a un ordine che di quella fattura porta
   solo il numero, e chi paga in contanti non viene mandato da nessuna
   parte. */
async function iscrivi(req, res) {
  /* Iscrizioni chiuse: si dice qui, prima di guardare i campi, così chi arriva
     tardi legge «chiuse» e non «codice fiscale non valido». Il `chiuse: true`
     lo usa la pagina per nascondere il modulo invece di dire «riprova». */
  if (Date.now() > CHIUSURA_MS) {
    return res.status(403).json({
      errore:
        "le iscrizioni online si sono chiuse alle 23:59 del 18 settembre — " +
        "il giorno stesso ci si iscrive sul posto, prima della partenza",
      chiuse: true,
    });
  }

  /* Il campo trappola. Non esiste per chi compila — è nascosto, fuori
     dall'ordine di tabulazione e senza etichetta — quindi se arriva pieno
     l'ha riempito qualcosa che legge l'HTML e non la pagina. Non si dice
     «sei un robot»: si dice che non è riuscita, e si dà un indirizzo a cui
     scrivere, perché la persona vera che dovesse finirci in mezzo per una
     stranezza del suo browser non deve restare senza una via d'uscita. */
  if (pulisci(req.body?.sito, 200)) {
    return res.status(400).json({
      errore:
        "non è stato possibile registrare l'iscrizione da questo modulo — " +
        "scrivi a color-walk@rivaltasulmincio.it e ti iscriviamo noi",
    });
  }

  /* Chi si iscrive: maggiorenne per forza, codice fiscale obbligatorio.
     È la persona che si assume la responsabilità — per sé e per i minori
     che porta — quindi è quella che va identificata per intero. */
  const letto = leggiPersona(req.body, {
    minimo: 18,
    massimo: 120,
    chi: "Chi si iscrive",
    cfObbligatorio: true,
  });
  if (letto.errore) return res.status(400).json({ errore: letto.errore });
  const adulto = letto.persona;

  const email = pulisci(req.body?.email, 200);
  const telefono = pulisci(req.body?.telefono, 40);
  const note = pulisci(req.body?.note, 300);
  const consenso = req.body?.consenso === true;
  const modalita = pulisci(req.body?.pagamento, 20).toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "email mancante o non valida" });
  }
  if (!MODALITA.has(modalita)) {
    return res.status(400).json({ errore: "manca la scelta di come pagare la quota" });
  }
  /* La spunta è obbligatoria anche qui e non solo nel modulo: il `required`
     dell'HTML è una cortesia verso chi compila, non una garanzia per chi
     riceve. Ed è la dichiarazione con cui una persona si assume la
     responsabilità di sé e di chi porta con sé. */
  if (!consenso) {
    return res.status(400).json({ errore: "manca la dichiarazione di responsabilità" });
  }

  /* I minori a carico. Il codice fiscale qui è facoltativo — chi si assume la
     responsabilità è l'adulto, già identificato — ma se c'è viene controllato
     con lo stesso metro, data di nascita compresa. */
  const grezzi = Array.isArray(req.body?.minori) ? req.body.minori : [];
  if (grezzi.length > MAX_MINORI) {
    return res.status(400).json({
      errore: `si possono iscrivere al massimo ${MAX_MINORI} minori per volta: per gli altri, compila di nuovo il modulo`,
    });
  }

  const minori = [];
  for (let i = 0; i < grezzi.length; i++) {
    const esito = leggiPersona(grezzi[i], {
      minimo: 6,
      massimo: 17,
      chi: `Minore ${i + 1}`,
      cfObbligatorio: false,
    });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    minori.push(esito.persona);
  }

  const totaleCent = QUOTA_ADULTO_CENT + minori.length * QUOTA_MINORE_CENT;

  try {
    /* Quante ne ha già aperte e non pagate questo indirizzo. Se la domanda
       non si riesce a farla non si blocca nessuno: il tetto è una misura
       contro l'abuso, non una condizione per iscriversi, e un guasto nella
       ricerca non deve diventare una porta chiusa in faccia a chi si sta
       iscrivendo davvero. */
    let aperte = 0;
    try {
      const gia = await cercaFatture({ recipient_email: email, status: STATI_NON_PAGATE });
      aperte = gia.filter((f) => !saldata(f)).length;
    } catch (errore) {
      console.error("controllo delle iscrizioni già aperte non riuscito:", errore.message);
    }

    if (aperte >= MAX_NON_PAGATE) {
      return res.status(429).json({
        errore:
          `a questo indirizzo risultano già ${aperte} iscrizioni non ancora pagate. ` +
          "Se è un errore, o se ti serve iscrivere altre persone, scrivi a color-walk@rivaltasulmincio.it",
      });
    }

    /* Quando è stato dato il consenso, non solo che è stato dato: è la parte
       che serve se un domani qualcuno chiede conto di quei dati. */
    const numero = numeroFattura();
    const corpo = componiFattura({
      numero,
      adulto,
      minori,
      email,
      modalita,
      telefono,
      note,
      consenso: new Date().toISOString(),
    });
    const creata = await creaFattura(corpo);

    const idFattura = creata?.id || String(creata?.href || "").split("/").pop();
    if (!idFattura) throw new Error("PayPal ha creato la fattura ma non ha detto quale");

    /* Fuori dalla bozza, senza che PayPal scriva a nessuno: una bozza non
       accetta pagamenti, e senza questo passaggio né l'incasso online né il
       contante potrebbero mai essere segnati. */
    await spedisciFattura(idFattura);

    if (modalita === "contanti") return contanti(res, { fattura: corpo, idFattura, numero, email, totaleCent });

    const quante = minori.length ? ` + ${minori.length} minori` : "";
    const ordine = await creaOrdine({
      numero,
      adulto,
      minori,
      descrizione: `Color Walk 20 settembre — ${adulto.nome} ${adulto.cognome}${quante}`,
      /* L'identificativo dell'ordine non si mette qui: ce lo aggiunge PayPal
         al momento di rimandare indietro il browser, come `?token=…`. È
         quello che la pagina ci ripassa da verificare. */
      ritorno: `${SITE}/color-walk?stato=ok`,
      annulla: `${SITE}/color-walk?stato=annullato`,
    });

    return res.status(200).json({ url: ordine.url });
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}

/* ── Chi paga al ritrovo ──────────────────────────────────────────────────
   Nessun pagamento da aprire: l'iscrizione è già registrata, e quello che
   resta da fare è dirglielo. La mail parte da qui e non dal webhook, perché
   nessun webhook scatterà mai: non ci sarà nessun avviso di pagamento
   finché quei soldi non passano di mano davanti alla chiesa.

   Se la mail non parte, l'iscrizione resta valida lo stesso — è già scritta
   sulla fattura, che è il registro. Si risponde comunque «fatto», con
   l'avviso che la conferma non è arrivata: dire «non è riuscita» a chi è
   invece iscritto lo farebbe iscrivere una seconda volta. */
async function contanti(res, { fattura, idFattura, numero, email, totaleCent }) {
  /* La fattura passata qui è lo stesso oggetto mandato a PayPal un attimo
     fa: le stesse voci, gli stessi importi. La mail si compone da quello e
     non dai campi del modulo, così quello che la persona legge è quello che
     è stato scritto nel registro — non una seconda copia che potrebbe
     raccontare qualcos'altro. */
  const mail = ricevuta({ fattura, pagato: false });

  let spedita = true;
  try {
    await spedisci({ a: email, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });
  } catch (errore) {
    spedita = false;
    console.error(`iscrizione ${numero} (${idFattura}) registrata ma mail non spedita:`, errore.message);
  }

  return res.status(200).json({
    contanti: true,
    spedita,
    nome: mail.nome,
    persone: mail.persone,
    totaleCent,
  });
}
