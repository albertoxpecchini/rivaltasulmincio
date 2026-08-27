# La locandina e il banner della Color Runner

Due tavole disegnate su tela di **Claude Design** (canvas «Locandina A4 verticale») e
scaricate qui intere. Sono l'**originale editabile**: nel sito ci va il file esportato
(vedi «Come i due pezzi entrano nel sito» più sotto), non questi `.dc.html` col loro
runtime.

| File | Cos'è | Misura |
| :--- | :--- | :--- |
| `locandina.dc.html` | Locandina A4 verticale — evento, quando/dove, quota, iscrizioni, organizzatori | 210 × 297 mm |
| `banner.dc.html` | Striscia orizzontale per la testa della pagina `/color-runner` | 1600 × 600 px |
| `doc-page.js`, `support.js` | Il runtime di Claude Design che le due tavole caricano con `<script src="./…">`. Senza, i `.dc.html` non si compongono | — |
| `.thumbnail` | Anteprima del canvas (WebP 640 × 335), la usa Claude Design | — |
| `screenshots/banner.png` | Istantanea del banner (JPEG 924 × 540), comoda per un colpo d'occhio senza aprire il runtime | — |

## Da dove vengono i dati

Testi e cifre sono copiati da [`/color-runner`](../../color-runner.html) e dal
[regolamento](../../color-runner-regolamento.html) **al 27 agosto 2026**: domenica 20
settembre 2026 dalle 15:30, ritrovo in Piazza Chiesa, quota 10 € (+1 € di commissioni),
iscrizioni su `rivaltasulmincio.it/color-runner`, organizzano Rebecca Zovi, Elena Colla e
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

- **Banner** → `assets/foto/color-runner-banner.webp` (2400 × 900, ~55 kB). `renderBanner`
  lo mette come `<img class="sb-riv-crbanner">` nella testata di
  [`/color-runner`](../../color-runner.html), al posto della scheda dell'evento in
  [home](../../index.html) (dove è un collegamento) e in coda al
  [regolamento](../../color-runner-regolamento.html).
- **Locandina** → `assets/foto/color-runner-locandina.webp` (1240 × 1754, ~90 kB) per
  l'anteprima e `assets/color-runner-locandina.pdf` (A4) per la stampa. `renderLocandina`
  le mette nella sezione «La locandina» di `/color-runner`: l'anteprima è un'immagine e il
  clic scarica il PDF.

La regola CSS di tutti e due sono poche righe in
[`assets/rivalta.css`](../../assets/rivalta.css) (`.sb-riv-crbanner`, `.sb-riv-crloc`); il
resto è dentro le immagini.

> I file sono stati ricavati aprendo `banner.dc.html` / `locandina.dc.html` in un browser
> **senza** il runtime di Claude Design (il markup si compone da solo) e catturandolo:
> screenshot a 2× per i `.webp`, stampa in PDF A4 per la locandina. Rifatti i pezzi sulla
> tela, si riesporta con questi nomi e ricompaiono al primo build.

### Scorciatoia: `locandina.render.html`

Copia autonoma della sola locandina — stesso markup di `locandina.dc.html` ma senza
`<x-dc>`/`<doc-page>` né runtime, pagina A4 vera con i font da Google Fonts. Serve a
riesportare `webp` + `pdf` con Chrome headless, senza aprire Claude Design:

```
chrome --headless --no-pdf-header-footer --print-to-pdf=color-runner-locandina.pdf \
  --virtual-time-budget=10000 locandina.render.html
chrome --headless --force-device-scale-factor=2 --window-size=794,1123 \
  --screenshot=shot.png --virtual-time-budget=10000 locandina.render.html
# shot.png (1588×2246) → ridimensiona a 1240×1754 e salva in webp (es. sharp/squoosh)
```

Se si tocca `locandina.dc.html`, riportare la stessa modifica qui dentro (i due file
vanno tenuti allineati a mano).

## Perché sta qui e non va online

`design/` è in [`.vercelignore`](../../.vercelignore): è officina. In produzione ci va solo
l'HTML del sito, non il runtime di Claude Design né i suoi 100 kB di script.
