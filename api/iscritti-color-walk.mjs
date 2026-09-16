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
  MAX_ADULTI,
  MAX_MINORI,
  MAX_PICCOLI,
  QUOTA_ADULTO_CENT,
  QUOTA_MINORE_CENT,
  annullata,
  annullaFattura,
  cancellaFattura,
  componiFattura,
  creaFattura,
  daCartaceo,
  moduloDi,
  nettoCent,
  numeroCartaceo,
  prossimoCartaceo,
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
/* Il registro dei contanti. Sta fuori da PayPal apposta: vedi `_supabase.mjs`,
   in fondo, alla voce «Il contante della Color Walk». */
import { segnaContante, contantiIncassati, configurato as supabasePronto } from "./_supabase.mjs";
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
      if (req.body?.modifica) return await modifica(req, res);
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

  /* Chi ha pagato in contanti lo dice il nostro registro, non PayPal.

     Si legge una volta sola per tutto l'elenco, e se Supabase non risponde si
     va avanti con una mappa vuota: un elenco senza i contanti è incompleto e
     si vede (`registroContanti: false` in fondo), ma un elenco che non si apre
     il 20 mattina è molto peggio. */
  let incassiContanti = new Map();
  let registroContanti = false;
  if (supabasePronto()) {
    try {
      incassiContanti = await contantiIncassati(EVENTO);
      registroContanti = true;
    } catch (errore) {
      console.error("registro dei contanti non letto:", errore.message);
    }
  }

  const iscritti = [];
  let incompleti = 0;
  let illeggibili = 0;
  let riletture = 0;

  for (const f of fatture) {
    /* LA CARTA È GIÀ PAGATA, SEMPRE.

       Un modulo cartaceo esiste solo perché qualcuno si è presentato al
       banchetto, ha firmato un foglio e ha messo i soldi nel cassetto. Non
       c'è un modulo cartaceo «da incassare»: se è di carta, è pagato — e
       quei soldi li ha contati una persona, non PayPal.

       Fino al 15 settembre questa verità dipendeva da PayPal: lo stato della
       fattura. Ma per arrivare a scrivere «pagata» su una fattura PayPal
       pretende che prima esca dalla bozza, e quando quel passaggio veniva
       rifiutato — è successo, e non solo alla carta — il foglio restava lì a
       dire «da incassare» con i soldi già in cassetta, e nessun tasto poteva
       più rimediare.

       Adesso la regola sta qui, dove nessuna chiamata di rete la può
       smentire: il numero della fattura comincia per CW-CART-, quindi è un
       foglio di carta, quindi è pagato. Quello che PayPal pensa si continua a
       guardare per tutte le altre — online e contanti prenotati dal sito —
       dove è l'unica fonte che sa se i soldi sono arrivati davvero. */
    const diCarta = daCartaceo(f?.detail?.invoice_number);

    /* E il contante incassato al ritrovo, che sta nel nostro registro.

       È la terza via, e dal 16 settembre è quella che comanda sul contante:
       PayPal può rifiutarsi di scrivere «pagata» su una fattura — succede, a
       intermittenza e senza motivo leggibile — ma quei soldi li ha contati
       una persona al banchetto e sono nel cassetto. Il registro lo sa, e
       nessuna chiamata di rete lo può smentire. */
    const inContanti = incassiContanti.has(String(f?.detail?.invoice_number || ""));
    const pagata = diCarta || inContanti || saldata(f);
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

    let { adulto, adulti, minori, piccoli } = personeDa(f);

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
      if (piena) ({ adulto, adulti, minori, piccoli } = personeDa(piena));
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
        piccoli: [],
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
      piccoli: piccoli.map(({ nome, cognome, dataNascita }) => ({ nome, cognome, dataNascita })),
      quandoISO: quandoDi(f),
      importoCent: importoDi(f, [adulto, ...adulti, ...minori]),
      pagato: pagata,
      pagamento: comePagata(f),
    });
  }

  // Prima l'ultimo arrivato: è quello che chi guarda sta cercando.
  iscritti.sort((a, b) => (a.quandoISO < b.quandoISO ? 1 : -1));

  const daIncassare = iscritti.filter((i) => !i.pagato);

  /* ── La cassa, spaccata in due ──────────────────────────────────────
       «Incassato» da solo non basta a chi tiene i conti, perché mette
       insieme due cose che non si assomigliano: i soldi arrivati sul conto
       PayPal, su cui PayPal ha già trattenuto la sua commissione, e le
       banconote prese al banchetto, che sono intere e stanno in un cassetto.

       Chi deve versare all'associazione ha bisogno di sapere quale delle due
       cifre ha in mano e quale è già in banca, e quanto ne resta davvero
       dopo le commissioni. Quindi si contano separate, e di quella che passa
       da PayPal si dice anche il netto.

       Il netto si somma iscrizione per iscrizione, non nettando il totale:
       la commissione ha una parte fissa di 35 centesimi che PayPal trattiene
       a ogni pagamento, e due iscrizioni da 10 € la pagano due volte. */
  const pagati = iscritti.filter((i) => i.pagato);
  const online = pagati.filter((i) => i.pagamento !== "contanti");
  const contanti = pagati.filter((i) => i.pagamento === "contanti");

  const onlineLordoCent = online.reduce((s, i) => s + i.importoCent, 0);
  const onlineNettoCent = online.reduce((s, i) => s + nettoCent(i.importoCent), 0);
  const contantiCent = contanti.reduce((s, i) => s + i.importoCent, 0);

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
    /* Se il registro dei contanti è stato letto davvero. Quando è `false` i
       contanti incassati al ritrovo non compaiono, e l'elenco lo deve dire
       invece di far credere che quelle persone non abbiano pagato. */
    registroContanti,
    /* Quante iscrizioni sono state ricopiate da un modulo cartaceo. Serve a
       chi al banco vuole sapere se ha finito di riportare i fogli del giorno. */
    cartacei: iscritti.filter((i) => i.modulo).length,
    /* Due numeri diversi e tutti e due veri: quante volte è stato compilato
       il modulo, e quante persone cammineranno. È il secondo a doversi
       fermare sotto il tetto. */
    persone: iscritti.reduce(
      (n, i) => n + 1 + (i.adulti || []).length + i.minori.length + (i.piccoli || []).length,
      0
    ),
    tetto: TETTO_PARTECIPANTI,
    /* La cassa in cinque cifre. `incassatoCent` resta quello di prima — il
       totale di tutto quello che è stato incassato — perché è il numero che
       la pagina mostrava e che chi legge conosce; le altre lo spiegano. */
    incassatoCent: onlineLordoCent + contantiCent,
    onlineLordoCent,
    onlineNettoCent,
    onlineCommissioniCent: onlineLordoCent - onlineNettoCent,
    contantiCent,
    daIncassareCent: daIncassare.reduce((s, i) => s + i.importoCent, 0),
    daIncassare: daIncassare.length,
    aggiornatoISO: new Date().toISOString(),
  });
}

/* ── Correggere un'iscrizione già in elenco ───────────────────────────────
   Il banchetto non è un modulo web: si scrive a penna, di corsa, e mezz'ora
   dopo arriva il cugino che cammina anche lui, o si scopre che il cognome è
   sbagliato, o che quei dieci euro non erano stati davvero messi nel
   cassetto. Fino a oggi l'unica strada era annullare l'iscrizione e
   riscriverla da capo, il che vuol dire ribattere otto campi con la coda di
   gente davanti.

   — Perché si rifà la fattura invece di correggerla —
   PayPal ha un PUT che sostituisce una fattura, ma su una fattura già
   saldata lo rifiuta: è lo stesso muro contro cui sbatte il `/send`. E una
   correzione che funziona solo finché nessuno ha pagato non serve a niente,
   perché qui è pagato tutto — la carta lo è per definizione.

   Quindi si fa la cosa che non dipende dal loro permesso: si crea una
   fattura NUOVA col contenuto giusto, e si annulla la vecchia. Il numero
   resta lo stesso nella sostanza — un modulo cartaceo tiene il suo numero di
   foglio, con una lettera in coda che dice quante volte è stato corretto —
   così il foglio di carta nel raccoglitore continua a corrispondere alla
   riga in elenco, che è la cosa che deve restare vera.

   L'ordine conta: prima si crea la nuova, poi si annulla la vecchia. Se si
   invertisse e la creazione fallisse, l'iscrizione sarebbe sparita e i soldi
   con lei. Così invece il caso peggiore è due righe uguali per qualche
   secondo, che si vede e si aggiusta. */
async function modifica(req, res) {
  const m = req.body?.modifica || {};
  const id = pulisci(m.fattura, 40);
  if (!id) return res.status(400).json({ errore: "manca l'iscrizione da correggere" });

  const vecchia = await leggiFattura(id).catch(() => null);
  if (!vecchia) return res.status(404).json({ errore: "iscrizione non trovata" });

  /* La stessa guardia dell'incasso: questa chiave apre la Color Walk, non il
     permesso di riscrivere una fattura qualunque che sia sul conto. */
  if (String(vecchia?.detail?.reference || "") !== EVENTO) {
    return res.status(404).json({ errore: "iscrizione non trovata" });
  }
  if (annullata(vecchia)) {
    return res.status(400).json({ errore: "questa iscrizione è già stata annullata: non c'è più niente da correggere" });
  }

  const numeroVecchio = String(vecchia?.detail?.invoice_number || "");
  const memoVecchio = leggiMemo(vecchia?.detail?.memo);
  const daCarta = daCartaceo(numeroVecchio);

  /* Quello che c'era prima, per i campi che chi corregge non tocca. Una
     correzione parziale non deve cancellare quello che non nomina. */
  const prima = personeDa(vecchia);
  if (!prima.adulto) {
    return res.status(400).json({ errore: "questa iscrizione non si riesce a leggere: correggerla da qui la rovinerebbe" });
  }

  /* Chi si è iscritto. Se non arriva niente resta com'era, campo per campo:
     si corregge un cognome senza dover ribattere la data di nascita. */
  const capofilaGrezzo = {
    nome: m.nome ?? prima.adulto.nome,
    cognome: m.cognome ?? prima.adulto.cognome,
    dataNascita: m.dataNascita ?? prima.adulto.dataNascita,
    codiceFiscale: m.codiceFiscale ?? prima.adulto.codiceFiscale,
  };
  const letto = leggiPersona(capofilaGrezzo, {
    minimo: 18,
    massimo: 120,
    chi: "Chi si iscrive",
    cfObbligatorio: !daCarta,
    dataObbligatoria: !daCarta,
    capofila: true,
  });
  if (letto.errore) return res.status(400).json({ errore: letto.errore });
  const adulto = letto.persona;

  /* Le tre file. Chi non le nomina se le tiene come stanno; chi le nomina le
     sostituisce per intero, perché è così che la pagina le manda — l'elenco
     completo di quella fila, non una differenza da applicare. */
  const fila = async (chiave, vecchi, { minimo, massimo, eti, max }) => {
    if (!Array.isArray(m[chiave])) return { persone: vecchi };
    if (m[chiave].length > max) return { errore: `su un'iscrizione ci stanno al massimo ${max} ${eti}` };
    const fuori = [];
    for (let i = 0; i < m[chiave].length; i++) {
      const esito = leggiPersona(m[chiave][i], {
        minimo,
        massimo,
        chi: `${eti} ${i + 1}`,
        cfObbligatorio: false,
        dataObbligatoria: !daCarta && minimo === 18 ? true : minimo !== 18,
      });
      if (esito.errore) return { errore: esito.errore };
      fuori.push(esito.persona);
    }
    return { persone: fuori };
  };

  const esitoA = await fila("adulti", prima.adulti, { minimo: 18, massimo: 120, eti: "Maggiorenne", max: MAX_ADULTI - 1 });
  if (esitoA.errore) return res.status(400).json({ errore: esitoA.errore });
  const esitoM = await fila("minori", prima.minori, { minimo: 6, massimo: 17, eti: "Minore", max: MAX_MINORI });
  if (esitoM.errore) return res.status(400).json({ errore: esitoM.errore });
  const esitoP = await fila("piccoli", prima.piccoli, { minimo: 0, massimo: 5, eti: "Bambino", max: MAX_PICCOLI });
  if (esitoP.errore) return res.status(400).json({ errore: esitoP.errore });

  const adulti = esitoA.persone;
  const minori = esitoM.persone;
  const piccoli = esitoP.persone;

  const email = m.email === undefined
    ? String(vecchia?.primary_recipients?.[0]?.billing_info?.email_address || "")
    : pulisci(m.email, 200);
  if (email && email !== ORGANIZZATORI && !EMAIL_RE.test(email)) {
    return res.status(400).json({ errore: "l'email non si legge come un indirizzo: correggila o lasciala vuota" });
  }

  const totaleCent = QUOTA_ADULTO_CENT * (1 + adulti.length) + minori.length * QUOTA_MINORE_CENT;

  /* Il numero della nuova fattura. Per un cartaceo si tiene il numero del
     foglio e gli si attacca una lettera: CW-CART-42 corretto una volta
     diventa CW-CART-42B, poi 42C. Così il foglio nel raccoglitore si trova
     sempre, e due correzioni non si pestano i piedi. Per le altre si riparte
     dall'orologio, come una qualsiasi iscrizione nuova. */
  const numero = daCarta ? prossimoCartaceo(numeroVecchio) : `${numeroVecchio}-C${Date.now().toString(36).toUpperCase().slice(-3)}`;

  /* Come risulta pagata. `pagatoCash` è il campo che chiede la pagina quando
     si corregge lo stato del contante: vero vuol dire «i soldi ci sono»,
     falso «non ancora». Chi non lo nomina tiene quello che c'era. */
  const eraPagata = daCarta || saldata(vecchia);
  const pagata = m.pagatoCash === undefined ? eraPagata : m.pagatoCash === true;

  const note = m.note === undefined ? memoVecchio.note : pulisci(m.note, 300);
  const telefono = m.telefono === undefined ? memoVecchio.telefono : pulisci(m.telefono, 40);

  const corpo = componiFattura({
    numero,
    adulto,
    adulti,
    minori,
    piccoli,
    email: email || ORGANIZZATORI,
    modalita: memoVecchio.modalita || "contanti",
    telefono,
    note,
    /* Il consenso è quello di allora: è il momento in cui quella persona ha
       detto di sì, e una correzione fatta da noi non lo sposta. */
    consenso: memoVecchio.consenso || new Date().toISOString(),
  });

  const creata = await creaFattura(corpo);
  const idNuovo = creata?.id || String(creata?.href || "").split("/").pop();
  if (!idNuovo) {
    return res.status(502).json({ errore: "PayPal non ha creato la nuova versione: l'iscrizione è rimasta com'era" });
  }

  /* Segnarla pagata, se lo era o se lo si sta dicendo adesso. Per un cartaceo
     non è obbligatorio che PayPal riesca a scriverlo: la carta è pagata
     perché è di carta, e l'elenco lo sa dal numero della fattura. */
  let segnata = null;
  if (pagata) {
    const segno = await portaAPagata(idNuovo, {
      metodo: "CASH",
      nota: daCarta ? `Contanti al banchetto — modulo cartaceo n. ${moduloDi(numero)}` : "Contanti incassati",
      obbligatorio: false,
    });
    segnata = segno.segnata;
  }

  /* E solo adesso si toglie di mezzo la vecchia. Se questo fallisce restano
     due righe: è brutto da vedere ed è l'unico esito che non perde niente,
     quindi si dice e si va avanti. */
  let vecchiaVia = true;
  try {
    if (String(vecchia?.status || "") === "DRAFT") await cancellaFattura(id);
    else await annullaFattura(id);
  } catch (errore) {
    vecchiaVia = false;
    console.error(`correzione di ${numeroVecchio}: nuova fattura ${numero} creata ma la vecchia non si è tolta:`, errore.message);
  }

  return res.status(200).json({
    modificata: true,
    id: idNuovo,
    numero,
    modulo: moduloDi(numero),
    nome: `${adulto.nome} ${adulto.cognome}`,
    persone: 1 + adulti.length + minori.length + piccoli.length,
    totaleCent,
    pagata,
    segnata,
    vecchiaVia,
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

/* ── Portare una fattura fino a «pagata» ──────────────────────────────────
   Segnare un pagamento su PayPal richiede che la fattura sia fuori dalla
   bozza, e fin qui si mandava un `/send` alla cieca sperando che bastasse.
   Non bastava: il 15 settembre il modulo n. 2 è entrato in elenco «da
   incassare» con i soldi già in cassetta, e nei log `/send` e `/payments`
   venivano rifiutati tutti e due sulla stessa fattura, all'infinito.

   Qui invece si guarda lo stato vero prima di muoversi, e si fa solo quello
   che quello stato consente:

     · già saldata → non c'è niente da fare, e non è un errore;
     · ancora bozza → si spedisce, e POI si paga;
     · già spedita → si paga e basta, senza rispedirla.

   Una lettura in più per ogni incasso, che su una camminata di paese non si
   sente, e in cambio niente più chiamate mandate a caso. Se la lettura non
   riesce si prova la strada di prima — spedire e pagare — perché un incasso
   non si perde per una GET andata storta. */
async function portaAPagata(idFattura, { metodo, nota, obbligatorio = true, gia = null }) {
  /* `gia` è la fattura che il chiamante ha già in mano. Passarla risparmia un
     viaggio a PayPal, e chi incassa al banchetto ce l'ha sempre: l'ha appena
     letta per controllare che fosse della Color Walk. Senza, si legge qui. */
  const prima = gia || (await leggiFattura(idFattura).catch(() => null));

  if (prima && saldata(prima)) return { gia: true, segnata: true };

  /* Senza lo stato sotto gli occhi si prova comunque: il `/send` su una
     fattura già spedita PayPal lo perdona con `ALREADY_SENT`. */
  const stato = String(prima?.status || "");

  try {
    /* Se PayPal rifiuta di spedirla, si prova a pagarla lo stesso.

       Dal 16 settembre `/send` torna indietro con un `REQUEST_REJECTED` muto
       su OGNI fattura — un blocco dal lato di PayPal, non nostro, e non c'è
       riga di codice che lo tolga. Ma quel rifiuto non deve portarsi dietro
       anche l'incasso: il 20 mattina, al ritrovo, ci sono decine di contanti
       da spuntare uno per uno, e una spunta che fallisce lì è una persona
       che ha pagato e che l'elenco continua a dare per non pagata.

       Quindi lo spedire diventa un tentativo, non una condizione. Se va, la
       strada è quella di sempre. Se non va, si prova `/payments` comunque:
       nel peggiore dei casi lo rifiuta anche lui — e allora l'errore che
       conta è quello, non quello dello spedire — ma se lo accetta, i soldi
       sono segnati e giovedì mattina il banco va avanti. */
    if (!prima || stato === "DRAFT") {
      try {
        await spedisciFattura(idFattura);
      } catch (errore) {
        console.error(`fattura ${idFattura}: /send rifiutato (${errore.message}) — si prova a segnare il pagamento lo stesso`);
      }
    }
    const esito = await registraPagamento(idFattura, { metodo, nota });
    return { gia: esito?.giaFatto === true, segnata: true };
  } catch (errore) {
    /* `obbligatorio` distingue i due mondi, e la differenza è tutta qui.

       Per un'iscrizione ONLINE questo passo è la verità stessa: se PayPal non
       registra il pagamento, non si sa se quei soldi esistono. L'errore sale.

       Per un modulo CARTACEO no. Quei soldi sono nel cassetto — li ha contati
       una persona al banchetto, c'è un foglio firmato che lo dice — e la
       fattura è soltanto il posto dove li stiamo annotando. Se PayPal si
       rifiuta di annotarli, il fatto non cambia: l'iscrizione entra lo stesso,
       e l'elenco la conta pagata perché è di carta, non perché PayPal è
       riuscito a scriverlo. Far fallire il riporto qui vorrebbe dire perdere
       una persona vera e dei soldi veri per un capriccio di un servizio. */
    if (obbligatorio) throw errore;
    console.error(`fattura ${idFattura}: contante non segnato su PayPal (${errore.message}) — l'iscrizione resta, la carta è pagata comunque`);
    return { gia: false, segnata: false, perche: errore.message };
  }
}

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

  /* Gli altri maggiorenni del foglio, e qui la carta si stacca dall'online.
     Sul foglio firmato al banchetto la riga di chi cammina con te arriva
     quasi sempre col solo nome e cognome: si firma in piedi, in dieci minuti,
     e nessuno tira fuori la tessera sanitaria della moglie. Pretendere data e
     codice fiscale qui vorrebbe dire rifiutare quel foglio — e un foglio
     rifiutato è un'iscrizione che manca in elenco e una quota che non risulta
     incassata. L'incasso è la cosa che conta, ed è quella che si salva.

     Chi risponde per tutti resta il primo nome, che i suoi dati li dà sempre:
     è lui la reperibilità del foglio. Gli altri sono nomi per la lista delle
     sacche, e quello che di loro è stato scritto — la data, il codice, o
     tutti e due — si controlla come sempre. Il tetto non cambia. */
  const grezziA = Array.isArray(c.adulti) ? c.adulti : [];
  if (grezziA.length > MAX_ADULTI - 1) {
    return res.status(400).json({ errore: `su un foglio ci stanno al massimo ${MAX_ADULTI} maggiorenni` });
  }
  const adulti = [];
  const codiciVisti = [adulto.codiceFiscale];
  for (let i = 0; i < grezziA.length; i++) {
    const chi = `Adulto ${i + 2}`;
    const esito = leggiPersona(grezziA[i], {
      minimo: 18,
      massimo: 120,
      chi,
      cfObbligatorio: false,
      dataObbligatoria: false,
    });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    /* Il doppione si cerca solo fra i codici che ci sono davvero: adesso che
       il campo può restare vuoto, senza questo guardia due accompagnati senza
       codice fiscale sarebbero «la stessa persona» perché sono due stringhe
       vuote uguali. */
    if (esito.persona.codiceFiscale && codiciVisti.includes(esito.persona.codiceFiscale)) {
      return res.status(400).json({
        errore: `${chi}: questo codice fiscale è già su questo foglio — ogni persona si iscrive una volta sola`,
      });
    }
    if (esito.persona.codiceFiscale) codiciVisti.push(esito.persona.codiceFiscale);
    adulti.push(esito.persona);
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

  /* E i bambini sotto i 6 anni, che sul foglio ci sono e non pagano. */
  const grezziP = Array.isArray(c.piccoli) ? c.piccoli : [];
  if (grezziP.length > MAX_PICCOLI) {
    return res.status(400).json({ errore: `su un foglio ci stanno al massimo ${MAX_PICCOLI} bambini sotto i 6 anni` });
  }
  const piccoli = [];
  for (let i = 0; i < grezziP.length; i++) {
    const esito = leggiPersona(grezziP[i], { minimo: 0, massimo: 5, chi: `Bambino ${i + 1}`, cfObbligatorio: false });
    if (esito.errore) return res.status(400).json({ errore: esito.errore });
    piccoli.push(esito.persona);
  }

  const totaleCent =
    QUOTA_ADULTO_CENT * (1 + adulti.length) + minori.length * QUOTA_MINORE_CENT;

  /* L'ora che si registra è quella in cui il foglio è stato ricopiato, non
     quella della firma: è l'unica delle due che questa funzione sa per certo.
     Il consenso vero è la firma sul foglio, e il numero del modulo è quello
     che dice dove andarla a cercare. */
  const corpo = componiFattura({
    numero,
    adulto,
    adulti,
    minori,
    piccoli,
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

  /* Al banco i soldi sono già stati presi: il foglio ha «Totale versato»
     compilato e la firma sotto. OGNI modulo cartaceo si riporta già pagato in
     contanti — è la regola, non un caso particolare — così non finisce nel
     conto di quello che resta da incassare la mattina del 20.

     Se questo passo non riesce, l'errore sale e il foglio NON risulta
     riportato: meglio riprovare col foglio in mano che una riga in elenco
     che dice «da incassare» con i soldi già nel cassetto. */
  const segno = await portaAPagata(idFattura, {
    metodo: "CASH",
    nota: `Contanti al banchetto — modulo cartaceo n. ${modulo}`,
    obbligatorio: false,
  });

  /* La ricevuta parte SUBITO, appena il foglio è confermato, e parte da sé:
     non c'è nessun secondo gesto da fare. L'unica condizione è che sul foglio
     un indirizzo ci fosse — chi non l'ha lasciato ha il suo foglio in mano, ed
     è quella la sua ricevuta.

     Se la spedizione fallisce l'iscrizione resta buona: i soldi sono presi e
     la riga c'è, e buttare via tutto per una mail sarebbe il danno peggiore.
     Ma il MOTIVO torna indietro insieme alla risposta, non solo nel log:
     «non è partita» da solo non dice se l'indirizzo era sbagliato, se manca
     la chiave del servizio di posta o se il mittente non è verificato, e chi
     sta al banchetto quella differenza la deve poter leggere. */
  let spedita = null;
  let perche = "";
  if (email) {
    const mail = ricevuta({ fattura: corpo, pagato: true, cartaceo: modulo });
    try {
      await spedisci({ a: email, oggetto: mail.oggetto, html: mail.html, testo: mail.testo });
      spedita = true;
    } catch (errore) {
      spedita = false;
      perche = errore.message;
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
    persone: 1 + adulti.length + minori.length + piccoli.length,
    totaleCent,
    spedita,
    ...(email ? { email } : {}),
    ...(perche ? { perche } : {}),
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

  /* PRIMA il nostro registro, e solo dopo PayPal.

     Questo è l'ordine che conta, ed è cambiato il 16 settembre. Prima la
     spunta esisteva solo dentro PayPal: se lui rifiutava — e quel giorno ha
     cominciato a rifiutare a intermittenza, sulla stessa fattura, senza un
     motivo leggibile — chi stava al banchetto aveva i soldi in mano e uno
     schermo che diceva di no.

     Adesso i contanti li comanda il registro. Si scrive lì, e da quel momento
     la persona è pagata per l'elenco: è la verità, perché quei soldi sono nel
     cassetto e li ha contati qualcuno. Se scrivere nel registro non riesce,
     ALLORA sì che è un errore da mostrare, perché vuol dire che di
     quell'incasso non resta traccia da nessuna parte. */
  const numeroFattura = String(fattura?.detail?.invoice_number || "");
  const importoCent = Math.round(Number(fattura?.amount?.value || 0) * 100);
  let nelRegistro = false;
  let giaSegnato = false;

  if (supabasePronto()) {
    const segno = await segnaContante({
      evento: EVENTO,
      numero: numeroFattura,
      fattura: fattura.id,
      importoCent,
      nota: "Contanti incassati al ritrovo, prima della partenza",
    });
    nelRegistro = segno.segnato;
    giaSegnato = segno.gia;
  }

  /* E poi PayPal — ma DOPO aver risposto, non prima.

     Qui si decide quanto dura un incasso al banchetto, e la misura è venuta
     dal collaudo: cinque secondi a spunta. Davanti alla chiesa, con la fila
     che aspetta e cento contanti da segnare, cinque secondi per volta sono
     un'ora di coda.

     Se ne andavano tutti in PayPal: leggere la fattura, rileggerla, spedirla,
     segnarla. Quattro viaggi di rete, ognuno coi suoi secondi, prima che chi
     ha premuto vedesse qualcosa — e nessuno dei quattro cambiava la risposta,
     perché la verità sul contante ormai la tiene il registro.

     Quindi l'ordine giusto è: il registro ha scritto, la persona è pagata,
     RISPONDI. PayPal lo si allinea dopo, mentre chi sta al banco è già
     passato al prossimo. Se rifiuta resta nel log, e i soldi sono comunque
     al sicuro nel registro — che è tutto il senso di averlo fatto.

     Quando invece il registro NON c'è (Supabase non configurato), PayPal
     torna a essere l'unico posto dove l'incasso può essere scritto: lì si
     aspetta, perché rispondere «fatto» senza aver scritto da nessuna parte
     sarebbe una bugia. */
  if (nelRegistro) {
    /* La risposta parte adesso. `gia` viene dal registro, che è la fonte:
       dice il vero anche senza aspettare PayPal. */
    res.status(200).json({ incassata: true, gia: giaSegnato, id: fattura.id });

    /* Su Vercel un lavoro lasciato indietro dopo la risposta può non arrivare
       in fondo: l'istanza viene congelata, e riprende solo se le capita
       un'altra richiesta. Quindi questo allineamento è un di più, non una
       promessa — e il codice è scritto perché quel di più possa mancare
       senza che nessuno ci rimetta: l'incasso è già nel registro, e l'elenco
       legge da lì. Al peggio la fattura su PayPal resta indietro, ed è
       esattamente la cosa che `_build/fatture-in-bozza.mjs` rimette in riga
       con calma, a camminata finita. */

    /* E questo continua da solo. Non si aspetta e non si `await`a: l'unico
       esito che interessa è una riga di log, e chi ha premuto è già altrove. */
    portaAPagata(fattura.id, {
      metodo: "CASH",
      nota: "Contanti incassati al ritrovo, prima della partenza",
      obbligatorio: false,
      gia: fattura,
    }).catch((errore) => {
      console.error(`incasso ${numeroFattura}: registrato da noi, ma PayPal non l'ha preso (${errore.message})`);
    });
    return;
  }

  /* Senza registro si aspetta PayPal, perché è rimasto l'unico posto dove
     scrivere. La carta resta l'eccezione: è pagata perché è di carta. */
  const esito = await portaAPagata(fattura.id, {
    metodo: "CASH",
    nota: "Contanti incassati al ritrovo, prima della partenza",
    obbligatorio: !daCartaceo(numeroFattura),
    gia: fattura,
  });

  /* Che PayPal non abbia gridato non vuol dire che abbia scritto. Le scuse
     che `paypal()` tollera tornano indietro come `giaFatto`, e per due di
     loro — «era già pagata» — va benissimo così: chi ha premuto il tasto
     voleva quei soldi segnati, e segnati sono.

     Il controllo vero lo fa `registraPagamento`, che da oggi NON tollera
     più lo stato sbagliato: quello sale come errore e lo prende il catch
     del chiamante. Qui si risponde `gia` con sincerità, perché la pagina
     possa dire «era già segnata» invece di far credere a chi sta al banco
     di essere stato lui a incassarla adesso. */
  return res.status(200).json({ incassata: true, gia: esito.gia, id: fattura.id });
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
