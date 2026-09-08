# Il vestito del mese — la tela

La guida visiva da cui nasce il tema di stagione del sito. Quattro artboard su una tela sola:

| File | Cosa mostra |
| :--- | :--- |
| `Main.dc.html` | Una pagina di Rivalta vestita, tema **chiaro**: testata col festone, occhiello di stagione, testata di sezione, riquadro di vetro |
| `Dark.dc.html` | La stessa pagina, tema **scuro** |
| `Palette.dc.html` | Le tre tinte, la mappatura sui token `--sb-*`, i contrasti verificati, e l'elenco di cosa **non** cambia |
| `Motif.dc.html` | L'alfabeto grafico — grappolo, foglia di vite, viticcio — il festone per esteso e come si muove lo strato del fondale |

🔗 **Tela online:** <https://claude.ai/code/artifact/7f66168b-3ccf-4808-830a-a64210432f7f>

## Settembre — uva

Tre tinte, e le regole del design system restano quelle:

| | Chiaro | Scuro | Dove |
| :--- | :--- | :--- | :--- |
| **Viola uva** | `#6d3f7c` | `#a870bd` | `--sb-brand`, bottoni, occhielli, grappoli |
| **Ambra vendemmia** | `#9a6a24` | `#d69a52` | numeri di sezione, secondo alone del fondale |
| **Foglia di vite** | `#6f7d3a` | `#9aa86a` | tralci del festone, foglie che scendono |

## Come si rigenera la tela

Gli `.dc.html` e `canvas.json` sono il sorgente e stanno nel repo. Il file impacchettato
(`tema-vendemmia.html`, 2,5 MB: l'editor di Claude Design attorno al disegno) **non** è versionato —
si rifà dalla skill `design`, che rilegge questi file e ripubblica sullo stesso indirizzo.

Non si modifica mai il file impacchettato: si modificano gli `.dc.html` qui accanto e si riparte
da quelli.

## E l'implementazione?

La tela è la **guida**, non il sito. Quello che finisce davvero online sta in:

- [`assets/stagioni.css`](../../assets/stagioni.css) — accento, aloni del fondale, festone
- [`assets/stagioni.js`](../../assets/stagioni.js) — le foglie che scendono
- [`build.mjs`](../../build.mjs) — `STAGIONI` / `STAGIONE` in cima: una riga per cambiare mese

Il perché di ogni scelta è nel [README del sito](../../README.md#-il-vestito-del-mese).
