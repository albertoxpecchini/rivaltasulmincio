/* ═══════════════════════════════════════════════════════════════════════════
   Il movimento delle due pagine della Color Walk.

   Lo scarica solo chi ha la vernice addosso — /color-walk e
   /color-walk-regolamento — perché è build.mjs a metterlo in fondo alla
   pagina quando il frammento contiene `class="sb-cr"`. Sulle altre dodici
   pagine questo file non esiste.

   Quattro cose, tutte facoltative: ognuna guarda se il suo pezzo di pagina
   c'è e, se non c'è, si toglie di mezzo senza dire niente.

     1. i blocchi che entrano scorrendo
     2. il filo del percorso che si riempie
     3. il conto che pulsa quando cambia
     4. la barra di lettura e l'indice che segue, sul regolamento

   ── Il patto sul movimento ────────────────────────────────────────────────
   Tutto quello che c'è qui dentro è in più. Lo stato di partenza di ogni
   blocco è «visibile»: la classe che lo nasconde per farlo entrare — cw-anim
   sulla radice — la scrive questo file e la scrive SOLO se il movimento è
   permesso. Se il file non arriva, se JavaScript è spento, se chi legge ha
   chiesto meno movimento al sistema operativo o ha premuto «ferma» nella
   barra in basso, la classe non compare e la pagina è quella di sempre, tutta
   in vista dal primo frame.

   È la stessa regola che il sito applica ovunque, scritta al contrario: qui
   non si spegne un'animazione, si accende.
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

  var haObserver = typeof window.IntersectionObserver === "function";

  /* ══ 1. I blocchi che entrano ════════════════════════════════════════════
     Un osservatore solo per tutta la pagina. Ogni blocco si scopre quando ne
     entra in vista un quinto, e poi l'osservatore lo lascia andare: entrare è
     una cosa che succede una volta, e un blocco che si rinasconde risalendo
     sarebbe un effetto da giostra.

     Il ritardo a cascata non lo decide questo file: lo dichiara il markup con
     data-cw-fila sul contenitore, che vale il passo in millisecondi. Così una
     fila di quattro tessere entra come una fila e non come quattro cose
     separate, e chi cambia la pagina non deve venire a cercare qui. */
  if (dolce && haObserver) {
    radice.classList.add("cw-anim");

    document.querySelectorAll("[data-cw-fila]").forEach(function (fila) {
      var passo = parseInt(fila.getAttribute("data-cw-fila"), 10) || 70;
      var figli = fila.querySelectorAll(".sb-cw-su, .sb-cw-tappa");
      for (var i = 0; i < figli.length; i++) {
        /* Il ritardo si ferma a mezzo secondo: su diciassette tappe, un passo
           che continua a crescere farebbe aspettare l'ultima due secondi
           buoni dopo essere già stata guardata. */
        figli[i].style.setProperty("--cw-d", Math.min(i * passo, 500) + "ms");
      }
    });

    var arrivato = false;
    var occhio = new window.IntersectionObserver(
      function (voci) {
        for (var i = 0; i < voci.length; i++) {
          if (!voci[i].isIntersecting) continue;
          arrivato = true;
          voci[i].target.classList.add("sb-cw-dentro");
          occhio.unobserve(voci[i].target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    );
    document.querySelectorAll(".sb-cw-su, .sb-cw-tappa").forEach(function (el) {
      occhio.observe(el);
    });

    /* La rete sotto la rete. Nascondere del contenuto e riaccenderlo è la
       cosa più pericolosa che questa pagina fa: se l'osservatore per una
       ragione qualsiasi non consegnasse mai niente — un browser che si
       comporta diversamente, un caso che non abbiamo previsto — resterebbe
       una pagina con dentro dei buchi bianchi, e nessuno se ne accorgerebbe
       finché non lo dice qualcuno che voleva iscriversi.

       Quindi: se dopo un secondo e mezzo non è entrato NIENTE, si toglie la
       classe che nasconde e tutta la pagina torna visibile in un colpo. Si
       perde l'animazione, che è la cosa meno importante che c'è qui dentro.
       Un secondo e mezzo perché il primo blocco, quello già in vista, entra
       nei primi millisecondi: se a quel punto non è successo, non succederà. */
    window.setTimeout(function () {
      if (!arrivato) radice.classList.remove("cw-anim");
    }, 1500);
  }

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

  /* ══ 2. Il filo del percorso ═════════════════════════════════════════════
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

  /* ══ 3. Il conto che pulsa ═══════════════════════════════════════════════
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

  /* ══ 4a. La barra di lettura ═════════════════════════════════════════════
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

  /* ══ 4b. L'indice che segue ══════════════════════════════════════════════
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
