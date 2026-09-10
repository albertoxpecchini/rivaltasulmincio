/* ═══════════════════════════════════════════════════════════════════════════
   Il movimento delle tre pagine della Color Walk.

   Lo scarica solo chi ha la vernice addosso — /color-walk,
   /color-walk-regolamento e /color-walk-modulo — perché è build.mjs a
   metterlo in fondo alla pagina quando il frammento contiene `class="sb-cr"`.
   Sulle altre undici pagine questo file non esiste.

   Le tre pagine ne usano quantità diverse, ed è normale: il modulo cartaceo
   qui dentro non trova più niente da fare, l'iscrizione usa i primi due punti
   e il regolamento il terzo. Meglio un file solo che tre file quasi uguali —
   e su /color-walk-modulo pesa quanto un'immagine piccola.

   Tre cose, tutte facoltative: ognuna guarda se il suo pezzo di pagina c'è
   e, se non c'è, si toglie di mezzo senza dire niente.

     1. il filo del percorso che si riempie
     2. il conto che pulsa quando cambia
     3. la barra di lettura e l'indice che segue, sul regolamento

   ── Quello che questo file non fa più ─────────────────────────────────────
   Qui c'era anche l'ingresso dei blocchi allo scroll: un osservatore che
   nascondeva ogni sezione e la riaccendeva quando l'occhio ci arrivava. Non
   c'è più, e con lui se ne sono andati la classe `cw-anim`, i ritardi a
   cascata di `data-cw-fila` e la rete di sicurezza che dopo un secondo e
   mezzo rimetteva tutto in vista se l'osservatore non avesse consegnato
   niente.

   La ragione sta in che pagina è questa: /color-walk è un modulo con cui si
   iscrivono dei bambini, non una vetrina. Del contenuto che si accende a mano
   a mano che ci si arriva, su un modulo, vuol dire non sapere mai se è
   finito. Adesso non c'è nessuno stato in cui un pezzo di queste pagine parta
   invisibile — e quindi nemmeno più bisogno di una rete che lo rimetta in
   vista.

   ── Il patto sul movimento ────────────────────────────────────────────────
   Quello che resta è tutto in più, e niente di quello che resta nasconde
   qualcosa: sono un filo che si colora, un numero che batte e una barra che
   avanza. Se il file non arriva, se JavaScript è spento, se chi legge ha
   chiesto meno movimento al sistema operativo o ha premuto «ferma» nella
   barra in basso, le pagine sono quelle di sempre — tutte in vista dal primo
   frame, col filo del percorso colorato per intero e fermo.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var radice = document.documentElement;
  if (!document.querySelector(".sb-cr")) return;

  /* La stessa domanda che si fa il modulo, e con lo stesso ordine di
     precedenza: il tasto della barra vince sull'impostazione di sistema,
     perché è una scelta più recente e più specifica. */
  function media(q) {
    try {
      if (typeof window.matchMedia !== "function") return { matches: false };
      return window.matchMedia(q) || { matches: false };
    } catch (e) {
      return { matches: false };
    }
  }
  var dolce =
    radice.classList.contains("rsm-motion") ||
    (!radice.classList.contains("rsm-still") &&
      !media("(prefers-reduced-motion: reduce)").matches);

  /* ══ Un solo ascolto dello scroll ════════════════════════════════════════
     Le due cose che seguono la pagina mentre scorre — il filo del percorso e
     la barra di lettura — non prendono un ascoltatore ciascuna: si iscrivono
     qui, e questa funzione le chiama una volta per frame dipinto. Scrivono
     custom property, cioè trasformazioni: nessun ricalcolo di layout. */
  var seguaci = [];
  var inCoda = false;

  function passata() {
    inCoda = false;
    for (var i = 0; i < seguaci.length; i++) {
      try {
        seguaci[i]();
      } catch (e) {}
    }
  }
  function chiedi() {
    if (inCoda) return;
    inCoda = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(passata);
    else window.setTimeout(passata, 16);
  }

  function segui(f) {
    seguaci.push(f);
    if (seguaci.length === 1) {
      window.addEventListener("scroll", chiedi, { passive: true });
      window.addEventListener("resize", chiedi, { passive: true });
    }
    f();
  }

  function fra(min, v, max) {
    return v < min ? min : v > max ? max : v;
  }

  /* ══ 1. Il filo del percorso ═════════════════════════════════════════════
     La colonna delle vie ha un filo verticale a sinistra, e il filo si colora
     man mano che si scende: si parte in bianco e si arriva a colori, che è
     quello che fa la camminata.

     La quota è il rapporto fra quanto della lista è già passato sopra la metà
     dello schermo e quanto è lunga: 0 quando la prima tappa arriva a metà
     finestra, 1 quando ci arriva l'ultima. Il CSS ne fa uno scaleY. */
  var giro = document.querySelector("[data-cw-giro]");
  if (giro && dolce) {
    segui(function () {
      var r = giro.getBoundingClientRect();
      var meta = window.innerHeight * 0.55;
      var quota = r.height > 0 ? (meta - r.top) / r.height : 0;
      giro.style.setProperty("--cw-giro", fra(0, quota, 1).toFixed(4));
    });
  }

  /* ══ 2. Il conto che pulsa ═══════════════════════════════════════════════
     Quando la somma cambia — si aggiunge qualcuno, si toglie qualcuno — il
     numero fa un battito e torna com'era. Non riscrive niente: la cifra la
     scrive il modulo, qui si aggiunge e si toglie una classe. Un contatore
     che sale da 10 a 15 sarebbe stato più vistoso e peggio: mentre corre, il
     numero che si legge non è quello che si sta per pagare.

     Il primo passaggio non pulsa. Il modulo scrive il conto appena si apre, e
     un numero che batte da solo su una pagina appena caricata sembra un
     avviso invece che una risposta. */
  var somma = document.getElementById("cr-conto-somma");
  if (somma && dolce && typeof window.MutationObserver === "function") {
    var primo = true;
    var spegni = 0;
    new window.MutationObserver(function () {
      if (primo) {
        primo = false;
        return;
      }
      somma.classList.remove("sb-cw-batte");
      /* Riavviare un'animazione CSS chiede di leggere qualcosa dal nodo in
         mezzo alle due classi, o il browser le vede come un cambiamento solo
         e non riparte da capo. */
      void somma.offsetWidth;
      somma.classList.add("sb-cw-batte");
      window.clearTimeout(spegni);
      spegni = window.setTimeout(function () {
        somma.classList.remove("sb-cw-batte");
      }, 600);
    }).observe(somma, { childList: true, characterData: true, subtree: true });
  }

  /* ══ 3a. La barra di lettura ═════════════════════════════════════════════
     Sul regolamento, un filo azzurro sotto la barra di navigazione che dice
     quanto manca alla fine. Dieci punti di regolamento sono lunghi, e sapere
     di essere al terzo o al nono cambia il modo in cui si legge.

     Si misura sul corpo del testo e non sul documento: la testata sopra e il
     piede sotto non sono regolamento, e contarli vorrebbe dire una barra che
     parte già piena a un quinto e non arriva mai in fondo. */
  var prog = document.querySelector("[data-cw-prog]");
  var corpo = document.querySelector(".sb-cwr-corpo");
  if (prog && corpo) {
    segui(function () {
      var r = corpo.getBoundingClientRect();
      var utile = r.height - window.innerHeight * 0.6;
      var quota = utile > 0 ? -r.top / utile : r.top < 0 ? 1 : 0;
      prog.style.setProperty("--cw-letto", fra(0, quota, 1).toFixed(4));
    });
  }

  /* ══ 3b. L'indice che segue ══════════════════════════════════════════════
     Le pillole in cima al regolamento sanno qual è il punto che si sta
     leggendo. È lo stesso mestiere del filo azzurro sotto le voci della nav —
     dire «sei qui» senza aggiungere un secondo colore — e si scrive con
     aria-current, che è quello che serve anche a chi la pagina la ascolta.

     Il punto attivo è l'ultimo la cui testata è già passata sotto la nav.
     Non il più vicino al centro: leggendo si sta sempre in mezzo a un punto,
     e l'ultimo cominciato è quello di cui si stanno leggendo le righe. */
  var toc = document.querySelector(".sb-riv-toc");
  if (toc) {
    var voci = [];
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var sez = document.getElementById(a.getAttribute("href").slice(1));
      if (sez) voci.push({ a: a, sez: sez });
    });
    if (voci.length) {
      var attiva = null;
      segui(function () {
        var scelta = voci[0];
        for (var i = 0; i < voci.length; i++) {
          if (voci[i].sez.getBoundingClientRect().top <= 96) scelta = voci[i];
        }
        if (scelta === attiva) return;
        if (attiva) attiva.a.removeAttribute("aria-current");
        scelta.a.setAttribute("aria-current", "true");
        attiva = scelta;
      });
    }
  }
})();
