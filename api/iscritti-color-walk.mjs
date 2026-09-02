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
  annullata,
  cercaFatture,
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

  const segreto = process.env.ISCRITTI_CHIAVE;
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
    if (req.method === "POST") return await incassa(req, res);
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

    /* Annullata a mano: una prova, un doppione, o qualcuno che aveva
       prenotato in contanti e non si è presentato. Non è un pagamento
       lasciato a metà — è un'iscrizione che non c'è più — e non si conta da
       nessuna parte, o resterebbe a gonfiare un numero per sempre.

       Le annulla anche il webhook, ma solo quelle online, quando il pagamento
       viene rifiutato: quelle sì che sono rimaste a metà, e infatti sono
       proprio il caso qui sotto. A dire quale delle due cose è, è il modo di
       pagare scritto nel memo. */
    if (annullata(f) && memo.modalita === "contanti") continue;

    /* Chi ha aperto il pagamento online e non è arrivato in fondo: non è
       iscritto, e il suo nome non esce di qui. Si conta e basta. */
    if (!pagata && (memo.modalita === "paypal" || annullata(f))) {
      incompleti++;
      continue;
    }

    let { adulto, minori } = personeDa(f);

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
      if (piena) ({ adulto, minori } = personeDa(piena));
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
        illeggibile: true,
        nome: "",
        cognome: "",
        codiceFiscale: "",
        dataNascita: "",
        email: f?.primary_recipients?.[0]?.billing_info?.email_address || "",
        telefono: memo.telefono,
        note: memo.note,
        consenso: memo.consenso,
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
      nome: adulto.nome,
      cognome: adulto.cognome,
      codiceFiscale: adulto.codiceFiscale,
      dataNascita: adulto.dataNascita,
      email: f?.primary_recipients?.[0]?.billing_info?.email_address || "",
      telefono: memo.telefono,
      note: memo.note,
      consenso: memo.consenso,
      minori: minori.map(({ nome, cognome, dataNascita, codiceFiscale }) => ({
        nome,
        cognome,
        dataNascita,
        codiceFiscale,
      })),
      quandoISO: quandoDi(f),
      importoCent: importoDi(f, [adulto, ...minori]),
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
    /* Due numeri diversi e tutti e due veri: quante volte è stato compilato
       il modulo, e quante persone cammineranno. È il secondo a doversi
       fermare sotto il tetto. */
    persone: iscritti.reduce((n, i) => n + 1 + i.minori.length, 0),
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
