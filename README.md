<div align="center">

# Rivalta sul Mincio — dossier informativo del paese

**Sito statico, zero dipendenze** — il dossier completo di **Rivalta sul Mincio**
(frazione del Comune di Rodigo, provincia di Mantova): anagrafica, servizi, attività,
comunità, viabilità, natura, eventi e una mappa interattiva. Dieci pagine di HTML
puro, generate da un assemblatore di 260 righe, vestite con il design system **`.sb-`** di
[albertopecchini.it](https://albertopecchini.it) — palette neutra, un solo azzurro,
tema chiaro/scuro nativo.

<!-- ─────────────  METRICHE LIVE (shields.io → GitHub API, auto-aggiornanti)  ───────────── -->

[![Last commit](https://img.shields.io/github/last-commit/albertoxpecchini/rivaltasulmincio/main?style=flat-square&logo=git&logoColor=white&color=3ECF8E)](https://github.com/albertoxpecchini/rivaltasulmincio/commits/main)
[![Commit activity](https://img.shields.io/github/commit-activity/m/albertoxpecchini/rivaltasulmincio?style=flat-square&color=24B47E)](https://github.com/albertoxpecchini/rivaltasulmincio/pulse)
[![Created at](https://img.shields.io/github/created-at/albertoxpecchini/rivaltasulmincio?style=flat-square&label=nato%20il&color=1C8C63)](https://github.com/albertoxpecchini/rivaltasulmincio)
[![Repo size](https://img.shields.io/github/repo-size/albertoxpecchini/rivaltasulmincio?style=flat-square&color=3ECF8E)](https://github.com/albertoxpecchini/rivaltasulmincio)
[![Top language](https://img.shields.io/github/languages/top/albertoxpecchini/rivaltasulmincio?style=flat-square&color=E34F26)](https://github.com/albertoxpecchini/rivaltasulmincio)
[![Languages](https://img.shields.io/github/languages/count/albertoxpecchini/rivaltasulmincio?style=flat-square&label=lingue&color=6EE7B7)](https://github.com/albertoxpecchini/rivaltasulmincio)
[![File in assets](https://img.shields.io/github/directory-file-count/albertoxpecchini/rivaltasulmincio/assets?type=file&style=flat-square&label=file%20assets&color=24B47E)](https://github.com/albertoxpecchini/rivaltasulmincio/tree/main/assets)

<!-- ─────────────  STACK (badge statici: qui non c'è un package.json da rispecchiare)  ───────────── -->

[![HTML5](https://img.shields.io/badge/HTML-statico-E34F26?style=flat-square&logo=html5&logoColor=white)](index.html)
[![CSS](https://img.shields.io/badge/CSS-design_system_.sb--_-1572B6?style=flat-square&logo=css3&logoColor=white)](assets/sb.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](assets/rivalta.js)
[![Node](https://img.shields.io/badge/Node-build.mjs-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](build.mjs)
[![Dipendenze](https://img.shields.io/badge/dipendenze-0-3ECF8E?style=flat-square&logo=npm&logoColor=white)](#-comè-fatto)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-ODbL-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/copyright)
[![Vercel](https://img.shields.io/badge/Vercel-hosting_statico-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

🔗 **Live:** [www.rivaltasulmincio.it](https://www.rivaltasulmincio.it) · **Repo:** [albertoxpecchini/rivaltasulmincio](https://github.com/albertoxpecchini/rivaltasulmincio) · **Autore:** [@albertoxpecchini](https://github.com/albertoxpecchini)

</div>

---

## 📊 Il progetto in numeri

> I badge di metrica derivano dall'API GitHub e si ricalcolano a ogni `git push`.
> La tabella qui sotto è misurata sull'albero al momento della scrittura.

| Dominio | Valore | Dettaglio |
| :--- | :--- | :--- |
| **Pagine pubblicate** | **12** | HTML **generato**, indirizzi senza estensione |
| **Sorgenti in `_build/`** | 12 frammenti di contenuto + guscio (`head.html` · `foot.html`) | |
| **Design system** | **2.516 righe CSS** | `sb.css` (998) · `rivalta.css` (1.332) · `controlbar.css` (186) |
| **JavaScript nel browser** | **1.488 righe**, 6 file | `rivalta.js` (115) · `controlbar.js` (364) · `glass.js` (328) · `mappa.js` (200) · `meteo.js` (214) · `ricerca.js` (267) |
| **JavaScript su server** | **221 righe**, 1 file | `api/meteo.mjs`, la sola cosa che non giri nel browser di chi legge |
| **Build** | **933 righe**, `build.mjs` | zero dipendenze, solo la libreria standard di Node |
| **Dipendenze** | **0** dev, **1** a runtime | Leaflet 1.9.4 ospitato in locale, caricato solo su `/mappa`. Niente `package.json` |
| **Luoghi censiti** | **110** | 55 luoghi + 55 attività in `_build/luoghi.json`, 84 con coordinate OSM |
| **Dataset OSM** | **330 POI** su 10.191 righe JSON | 74 strade · 92 elementi stradali · 106 incroci · 16 corsi d'acqua |
| **Numeri civici** | **177** su **21 vie** | mappati in OpenStreetMap, non un archivio anagrafico |
| **Dossier sorgente** | **1.044 righe** Markdown | `data/rivalta-sul-mincio-dossier.md` |
| **Cronologia** | **167 commit** dal 2026-05-09 | repo creato il 2026-04-26 |

---

## 🏗️ Com'è fatto

HTML statico. Nessuna dipendenza, nessun framework, nessun build step in produzione: si serve la
cartella così com'è.

L'unica cosa che gira su un server è [`api/meteo.mjs`](api/meteo.mjs), che legge la stazione meteo
del paese per la pagina `/natura` — sta lì perché il browser, da solo, quel file non può leggerlo. Si sveglia quando qualcuno apre la pagina e per il resto del tempo non esiste;
[più sotto](#la-stazione-meteo--lunica-cosa-che-gira-su-un-server) c'è il perché per esteso.

Gli indirizzi pubblici **non hanno estensione**: `/paese`, non `/paese.html`. I file su disco si
chiamano ancora `paese.html` — è `"cleanUrls": true` in [`vercel.json`](vercel.json) che li serve senza, e che manda
un **redirect 308** dal vecchio indirizzo al nuovo, così i link già in giro e quello che è stato
indicizzato non si rompono. I link interni si scrivono root-assoluti (`/paese`, `/` per la home).

### Modificare il sito

Le dieci pagine `.html` in radice sono **generate**: le modifiche vanno fatte in [`_build/`](_build/), poi

```bash
node build.mjs
```

Dieci pagine condividono la stessa nav e lo stesso footer. Tenerne dieci copie a mano significa che
prima o poi nove sono aggiornate e una no, ed è sempre quella che qualcuno apre.

Titolo e descrizione di ogni pagina stanno in testa al rispettivo frammento, come due commenti —
così il contenuto e i suoi metadati non possono separarsi:

```html
<!--title: Servizi — Rivalta sul Mincio-->
<!--desc: Comune e sportelli, farmacia e salute…-->
```

Per aggiungere una pagina basta creare `_build/nuova.body.html` con quei due commenti e rilanciare
il build; la voce nella nav va aggiunta a mano in [`_build/head.html`](_build/head.html) e [`_build/foot.html`](_build/foot.html).

---

## 🧭 Le dieci pagine

Un solo dominio, un indirizzo per pagina, la home alla radice. La nav è la stessa ovunque perché
esiste in copia unica in [`_build/head.html`](_build/head.html).

| Indirizzo | Frammento | Priorità | Cosa c'è |
| :--- | :--- | :---: | :--- |
| `/` | `index.body.html` | 1.0 | Il paese in sintesi + **«Rivalta sui giornali»** (rassegna stampa) |
| `/paese` | `paese.body.html` | 0.7 | Anagrafica, etimologia, dati ISTAT e demografia, edificato, monumenti |
| `/servizi` | `servizi.body.html` | 0.8 | Comune e sportelli, farmacia, banche, calendario rifiuti, fibra e 5G |
| `/attivita` | `attivita.body.html` | 0.8 | Alimentari, tabaccheria, bar e ristoranti, ricettività, mercato, aziende |
| `/comunita` | `comunita.body.html` | 0.7 | Scuole, Museo Etnografico dei Mestieri del Fiume, biblioteca, Pro Loco, sport |
| `/muoversi` | `muoversi.body.html` | 0.7 | Le 74 vie con fondo e limiti, dossi, 106 incroci, parcheggi, linea APAM 13 |
| `/natura` | `natura.body.html` | 0.7 | Parchi, Riserva Naturale Valli del Mincio, uso del suolo, ciclabili, navigazione |
| `/eventi` | `eventi.body.html` | 0.9 | Festa del Pesce, Sagra dei Patroni, Brusa la Vècia, Pulimincio, Cena Tedesca |
| `/mappa` | `mappa.body.html` | 0.9 | Mappa interattiva dei 268 punti d'interesse, filtri per categoria, registro dei luoghi |
| `/dati` | `dati.body.html` | 0.4 | Fonti, metodo di misura, dataset JSON scaricabile, come rigenerarlo via Overpass |

---

## 🎨 Il design system `.sb-`

Non è un tema applicato sopra: [`assets/sb.css`](assets/sb.css) è un **estratto fedele** di
`src/app/home.css` di albertopecchini.it (blocco `.sb-home` e `html.dark .sb-home`). Token, misure e
primitive sono copiati dalla fonte di verità; cambia solo il contorno — lì è una SPA React con CSS
colocato per pagina, qui è un sito statico e il foglio è uno solo.

Le regole sono quelle del design system, non opinioni di questo repo:

- palette **neutra** (soli grigi) più **un'unica tinta**, l'azzurro brand `hsl(197 100% 49%)`. Non si
  introduce un secondo colore vivo per distinguere qualcosa: si distingue con peso, spaziatura o bordo;
- ogni colore, ombra e bordo si scrive con `var(--sb-*)`. Gli unici valori letterali stanno nei due
  blocchi di token in cima a `assets/sb.css`;
- **un solo fondale** `position: fixed` per tutta la pagina. Nessuna sezione ha un bordo o uno
  sfondo proprio: fra una sezione e l'altra il contenuto scorre trasparente, senza righe di confine;
- niente reveal allo scroll, fade-in a cascata o contatori che partono entrando in viewport.
  Scorrere una pagina non è un evento da annunciare;
- tema chiaro/scuro **nativo**: `html.dark` ridichiara gli stessi token, non esiste un secondo
  foglio di stile.

Le superfici delle card non sono tinte piatte ma **lastre di vetro**: trasparenza (`--sb-glass-bg`),
sfocatura di ciò che sta dietro (`--sb-glass-blur`, con un pizzico di saturazione in più perché il
blur slava i colori) e filo di luce sul bordo alto (`--sb-glass-spec`), che è quello che il cervello
legge come «spessore».

Il tema è calcolato **prima del primo paint**, con uno script inline in `<head>`: senza, entrando su
una pagina che finirà scura si vedrebbe un lampo di bianco.

### Lo smusso — la forma di questo sito

È l'unico punto in cui Rivalta si stacca dal design system originale. Pillole, badge, indici,
filtri, lastre e tabelle **non sono stondati**: hanno l'angolo in alto a sinistra e quello in basso
a destra **tagliati a 45°**. Due diagonali opposte danno una direzione alla sagoma; tagliarne quattro
la rimetterebbe in simmetria e tornerebbe a essere un ottagono, cioè di nuovo un tondo.

Due misure sole, `--sb-cut: 10px` per gli elementi piccoli e `--sb-cut-lg: 18px` per le lastre, e
tre sagome pronte in `assets/sb.css`: `--sb-shape-sm`, `--sb-shape-lg`, `--sb-shape-lg-in`.

Tre cose da sapere prima di metterci mano:

- **Non accorparle in una sagoma sola con una misura variabile.** Le custom property vengono
  sostituite subito, sull'elemento dove sono scritte, e quello che eredita è il valore già risolto.
  Una `--sb-shape` che contenesse `var(--c)` cercherebbe `--c` su `.sb-home`, non lo troverebbe, e
  diventerebbe invalida — cioè vuota — prima ancora di arrivare a chi la usa.
- **`0.586px` non è un numero magico.** È di quanto va stretto il taglio interno perché fra le due
  diagonali della lastra resti esattamente 1px, come sui lati dritti: su una retta a 45° un pixel in
  perpendicolare vale √2 di scostamento, e 2 − √2 = 0.586. Arrotondarlo a 1px ingrossa la diagonale
  rispetto ai lati, e si vede.
- **`clip-path` taglia via anche il `box-shadow`.** Sulle lastre l'ombra esterna non può più essere
  un'ombra: `filter: drop-shadow()` la seguirebbe, ma un `filter` crea un *backdrop root* e
  spegnerebbe il `backdrop-filter` di tutto ciò che ha dentro — il vetro si smaterializzerebbe
  proprio al passaggio del mouse. Per le card cliccabili l'ombra è quindi **una seconda lastra**
  sfocata, appesa al contenitore `<a>` che non è ritagliato; in cambio segue lo smusso invece di
  arrotondarlo.

Sui lati dritti il contorno resta il `border`. Sulle due diagonali il clip lo porterebbe via, e si
ridisegna con due gradienti confinati nei quadrati d'angolo (`--sb-shape-edge`). Il `50%` degli stop
non è a occhio: su un quadrato di lato S la linea di taglio dista S/√2 dall'angolo, e l'asse di un
gradiente a 135° è lungo S·√2 — la metà esatta.

Restano stondati i bottoni (6px), la pillola scorrevole della nav e i pallini: la forma nuova
riguarda ciò che contiene, non ciò che si preme.

### Il testo è giustificato

Tutta la prosa del sito è `text-align: justify` con `hyphens: auto`. La sillabazione non è un vezzo:
le colonne sono strette (`max-width: 46rem`) e l'italiano ha parole lunghe — senza, la
giustificazione apre fiumi bianchi verticali che si vedono da lontano. Funziona perché `head.html`
dichiara `<html lang="it">` e il browser sillaba nella lingua del documento.

**Sotto i 480px torna a bandiera:** su una colonna da telefono fra una parola e l'altra si aprirebbero
voragini, e lì vince la leggibilità. Restano allineati a sinistra i dati (celle, intestazioni,
numeri) e tutto ciò che è centrato per scelta.

Non esiste una classe unica per il testo corrente — le pagine sono nate una alla volta e ogni
contesto si è portato dietro la sua — quindi il gruppo di selettori è elencato per esteso in cima a
`assets/rivalta.css`. **Se nasce una classe nuova che contiene un paragrafo, va aggiunta lì.**

---

## 🌀 Movimento — il vetro, e solo su un gesto

Tutto il movimento sta in [`assets/glass.js`](assets/glass.js), separato da `rivalta.js` perché la
differenza è netta: `rivalta.js` fa **funzionare** il sito (menu, voce attiva, bordo della nav),
`glass.js` lo fa **sembrare fatto di vetro**. Se quel file non arriva — rete lenta, script bloccati,
JS spento — non manca niente di leggibile né di navigabile: le card restano dritte, il fondale
fermo, la nav con il suo hover di sempre. Ogni custom property scritta da lì ha un valore di
ripiego nel CSS.

- **Risponde a un gesto**: la card si inclina sotto il puntatore, la pillola della nav segue la
  voce, il fondale scorre di un dodicesimo. Niente di tutto questo parte da solo.
- **Il touch è escluso** — lì «hover» è il dito appoggiato un istante prima del tap, e una card che
  si inclina mentre si scorre è un difetto.
- **Un solo ascoltatore in delega** sul documento, non uno per card: le card sono qualche decina per
  pagina e la rassegna stampa le genera in build — con gli ascoltatori attaccati a mano una card
  nuova nascerebbe morta.
- **Niente letture di geometria dentro un gestore di evento** (misurare forza il browser a
  ricalcolare il layout, e su `pointermove` vuol dire una volta per frame): si misura all'ingresso,
  poi si usa quel numero. Si scrive nello stile solo dentro un `requestAnimationFrame`.
- Si accende e si spegne con il **tasto a stella nella barra**, e la scelta resta. Tre stati: senza
  scelta manuale comanda `prefers-reduced-motion` del sistema (e allora non si attacca nemmeno un
  ascoltatore); con la scelta fatta comanda il tasto, anche contro il sistema — una preferenza
  espressa qui è più recente e più specifica di quella del sistema operativo. In `localStorage`:
  `rsm-motion-mode` e `rsm-motion-manual`, classi `html.rsm-motion` / `html.rsm-still` scritte prima
  del primo paint.

---

## 🎛️ La barra di controllo

In basso a sinistra, fuori dal bordo, con la sola linguetta a vista: esce quando il puntatore le si
avvicina (130 px), quando il fuoco da tastiera entra, o premendo la linguetta — che sul touch è
l'unico modo. All'avvio si mostra un paio di secondi, così si sa che c'è. Dentro ci sono le tre
preferenze del sito: **tema**, **sensore orario**, **movimento**.

È portata da [`theme/`](theme/) (i sorgenti React di albertopecchini.it: `ControlBar.tsx`,
`ThemeWidget.tsx`, `themeCore.ts`, `controlbar.css`). Misure, curve e comportamento sono gli stessi;
è caduto solo il segmento della lingua, perché qui si parla italiano e basta, e al suo posto c'è il
tasto del movimento.

Il tema ha **due modi**, ed è la parte che vale la pena avere in testa:

- **auto** — il tema lo decide l'orologio: 08:00–19:59 chiaro, il resto scuro. Ai due confini cambia
  **da solo mentre la pagina è aperta**, con l'onda che parte un secondo prima (alle :59:59). Se la
  scheda è stata in secondo piano per ore, al risveglio (`visibilitychange`, `focus`) si riallinea
  invece di fidarsi di timer che il browser ha strozzato;
- **manuale** — vince il tasto, ma **solo fino al confine orario successivo**: lì il sensore si
  riprende il comando. Non è una svista, è il patto di «sempre e ovunque» — il sito di notte è scuro
  anche se stamattina qualcuno l'aveva schiarito. Il chip **Auto** restituisce il comando subito.

Ogni cambio di tema, a mano o dal sensore, passa dalla stessa **onda**: un cerchio tinto del tema in
arrivo si apre dal tasto premuto (o dal centro, se non l'ha premuto nessuno), il tema vero commuta a
corsa quasi finita — sotto la copertura — e il velo si dissolve rivelando la pagina già cambiata.
Cambiare tutti i colori a vista, insieme, è la cosa che fa sembrare rotto un sito che sta solo
cambiando tema. Con `prefers-reduced-motion` l'onda non parte: il tema cambia e basta.

---

## 🗂️ Struttura del repository

```
rivaltasulmincio/
├── index.html … mappa.html     # le 10 pagine, GENERATE — non modificarle a mano
├── assets/
│   ├── sb.css                  #   design system .sb- (token + primitive da albertopecchini.it)
│   ├── rivalta.css             #   classi di pagina .sb-riv-* (tabelle, stat, note, indici, testata, ricerca)
│   ├── rivalta.js              #   bordo nav allo scroll, menu, voce attiva, «aggiornato» in forma relativa
│   ├── ricerca.js              #   la tendina «Cerca» in testata (/ o ⌘K); legge l'indice qui sotto
│   ├── ricerca-dati.js         #   GENERATO da build.mjs: l'indice di ricerca di tutte le pagine
│   ├── controlbar.css / .js    #   barra di controllo: tema, sensore orario, movimento
│   ├── glass.js                #   movimento del vetro: card che si inclinano, parallasse, pillola
│   ├── mappa.js                #   monta Leaflet e i 268 segnaposto — solo su /mappa
│   ├── favicon.svg             #   la sagoma smussata del sito, col Mincio dentro — fa anche da marchio in testata
│   ├── loghi/                  #   i marchi: ap.png (firma), comune-rodigo, anspi
│   ├── foto/                   #   le fotografie: <slug>.jpg, le attività in foto/attivita/
│   └── vendor/leaflet/         #   Leaflet 1.9.4 ospitato qui, nessuna CDN
├── api/                        # le tre cose che NON girano nel browser di chi legge
│   ├── meteo.mjs               #   la stazione di meteomincio, tradotta in JSON
│   ├── iscrizione-color-runner.mjs   #   apre il pagamento, e verifica il ritorno
│   └── conferma-color-runner.mjs     #   il webhook Stripe: manda la ricevuta o l'avviso
│                               #   (in coda ha un blocco GENERATO da build.mjs: le due mail)
├── data/
│   ├── rivalta_dataset.json    #   l'estratto OpenStreetMap completo (ODbL) — 330 POI
│   └── …-dossier.md            #   il dossier sorgente in Markdown
├── _build/                     # l'officina: NON va online (.vercelignore)
│   ├── head.html               #   guscio: <head> + nav, con {{TITLE}} e {{DESC}}
│   ├── foot.html               #   guscio: footer + script
│   ├── <pagina>.body.html      #   il contenuto di ogni pagina (10 frammenti)
│   ├── notizie.json            #   la rassegna stampa, resa al posto di {{NEWS}}
│   ├── luoghi.json             #   il registro dei 110 luoghi: coordinate, foto, schede
│   ├── tipi.json               #   tipi OSM → etichetta italiana e gruppo di filtro
│   └── email/                  #   le due mail della Color Runner, sorgente
│       ├── ricevuta-color-runner.html   #     a chi ha pagato
│       ├── fallita-color-runner.html    #     a chi si è fermato a metà
│       └── evento.json                  #     ritrovo, distanza, rimborsi: da compilare
├── theme/                      # i sorgenti React di albertopecchini.it da cui è portata la barra
│                               #   (riferimento, NON serve al sito: non va online)
├── build.mjs                   # incolla guscio + contenuto, genera sitemap.xml, ricerca-dati.js e le due mail
├── serve.mjs                   # anteprima locale con cleanUrls (non va online)
├── prova-conferma.mjs          # `npm test`: 15 casi sulle mail, con Stripe finto (non va online)
├── prova-invio.mjs             # manda una mail vera a sé stessi, per guardarla (non va online)
├── sitemap.xml                 # GENERATO da build.mjs — non modificarlo a mano
├── robots.txt                  # statico, nessuna esclusione
└── vercel.json                 # framework null, cleanUrls, cache di assets/ e data/
```

---

## 🔀 Come funziona — il giro dei dati

Dalla **sorgente** (dossier, estratto OSM, frammenti HTML) alle **pagine generate** in locale, fino
al **deploy** su Vercel — che non costruisce niente, serve file.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Alberto · dev
    participant OSM as OpenStreetMap · Overpass
    participant BLD as node build.mjs
    participant GH as GitHub · main
    participant VC as Vercel · hosting
    participant BR as Browser
    participant WX as meteomincio.it · stazione

    Note over Dev,OSM: 1 · I dati
    Dev->>OSM: query Overpass sull'area di Rivalta
    OSM-->>Dev: data/rivalta_dataset.json (ODbL, 330 POI)
    Note over Dev: dossier .md + dataset → frammenti _build/*.body.html

    Note over Dev,BLD: 2 · Assemblaggio, in locale
    Dev->>BLD: node build.mjs
    activate BLD
    Note over BLD: head + body + foot → 10 pagine .html
    Note over BLD: notizie.json → {{NEWS}} nella home
    Note over BLD: luoghi.json → {{luogo:}} {{foto:}} {{LUOGHI}}
    Note over BLD: dataset + tipi.json → {{MAPPA}}, 268 punti in pagina
    Note over BLD: SITE → canonical + og:url + sitemap.xml
    BLD-->>Dev: ✓ 10 pagine + sitemap (10 URL) + foto mancanti
    deactivate BLD

    Note over GH,VC: 3 · Pubblicazione
    Dev->>GH: git commit + push → main (pagine già pronte)
    GH->>VC: webhook · nuovo commit
    activate VC
    Note over VC: buildCommand = echo · nessuna build
    Note over VC: outputDirectory "." · .vercelignore esclude _build/, theme/
    VC-->>GH: deploy ok
    deactivate VC

    Note over BR,VC: 4 · Un lettore apre il sito
    BR->>VC: GET /paese
    VC-->>BR: paese.html (cleanUrls) + assets/ (cache 1 h)
    Note over BR: tema e movimento decisi prima del primo paint
    BR->>VC: GET /data/rivalta_dataset.json (dalla pagina /dati)
    VC-->>BR: il dataset grezzo, riverificabile (cache 24 h)

    Note over BR,WX: 5 · La stazione meteo, dalla pagina /natura
    loop ogni minuto, finché la scheda resta in primo piano
        BR->>VC: GET /api/meteo
        alt cache CDN scaduta (al più una volta al minuto)
            VC->>WX: GET clientraw.txt
            WX-->>VC: 170 campi separati da spazio
            Note over VC: parsing → JSON · s-maxage 60 s
        end
        VC-->>BR: la lettura della stazione, in JSON
    end
```

| Dipendenza esterna | Uso | Dove |
| :--- | :--- | :--- |
| **OpenStreetMap / Overpass API** | l'estratto geodati del paese (ODbL) | a mano, in locale — non a runtime |
| **Google Fonts** | Titillium Web + Roboto Mono | client, con `preconnect` |
| **Piastrelle OpenStreetMap** | il fondo della mappa (ODbL, con attribuzione) | client, **solo su `/mappa`** |
| **meteomincio.it** | la lettura della stazione di Rivalta | server, via `/api/meteo`, per la home e `/natura` |
| **Vercel** | hosting statico + tre funzioni, `cleanUrls`, header di cache | produzione |
| **Stripe** | l'incasso della quota Color Runner e l'avviso di com'è andata | server, via `/api/iscrizione-color-runner` e `/api/conferma-color-runner` |
| **Resend** | la spedizione delle due mail della Color Runner | server, via `/api/conferma-color-runner` |

Quello che il browser scarica sono pagine, fogli di stile, gli script e — solo se lo si chiede — il
dataset da `/dati`. Le chiamate a runtime sono **due**: `/mappa` scarica le piastrelle da
`tile.openstreetmap.org` mentre la si esplora (i 268 segnaposto, invece, sono già dentro la
pagina), e la stazione meteo viene chiesta a `/api/meteo` dalle due pagine che la mostrano — la
home e `/natura`. Le altre otto non parlano con nessuno.

### La stazione meteo — l'unica cosa che gira su un server

A Rivalta c'è una stazione vera, gestita col Centro Meteorologico Lombardo, che pubblica le proprie
letture su [meteomincio.it](https://www.meteomincio.it) in `clientraw.txt` — il formato standard di
Weather Display: una riga, 170 campi separati da spazio, posizione fissa. Il file viene riscritto
**ogni venticinque secondi circa**, e quello che si legge è vecchio di una cinquantina: «aggiornato
al minuto» è esattamente quanto questa fonte può dare, e la pagina non promette di più.

Il loro server però non manda `Access-Control-Allow-Origin`, quindi il browser di chi legge questo
sito non può aprire quel file da sé. Da qui [`api/meteo.mjs`](api/meteo.mjs), **la sola riga di
codice del progetto che non giri nel browser di chi legge**: sta in mezzo, traduce i 170 campi in
JSON con i nomi delle cose, e risponde con `s-maxage=60`. È la CDN di Vercel a servire quella
risposta a tutti, quindi meteomincio viene interrogato **al massimo una volta al minuto** — mille
lettori o uno solo, per il loro server non cambia niente.

Non c'è nessun cron e nessuna macchina accesa: la funzione si sveglia quando qualcuno apre una
delle due pagine, e se non le apre nessuno non succede niente. Se la stazione tace, la funzione
risponde `503` e la pagina tiene a schermo l'ultima lettura buona dicendo di quando è — un dato
vecchio ma dichiarato è utile, un dato inventato no.

Gli indici dei campi in `CAMPI` sono verificati contro `ajaxWDwx3.js`, lo script con cui
meteomincio legge il proprio cruscotto: sono gli stessi numeri che leggono loro. **È l'unico punto
del sito che dipende dal formato di qualcun altro**, e se un giorno smettesse di funzionare è lì che
si guarda.

#### «Prossimamente» — come si toglie

La sezione è **in prova**, e lo dice: sopra i dati, in tutte e due le pagine, c'è una pillola
`Prossimamente` e — dove c'è spazio — la riga che spiega perché. Non è un segnaposto: i numeri
sotto sono veri e in diretta. È in attesa del via libera di chi la stazione la gestisce, a cui la
richiesta è stata mandata dal loro modulo di contatto.

La barra sta **dentro** il blocco dei dati, non sopra: il blocco nasce `hidden` e lo scopre lo
script solo a lettura arrivata, e una barra messa fuori resterebbe lì da sola ad annunciare una
cosa che non si vede.

Quando la risposta arriva, si tolgono le due chiamate a `renderProssimamente()` in
[`build.mjs`](build.mjs), si rigenera, e non resta traccia di niente. Se la risposta fosse no, si
tolgono invece i segnaposto `{{METEO}}` da `_build/natura.body.html` e `{{METEO_ORA}}` da
`_build/index.body.html`: il sito torna esattamente com'era e la funzione resta in cartella senza
fare niente.

#### Le due forme

Le pagine che la mostrano sono due, e mostrano cose diverse perché servono momenti diversi.

In fondo a **`/natura`** c'è la griglia estesa: quattro numeri grandi e dieci misure di contorno,
per chi la stazione la stava cercando. Nella **hero della home**, a destra del titolo, c'è la
scheda `Ora a Rivalta`: gradi, che tempo fa, minima e massima, e le tre misure che cambiano la
giornata — umidità, vento, pioggia. Quanto basta a decidere se prendere la giacca; il resto sta a
un click.

Il campo 48 del formato è un numero da 0 a 37 con cui la stazione dichiara la condizione in corso.
[`api/meteo.mjs`](api/meteo.mjs) lo traduce in un nome italiano e in una chiave, e
[`assets/meteo.js`](assets/meteo.js) disegna la figura corrispondente: **undici SVG scritti in
linea**, con lo stesso tratto delle altre icone del sito. Sono in linea e non in un file di
immagini perché così prendono il colore dal testo — passano da sole al tema scuro, e una notte
serena non resta azzurra su fondo nero perché il `.svg` era stato salvato azzurro.

Nessuna delle figure ne copre un'altra. Il primo tentativo faceva passare la nuvola davanti al
sole riempiendola del colore del fondo: funzionava sul foglio di prova e sarebbe stato sbagliato in
pagina, perché la scheda sta su una lastra di vetro traslucida e non sul fondo — la toppa si
sarebbe vista come una macchia chiara dentro la nuvola. Ora l'astro sta in alto a destra e la
nuvola in basso a sinistra, senza toccarsi.

Un solo script serve tutte e due le forme, e non le conosce: cerca gli elementi che dichiarano
`data-meteo` e ci scrive il campo che chiedono. Una terza forma, un domani, non richiede una riga
in più lì dentro.

### La Color Runner — l'iscrizione che incassa davvero

La seconda cosa che non gira nel browser di chi legge. `/color-runner` raccoglie i dati di chi si
iscrive alla camminata a colori del 20 settembre e incassa **11 €** — quota **10 €** più **1 € di
commissioni di servizio**, due voci distinte nel Checkout — un pagamento vero, in un passaggio solo.
L'euro in più copre quanto il circuito di pagamento trattiene su ogni incasso, così alla camminata
arriva la quota intera. La pagina **non sta nel menu** — le nove porte d'ingresso sono quelle
e restano nove — ma è pubblica: la richiamano la home, `/comunita` e `/eventi`, ed entra in
sitemap. Per rimetterla in disparte basta rimettere `noindex: true` in testa a
[`_build/color-runner.body.html`](_build/color-runner.body.html) e rifare il build.

[`api/iscrizione-color-runner.mjs`](api/iscrizione-color-runner.mjs) parla con l'API REST di Stripe
via `fetch`, **senza il pacchetto npm `stripe`**: stesso zero-dipendenze del resto del sito, stesso
stile di `api/meteo.mjs`. Fa due mestieri secondo il metodo con cui lo si chiama:

| | |
|---|---|
| `POST` | il modulo manda nome, cognome, email, telefono, note e il consenso spuntato; nasce una sessione Stripe Checkout e la risposta è l'indirizzo a cui mandare il browser a pagare |
| `GET ?sessione=cs_…` | al ritorno dal pagamento la pagina chiede a Stripe se quella sessione è stata **davvero** pagata |

E accanto c'è [`api/conferma-color-runner.mjs`](api/conferma-color-runner.mjs), che non lo chiama
il sito: lo chiama Stripe. È il webhook che manda la mail.

Il secondo esiste perché l'indirizzo di ritorno lo digita chiunque: senza quel controllo basterebbe
aprire `/color-runner?stato=ok` per vedersi dire «iscrizione ricevuta» senza aver pagato una lira.
Chi ha pagato ha in mano anche l'identificativo di sessione — che non si indovina — ed è quello, non
la parola `ok`, a decidere cosa la pagina scrive.

**L'elenco degli iscritti è il dashboard Stripe.** I campi del modulo viaggiano come `metadata`
della sessione e compaiono lì accanto a ogni pagamento, insieme all'ora in cui il consenso è stato
dato: niente database, niente foglio a parte, niente seconda copia dei dati di persone vere da
tenere al sicuro. Il sito non vede mai i dati della carta.

#### Le due mail — e perché non partono dalla pagina

Chi paga riceve una **ricevuta**; chi comincia e non arriva in fondo riceve un avviso che dice che
**il pagamento non è andato a buon fine e che non gli è stato addebitato niente**. Nessuno resta a
chiedersi se è iscritto o no — che è l'unica cosa, dopo aver dato dieci euro, che si vuole sapere.

La mail **non parte dalla pagina di ritorno dal pagamento**, e questa è la scelta che tiene in piedi
tutto il resto. Al ritorno dal pagamento non ci si torna sempre: si chiude la scheda, finisce la
batteria, il telefono perde campo mentre Stripe sta rimandando indietro il browser. Il pagamento è
fatto e la pagina non lo sa. Se la conferma dipendesse da lì, chi ha pagato resterebbe senza.

Parte invece da **Stripe che avvisa il server**, a pagamento concluso, indipendentemente da dove sia
finito il browser. Quattro proprietà, ognuna col suo perché:

| | |
|---|---|
| **la mail giusta** | la ricevuta parte **solo** se `payment_status` vale `paid` — riletto in quel momento da Stripe con la chiave segreta, non preso dall'avviso ricevuto. Un avviso falso, anche perfettamente firmato, al massimo nomina una sessione: se quella sessione non risulta pagata, non esce niente |
| **la firma** | ogni avviso di Stripe è firmato in HMAC-SHA256 con `STRIPE_WEBHOOK_SECRET`; la firma si ricalcola sul corpo **grezzo** (per questo `bodyParser` è spento: riscrivere anche solo gli spazi la invaliderebbe) e si confronta a tempo costante. Fuori dai cinque minuti di tolleranza, un avviso vero rigiocato più tardi non vale più |
| **una sola volta** | spedita la ricevuta, resta un segno nei `metadata` del PaymentIntent, che al giro dopo si rilegge. Serve perché lo stesso pagamento può generare più avvisi, e perché i rinvii di Stripe sono fatti apposta per ripetersi |
| **prima o poi arriva** | se la spedizione fallisce la funzione risponde **500**, non 200: è il modo di dire a Stripe «rimandamelo». Stripe riprova per tre giorni. Una chiave sbagliata o un servizio di posta giù diventano così una mail in ritardo invece di una mail persa |

L'avviso di mancato pagamento parte su **sessione scaduta** (`checkout.session.expired` — chi apre
il pagamento e chiude la pagina; Stripe lo dice alla scadenza, cioè fino a 24 ore dopo) e su
**pagamento differito rifiutato**. Una carta rifiutata mentre si è ancora sulla pagina di Stripe non
fa partire niente: lì si ritenta subito, e una mail a ogni tentativo sarebbe molestia. E chi ha poi
pagato con una seconda sessione non se lo vede arrivare: prima di spedirlo, la funzione chiede a
Stripe se a quell'indirizzo risulta un pagamento riuscito. Se la domanda non riesce a farla, la mail
**non parte**: dire per sbaglio «non sei iscritto» a chi ha pagato è un danno, tacere è un'occasione
persa.

##### Dove si scrivono

I due modelli stanno in [`_build/email/`](_build/email/) — HTML vero, che si apre nel browser per
guardarlo. Non sono scritti come una pagina del sito: la posta non è il web, e `var(--sb-*)`,
`color-mix()`, flex e grid in Outlook e Gmail non esistono. Stessa grammatica visiva del sito,
tecnica diversa: tabelle, stili in linea, i token di `assets/sb.css` risolti a mano in hex.

`node build.mjs` li compila **dentro** `api/conferma-color-runner.mjs`, fra due marcatori.
Sembra un giro largo, ed è il punto: `_build/` è in `.vercelignore`, quindi su Vercel quei file non
arrivano — compilati diventano due stringhe dentro la funzione, e non c'è niente che possa mancare
all'appello proprio mentre qualcuno sta pagando. Il blocco fra i marcatori è **generato**: si
modifica l'HTML in `_build/email/` e si rifà il build, mai il contrario.

I dati dell'evento — ritrovo, partenza, distanza, cosa portare, rimborsi, indirizzo degli
organizzatori — stanno in [`_build/email/evento.json`](_build/email/evento.json), perché cambiarli
non deve voler dire rimettere le mani dentro una mail. **Un campo lasciato vuoto non stampa una
parentesi quadra nella posta di qualcuno:** il build toglie via la sezione intera, e finché ritrovo e
cosa portare mancano al loro posto la ricevuta dice che i dettagli arrivano più avanti — che è la
verità. Ogni build stampa l'elenco di cosa manca ancora.

> La ricevuta di Stripe (**Settings → Payments → Customer emails**) è un'altra cosa e resta
> separata: quella è la prova del pagamento, questa è la conferma dell'iscrizione. Averle entrambe
> non fa male.

#### Le chiavi — le cose da mettere a mano

La chiave segreta **non è nel repository e non deve entrarci**. Vive in una variabile d'ambiente su
Vercel, e finché non c'è l'endpoint risponde `500 pagamento non ancora configurato` senza provarci:

1. Stripe → **Developers → API keys** → copiare la *Secret key* (`sk_live_…` per incassare davvero,
   `sk_test_…` per provare col numero di carta finto `4242 4242 4242 4242`).
2. Vercel → progetto → **Settings → Environment Variables** → nome `STRIPE_SECRET_KEY`, valore la
   chiave, ambiente *Production* (e *Preview*, con la chiave di test, se si vuole provare sui
   deploy di anteprima).
3. **Rideployare**: le variabili le legge la funzione all'avvio, un deploy già fatto non le vede.

Per far arrivare **anche** la ricevuta di pagamento di Stripe va spuntato, in Stripe, **Settings →
Payments → Customer emails → Successful payments**: Checkout riceve già l'indirizzo, ma senza quella
spunta Stripe in modalità live non scrive a nessuno. La conferma d'iscrizione del sito è un'altra
cosa e non dipende da quella spunta.

##### E perché le mail partano

Tre variabili in più, sempre in **Settings → Environment Variables**, e sempre seguite da un
rideploy:

| Variabile | Dove si prende | Se manca |
| :--- | :--- | :--- |
| `STRIPE_WEBHOOK_SECRET` | Stripe → **Developers → Webhooks → Add endpoint**, indirizzo `https://www.rivaltasulmincio.it/api/conferma-color-runner`, eventi `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`. Il `whsec_…` compare a endpoint creato | gli avvisi vengono accettati **senza verificarne la firma** (quello che conta si rilegge comunque da Stripe, ma è un buco: nei log si vede) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → **API Keys**, dopo aver verificato il dominio `rivaltasulmincio.it` in **Domains** (record SPF e DKIM dal pannello DNS) | la funzione risponde 500 e Stripe **continua a riprovare per tre giorni**: appena la chiave c'è, le mail arretrate partono |
| `POSTA_MITTENTE` | facoltativa. Il mittente, forma `Nome <indirizzo@dominio>`. Il dominio dev'essere quello verificato in Resend | vale `Color Runner — Rivalta sul Mincio <color-runner@rivaltasulmincio.it>` |

Il webhook si prova senza aspettare un vero iscritto: in Stripe, dalla scheda dell'endpoint,
**Send test webhook**. E in locale [`prova-conferma.mjs`](prova-conferma.mjs) — `npm test`, zero
dipendenze — finge Stripe e il servizio di posta e ripercorre quindici casi senza spedire niente a
nessuno:

```
── Il pagamento è andato a buon fine ──────────────────────────
  ok   pagata → parte la ricevuta
  ok   pagata in differita → parte la ricevuta
  ok   ricevuta già spedita → non si ripete
  ok   posta giù → 500, così Stripe ritenta

── Il pagamento NON è andato a buon fine ──────────────────────
  ok   sessione scaduta → parte l'avviso
  ok   pagamento differito rifiutato → parte l'avviso
  ok   scaduta, ma ha pagato con un'altra sessione → niente
  ok   completata ma non pagata → si aspetta, niente mail

── Chi bussa senza essere Stripe ──────────────────────────────
  ok   filtro per indirizzo rifiutato da Stripe: ripiega e trova il pagato
  ok   Stripe muto sul controllo: nel dubbio non accusa chi ha pagato
  ok   firma sbagliata → 400, nessuna mail
  ok   firma vecchia di un'ora → 400, nessuna mail
  ok   avviso firmato che MENTE sul pagamento → nessuna ricevuta
  ok   sessione di un altro evento → ignorata
  ok   avviso che non riguarda le sessioni → ignorato
```

Il penultimo è quello che vale la pena rileggere: un avviso con firma **valida** che dichiara un
pagamento riuscito non fa uscire nessuna ricevuta, perché quel che decide è la risposta di Stripe
all'interrogazione fatta con la chiave segreta, non quello che l'avviso racconta di sé.

##### La prova che nessuna finzione può dare

`npm test` dice che la funzione **decide** giusto. Non dice che la mail **esce** e che in Gmail su
un telefono si vede come deve — quello lo dice solo una mail vera.
[`prova-invio.mjs`](prova-invio.mjs) ne manda una, a sé stessi, con dati inventati, senza toccare
Stripe né pagamenti né iscritti. Usa gli stessi due modelli e la stessa funzione di spedizione del
webhook, importati e non ricopiati, quindi quello che si vede arrivare è esattamente quello che
arriverà a chi paga:

```powershell
$env:RESEND_API_KEY = "re_…"
node prova-invio.mjs io@example.it            # la ricevuta
node prova-invio.mjs io@example.it fallita    # l'avviso di mancato pagamento
```

**Va fatto girare prima che si iscriva qualcuno davvero.** Il modo tipico di sbagliare è il
mittente: in Resend si verifica spesso un sottodominio (`send.rivaltasulmincio.it`) mentre
`POSTA_MITTENTE` è rimasto sul dominio nudo, o viceversa — e allora Resend rifiuta con un 403 che
da solo non spiega niente. Qui e nei log di Vercel quel caso si dice per esteso, col mittente
stampato accanto. Ma è meglio scoprirlo con la propria casella che col primo che tira fuori la
carta: fino a quel momento il pagamento riuscirebbe comunque — l'incasso è di Stripe e non dipende
dalla mail — e la ricevuta arriverebbe in ritardo, quando la variabile è corretta e Stripe rimanda
l'avviso.

Va infine compilato **`_build/email/evento.json`** con quello che il gruppo del Palio decide, a
partire da `organizzatori`: senza quell'indirizzo le mail partono senza un posto a cui rispondere,
e il piede che dice «rispondi pure a questo messaggio» promette una cosa che non c'è.

Gli importi che il codice usa stanno in **un punto solo**: `QUOTA_CENT` e `COMMISSIONI_CENT` in
`api/iscrizione-color-runner.mjs` (in centesimi). Il testo di `_build/color-runner.body.html` li
ripete a parole per chi legge — se si cambiano i centesimi, va riallineato anche quello. Nelle mail
non sono ricopiati: la ricevuta mostra le voci lette da Stripe (`expand[]=line_items`), quello che
è stato incassato davvero.

---

## 🗺️ Dati e fonti

I geodati sono © **OpenStreetMap contributors**, licenza **ODbL**, estratti l'**11 agosto 2026**.
Le distanze sono in linea d'aria dal centro paese (45.18019 N, 10.67714 E), non stradali.

Dove il dossier in `data/` e il dataset grezzo divergono — numeri civici, parcheggi, barriere — **il
sito pubblica il dato grezzo**, perché è quello riverificabile aprendo
[`data/rivalta_dataset.json`](data/rivalta_dataset.json). La divergenza non è esposta al lettore: è
annotata qui.

Scelte editoriali da mantenere nelle prossime modifiche:

- **niente voci anonime fra le attività commerciali.** Un «parrucchiere senza nome a ~175 m» non
  serve a chi cerca un parrucchiere. Negozi, bar e locali entrano in elenco solo con un nome;
- **niente meta-commento sulla completezza dei dati.** Beni pubblici e naturali privi di nome
  proprio si nominano per quello che sono («Area verde di Via Garibaldi»), non si etichettano come
  non mappati;
- orari e recapiti restano da riverificare alla fonte prima di usi ufficiali — è detto una volta
  sola, in `/dati`, senza ripeterlo pagina per pagina.

---

## 📰 Aggiornare la rassegna stampa

La sezione «Rivalta sui giornali» in home si aggiorna da **[`_build/notizie.json`](_build/notizie.json)**, poi `node build.mjs`.
Le schede sono ordinate da sole per data decrescente.

```json
{
  "titolo": "il titolo esatto dell'articolo",
  "testata": "Gazzetta di Mantova",
  "data": "2026-07-06",              // ISO, serve solo a ordinare
  "dataTesto": "6 luglio 2026",      // quello che si legge nella scheda
  "nota": "luogo o date dell'evento", // fatti nostri, non frasi dell'articolo
  "url": "https://…"
}
```

**Regola da non violare: si pubblica solo il titolo, la testata, la data e il link.** Mai il testo
dell'articolo, mai la sua fotografia — nemmeno in hotlink. Un titolo con rimando è indicizzazione e
manda traffico alla testata; copiarne foto o corpo è riproduzione, ed è la parte che le testate
tutelano davvero. Il campo `nota` va scritto da noi e contiene solo fatti verificabili (date, luogo),
non una parafrasi del pezzo.

Le voci vanno verificate prima di pubblicarle: titolo e data si controllano aprendo l'articolo.

---

## 📍 Il registro dei luoghi

**[`_build/luoghi.json`](_build/luoghi.json)** è l'anagrafe dei posti di cui il sito parla: **110
voci**, 55 luoghi e 55 attività. Un file solo, perché le stesse informazioni servono a tre cose che
altrimenti si scriverebbero tre volte e divergerebbero al primo cambiamento — i collegamenti alla
mappa, le fotografie e le schede della pagina `/mappa`.

```json
{
  "slug": "chiesa-santi-vigilio-donato",
  "nome": "Chiesa dei Santi Vigilio e Donato",
  "gruppo": "Luoghi di culto",
  "indirizzo": "Piazza Chiesa",
  "lat": 45.179933, "lon": 10.680703, "dist_m": 281,
  "pagina": "/paese#chiese",
  "foto": "chiesa-santi-vigilio-donato.jpg",
  "alt": "La facciata settecentesca della parrocchiale su Piazza Chiesa",
  "credito": null,
  "consenso": null
}
```

Le coordinate sono state prese dall'estratto OSM, non scritte a mano: **84 voci su 110** hanno un
punto. Le altre sono aree, percorsi o cose diffuse — il fiume, le capezzagne, le meridiane — che un
punto non ce l'hanno, e il cui collegamento ricade sulla ricerca per nome di OpenStreetMap.

### I tre segnaposto

Nei frammenti non si scrivono link a mano. `build.mjs` risolve tre segnaposto:

| Si scrive | Diventa |
| :--- | :--- |
| `{{luogo:corte-mincio-porto}}` | il nome del luogo, premibile, che apre OSM sul punto |
| `{{luogo:corte-mincio-porto\|Via Porto}}` | lo stesso, con un'etichetta diversa dal nome |
| `{{geo:45.18234,10.67681}}` | coordinate sciolte (dossi, autovelox, nodi STOP) |
| `{{foto:chiesa-santi-vigilio-donato}}` | la fotografia, **se il file esiste** |

Uno slug che non esiste **fa fallire il build**, come già succede a un frammento senza titolo: un
collegamento rotto scoperto in produzione costa più di un build che si ferma.

---

## 📷 Aggiungere una fotografia

Le fotografie si mettono in **`assets/foto/`** (le attività in `assets/foto/attivita/`) con
**esattamente** il nome file scritto nel campo `foto` del registro, poi `node build.mjs`.

Non serve toccare l'HTML: i segnaposto `{{foto:…}}` sono **già scritti** nelle pagine per tutte e 110
le voci. Finché il jpg non c'è, il segnaposto non produce niente — nessun buco, nessuna immagine
rotta. Il giorno che il file entra nella cartella, la figura compare da sé.

Il build dice a ogni giro a che punto siamo:

```
⚠ fotografie: 12 su 110. Ne mancano 98.
  parco-campino.jpg  parco-la-platana.jpg  fontana-della-madonna.jpg  …
```

**Formato:** 1600 × 1067 (3:2), JPEG qualità ~82, sotto i 250 kB. Le misure sono scritte
nell'attributo `width`/`height` dell'immagine, così la pagina non sobbalza mentre carica.

> **Le vetrine delle attività vogliono un permesso.** Fotografare dalla strada pubblica è una cosa,
> pubblicare la foto su un sito che presenta quell'attività è un'altra: serve l'ok del titolare, e
> l'insegna è un marchio. Chiederlo mentre si scatta è anche il modo più semplice per ottenere una
> foto migliore di quella fatta di sfuggita dal marciapiede. Il registro ha i campi `credito` e
> `consenso` per tenerne traccia.

---

## 🗺️ La mappa

`/mappa` monta **Leaflet 1.9.4**, ospitato in `assets/vendor/leaflet/` — nessuna CDN. È l'unica
dipendenza del progetto, pesa ~160 kB fra script e foglio, e **si carica solo su quella pagina**:
`build.mjs` inietta i tag se e solo se il frammento contiene `{{MAPPA}}`, così non c'è un elenco da
tenere aggiornato.

I 268 segnaposto **non si scaricano a runtime**: il build proietta il dataset in un blocco JSON
dentro la pagina (~33 kB invece di 10.191 righe). Il dataset cambia solo quando qualcuno rigenera
l'estratto OSM, cioè fra un deploy e l'altro: andarlo a chiedere a ogni caricamento vorrebbe dire
mostrare una mappa vuota a chi ha la linea lenta.

- **Un solo colore.** I segnaposto sono tutti azzurro brand, come vuole il design system; a
  distinguere le nove categorie sono il segno dentro la goccia e i filtri. I punti con un nome sono
  più grandi e pieni: nel riquadro ci sono 28 panchine e un museo, e non devono pesare uguale.
- **Tema scuro senza una seconda fonte.** Non esiste una piastrella scura ufficiale di OSM, quindi
  quella chiara si inverte in CSS (`invert` + `hue-rotate`), e il cambio tema dalla barra di
  controllo agisce sulla mappa senza che `mappa.js` ne sappia nulla.
- **Movimento fermo rispettato:** con `html.rsm-still` o `prefers-reduced-motion` Leaflet nasce
  senza animazioni di zoom e dissolvenza.
- **Senza JavaScript la pagina regge:** sotto la mappa c'è l'elenco completo dei 110 luoghi, ognuno
  con il suo collegamento a OpenStreetMap.

Le etichette italiane dei tipi OSM stanno in **[`_build/tipi.json`](_build/tipi.json)**, insieme al
gruppo di filtro. Se una rigenerazione del dataset porta tipi nuovi, il build li elenca e li lascia
fuori dalla mappa finché non vengono tradotti lì.

> **Cosa non finisce sulla mappa.** `tipi.json` marca `escluso: true` le **38 piscine** e i **23
> recinti per animali** censiti: sono quasi tutti dentro giardini di abitazioni private. Sono dati
> veri e restano nel dataset scaricabile — che è OpenStreetMap così com'è — ma una mappa puntuale di
> casa d'altri non è una funzione, è un problema. Fuori anche i tombini, per motivi meno gravi.

---

## 🔎 Sitemap e indicizzazione

`sitemap.xml` **è generato** da `build.mjs` insieme alle pagine, dalla stessa lista di frammenti: una
pagina nuova entra in sitemap da sé. Non modificarlo a mano — una sitemap scritta a mano è una
sitemap che prima o poi elenca un indirizzo che non esiste più, ed è peggio di non averla.

Il dominio di produzione sta in **una riga sola**, la costante `SITE` in cima a `build.mjs`. Da lì
escono sia il `<loc>` della sitemap sia il `<link rel="canonical">` e l'`og:url` di ogni pagina: se
non coincidessero al carattere, Search Console tratterebbe la stessa pagina come due. La home è
canonicalizzata sulla radice (`/`, non `/index`), o i motori indicizzerebbero due pagine identiche.

Priorità e frequenza si dichiarano nel frammento, con due commenti facoltativi (default `0.7` e
`monthly`):

```html
<!--prio: 0.9-->
<!--freq: weekly-->
```

`lastmod` è la data di ultima modifica **del frammento sorgente**, non di oggi: rigenerare il sito
senza aver cambiato niente non deve dire ai motori che tutte e nove le pagine sono state riscritte.

`robots.txt` è statico e non ha esclusioni: nove pagine pubbliche, nessuna area riservata.

---

## 🔍 La ricerca in testata

Il tasto **Cerca** in testata (o il tasto `/`, o `⌘K` / `Ctrl K`) apre una tendina sopra la pagina:
si scrive, si scorre con le frecce, si apre con `Invio`, si chiude con `Esc` o toccando fuori.

L'indice **è generato** da `build.mjs` — come `sitemap.xml`, dalla stessa lista di frammenti — e
finisce in `assets/ricerca-dati.js` (`window.RSM_RICERCA`). Per ogni pagina pubblica: nome breve,
indirizzo, descrizione, e ogni sezione ancorata (l'etichetta la dà l'indice `.sb-riv-toc` in cima
alla pagina quando c'è, altrimenti il titolo `<h2>`; ci finiscono anche i pochi `<h3 id="…">`).
A ogni voce è allegato un pezzo del testo della sezione, **non mostrato, solo cercabile**: così
«autobus» porta a `/muoversi`, «meteo» a `/natura#stazione-meteo`, anche se la parola nel titolo
non c'è.

Nessuna chiamata di rete: l'indice è già nel browser, la ricerca funziona anche offline.
`assets/ricerca.js` è il comportamento (~26 kB l'indice, un file solo per tutte le pagine, in cache
dopo la prima). Senza JavaScript il tasto non compare e la navigazione a voci basta da sola.

## 🕔 «Ultimo aggiornamento»

La data dell'**ultimo commit** (`git log -1`, letta da `build.mjs`) è messa in testata, nel foglio
del menu su schermo stretto e in fondo a ogni pagina, con tre forme dallo stesso segnaposto:
`{{UPDATED_ISO}}` per `datetime`, `{{UPDATED_LONG}}` («26 agosto 2026») e `{{UPDATED_SHORT}}`
(«26 ago»). Con JavaScript `rivalta.js` la accorcia in forma relativa — «oggi», «ieri», «3 giorni
fa» — e sposta la data per esteso nel `title`. Fuori da un repo git il build ripiega su oggi.

---

## 🚀 Deploy (Vercel)

Il sito si serve così com'è: **su Vercel non gira nessuna build**. Le pagine si generano in locale con
`node build.mjs` e si committano già pronte.

[`vercel.json`](vercel.json) è quello che tiene in riga la piattaforma:

- `"framework": null` → preset **Other**. Il progetto era nato come SPA Vite e nelle impostazioni era
  rimasto il preset Vite: senza questa riga Vercel lancia `vite build` e fallisce con
  `vite: command not found` (exit 127), perché in questo repo Vite non esiste più;
- `"buildCommand"` e `"installCommand"` sono `echo` innocui. Devono essere **presenti**, non assenti:
  `vercel.json` ha la precedenza sulla dashboard, ma solo per i campi che dichiara — omettendoli
  tornerebbe a vincere il `vite build` salvato nelle impostazioni del progetto;
- `"outputDirectory": "."` → la radice del repo è già il sito;
- `"cleanUrls": true` → gli indirizzi non hanno estensione, e il vecchio `/paese.html` risponde con
  un redirect 308 su `/paese`;
- gli header di **cache**: `assets/` un'ora, `data/` un giorno, entrambi con `must-revalidate`.

[`.vercelignore`](.vercelignore) tiene fuori dal deploy l'officina (`_build/`, `build.mjs`,
`README.md`, `theme/`): online vanno solo le pagine, `assets/` e `data/`.

Il `cleanUrls` ha una conseguenza che era già costata una nota qui: l'evidenza della voce attiva
nella nav confronta il path con l'`href` dei link, e con gli indirizzi accorciati il confronto
letterale non torna più. Ora la funzione `pagina()` in [`assets/rivalta.js`](assets/rivalta.js) riduce entrambi al nome
della pagina — via lo slash iniziale, via l'estensione, `index` → vuoto — quindi il filo azzurro regge
sia su `/paese` sia su `/paese.html`, che è quello che vede chi arriva da un vecchio link prima che
il redirect scatti. **Se un giorno si toglie `cleanUrls`, quella funzione continua a funzionare:
non va disfatta.**

---

## 💻 Sviluppo locale

**Requisiti:** solo Node (per `build.mjs` e `serve.mjs`, che usano la sola libreria standard).
Niente `npm install`: non c'è niente da installare.

```bash
git clone https://github.com/albertoxpecchini/rivaltasulmincio.git
cd rivaltasulmincio
node build.mjs    # rigenera le 9 pagine + sitemap.xml
node serve.mjs    # http://localhost:8080 — Ctrl+C per fermare
```

[`serve.mjs`](serve.mjs) è l'anteprima locale: come `build.mjs`, sola libreria standard di Node e
niente da installare. La porta si cambia con `node serve.mjs 3000` (o `PORT=3000`).

Un server ci vuole per forza: aprire i file con `file://` **non** funziona più, perché da quando i
link interni sono root-assoluti (`/paese`) con `file://` puntano alla radice del disco. E deve
**risolvere gli indirizzi senza estensione** (`/paese` → `paese.html`), altrimenti in locale ogni
link interno dà 404 mentre in produzione funziona: `serve.mjs` riproduce apposta `"cleanUrls": true`
di `vercel.json`. Va bene anche `npx serve .` (porta 3000), che lo fa da sé, ma si tira dietro un
albero di dipendenze per una cosa che qui sono cinquanta righe.

### Provare le funzioni `api/` in locale — `npm run dev`

`serve.mjs` mostra le pagine; per provare anche le funzioni in `api/` c'è `npm run dev` (Vite:
`http://localhost:5174`, e in ascolto anche sull'indirizzo di rete `10.x`, così le pagine si aprono
dal telefono). Le funzioni leggono le chiavi da `process.env` — in produzione le mette Vercel, in
locale da un file **`.env`** in radice, che `git` ignora perché sono segreti:

```bash
cp .env.example .env      # poi riempire ISCRITTI_CHIAVE e STRIPE_SECRET_KEY
npm run dev
```

Senza `.env`, `/iscritti` risponde «zona iscritti non configurata: manca `ISCRITTI_CHIAVE`» e non
si arriva nemmeno a digitare la chiave. In `.env` la chiave la si inventa: dev'essere solo la stessa
che si scrive nella porta della pagina. Una variabile già esportata nella shell vince sul file.

---

## ♿ Accessibilità

Skiplink al contenuto (`Salta al contenuto`) · landmark semantici (`header` / `nav[aria-label]` /
`main` / `footer`) · `aria-current` sulla voce attiva, e la pillola che le scivola sotto è
`aria-hidden` perché non dice niente che `aria-current` non dica già meglio · barra di controllo
raggiungibile da tastiera (esce al `focus`) · **`prefers-reduced-motion` onorato**: senza una scelta
esplicita comanda il sistema, e allora non si attacca nemmeno un ascoltatore e l'onda del tema non
parte.

---

## 🎨 Palette

Azzurro brand identico nei due temi, grigi puri intorno. Tutti i valori letterali vivono nei due
blocchi di token in cima a [`assets/sb.css`](assets/sb.css); tutto il resto del foglio usa `var(--sb-*)`.

![#00B3FA](https://img.shields.io/badge/Brand-hsl(197_100%25_49%25)-00B3FA?style=flat-square)
![#fcfcfc](https://img.shields.io/badge/Fondo_chiaro-%23FCFCFC-FCFCFC?style=flat-square&labelColor=555)
![#141414](https://img.shields.io/badge/Fondo_scuro-%23141414-141414?style=flat-square)
![#171717](https://img.shields.io/badge/Inchiostro-%23171717-171717?style=flat-square)
![#e8e8e8](https://img.shields.io/badge/Bordo-%23E8E8E8-E8E8E8?style=flat-square&labelColor=555)

Carattere del sito: **Titillium Web** (+ Roboto Mono per il codice).

---

## 📄 Licenza e crediti

- **Geodati** — © **OpenStreetMap contributors**, licenza **[ODbL](https://opendatacommons.org/licenses/odbl/)**.
  Chi riusa `data/rivalta_dataset.json` deve mantenere l'attribuzione e la stessa licenza.
- **Design system `.sb-`** — portato da [albertopecchini.it](https://albertopecchini.it), codice sotto
  licenza **MIT** nel repo d'origine.
- **Testi del dossier e impaginazione** — © Alberto Pecchini. Le fonti istituzionali citate
  (Comune di Rodigo, ISTAT, Parco del Mincio, APAM) restano dei rispettivi titolari.
- **Rassegna stampa** — titoli, testate e link appartengono alle testate: qui c'è solo l'indice.

## 📬 Contatti

[![Email](https://img.shields.io/badge/Email-pzkko@yahoo.com-D14836?style=flat-square&logo=maildotru&logoColor=white)](mailto:pzkko@yahoo.com)
[![GitHub](https://img.shields.io/badge/GitHub-@albertoxpecchini-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/albertoxpecchini)

<div align="center"><sub>Rivalta sul Mincio · Rodigo (MN) · <code>HTML statico, zero dipendenze</code></sub></div>
</content>
</invoke>
