/* ═══════════════════════════════════════════════════════════════════════════
   La stazione di Rivalta, in pagina.

   Chiede /api/meteo — che a sua volta legge la stazione vera — e riempie i
   riquadri. Poi lo rifà ogni minuto, da solo, finché la pagina resta aperta.

   Lo stesso script serve due forme diverse: la scheda piccola nella hero della
   home e la griglia estesa in fondo a /natura. Non le conosce e non le
   distingue: cerca gli elementi che dichiarano `data-meteo` e ci scrive dentro
   il campo che chiedono. Una terza forma, un domani, non richiede una riga qui.

   Tre scelte che vale la pena spiegare.

   La prima: i blocchi partono `hidden` e compaiono solo alla prima lettura
   riuscita. Un riquadro pieno di trattini non è un'attesa, è una promessa non
   mantenuta; se i dati non arrivano è meglio che la pagina resti quella di
   prima.

   La seconda: quando la scheda finisce in secondo piano il ciclo si ferma. Un
   sito lasciato aperto in una scheda che nessuno guarda non deve continuare a
   interrogare un server per l'eternità — e nel momento in cui si torna a
   guardarlo, la lettura si rinfresca subito, prima ancora del minuto.

   La terza: se la stazione tace, i numeri già a schermo **restano**, e a
   cambiare è solo la riga in fondo, che smette di dire l'ora della misura e
   dice da quanto non arrivano notizie. Cancellare i valori punirebbe chi legge
   per un guasto che non è suo, e l'ultima lettura buona resta comunque
   l'informazione migliore che abbiamo.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  const blocchi = [...document.querySelectorAll("[data-meteo-blocco]")];
  if (!blocchi.length) return;

  const ATTESA = 60_000; // un minuto: la stazione non ha niente di più fresco
  const ATTESA_MAX = 600_000; // ...ma se tace, ci si allontana fino a dieci

  /* ── I disegni ──────────────────────────────────────────────────────────
     Undici condizioni, undici figure, tutte con lo stesso tratto delle altre
     icone del sito: nessun riempimento, linee da 1.6, estremità tonde. Sono
     qui e non in un file di immagini perché il colore lo devono prendere dal
     testo — così passano da sole al tema scuro, e una notte serena non resta
     azzurra su fondo nero perché il .svg era stato salvato azzurro.

     **Nessuna figura ne copre un'altra.** Il primo tentativo faceva passare la
     nuvola davanti al sole, riempiendola del colore del fondo per nasconderlo:
     funzionava sul foglio di prova e sarebbe stato sbagliato in pagina, perché
     la scheda sta su una lastra di vetro traslucida e non sul fondo della
     pagina — la toppa si sarebbe vista come una macchia più chiara dentro la
     nuvola. Qui l'astro sta in alto a destra e la nuvola in basso a sinistra,
     senza toccarsi: si legge uguale e non dipende da cosa c'è dietro. */
  const SOLE = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>';
  const LUNA = '<path d="M20.2 14.6A8.4 8.4 0 1 1 9.4 3.8a6.6 6.6 0 0 0 10.8 10.8Z"/>';
  const NUVOLA = '<path d="M7 19h10.2a3.8 3.8 0 0 0 .4-7.6 5.6 5.6 0 0 0-10.8-1.2A4 4 0 0 0 7 19Z"/>';
  /* La stessa nuvola alzata di tre unità e mezzo, per lasciare sotto lo spazio
     della pioggia, della neve, del fulmine e delle righe della nebbia. */
  const NUVOLA_ALTA = '<path d="M7 15.4h10.2a3.8 3.8 0 0 0 .4-7.6 5.6 5.6 0 0 0-10.8-1.2A4 4 0 0 0 7 15.4Z"/>';

  /* Le versioni piccole per l'angolo in alto a destra. Sono ridisegnate a
     misura invece che rimpicciolite con un transform: scalare un gruppo scala
     anche lo spessore del tratto, e un sole con le linee più sottili di tutte
     le altre icone si nota — è il genere di dettaglio che non si sa dire ma si
     vede. Al sole restano i raggi di sopra: quelli di sotto finirebbero sulla
     nuvola. */
  const SOLE_PICCOLO =
    '<circle cx="16.4" cy="7" r="2.6"/>' +
    '<path d="M16.4 1.6v1.5M11 7h1.5M20.3 7h1.5M12.6 3.2l1.1 1.1M20.2 3.2l-1.1 1.1"/>';
  const LUNA_PICCOLA = '<path d="M19.7 7.8A3.8 3.8 0 1 1 14.8 2.9a3 3 0 0 0 4.9 4.9Z"/>';
  const NUVOLA_BASSA =
    '<path d="M5 19.6h9.6a3.5 3.5 0 0 0 .3-7 5.2 5.2 0 0 0-10.1-1A3.7 3.7 0 0 0 5 19.6Z"/>';

  const conNuvola = (astro) => astro + NUVOLA_BASSA;

  const DISEGNI = {
    sereno: SOLE,
    "sereno-notte": LUNA,
    "poco-nuvoloso": conNuvola(SOLE_PICCOLO),
    "poco-nuvoloso-notte": conNuvola(LUNA_PICCOLA),
    nuvoloso: NUVOLA,
    /* Coperto è due nuvole, e la seconda è solo il profilo di sopra: mezza
       nuvola dietro si legge come «altre nuvole» meglio di una seconda intera,
       che leggerebbe come «due nuvole». Finisce prima che cominci quella
       davanti, così nemmeno qui una linea attraversa l'altra. */
    coperto:
      '<path d="M3.4 11.2a3 3 0 0 1 1.6-5.6 4.5 4.5 0 0 1 8.1-1"/>' +
      '<path d="M8.4 20h9.2a3.5 3.5 0 0 0 .3-7 5.2 5.2 0 0 0-10-1A3.7 3.7 0 0 0 8.4 20Z"/>',
    nebbia: NUVOLA_ALTA + '<path d="M4.6 18.8h14.8M6.8 21.8h10.6"/>',
    pioggia: NUVOLA_ALTA + '<path d="M9 18.4l-.9 2.6M12.6 18.4l-.9 2.6M16.2 18.4l-.9 2.6"/>',
    temporale: NUVOLA_ALTA + '<path d="M13.2 17.2l-3 3.8h3.2l-1.4 2.8"/>',
    neve: NUVOLA_ALTA + '<path d="M9.4 19v.02M12 21.2v.02M14.6 19v.02M9.4 22.2v.02M14.6 22.2v.02"/>',
    vento: '<path d="M3.5 8.5h11a3 3 0 1 0-3-3M3.5 13h15a3 3 0 1 1-3 3M3.5 17.5h7.5"/>',
  };

  const svg = (chiave) =>
    DISEGNI[chiave]
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DISEGNI[chiave]}</svg>`
      : "";

  /* ── La scrittura ────────────────────────────────────────────────────── */
  const numero = (v, dec = 1) =>
    v.toLocaleString("it-IT", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const caselle = [...document.querySelectorAll("[data-meteo]")];
  const icone = [...document.querySelectorAll("[data-meteo-icona]")];
  const righe = [...document.querySelectorAll("[data-meteo-stato]")];

  let ultimoBuono = null; // quando è andata a segno l'ultima lettura
  let attesa = ATTESA;
  let timer = null;

  const quando = (d) => d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const scrivi = (dati) => {
    for (const el of caselle) {
      const valore = dati[el.dataset.meteo];
      const testo = typeof valore === "number" ? numero(valore, Number(el.dataset.meteoDec ?? 1)) : valore;

      /* Sensore assente o rotto: sparisce la porzione di pagina che lo
         mostrava. Meglio una misura in meno che una misura sbagliata scritta
         con sicurezza. */
      const contenitore = el.closest("[data-meteo-riga]") || el;
      contenitore.hidden = testo === null || testo === undefined;
      if (contenitore.hidden) continue;

      /* L'unità sta in un <small> dentro la stessa casella e non va toccata:
         si riscrive solo il testo che la precede. */
      const unita = el.querySelector("small");
      el.textContent = testo;
      if (unita) el.append(" ", unita);
    }

    for (const el of icone) {
      el.innerHTML = svg(dati.icona);
      /* Il disegno è decorativo, il nome della condizione è già scritto
         accanto a parole: ripeterlo a chi ascolta la pagina non aggiunge
         niente. Ma se il testo mancasse, l'icona è tutto quello che resta. */
      el.hidden = !dati.icona;
    }
  };

  /* Due formulazioni della stessa cosa. La griglia di /natura ha una riga
     larga quanto la pagina e può spiegarsi; la scheda della home è larga
     ventun rem e una frase di dodici parole ci va a capo tre volte, rubando
     più spazio di quanto ne valga. Chi vuole la versione lunga la trova
     seguendo il collegamento che ha appena sopra. */
  const stato = (dati) => {
    let lunga, breve;

    if (dati) {
      const misurata = dati.rilevazione ? new Date(dati.rilevazione) : null;
      const ora = misurata && !Number.isNaN(misurata.valueOf()) ? quando(misurata) : quando(new Date());
      lunga = `Lettura delle ${ora}, si aggiorna da sola ogni minuto.`;
      breve = `Lettura delle ${ora}`;
    } else {
      if (!ultimoBuono) return;
      const minuti = Math.max(1, Math.round((Date.now() - ultimoBuono) / 60_000));
      if (minuti < 60) {
        const plurale = minuti === 1 ? "o" : "i";
        lunga = `La stazione non risponde: questi sono i valori di ${minuti} minut${plurale} fa.`;
        breve = `Valori di ${minuti} minut${plurale} fa`;
      } else {
        const ora = quando(new Date(ultimoBuono));
        lunga = `La stazione non risponde da un po': questi sono i valori delle ${ora}.`;
        breve = `Valori delle ${ora}`;
      }
    }

    for (const el of righe) el.textContent = el.dataset.meteoStato === "breve" ? breve : lunga;
  };

  const leggi = async () => {
    try {
      const risposta = await fetch("/api/meteo", {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!risposta.ok) throw new Error(String(risposta.status));

      const dati = await risposta.json();
      if (typeof dati.temperatura !== "number") throw new Error("lettura senza temperatura");

      scrivi(dati);
      stato(dati);
      for (const b of blocchi) b.hidden = false;
      ultimoBuono = Date.now();
      attesa = ATTESA;
    } catch {
      /* Ci si allontana raddoppiando: se la stazione è giù, bussare ogni
         minuto per ore non la fa tornare su prima. */
      attesa = Math.min(attesa * 2, ATTESA_MAX);
      stato(null);
    } finally {
      programma();
    }
  };

  const programma = () => {
    clearTimeout(timer);
    if (document.hidden) return; // in secondo piano non si chiede niente
    timer = setTimeout(leggi, attesa);
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
      return;
    }
    /* Tornati a guardare: il valore a schermo è vecchio di quanto è durata
       l'assenza, quindi si rilegge subito invece di aspettare il minuto. */
    attesa = ATTESA;
    leggi();
  });

  leggi();
})();
