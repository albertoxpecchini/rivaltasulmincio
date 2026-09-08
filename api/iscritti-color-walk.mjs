/* ═══════════════════════════════════════════════════════════════════════════
   /api/iscritti-color-walk — l'elenco di chi si è iscritto alla Color
   Walk, per chi organizza. Lo legge la pagina /iscritti.

   Fa due mestieri:

     GET   l'elenco: chi è iscritto, chi ha già pagato e chi paga al ritrovo,
           quante persone in tutto e quanto c'è ancora da incassare.

     POST  il contante incassato. È il bottone che si preme davanti alla
           chiesa, quando qualcuno arriva e paga: segna quella fattura come
           saldata, metodo contanti. Si può fare anche dall'app di PayPal —
           ma sui gradini della chiesa, col telefono in una mano e i soldi
           nell'altra, il bottone vince.

   ── L'elenco non è un database nostro ─────────────────────────────────────
   È l'elenco delle fatture PayPal: ogni iscrizione ne è una, e i dati del
   modulo ci stanno dentro come voci e memo (vedi api/_paypal.mjs). Questa
   funzione non fa altro che rileggerle e rimetterle in fila. Non c'è niente
   da tenere allineato, perché non c'è una seconda copia.

   ── Un'iscrizione può valere più persone ──────────────────────────────────
   Chi si iscrive è maggiorenne e può portare con sé i minori a suo carico. Un
   pagamento, quindi, non è una persona: è un adulto più i suoi minori,
   scritti come voci separate della fattura. Qui si contano uno per uno,
   perché il tetto dell'evento è di 300 PARTECIPANTI e non di 300 pagamenti —
   e perché l'elenco che serve al ritiro delle sacche è quello delle persone.

   ── Tre stati, non due ────────────────────────────────────────────────────
   Con la sola carta gli stati erano due: pagato, o non arrivato in fondo.
   Adesso sono tre, e la differenza conta parecchio il giorno della
   camminata:

     · pagato online          la quota è già sul conto;
     · da incassare           iscritto, viene a pagare al ritrovo. È una
                              persona che ci sarà: occupa un posto e una
                              sacca esattamente come le altre;
     · non completato         ha aperto il pagamento online e non è arrivato
                              in fondo. Non è iscritto, e nell'elenco non
                              compare con nome e cognome: se ne conta soltanto
                              quanti sono. Sono persone che ci hanno
                              ripensato, e di loro agli organizzatori serve
                              sapere il numero, non l'anagrafica.

   ── Qui dentro passano dati di persone vere ───────────────────────────────
   Nome, cognome, CODICE FISCALE, data di nascita, email e telefono di
   chiunque si sia iscritto, e i nomi dei minori che qualcuno porta con sé. È
   il dato più sensibile che questo sito tocchi, e sta dietro l'unica porta
   chiusa a chiave del progetto:

     · serve la chiave in ISCRITTI_CHIAVE, una variabile d'ambiente su Vercel.
       Se non è impostata la funzione non risponde — non «risponde a tutti»:
       una porta senza serratura si tiene chiusa, non spalancata;
     · il confronto è a tempo costante, così la chiave non si indovina un
       carattere alla volta misurando quanto ci mette a dire di no;
     · chi sbaglia aspetta mezzo secondo prima della risposta: rende inutile
       provarne diecimila;
     · niente cache, da nessuna parte: `no-store` in testata;
     · la pagina che la interroga è noindex e fuori dalla sitemap, e /api/ è
       già escluso in robots.txt.

   La stessa chiave vale per la POST. Non è una serratura diversa perché non
   è un potere diverso: chi può leggere l'anagrafica di trecento persone può
   anche segnare che una di loro ha pagato dieci euro.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createHash, timingSafeEqual } from "node:crypto";
import {
  EVENTO,
  MAX_MINORI,
  QUOTA_ADULTO_CENT,
  QUOTA_MINORE_CENT,
  annullata,
  annullaFattura,
  cancellaFattura,
  componiFattura,
  creaFattura,
  moduloDi,
  numeroCartaceo,
  spedisciFattura,
  tutteLeFatture,
  leggiFattura,
  comePagata,
  leggiMemo,
  personeDa,
  pulisci,
  registraPagamento,
  saldata,
  trovaFattura,
} from "./_paypal.mjs";
/* La stessa validazione del modulo online, non una copia: chi entra dal
   banchetto e chi entra dal sito devono passare dallo stesso metro. */
import { EMAIL_RE, leggiPersona } from "./_persone.mjs";
import { ORGANIZZATORI, ricevuta, spedisci } from "./_posta.mjs";

/* Il materiale che ANSPI ha a disposizione basta per trecento persone: è il
   tetto dell'evento, e la pagina /iscritti lo mostra accanto al conto di
   quante ne sono state iscritte finora. Ci stanno dentro anche quelle che
   pagheranno al ritrovo: il posto è occupato lo stesso. */
const TETTO_PARTECIPANTI = 300;

/* Quante fatture al massimo si va a rileggere una per una quando la ricerca
   torna senza le voci. È una rete di sicurezza, non la strada normale: se si
   riempie, il guasto è nella ricerca e va risolto là. */
const MAX_RILETTURE = 60;

const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));

/* Le due chiavi passano da uno sha256 prima del confronto: così sono sempre
   lunghe uguali — timingSafeEqual pretende due buffer della stessa misura, e
   se glieli si desse di lunghezza diversa bisognerebbe controllarla prima,
   rivelando proprio quella. */
function stessaChiave(a, b) {
  if (!a || !b) return false;
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

const importoDi = (fattura, persone) => {
  const totale = Math.round(Number(fattura?.amount?.value || 0) * 100);
  return totale || persone.reduce((s, p) => s + p.importoCent, 0);
};

/* Quando è stata fatta l'iscrizione. `invoice_date` è un giorno e basta:
   per mettere in fila le iscrizioni di oggi serve l'ora, che sta nei dati di
   servizio della fattura. Se non ci fosse, il giorno da solo è meglio di
   niente — l'ordine dentro la giornata si perde, l'elenco no. */
const quandoDi = (fattura) =>
  fattura?.detail?.metadata?.create_time || `${fattura?.detail?.invoice_date || ""}T00:00:00Z`;

export default async function handler(req, res) {
  /* Un elenco di iscritti non si mette in cache da nessuna parte: né nel
     browser, né nella rete di distribuzione davanti alla funzione. */
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  /* La chiave che arriva dalla pagina passa da `pulisci`: niente a capo,
     niente spazi ai bordi. Quella dell'ambiente va normalizzata allo stesso
     modo, o un solo spazio invisibile rimasto attaccato incollando il valore
     nel pannello di Vercel chiude la porta a tutti — e dal di fuori non c'è
     modo di vederlo: la pagina direbbe «chiave non valida» a chi la chiave ce
     l'ha giusta, e la chiave giusta non esisterebbe più.

     Il taglio a 200 caratteri resta solo sul lato che arriva da fuori, dove
     serve a non farsi mandare un chilo di roba da confrontare. Qui sarebbe
     un'altra cosa: accorcerebbe la chiave vera senza dirlo a nessuno. */
  const segreto = pulisci(process.env.ISCRITTI_CHIAVE, Infinity);
  if (!segreto) {
    return res.status(503).json({
      errore: "zona iscritti non configurata: manca ISCRITTI_CHIAVE fra le variabili d'ambiente",
    });
  }

  const data = pulisci(req.query?.chiave || req.headers["x-chiave"], 200);
  if (!stessaChiave(data, segreto)) {
    await aspetta(500);
    return res.status(401).json({ errore: "chiave non valida" });
  }

  try {
    /* `await` e non solo `return`: senza, un errore là dentro nascerebbe
       dopo che questa funzione è già finita, e il catch qui sotto non lo
       vedrebbe passare. */
    /* Quattro cose si scrivono da questa porta, e si distinguono dal corpo:
       riportare un modulo cartaceo, annullare un'iscrizione, rimandare la
       ricevuta a chi non l'ha ricevuta, o segnare incassato il contante di
       un'iscrizione che c'è già — che resta il caso senza etichetta, perché
       è quello che si fa cento volte la mattina del 20. */
    if (req.method === "POST") {
      if (req.body?.cartaceo) return await riporta(req, res);
      if (req.body?.annulla) return await annulla(req, res);
      if (req.body?.ricevuta) return await rimanda(req, res);
      return await incassa(req, res);
    }
    return await elenco(res);
  } catch (errore) {
    return res.status(502).json({ errore: String(errore.message || errore) });
  }
}

async function elenco(res) {
  const fatture = await tutteLeFatture();

  const iscritti = [];
  let incompleti = 0;
  let illeggibili = 0;
  let riletture = 0;

  for (const f of fatture) {
    const pagata = saldata(f);
    const memo = leggiMemo(f?.detail?.memo);

    /* Annullata vuol dire che non c'è più, e non importa chi l'ha annullata:
       chi organizza, perché era una prova o un doppione o qualcuno che aveva
       prenotato in contanti e non si è presentato; o il webhook, dopo un
       pagamento rifiutato. In tutti e due i casi è una partita chiusa — a chi
       ha avuto il pagamento rifiutato la mail è già partita — e tenerla in un
       conteggio vuol dire lasciare un numero gonfio addosso alla pagina per
       sempre, senza nessun modo di toglierlo.

       Prima queste due cose le distinguevo, e la distinzione non pagava.
       Quello che resta contato qui sotto è il numero utile davvero: chi ha
       aperto il pagamento online e non l'ha mai concluso né chiuso. */
    if (annullata(f)) continue;

    /* Chi ha aperto il pagamento online e non è arrivato in fondo: non è
       iscritto, e il suo nome non esce di qui. Si conta e basta. */
    if (!pagata && memo.modalita === "paypal") {
      incompleti++;
      continue;
    }

    let { adulto, adulti, minori } = personeDa(f);

    /* Le voci sono la fattura: senza, non si sa chi è iscritto. La ricerca
       dovrebbe restituirle — gliele chiediamo — ma se per qualsiasi ragione
       non arrivano, la fattura si va a rileggere intera prima di rinunciare.
       Costa una chiamata, e solo per quelle che ne hanno bisogno.

       Se questa rilettura scattasse su tutte, il conto delle chiamate
       diventerebbe insostenibile e il guasto sarebbe a monte, nella ricerca:
       per questo si ferma a un tetto e lo dice nel registro invece di
       trascinare la funzione oltre il tempo che ha. */
    if (!adulto && riletture < MAX_RILETTURE) {
      riletture++;
      const piena = await leggiFattura(f.id).catch(() => null);
      if (piena) ({ adulto, adulti, minori } = personeDa(piena));
    }

    /* E se ancora non si legge, la riga compare lo stesso. Una fattura che
       sparisce dall'elenco è una persona che nessuno chiama al banchetto e
       di cui nessuno si accorge; una riga che dice «non riesco a leggerla»
       è un problema che si vede, col numero per andarlo a guardare su
       PayPal. Vale come una persona, perché una persona lo è. */
    if (!adulto) {
      illeggibili++;
      iscritti.push({
        id: f.id,
        numero: f?.detail?.invoice_number || "",
        modulo: moduloDi(f?.detail?.invoice_number),
        illeggibile: true,
        nome: "",
        cognome: "",
        codiceFiscale: "",
        dataNascita: "",
        email: f?.primary_recipients?.[0]?.billing_info?.email_address || "",
        telefono: memo.telefono,
        note: memo.note,
        consenso: memo.consenso,
        /* Vuoti tutti e due, e non assenti: la pagina ci passa sopra con
           un ciclo, e un elenco che non c'è la fermerebbe sulla riga che
           esiste apposta per dire che qualcosa non va. */
        adulti: [],
        minori: [],
        quandoISO: quandoDi(f),
        importoCent: Math.round(Number(f?.amount?.value || 0) * 100),
        pagato: pagata,
        pagamento: comePagata(f),
      });
      continue;
    }

    iscritti.push({
      id: f.id,
      numero: f?.detail?.invoice_number || "",
      /* Da dove viene questa iscrizione. Non c'è un campo che lo dica: lo dice
         il numero della fattura, che per i moduli cartacei porta il numero del
         foglio. Costa niente e non tocca il memo, che è la cosa che non si
         può toccare senza perdere le note di chi si è già iscritto. */
      modulo: moduloDi(f?.detail?.invoice_number),
      nome: adulto.nome,
      cognome: adulto.cognome,
      codiceFiscale: adulto.codiceFiscale,
      dataNascita: adulto.dataNascita,
      email: f?.primary_recipients?.[0]?.billing_info?.email_address || "",
      telefono: memo.telefono,
      note: memo.note,
      consenso: memo.consenso,
      /* Gli altri maggiorenni dell'iscrizione. Escono con gli stessi quattro
         campi dei minori — l'importo resta fuori di qui come per loro, perché
         la scheda ne mostra uno solo, quello dell'iscrizione intera. */
      adulti: adulti.map(({ nome, cognome, dataNascita, codiceFiscale }) => ({
        nome,
        cognome,
        dataNascita,
        codiceFiscale,
      })),
      minori: minori.map(({ nome, cognome, dataNascita, codiceFiscale }) => ({
        nome,
        cognome,
        dataNascita,
        codiceFiscale,
      })),
      quandoISO: quandoDi(f),
      importoCent: importoDi(f, [adulto, ...adulti, ...minori]),
      pagato: pagata,
      pagamento: comePagata(f),
    });
  }

  // Prima l'ultimo arrivato: è quello che chi guarda sta cercando.
  iscritti.sort((a, b) => (a.quandoISO < b.quandoISO ? 1 : -1));

  const daIncassare = iscritti.filter((i) => !i.pagato);

  return res.status(200).json({
    evento: EVENTO,
    iscritti,
    incompleti,
    /* Quante fatture di questo evento PayPal ha restituito in tutto, e quante
       di quelle non si è riusciti a leggere. Servono a distinguere «non c'è
       nessuno» da «non riesco a vedere nessuno», che sulla pagina di chi
       organizza sono la stessa immagine e due guai molto diversi. */
    letti: fatture.length,
    illeggibili,
    /* Quante iscrizioni sono state ricopiate da un modulo cartaceo. Serve a
       chi al banco vuole sapere se ha finito di riportare i fogli del giorno. */
    cartacei: iscritti.filter((i) => i.modulo).length,
    /* Due numeri diversi e tutti e due veri: quante volte è stato compilato
       il modulo, e quante persone cammineranno. È il secondo a doversi
       fermare sotto il tetto. */
    persone: iscritti.reduce((n, i) => n + 1 + (i.adulti || []).length + i.minori.length, 0),
    tetto: TETTO_PARTECIPANTI,
    /* Quello che è già sul conto, e quello che si raccoglie al banchetto la
       mattina del 20: due cifre separate perché sono due cose separate, e
       chi tiene la cassa deve sapere quanti soldi aspettarsi. */
    incassatoCent: iscritti.filter((i) => i.pagato).reduce((s, i) => s + i.importoCent, 0),
    daIncassareCent: daIncassare.reduce((s, i) => s + i.importoCent, 0),
    daIncassare: daIncassare.length,
    aggiornatoISO: new Date().toISOString(),
  });
}

/* ── Il contante che arriva ───────────────────────────────────────────────
   Si segna la fattura, non un registro nostro: l'iscrizione era già lì, e
   quello che cambia è che adesso è saldata. Da quel momento la persona
   compare fra i pagati, sulla pagina di chi organizza e nel pannello di
   PayPal, senza che nessuno debba riportare niente da nessuna parte.

   Si accetta l'identificativo della fattura o il suo numero: dal telefono si
   preme un bottone e passa l'identificativo, ma il numero è quello che si
   legge in elenco, ed è più facile da ridire a voce se qualcosa va storto. */

/* ── Un modulo cartaceo riportato a mano ──────────────────────────────────
   Chi si iscrive al banchetto lascia un foglio firmato e paga in contanti lì.
   Quel foglio poi va ricopiato in elenco, o il tetto dei 300 si conta su metà
   degli iscritti e il giorno della camminata al banco delle sacche ci sono
   nomi che l'elenco non conosce.

   È una procedura a mano, e le tre cose che la tengono sicura sono queste.

   La PORTA è la stessa dell'elenco: questa funzione non si raggiunge senza la
   chiave degli organizzatori, che è già stata controllata dal chiamante.

   Il NUMERO DEL FOGLIO diventa il numero della fattura. Riportare due volte
   lo stesso foglio non crea due iscrizioni: la seconda volta si torna indietro
   dicendo che c'era già. La difesa è doppia — si guarda prima di scrivere, e
   PayPal rifiuta comunque un numero di fattura ripetuto — perché fra il
   guardare e lo scrivere passa una chiamata di rete, e due persone al banco
   possono ricopiare lo stesso foglio nello stesso momento.

   Le PERSONE passano dallo stesso `leggiPersona` del modulo online. Un codice
   fiscale che il sito rifiuterebbe non entra da questa porta solo perché è
   stato scritto a penna. */
async function riporta(req, res) {
  const c = req.body?.cartaceo || {};

  const modulo = pulisci(c.modulo, 12).replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (!modulo) {
    return res.status(400).json({ errore: "manca il numero del modulo: è quello scritto in cima al foglio" });
  }
  const numero = numeroCartaceo(modulo);

  /* Prima difesa: c'è già? */
  const gia = await trovaFattura(numero).catch(() => null);
  if (gia) {
    return res.status(200).json({
      riportato: true,
      gia: true,
      modulo,
      numero,
      id: gia.id,
      messaggio: `Il modulo n. ${modulo} era già in elenco: non è stato riportato due volte.`,
    });
  }

  const letto = leggiPersona(c, {
    minimo: 18,
    massimo: 120,
    chi: "Chi si iscrive",
    cfObbligatorio: true,
    capofila: true,
  });
  if (letto.errore) return res.status(400).json({ errore: letto.errore });
  const adulto = letto.persona;

  /* L'email è facoltativa: sul foglio può non esserci, e un'iscrizione vera
     non si butta via per un campo lasciato in bianco. Quando manca, la fattura
     la si intesta all'associazione — che è chi quel foglio lo custodisce
     davvero — e nessuna ricevuta parte, perché non c'è dove mandarla. */
  const email = pulisci(c.email, 200);
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "l'email scritta sul foglio non si legge come un indirizzo: correggila o lasciala vuota" });
  }

  const grezzi = Array.isArray(c.minori) ? c.minori : [];
  if (grezzi.length > MAX_MINORI) {
    return res.status(400).json({ errore: `su un foglio ci stanno al massimo ${MAX_MINORI} minori` });
  }
  const minori = [];
  for (let i = 0; i < grezzi.length; i++) {
    const esito = leggiPersona(grezzi[i], { minimo: 6, massimo: 17, chi: `Minore ${i + 1}`, cfObbligatorio: false });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    minori.push(esito.persona);
  }

  const totaleCent = QUOTA_ADULTO_CENT + minori.length * QUOTA_MINORE_CENT;

  /* L'ora che si registra è quella in cui il foglio è stato ricopiato, non
     quella della firma: è l'unica delle due che questa funzione sa per certo.
     Il consenso vero è la firma sul foglio, e il numero del modulo è quello
     che dice dove andarla a cercare. */
  const corpo = componiFattura({
    numero,
    adulto,
    adulti: [],
    minori,
    email: email || ORGANIZZATORI,
    modalita: "contanti",
    telefono: pulisci(c.telefono, 40),
    note: pulisci(c.note, 300),
    consenso: new Date().toISOString(),
  });

  const creata = await creaFattura(corpo);
  const idFattura = creata?.id || String(creata?.href || "").split("/").pop();
  if (!idFattura) {
    /* Seconda difesa: PayPal ha rifiutato il numero ripetuto e `creaFattura`
       lo tollera senza dare un id. Vuol dire che qualcun altro ha riportato
       questo foglio fra il controllo di prima e adesso. */
    return res.status(200).json({
      riportato: true,
      gia: true,
      modulo,
      numero,
      messaggio: `Il modulo n. ${modulo} risulta già riportato: non è stato scritto due volte.`,
    });
  }

  await spedisciFattura(idFattura);

  /* Al banco i soldi sono già stati presi: il foglio ha «Totale versato»
     compilato e la firma sotto. Si segna pagato subito, così non finisce nel
     conto di quello che resta da incassare la mattina del 20. */
  await registraPagamento(idFattura, {
    metodo: "CASH",
    nota: `Contanti al banchetto — modulo cartaceo n. ${modulo}`,
  });

  /* La ricevuta parte solo se sul foglio un indirizzo c'era. Chi non l'ha
     lasciato ha già il suo foglio in mano, ed è quella la sua ricevuta. */
  let spedita = null;
  if (email) {
    const mail = ricevuta({ fattura: corpo, pagato: true, cartaceo: modulo });
    try {
      await spedisci({ a: email, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });
      spedita = true;
    } catch (errore) {
      spedita = false;
      console.error(`modulo cartaceo ${modulo} riportato ma mail non spedita:`, errore.message);
    }
  }

  return res.status(200).json({
    riportato: true,
    gia: false,
    modulo,
    numero,
    id: idFattura,
    nome: `${adulto.nome} ${adulto.cognome}`,
    persone: 1 + minori.length,
    totaleCent,
    spedita,
  });
}
async function incassa(req, res) {
  const id = pulisci(req.body?.fattura, 40);
  const numero = pulisci(req.body?.numero, 40);
  if (!id && !numero) return res.status(400).json({ errore: "manca l'iscrizione da segnare" });

  const fattura = id ? await leggiFattura(id).catch(() => null) : await trovaFattura(numero);
  if (!fattura) return res.status(404).json({ errore: "iscrizione non trovata" });

  /* Il marchio si ricontrolla anche qui: questa chiave apre l'elenco della
     Color Walk, non il permesso di segnare pagata una qualunque fattura che
     ci sia sul conto PayPal. */
  if (String(fattura?.detail?.reference || "") !== EVENTO) {
    return res.status(404).json({ errore: "iscrizione non trovata" });
  }

  if (saldata(fattura)) {
    /* Già segnata: non è un errore, è qualcuno che ha premuto due volte o
       due persone al banchetto che hanno segnato la stessa. Si risponde di
       sì, perché il mondo è nello stato che si voleva. */
    return res.status(200).json({ incassata: true, gia: true, id: fattura.id });
  }

  await registraPagamento(fattura.id, {
    metodo: "CASH",
    nota: "Contanti incassati al ritrovo, prima della partenza",
  });

  return res.status(200).json({ incassata: true, gia: false, id: fattura.id });
}

/* ── Trovare l'iscrizione su cui si sta per scrivere ──────────────────────
   Le tre scritture che agiscono su un'iscrizione che c'è già partono tutte
   dalla stessa domanda, e sbagliarla in una sola delle tre vorrebbe dire
   toccare la fattura di qualcun altro. Quindi si chiede una volta sola.

   Il marchio dell'evento si ricontrolla sempre: questa chiave apre l'elenco
   della Color Walk, non il permesso di scrivere su una qualunque fattura che
   ci sia sul conto PayPal. */
async function quale(req) {
  const id = pulisci(req.body?.fattura, 40);
  const numero = pulisci(req.body?.numero, 40);
  if (!id && !numero) return { errore: "manca l'iscrizione", codice: 400 };

  const fattura = id ? await leggiFattura(id).catch(() => null) : await trovaFattura(numero);
  if (!fattura) return { errore: "iscrizione non trovata", codice: 404 };
  if (String(fattura?.detail?.reference || "") !== EVENTO) {
    return { errore: "iscrizione non trovata", codice: 404 };
  }
  return { fattura };
}

/* ── Togliere un'iscrizione ───────────────────────────────────────────────
   Serve per una cosa sola, ed è una cosa che capita: il doppione. Qualcuno
   manda lo stesso modulo due o tre volte perché non gli torna indietro
   niente, e in elenco compare tre volte con lo stesso figlio. Finché non
   c'era questo, l'unico modo di far pulizia era entrare nel pannello di
   PayPal — cioè un posto dove per sbagliare basta un clic, e dove non c'è
   niente che dica quale di quelle fatture è la Color Walk.

   Un'iscrizione già pagata non si tocca da qui, e non è una precauzione
   generica: dietro ci sono dieci euro veri, e toglierla vorrebbe dire
   decidere anche di un rimborso. Quella decisione la prende una persona, nel
   pannello di PayPal, guardando il movimento. */
async function annulla(req, res) {
  const trovata = await quale(req);
  if (trovata.errore) return res.status(trovata.codice).json({ errore: trovata.errore });
  const fattura = trovata.fattura;

  if (saldata(fattura)) {
    return res.status(409).json({
      errore:
        "questa iscrizione risulta pagata: non si toglie da qui. " +
        "Se va rimborsata, il movimento si tratta nel pannello di PayPal.",
    });
  }

  if (annullata(fattura)) {
    /* Già annullata non è un errore: è qualcuno che ha premuto due volte, o
       due persone che stanno facendo pulizia insieme. Il mondo è nello stato
       che si voleva. */
    return res.status(200).json({ annullata: true, gia: true, id: fattura.id });
  }

  /* Una bozza non si annulla, si butta: vedi `cancellaFattura`. */
  if (String(fattura.status || "") === "DRAFT") await cancellaFattura(fattura.id);
  else await annullaFattura(fattura.id);

  return res.status(200).json({ annullata: true, gia: false, id: fattura.id });
}

/* ── Rimandare la ricevuta ────────────────────────────────────────────────
   La mail può non essere arrivata, e quando non arriva non c'è nessun modo
   di accorgersene da qui: la fattura è scritta, l'iscrizione è valida, e
   l'unico che sa che manca qualcosa è chi sta guardando una casella vuota.
   Prima di questo, l'unica risposta possibile era scriverla a mano.

   La ricevuta si compone dalla fattura vera, riletta adesso da PayPal — non
   dai campi di una pagina — quindi dice esattamente quello che c'è scritto
   nel registro: chi è iscritto, quanto, e se quei soldi ci sono già o si
   pagano al ritrovo. È la stessa funzione che scrive le altre due mail del
   progetto, e quindi non può divergere da loro.

   L'indirizzo di solito è quello della fattura. Si può scriverne un altro
   perché il caso esiste ed è banale: al banchetto uno detta la mail e chi
   scrive sbaglia una lettera. Non apre niente che non fosse già aperto — chi
   ha questa chiave l'elenco lo sta già leggendo per intero. */
async function rimanda(req, res) {
  const trovata = await quale(req);
  if (trovata.errore) return res.status(trovata.codice).json({ errore: trovata.errore });
  const fattura = trovata.fattura;

  if (annullata(fattura)) {
    return res.status(409).json({ errore: "questa iscrizione è annullata: non c'è nessuna ricevuta da mandare" });
  }

  const scritta = String(fattura?.primary_recipients?.[0]?.billing_info?.email_address || "").trim();
  const altro = pulisci(req.body?.a, 200);
  const a = altro || scritta;
  if (!EMAIL_RE.test(a)) {
    return res.status(400).json({
      errore: altro
        ? "l'indirizzo scritto qui non è valido"
        : "questa iscrizione non ha nessun indirizzo email: scrivilo qui accanto",
    });
  }

  const numero = String(fattura?.detail?.invoice_number || "");
  const mail = ricevuta({
    fattura,
    pagato: saldata(fattura),
    /* La data della ricevuta è quella del pagamento, se c'è stato, e non
       quella di adesso: una ricevuta rimandata a settembre per un pagamento
       di agosto deve dire agosto. */
    quando: fattura?.payments?.transactions?.[0]?.payment_date || fattura?.detail?.invoice_date,
    cartaceo: moduloDi(numero),
  });

  try {
    await spedisci({ a, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });
  } catch (errore) {
    console.error(`ricevuta di ${numero} non rimandata a ${a}:`, errore.message);
    return res.status(502).json({ errore: `la mail non è partita (${errore.message})` });
  }

  return res.status(200).json({ rimandata: true, a, nome: mail.nome, persone: mail.persone });
}
