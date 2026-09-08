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
  MAX_ADULTI,
  MAX_MINORI,
  MODALITA,
  annullata,
  QUOTA_ADULTO_CENT,
  QUOTA_MINORE_CENT,
  componiFattura,
  creaFattura,
  creaOrdine,
  incassaOrdine,
  leggiOrdine,
  numeroFattura,
  numeroDaTentativo,
  emailFattura,
  trovaFattura,
  personeDa,
  pulisci,
  saldata,
  spedisciFattura,
  cercaFatture,
} from "./_paypal.mjs";
import { ricevuta, spedisci } from "./_posta.mjs";
/* Le persone le legge e le controlla un modulo solo, che è lo stesso da cui
   passa la pagina di chi organizza quando ricopia un modulo cartaceo. */
import { EMAIL_RE, leggiPersona } from "./_persone.mjs";

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


/* Gli identificativi degli ordini PayPal: diciassette caratteri fra lettere
   maiuscole e cifre. Serve a non andare a chiedere a PayPal notizie di una
   stringa che un ordine non è, scritta a mano nella barra del browser. */
const ORDINE_RE = /^[A-Z0-9]{10,25}$/;

/* La sigla del tentativo: quella che la pagina si inventa quando si comincia
   a compilare e rimanda uguale a ogni invio dello stesso modulo. Non
   identifica una persona e non serve a riconoscerla: serve a riconoscere UN
   MODULO, per non registrarlo due volte. Si accetta solo la forma che manda
   la pagina — lettere, cifre e trattini — perché da lì scende un numero di
   fattura, e in un numero di fattura non ci va di tutto. */
const TENTATIVO_RE = /^[A-Za-z0-9_-]{8,60}$/;

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
    const { adulto, adulti, minori } = personeDa({ items: voci });

    return res.status(200).json({
      pagato: ordine?.status === "COMPLETED",
      nome: adulto?.nome || "",
      persone: adulto ? 1 + adulti.length + minori.length : 0,
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
    capofila: true,
  });
  if (letto.errore) return res.status(400).json({ errore: letto.errore });
  const adulto = letto.persona;

  const email = pulisci(req.body?.email, 200);
  const telefono = pulisci(req.body?.telefono, 40);
  const note = pulisci(req.body?.note, 300);
  const consenso = req.body?.consenso === true;
  const modalita = pulisci(req.body?.pagamento, 20).toLowerCase();
  /* Storta o assente, la sigla non è un motivo per dire di no: chi arriva da
     un browser che non ha saputo generarla si iscrive lo stesso, e la sua
     fattura prende il numero dall'orologio come si è sempre fatto. Perde solo
     la rete contro il doppione, che è meglio di perdere l'iscrizione. */
  const grezzoTentativo = pulisci(req.body?.tentativo, 80);
  const tentativo = TENTATIVO_RE.test(grezzoTentativo) ? grezzoTentativo : "";

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

  /* Gli altri maggiorenni. Il codice fiscale è obbligatorio come per chi
     compila, e per la stessa ragione: ognuno di loro si assume una
     responsabilità — la propria — e chi se ne assume una va identificato.
     La differenza col capofila non sta nei dati, sta nella lettera che
     prenderanno sulla fattura. */
  const grezziA = Array.isArray(req.body?.adulti) ? req.body.adulti : [];
  if (grezziA.length > MAX_ADULTI - 1) {
    return res.status(400).json({
      errore: `si possono iscrivere al massimo ${MAX_ADULTI} maggiorenni per volta: per gli altri, compila di nuovo il modulo`,
    });
  }

  const adulti = [];
  /* I codici già visti in questa iscrizione. Due volte la stessa persona
     succede a chi compila di fretta, e costa dieci euro veri: il codice
     fiscale è l'unico campo che lo dice con certezza, perché due omonimi
     veri hanno codici diversi. */
  const codiciVisti = [adulto.codiceFiscale];
  for (let i = 0; i < grezziA.length; i++) {
    const chi = `Adulto ${i + 2}`;
    const esito = leggiPersona(grezziA[i], {
      minimo: 18,
      massimo: 120,
      chi,
      cfObbligatorio: true,
    });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    if (codiciVisti.includes(esito.persona.codiceFiscale)) {
      return res.status(400).json({
        errore: `${chi}: questo codice fiscale è già in questa iscrizione — ogni persona si iscrive una volta sola`,
      });
    }
    codiciVisti.push(esito.persona.codiceFiscale);
    adulti.push(esito.persona);
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

  const totaleCent =
    QUOTA_ADULTO_CENT * (1 + adulti.length) + minori.length * QUOTA_MINORE_CENT;

  try {
    /* Quante ne ha già aperte e non pagate questo indirizzo. Se la domanda
       non si riesce a farla non si blocca nessuno: il tetto è una misura
       contro l'abuso, non una condizione per iscriversi, e un guasto nella
       ricerca non deve diventare una porta chiusa in faccia a chi si sta
       iscrivendo davvero. */
    let aperte = 0;
    try {
      const gia = await cercaFatture({ recipient_email: email, status: STATI_NON_PAGATE });
      /* Annullate escluse due volte: nella domanda a PayPal, con l'elenco
         degli stati, e di nuovo qui. La prima è un filtro che decide lui, la
         seconda è l'unica di cui rispondiamo noi — e sbagliarla vuol dire
         tenere fuori qualcuno che ha appena fatto pulizia e non capisce
         perché il modulo continui a dirgli di no. */
      aperte = gia.filter((f) => !saldata(f) && !annullata(f)).length;
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
    let numero = numeroDaTentativo(tentativo) || numeroFattura();
    const corpo = componiFattura({
      numero,
      adulto,
      adulti,
      minori,
      email,
      modalita,
      telefono,
      note,
      consenso: new Date().toISOString(),
    });
    let creata = await creaFattura(corpo, tentativo);

    /* Numero già preso SENZA che ci fosse una sigla. Non è il caso di sopra:
       qui il numero veniva dall'orologio, e due iscrizioni nello stesso
       millisecondo con le stesse quattro cifre a caso sono una cosa che non
       succede — ma se succedesse, trattarla come «era già registrata»
       vorrebbe dire dire «sei iscritto» a chi non lo è, e perdere
       l'iscrizione senza che nessuno se ne accorga. Si rifà, con un numero
       nuovo, una volta sola. */
    if (creata?.giaFatto && !tentativo) {
      console.warn(`iscrizione ${numero}: numero dall'orologio già preso, si rifà`);
      numero = numeroFattura();
      corpo.detail.invoice_number = numero;
      creata = await creaFattura(corpo);
    }

    /* Il numero era già preso. Se scende dal tentativo — e scende dal
       tentativo ogni volta che la pagina ne manda uno — l'unico che può
       averlo preso è il tentativo di prima dello stesso modulo: quello che
       non è tornato indietro e ha fatto premere di nuovo. Quindi non è una
       seconda iscrizione, è la stessa che chiede di nuovo la sua risposta.

       Non si crea niente e non si tocca niente: si riprende da dove si era
       rimasti. Per i contanti vuol dire rimandare la mail — che è proprio
       quella che la prima volta non era partita — e per il pagamento online
       vuol dire riaprire un checkout sulla stessa fattura. */
    const ripetuta = creata?.giaFatto === true && Boolean(tentativo);

    /* La fattura che c'era già. Serve solo per l'identificativo, e non è
       detto che arrivi: la ricerca di PayPal è un indice che ci mette
       qualche secondo, e una fattura nata trenta secondi fa lì dentro può
       non esserci ancora. Non trovarla non ferma niente — il numero è
       nostro, la fattura è nostra — ma se la si trova si controlla che sia
       davvero intestata a questo indirizzo, perché la sigla del tentativo
       arriva da fuori e da fuori si scrive qualunque cosa. */
    let idFattura = creata?.id || String(creata?.href || "").split("/").pop();
    if (ripetuta) {
      const gia = await trovaFattura(numero).catch(() => null);
      if (gia && emailFattura(gia) && emailFattura(gia) !== email.toLowerCase()) {
        return res.status(409).json({
          errore:
            "questa iscrizione risulta già registrata a un altro indirizzo — " +
            "ricarica la pagina e riprova, e se succede ancora scrivi a color-walk@rivaltasulmincio.it",
        });
      }
      idFattura = gia?.id || "";
      if (!idFattura) {
        console.warn(`iscrizione ${numero}: numero già preso ma fattura non ritrovata (indice PayPal in ritardo)`);
      }
    }
    if (!idFattura && !ripetuta) throw new Error("PayPal ha creato la fattura ma non ha detto quale");

    /* Fuori dalla bozza, senza che PayPal scriva a nessuno: una bozza non
       accetta pagamenti, e senza questo passaggio né l'incasso online né il
       contante potrebbero mai essere segnati. */
    if (idFattura) await spedisciFattura(idFattura);

    if (modalita === "contanti") return contanti(res, { fattura: corpo, idFattura, numero, email, totaleCent, ripetuta });

    /* Quello che chi paga legge sulla pagina di PayPal, accanto alla cifra.
       Singolare e plurale scritti giusti: è corto, lo legge una persona, e
       «1 minori» in mezzo a un pagamento fa sembrare storto tutto il resto. */
    const insieme = [
      adulti.length ? `${adulti.length} ${adulti.length === 1 ? "adulto" : "adulti"}` : "",
      minori.length ? `${minori.length} ${minori.length === 1 ? "minore" : "minori"}` : "",
    ]
      .filter(Boolean)
      .join(" + ");
    const quante = insieme ? ` + ${insieme}` : "";
    const ordine = await creaOrdine({
      numero,
      adulto,
      adulti,
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
    /* Questo `console.error` non c'era, ed è costato un'indagine intera. Il
       giorno che un'iscrizione si è rotta a metà — la fattura creata, la mail
       mai partita, e chi compilava che ha premuto tre volte — dei log non
       c'era niente da leggere: il guasto usciva di qui dentro un 502 e non
       lasciava traccia da nessuna parte. Un errore che il browser vede e il
       server non scrive è un errore che non si aggiusta. */
    console.error("iscrizione non riuscita:", errore?.stack || errore?.message || errore);
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
async function contanti(res, { fattura, idFattura, numero, email, totaleCent, ripetuta = false }) {
  /* La fattura passata qui è lo stesso oggetto mandato a PayPal un attimo
     fa: le stesse voci, gli stessi importi. La mail si compone da quello e
     non dai campi del modulo, così quello che la persona legge è quello che
     è stato scritto nel registro — non una seconda copia che potrebbe
     raccontare qualcos'altro.

     E si compone anche quando l'iscrizione c'era già. Anzi: soprattutto
     allora. Il modulo rimandato una seconda volta è quasi sempre il modulo di
     qualcuno a cui la prima volta la mail NON è arrivata — è per questo che
     ha premuto di nuovo — e rimandarla è l'unica cosa che gli serve. Una
     ricevuta in doppia copia è un fastidio di due secondi; una ricevuta che
     non arriva mai è una persona che si presenta al banchetto senza sapere
     se è iscritta. */
  const mail = ricevuta({ fattura, pagato: false });

  let spedita = true;
  try {
    await spedisci({ a: email, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });
  } catch (errore) {
    spedita = false;
    console.error(`iscrizione ${numero} (${idFattura || "senza id"}) registrata ma mail non spedita:`, errore.message);
  }

  return res.status(200).json({
    contanti: true,
    spedita,
    /* Che fosse già registrata lo sa la pagina, e le serve per non dire
       «iscrizione registrata» a chi la stava rimandando: gli dice che era già
       a posto, che è la cosa che stava cercando di sapere. */
    ripetuta,
    nome: mail.nome,
    persone: mail.persone,
    totaleCent,
  });
}
