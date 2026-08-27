# La locandina e il banner della Color Runner

Due tavole disegnate su tela di **Claude Design** (canvas «Locandina A4 verticale») e
scaricate qui intere. Non finiscono nel sito da sole: sono l'originale editabile da cui si
esporta il file vero — la locandina da stampare, l'immagine del banner per `/color-runner`.

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

## Come si tira fuori il file finito

- **Locandina** → esporta in PDF (o PNG ad alta risoluzione) in formato A4, pronto per la
  stampa o da allegare a una mail.
- **Banner** → esporta in PNG 1600 × 600 e mettilo come `<img>` nello slot `.sb-cr-banner`
  in cima a [`/color-runner`](../../color-runner.html), che oggi è previsto nel CSS ma
  vuoto. L'immagine ci entra dentro una `.sb-panel`: la forma tagliata e il filo di colore
  glieli mette la pagina, il file non deve portarseli dietro.

## Perché sta qui e non va online

`design/` è in [`.vercelignore`](../../.vercelignore): è officina. In produzione ci va solo
l'HTML del sito, non il runtime di Claude Design né i suoi 100 kB di script.
