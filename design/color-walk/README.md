# La locandina e il banner della Color Walk

Due tavole disegnate su tela di **Claude Design** (canvas «Locandina A4 verticale») e
scaricate qui intere. Sono l'**originale editabile**: nel sito ci va il file esportato
(vedi «Come i due pezzi entrano nel sito» più sotto), non questi `.dc.html` col loro
runtime.

| File | Cos'è | Misura |
| :--- | :--- | :--- |
| `locandina.dc.html` | Locandina A4 verticale — evento, quando/dove, quota, iscrizioni, organizzatori | 210 × 297 mm |
| `banner.dc.html` | Striscia orizzontale per la testa della pagina `/color-walk` | 1600 × 600 px |
| `doc-page.js`, `support.js` | Il runtime di Claude Design che le due tavole caricano con `<script src="./…">`. Senza, i `.dc.html` non si compongono | — |
| `.thumbnail` | Anteprima del canvas (WebP 640 × 335), la usa Claude Design | — |
| `screenshots/banner.png` | Istantanea del banner (JPEG 924 × 540), comoda per un colpo d'occhio senza aprire il runtime | — |
| `aperitivo/` | La striscia dell’**aperitivo** di fine camminata — sottoprogetto a parte (vedi sotto) | 2400 × 900 px |
| `foto/` | Il **banner e la locandina con la foto** (bambini che lanciano colori), sfumata nel foglio. Sorgenti vive che sostituiscono `banner.dc.html` e `locandina.dc.html` (vedi sotto) | banner 2400 × 900 · A4 1240 × 1754 |

> **Le copie qui dentro sono indietro (1° settembre 2026).** Banner e locandina pubblicati
> in `assets/` sono stati riesportati da Claude Design con roba che in questi `.dc.html` e
> `.render.html` non c'è: il **logo ANSPI**, il **QR code** verso `/color-walk`, i **sei
> stemmi delle contrade**, lo **stemma del Comune** e il logo **Fiordiloto**. Chi riapre
> queste tavole per cambiare una virgola e riesporta **cancella tutto quello**. Prima di
> toccarle si riscarica la cartella del progetto da claude.ai/design, come dice il giro qui
> sotto.

## Banner e locandina con la foto — `foto/`

`banner.dc.html` e `locandina.dc.html` qui sopra sono le versioni **astratte** (nuvole di
colore disegnate) — restano come storia. Le versioni vive hanno una **foto** (bambini che
corrono lanciando colori):

- **banner**: la foto a destra, **dissolta nel foglio** da una maschera radiale (niente
  rettangolo netto);
- **locandina A4**: la foto come **fascia a pieno taglio in cima** (1240 × 460), filo
  azzurro sotto, poi il testo su bianco.

| File in `foto/` | Cos'è |
| :--- | :--- |
| `color-walk-banner.dc.html` | Banner 2400 × 900, `<image-slot id="colorwalk-photo">` a destra |
| `color-walk-locandina.dc.html` | Locandina A4 1240 × 1754, `<image-slot id="colorwalk-photo-a4">` nella fascia in alto |
| `color-walk-banner.render.html`, `color-walk-locandina.render.html` | Copie piatte e autonome (foto + font inline) da cui si riesporta |
| `.image-slots.state.json` | Le foto com'erano nelle tele. **Nota:** DesignSync `get_file` tronca il sidecar oltre i 256 KiB (con 3 foto ci arriva): per riprenderlo intero si **riscarica la cartella del progetto** da claude.ai/design |
| `image-slot.js`, `support.js` | Runtime di Claude Design per queste due tele |

Le tele editabili stanno su **Claude Design**, progetto `adc6ffc7-1111-4420-8a1b-610cba5dba81`
(file `Color Walk Banner.dc.html` e `Color Walk Locandina.dc.html`, accanto alla
aperitivo — stessi `image-slot.js`/`support.js`, slot id distinti → un solo sidecar
`.image-slots.state.json` senza collisioni).

**Giro completo quando arriva una foto (PNG):**

1. Su Claude Design si apre il file (banner o locandina), si trascina il PNG nello slot,
   si posiziona, **Salva**. La stessa foto va bene per tutti e due.
2. Si **riscarica la cartella del progetto** (`~/Downloads/Risottata banner design/` — su Claude Design la cartella ha ancora il nome di prima):
   contiene i `.dc.html` aggiornati e il `.image-slots.state.json` intero. (`DesignSync
   get_file` va bene per i `.dc.html`, ma tronca il sidecar quando è grande.)
3. Si genera il `.render.html` piatto e autonomo: `<image-slot>` → `<div>` col
   `background-image` da `.u` del sidecar, font in base64. Zero rete. Per la locandina il
   `.render.html` ha anche il CSS di stampa (`@page A4`) per il PDF.
4. Screenshot Chrome headless a scala 1 → `sharp` in webp:
   - banner → **`assets/foto/color-walk-banner.webp`** (2400 × 900)
   - locandina → **`assets/foto/color-walk-locandina.webp`** (1240 × 1754) e il PDF A4
5. `node build.mjs` — il banner entra ovunque (`{{BANNER}}`/`{{CW_HOME}}`), la locandina
   nell'anteprima di `/color-walk`.

## L’aperitivo — `aperitivo/`

Tela di Claude Design importata da `claude.ai/design`. Diversa dalle altre due: il piatto
è un `<image-slot>` in cui è stata trascinata una foto (due spritz con arachidi), salvata
in `.image-slots.state.json` accanto al `.dc.html`.

| File | Cos'è |
| :--- | :--- |
| `aperitivo-banner.dc.html` | L'originale editabile (usa `support.js` + `image-slot.js`) |
| `image-slot.js`, `support.js` | Il runtime di Claude Design per questa tela |
| `.image-slots.state.json` | La foto, in base64, com'è stata inserita nella tela. Lo slot si chiama `aperitivo-plate` |
| `aperitivo-banner.render.html` | Copia **piatta e autonoma**: niente `<x-dc>`/`<image-slot>`, font Titillium Web in base64, la foto messa come sfondo di un cerchio. Zero rete. È da qui che si riesporta il webp |

**Riesportare** `assets/foto/aperitivo-banner.webp` (2400 × 900): screenshot di
`aperitivo-banner.render.html` con Chrome headless a scala 1, poi `sharp` in webp —
stesso giro della locandina.

```
chrome --headless --force-device-scale-factor=1 --window-size=2400,900 \
  --screenshot=shot.png --virtual-time-budget=12000 aperitivo/aperitivo-banner.render.html
# shot.png (2400×900) → webp, quality ~88
```

Se si rifà la tela su Claude Design, si riscarica `.dc.html` + `.image-slots.state.json`
e si rigenera `aperitivo-banner.render.html` (rimettendo la foto da `.u` del sidecar come
`background-image` del cerchio).

## Da dove vengono i dati

Testi e cifre sono copiati da [`/color-walk`](../../color-walk.html) e dal
[regolamento](../../color-walk-regolamento.html) **al 1° settembre 2026**: domenica 20
settembre 2026, ritrovo alle 15:45 in Piazza Chiesa e partenza alle 16:00, quota 10 € (+1 € di commissioni),
iscrizioni su `rivaltasulmincio.it/color-walk`, organizzano Rebecca Zovi, Elena Colla e
Alessandra Nosè. **Non si aggiornano da soli**: se in pagina cambia una data, un luogo o un
prezzo, queste due tavole vanno riaperte e rifatte a mano.

## Lo stile è quello del sito

Le due tavole rifanno il design system `.sb-` fuori dal sito: carattere **Titillium Web**
(più Roboto Mono per i dettagli tecnici), titoli in tondo con crenatura stretta, palette
**neutra più il solo azzurro** `#00A6EB` sui pochi elementi di sistema, angoli **tagliati a
45°** in alto a sinistra e in basso a destra (mai stondati), lastre di vetro chiaro con filo
di luce sul bordo alto, griglia tecnica da 64 px che sfuma sul fondo. Le **polveri colorate**
— magenta `#ff2d87`, giallo `#ffc61a`, ciano `#0fb2ef`, viola `#8a5cf6` — restano confinate
al fondale: veli tenui sulla locandina, una nuvola più accesa sul banner, mai sotto il testo.
Il rosso è escluso apposta: sul sito vuol dire «errore».

## Come i due pezzi entrano nel sito

Tutti e due sono **il file della tela, messo com'è** — nessuna cornice, nessuna lastra. Il
build li pesca da `assets/` e li mette al posto di `{{BANNER}}` / `{{LOCANDINA}}`; se un
file manca, il segnaposto non lascia buchi e il build lo dice.

- **Banner** → `assets/foto/color-walk-banner.webp` (2400 × 900, ~55 kB). `renderBanner`
  lo mette come `<img class="sb-riv-cwbanner">` nella testata di
  [`/color-walk`](../../color-walk.html), al posto della scheda dell'evento in
  [home](../../index.html) (dove è un collegamento) e in coda al
  [regolamento](../../color-walk-regolamento.html).
- **Locandina** → `assets/foto/color-walk-locandina.webp` (1240 × 1754, ~90 kB) per
  l'anteprima e `assets/color-walk-locandina.pdf` (A4) per la stampa. `renderLocandina`
  le mette nella sezione «La locandina» di `/color-walk`: l'anteprima è un'immagine e il
  clic scarica il PDF.

La regola CSS di tutti e due sono poche righe in
[`assets/rivalta.css`](../../assets/rivalta.css) (`.sb-riv-cwbanner`, `.sb-riv-cwloc`); il
resto è dentro le immagini.

> I file sono stati ricavati aprendo `banner.dc.html` / `locandina.dc.html` in un browser
> **senza** il runtime di Claude Design (il markup si compone da solo) e catturandolo:
> screenshot a 2× per i `.webp`, stampa in PDF A4 per la locandina. Rifatti i pezzi sulla
> tela, si riesporta con questi nomi e ricompaiono al primo build.

### Riesportare la locandina senza Claude Design

Da radice progetto:

```
npm install            # una volta: serve `sharp`
npm run render:locandina
```

Rigenera `assets/foto/color-walk-locandina.webp` (1240×1754) e
`assets/color-walk-locandina.pdf` (A4). Poi si controllano le due uscite e si committano.

Come funziona:

- **`locandina.render.html`** — copia autonoma della sola locandina: stesso markup di
  `locandina.dc.html` ma senza `<x-dc>`/`<doc-page>` né runtime, pagina A4 vera, **font
  Titillium Web e Roboto Mono già dentro il file** (woff2 in base64, sottoinsiemi latin +
  latin-ext). Nessuna rete: il risultato è identico online e offline.
- **`render-locandina.mjs`** — trova Chrome o Edge da solo (`CHROME_PATH` per forzarlo),
  fa PDF (`--print-to-pdf`) e screenshot 2× (1588×2246), poi `sharp` lo riduce a
  1240×1754 e lo salva in webp.

Se si tocca `locandina.dc.html`, riportare la stessa modifica in `locandina.render.html`
(i due file vanno tenuti allineati a mano; i blocchi `@font-face` in testa non si
toccano). Per rifare i font da capo: scaricare il CSS di Google Fonts e sostituire ogni
`url(https://…woff2)` col woff2 in `data:font/woff2;base64,…`.

Il **banner** non ha una scorciatoia: non porta testo che cambia spesso, si rifà sulla
tela quando serve.

## Perché sta qui e non va online

`design/` è in [`.vercelignore`](../../.vercelignore): è officina. In produzione ci va solo
l'HTML del sito, non il runtime di Claude Design né i suoi 100 kB di script.
