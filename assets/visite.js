/* ═══════════════════════════════════════════════════════════════════════════
   Il contatore delle bandiere, in pagina.

   Sta in fondo a tutte le pagine e risponde a una domanda sola: chi passa di
   qui, e da dove. Il conto vero lo tiene `/api/visite` — qui si chiede la
   tabella, si segna la propria visita e si disegnano le righe.

   Quattro scelte che vale la pena spiegare.

   La prima: **il blocco parte `hidden`**. Se la rete non risponde, o gli
   script sono spenti, in fondo alla pagina non resta un riquadro vuoto con
   dentro dei trattini: non resta niente, e il footer è quello di sempre. Un
   contatore è un di più, e un di più che non funziona si toglie di mezzo da
   solo.

   La seconda: **la propria visita si conta una volta per sessione**, non a
   ogni pagina aperta. Chi legge il paese, poi la storia, poi la mappa è una
   persona che gira il sito, non tre visitatori dal Nord Italia. Il ricordo
   sta in `sessionStorage`: dura quanto la scheda del browser, non lascia
   niente sul disco e non è un cookie.

   La terza: **la tabella e la propria riga arrivano da due strade diverse**.
   La tabella esce dalla CDN ed è la stessa per tutti — vecchia al massimo di
   cinque minuti, quindi la propria visita appena fatta lì dentro non c'è
   ancora. Il proprio paese e il proprio numero li restituisce la POST, ed è
   quel numero che vince: chi arriva dal Vietnam vede la sua bandiera e il
   suo conto anche se il Vietnam nella lista letta non compariva.

   La quarta: **i nomi dei paesi non sono scritti da nessuna parte**. Li dice
   `Intl.DisplayNames`, che sta già dentro il browser e li conosce in
   italiano: duecento nomi da mantenere a mano sarebbero duecento occasioni
   di scrivere «Cecoslovacchia». Se il browser non ce l'ha, resta il codice a
   due lettere, che è brutto ma non è sbagliato.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  const blocco = document.querySelector("[data-visite]");
  if (!blocco) return;

  const lista = blocco.querySelector("[data-visite-lista]");
  const totaleEl = blocco.querySelector("[data-visite-totale]");
  const paesiEl = blocco.querySelector("[data-visite-paesi]");

  const CHIAVE = "rsm-visita";
  const BANDIERE = "/assets/vendor/bandiere/";

  /* Il numero si scrive all'italiana — 1.204, non 1,204 — come tutti gli
     altri numeri del sito. Sotto le cinque cifre l'italiano il punto non lo
     mette, e Intl lo sa da sé: 1873 resta 1873. */
  const numero = (n) => n.toLocaleString("it-IT");

  const nomi = (() => {
    try {
      const d = new Intl.DisplayNames(["it"], { type: "region" });
      return (c) => d.of(c) || c;
    } catch {
      return (c) => c;
    }
  })();

  /* Il ricordo della sessione. In navigazione privata, o con i dati di sito
     bloccati, il solo accesso a sessionStorage può sollevare: in quel caso si
     conta la visita a ogni pagina, che è meno grave che non contarla mai. */
  const ricorda = (dati) => {
    try {
      sessionStorage.setItem(CHIAVE, JSON.stringify(dati));
    } catch {
      /* pazienza */
    }
  };

  const ricordato = () => {
    try {
      return JSON.parse(sessionStorage.getItem(CHIAVE) || "null");
    } catch {
      return null;
    }
  };

  /* ── Una riga ────────────────────────────────────────────────────────────
     Bandiera, nome, barra, numero. La barra è in proporzione al paese più
     visitato, non al totale: con l'Italia al 96% tutte le altre sarebbero
     linee invisibili, e una barra che non si vede è inchiostro sprecato.

     La bandiera è decorativa e ha `alt=""`: il nome del paese sta già scritto
     accanto, e farlo leggere due volte a chi usa uno screen reader non
     aggiunge niente. Se il file non c'è — un codice che le bandiere vendute
     non coprono — l'immagine si toglie di mezzo invece di lasciare l'icona
     rotta. */
  const riga = (paese, massimo, mio) => {
    const li = document.createElement("li");
    li.className = "sb-riv-visite-riga";
    if (mio) li.dataset.io = "";

    if (paese.c) {
      const img = document.createElement("img");
      img.className = "sb-riv-visite-bandiera";
      img.src = BANDIERE + paese.c.toLowerCase() + ".svg";
      img.alt = "";
      img.width = 21;
      img.height = 14;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => img.remove(), { once: true });
      li.appendChild(img);
    } else {
      /* Il resto del mondo non ha una bandiera: ha il mappamondo delle altre
         icone del sito, stesso tratto e stesso colore del testo. */
      li.insertAdjacentHTML(
        "beforeend",
        '<svg class="sb-riv-visite-bandiera sb-riv-visite-mondo" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>'
      );
    }

    /* Nome e «sei qui» stanno nella stessa cella: le colonne della riga sono
       tre — bandiera, nome, numero — e un quarto figlio in più andrebbe a
       capo da solo proprio nella riga di chi sta guardando. */
    const nome = document.createElement("span");
    nome.className = "sb-riv-visite-nome";
    nome.appendChild(document.createTextNode(paese.c ? nomi(paese.c) : "Resto del mondo"));
    if (mio) {
      const qui = document.createElement("span");
      qui.className = "sb-riv-visite-qui";
      qui.textContent = "sei qui";
      nome.appendChild(qui);
    }
    li.appendChild(nome);

    /* La barra non è una colonna: è il fondo della riga, che si riempie da
       sinistra in proporzione al paese più visitato. Sta fuori dal flusso
       della griglia — un istogramma dietro le parole, non accanto. */
    const barra = document.createElement("span");
    barra.className = "sb-riv-visite-barra";
    barra.setAttribute("aria-hidden", "true");
    const dentro = document.createElement("i");
    dentro.style.width = Math.max(2, Math.round((paese.v / massimo) * 100)) + "%";
    barra.appendChild(dentro);
    li.appendChild(barra);

    const num = document.createElement("span");
    num.className = "sb-riv-visite-num";
    num.textContent = numero(paese.v);
    li.appendChild(num);

    return li;
  };

  const disegna = (dati, io) => {
    const paesi = dati.paesi.slice();

    /* La propria riga: se il paese c'è già si aggiorna col numero fresco
       arrivato dalla POST, se non c'è si aggiunge. In tutti e due i casi si
       riordina, perché il numero nuovo può aver scavalcato qualcuno. */
    if (io && io.paese && Number.isFinite(io.visite)) {
      const trovato = paesi.find((p) => p.c === io.paese);
      if (trovato) trovato.v = Math.max(trovato.v, io.visite);
      else paesi.push({ c: io.paese, v: io.visite });
      paesi.sort((a, b) => b.v - a.v || (a.c < b.c ? -1 : 1));
    }

    /* Il resto del mondo arriva già calcolato dalla funzione. Una sola
       correzione: se la propria riga è finita in tabella venendo da fuori
       lista, le proprie visite stavano dentro il resto e adesso si vedono da
       sole — vanno tolte di lì, o si conterebbero due volte. */
    const fuoriLista = Boolean(io && io.paese && !dati.paesi.some((p) => p.c === io.paese));
    const resto = Math.max(0, dati.resto - (fuoriLista ? io.visite : 0));
    const righe = resto > 0 ? paesi.concat([{ c: null, v: resto }]) : paesi;
    if (!righe.length) return;

    /* Il totale mostrato non è quello letto cinque minuti fa ma la somma di
       quello che si sta vedendo, resto del mondo compreso: così la colonna
       dei numeri torna, e nessuno si mette a fare la somma per scoprire che
       mancano tre visite. */
    const totale = righe.reduce((s, p) => s + p.v, 0);
    const massimo = righe.reduce((m, p) => (p.v > m ? p.v : m), 1);

    lista.textContent = "";
    righe.forEach((p) => lista.appendChild(riga(p, massimo, Boolean(io && p.c && p.c === io.paese))));

    totaleEl.textContent = numero(totale);
    paesiEl.textContent = numero(paesi.length);
    blocco.hidden = false;
  };

  /* ── La propria visita ───────────────────────────────────────────────────
     Una volta per sessione. In anteprima locale la funzione risponde
     `contata: false` e senza paese — Vercel l'header del paese lo mette solo
     in produzione — quindi qui non si segna niente e la tabella si vede
     comunque, che è esattamente quello che serve mentre si lavora. */
  const segna = async () => {
    const gia = ricordato();
    if (gia) return gia;
    try {
      const r = await fetch("/api/visite", { method: "POST", headers: { accept: "application/json" } });
      if (!r.ok) return null;
      const j = await r.json();
      if (!j.contata) return null;
      const io = { paese: j.paese, visite: j.visite };
      ricorda(io);
      return io;
    } catch {
      return null;
    }
  };

  const tabella = async () => {
    try {
      const r = await fetch("/api/visite", { headers: { accept: "application/json" } });
      if (!r.ok) return null;
      const j = await r.json();
      return Array.isArray(j.paesi) ? j : null;
    } catch {
      return null;
    }
  };

  /* Le due chiamate partono insieme: la POST non deve aspettare la tabella,
     e la tabella esce dalla cache mentre la POST fa il suo giro. */
  Promise.all([tabella(), segna()]).then(([dati, io]) => {
    if (dati) disegna(dati, io);
  });
})();
