/* ═══════════════════════════════════════════════════════════════════════════
   /api/meteo — la stazione di Rivalta, tradotta in JSON.

   L'unica funzione che gira su un server in tutto il sito. Esiste per un
   motivo preciso: meteomincio.it pubblica i dati della stazione in un file di
   testo pubblico (clientraw.txt, il formato standard di Weather Display), ma
   il suo server non manda l'header Access-Control-Allow-Origin. Senza quello
   il browser di chi legge rivaltasulmincio.it non può aprire quel file: non è
   una questione di permessi sul dato, è il browser che si rifiuta di leggere
   un dominio che non l'ha autorizzato. Serve qualcuno che stia in mezzo, e
   sta qui.

   Cortesia verso il loro server: la risposta esce con s-maxage=60, quindi è
   la CDN di Vercel a servirla ai visitatori e meteomincio viene interrogato
   **al massimo una volta al minuto** — mille persone sulla pagina o una sola,
   per loro non cambia niente. Ha senso anche dal lato del dato: la stazione
   ricarica il file ogni ~25 secondi e quello che si legge è vecchio di una
   cinquantina, quindi chiedere più spesso non restituirebbe nulla di nuovo.

   Se qualcosa non va — loro offline, formato cambiato, rete lenta — questa
   funzione risponde 503 e basta. Non inventa un dato plausibile: la pagina sa
   cavarsela dicendo che la lettura non è disponibile, che è vero, mentre una
   temperatura finta non lo sarebbe.
   ═══════════════════════════════════════════════════════════════════════════ */

const FONTE = "https://www.meteomincio.it/clientraw.txt";

/* Il loro server manda Cache-Control: max-age=86400 su un file che cambia
   ogni 25 secondi — è una svista di configurazione, non un'intenzione. Il
   parametro cambia a ogni chiamata proprio per scavalcarla: è la stessa cosa
   che fa il loro cruscotto. */
const conAntiCache = () => `${FONTE}?${Date.now()}`;

/* ── Il formato clientraw ─────────────────────────────────────────────────
   Una riga sola, valori separati da spazio, posizione fissa. Comincia per
   12345 e finisce con !!: due sentinelle che servono a riconoscere il file
   troncato a metà upload, che altrimenti si leggerebbe come un file valido
   con dentro numeri a caso.

   Gli indici qui sotto sono verificati contro ajaxWDwx3.js, lo script che
   meteomincio usa per il proprio cruscotto: sono gli stessi numeri che
   leggono loro, non una nostra ipotesi. Temperature in °C, pressione in hPa,
   pioggia in mm; il vento in clientraw è **in nodi** e va convertito. */
const CAMPI = {
  ventoMedio: 1, ventoRaffica: 2, ventoGradi: 3,
  temperatura: 4, umidita: 5, pressione: 6,
  pioggiaOggi: 7, pioggiaMese: 8, pioggiaAnno: 9, intensitaPioggia: 10,
  ora: 29, minuti: 30, secondi: 31,
  temperaturaMax: 46, temperaturaMin: 47,
  condizione: 48, tendenzaBarometrica: 50,
  rugiada: 72, data: 74,
  uv: 79, radiazione: 127, percepita: 130,
};

const NODI_IN_KMH = 1.852;

/* ── Che tempo fa ─────────────────────────────────────────────────────────
   Il campo 48 è un numero da 0 a 37 con cui Weather Display dice la
   condizione in corso. Accanto, il campo 49 sarebbe la stessa cosa a parole,
   ma esce così: «Dusk/Dry/A_few_clouds_» — inglese, a pezzi separati da barre
   e con gli spazi scritti come underscore. Il numero non ha bisogno di essere
   ripulito prima di essere capito, quindi si traduce quello.

   Delle 38 voci originali molte finiscono nella stessa immagine: «rain» e
   «rain2» sono la stessa pioggia, «cloudy» e «cloudy2» la stessa nuvola. Qui
   restano le distinzioni che si vedono davvero guardando fuori dalla finestra
   — e il giorno separato dalla notte, perché una notte serena col sole
   disegnato sopra sarebbe una bugia. La chiave sceglie il disegno, il testo è
   quello che si legge. */
const CONDIZIONI = {
  0: ["sereno", "Sereno"],
  1: ["sereno-notte", "Sereno"],
  2: ["nuvoloso", "Nuvoloso"],
  3: ["nuvoloso", "Nuvoloso"],
  4: ["poco-nuvoloso-notte", "Poco nuvoloso"],
  5: ["poco-nuvoloso", "Poco nuvoloso"],
  6: ["nebbia", "Nebbia"],
  7: ["nebbia", "Foschia"],
  8: ["pioggia", "Pioggia forte"],
  9: ["poco-nuvoloso", "Poco nuvoloso"],
  10: ["nebbia", "Foschia"],
  11: ["nebbia", "Nebbia"],
  12: ["pioggia", "Pioggia forte"],
  13: ["coperto", "Coperto"],
  14: ["pioggia", "Pioggia"],
  15: ["pioggia", "Rovesci"],
  16: ["neve", "Neve"],
  17: ["temporale", "Temporale"],
  18: ["coperto", "Coperto"],
  19: ["poco-nuvoloso", "Parzialmente nuvoloso"],
  20: ["pioggia", "Pioggia"],
  21: ["pioggia", "Pioggia"],
  22: ["pioggia", "Rovesci"],
  23: ["neve", "Nevischio"],
  24: ["neve", "Rovesci di nevischio"],
  25: ["neve", "Neve"],
  26: ["neve", "Neve in scioglimento"],
  27: ["neve", "Rovesci di neve"],
  28: ["sereno", "Sereno"],
  29: ["temporale", "Rovesci temporaleschi"],
  30: ["temporale", "Rovesci temporaleschi"],
  31: ["temporale", "Temporale"],
  32: ["vento", "Tromba d'aria"],
  33: ["vento", "Ventoso"],
  34: ["poco-nuvoloso", "Ha smesso di piovere"],
  35: ["pioggia", "Pioggia e vento"],
  36: ["sereno", "Alba"],
  37: ["sereno-notte", "Tramonto"],
};

/* I sedici settori, in italiano: Ovest è O, non W. 22,5° l'uno. */
const ROSA = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const settore = (gradi) => ROSA[Math.round((gradi % 360) / 22.5) % 16];

/* Weather Display scrive le assenze come -100 o 255: sono sentinelle, non
   misure. Un sensore che non c'è (o rotto) deve arrivare alla pagina come
   null, così il riquadro sparisce invece di annunciare -100 °C. */
const numero = (grezzo) => {
  const n = Number.parseFloat(grezzo);
  if (!Number.isFinite(n) || n === -100 || n === 255) return null;
  return n;
};

const arrotonda = (n, decimali = 1) =>
  n === null ? null : Number.parseFloat(n.toFixed(decimali));

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ errore: "metodo non consentito" });
  }

  try {
    const risposta = await fetch(conAntiCache(), {
      /* Ci presentiamo. Se un giorno il traffico di questa funzione desse
         fastidio a meteomincio, devono poter capire da dove arriva e a chi
         scrivere, senza doverlo indovinare da un indirizzo IP. */
      headers: { "User-Agent": "rivaltasulmincio.it (+https://www.rivaltasulmincio.it)" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (!risposta.ok) throw new Error(`la stazione ha risposto ${risposta.status}`);

    const riga = (await risposta.text()).trim();

    /* Le due sentinelle. Senza questo controllo un file arrivato a metà
       diventa silenziosamente una lettura sbagliata, ed è il modo peggiore di
       sbagliare: nessuno se ne accorge. */
    if (!riga.startsWith("12345") || !riga.endsWith("!!")) {
      throw new Error("file incompleto o formato non riconosciuto");
    }

    const c = riga.split(/\s+/);
    if (c.length < 140) throw new Error(`campi insufficienti (${c.length})`);

    const leggi = (chiave) => numero(c[CAMPI[chiave]]);
    const gradi = leggi("ventoGradi");
    const nodi = (chiave) => {
      const n = leggi(chiave);
      return n === null ? null : arrotonda(n * NODI_IN_KMH);
    };

    /* L'ora è quella della **stazione**, non quella in cui abbiamo chiesto
       noi. È la differenza fra «questo è il dato delle 17:20» e «ho guardato
       alle 17:21»: la pagina deve poter dire la prima, perché è l'unica che
       dice davvero quanto è vecchia la misura. Esce senza fuso, come ora
       locale: la stazione scrive l'ora italiana e il paese è lì. */
    const [g, m, a] = String(c[CAMPI.data]).split("/").map(Number);
    const due = (v) => String(v).padStart(2, "0");
    const rilevazione =
      Number.isFinite(g) && Number.isFinite(m) && Number.isFinite(a)
        ? `${a}-${due(m)}-${due(g)}T${due(c[CAMPI.ora])}:${due(c[CAMPI.minuti])}:${due(c[CAMPI.secondi])}`
        : null;

    /* Se un giorno Weather Display aggiungesse un numero che qui non c'è, il
       resto della lettura è comunque buono: la scheda mostra i gradi e tace
       sul disegno, invece di rompersi tutta per un'icona. */
    const [icona, condizione] = CONDIZIONI[leggi("condizione")] ?? [null, null];

    const dati = {
      rilevazione,
      icona,
      condizione,
      temperatura: arrotonda(leggi("temperatura")),
      temperaturaMin: arrotonda(leggi("temperaturaMin")),
      temperaturaMax: arrotonda(leggi("temperaturaMax")),
      percepita: arrotonda(leggi("percepita")),
      rugiada: arrotonda(leggi("rugiada")),
      umidita: arrotonda(leggi("umidita"), 0),
      pressione: arrotonda(leggi("pressione")),
      tendenzaBarometrica: arrotonda(leggi("tendenzaBarometrica")),
      vento: nodi("ventoMedio"),
      raffica: nodi("ventoRaffica"),
      ventoGradi: gradi === null ? null : Math.round(gradi),
      ventoDirezione: gradi === null ? null : settore(gradi),
      pioggiaOggi: arrotonda(leggi("pioggiaOggi")),
      pioggiaMese: arrotonda(leggi("pioggiaMese")),
      pioggiaAnno: arrotonda(leggi("pioggiaAnno")),
      intensitaPioggia: arrotonda(leggi("intensitaPioggia")),
      uv: arrotonda(leggi("uv")),
      radiazione: arrotonda(leggi("radiazione"), 0),
      fonte: "https://www.meteomincio.it",
    };

    /* stale-while-revalidate: allo scadere dei 60 secondi il primo visitatore
       riceve subito la copia appena scaduta e l'aggiornamento avviene dietro
       le sue spalle. Nessuno resta ad aspettare che Aruba risponda, e se la
       stazione va giù per qualche minuto la pagina continua a mostrare
       l'ultima lettura buona invece di un errore. */
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(dati);
  } catch (errore) {
    /* Anche il guasto si mette in cache, per dieci secondi. Senza, una
       stazione offline significherebbe che ogni singola apertura della pagina
       va a bussare a un server che non risponde. */
    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60");
    return res.status(503).json({ errore: String(errore.message || errore) });
  }
}
