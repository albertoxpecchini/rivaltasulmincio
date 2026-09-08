# Il vestito del mese — la tela

Cinque artboard su una tela sola. **Non sono uno schizzo preparatorio**: colori, tracciati SVG e
parametri di movimento sono gli stessi che sono andati online, quindi questa tela si legge come il
documento di quello che c'è, non di quello che si voleva fare.

| File | Cosa mostra |
| :--- | :--- |
| `Main.dc.html` | Una pagina di Rivalta vestita, tema **chiaro**: nav, tralcio, hero, pillole, testata di sezione, lastra di vetro |
| `Dark.dc.html` | Il tema **scuro**, e sotto la **nota di stagione** com'è in fondo a ogni pagina |
| `Palette.dc.html` | Le sei parole del disciplinare e il colore che ognuna diventa, chiaro e scuro, con la mappatura sui token `--sb-*` e i contrasti |
| `Zone.dc.html` | **La geografia**: il Mincio da Garda al Po, le due denominazioni di collina a monte, quella di pianura a valle, e Rivalta nel mezzo |
| `Motif.dc.html` | I tre disegni (foglia, grappolo, viticcio), la geometria del tralcio e la fisica di quello che scende |

🔗 **Tela online:** <https://claude.ai/code/artifact/7f66168b-3ccf-4808-830a-a64210432f7f>

## Settembre — uva

Rivalta non ha vigne: la sua terra fa cereali e meloni. Ma il Mincio scende dall'anfiteatro morenico
del Garda, e lassù il vino c'è. Le sei tinte del mese sono le parole con cui l'**articolo 6** dei due
disciplinari di zona descrive quei vini.

| Variabile | La parola | Da dove | Chiaro · scuro |
| :--- | :--- | :--- | :--- |
| `--stag-rubino` | «rosso rubino più o meno intenso» | Lambrusco Mantovano DOC · rosso | `#9b1b30` · `#c94055` |
| `--stag-granato` | «…o granato» | Lambrusco Mantovano DOC · rosso | `#6b2029` · `#a03648` |
| `--stag-cerasuolo` | «tendente al cerasuolo con l'invecchiamento» | Garda Colli Mantovani DOC · rosso | `#b8323f` · `#d75c6c` |
| `--stag-rosato` | «rosato brillante» | Garda Colli Mantovani DOC · chiaretto | `#e2879b` · `#f0a8b7` |
| `--stag-paglierino` | «giallo paglierino» | Garda Colli Mantovani DOC · bianco | `#d8bd60` · `#e3c977` |
| `--stag-viola` | «sentore di viola o ribes» | Lambrusco Mantovano DOC · odore | `#6d4a8c` · `#ab8ccb` |

Le tre che non sono vino: `--stag-vite` (`#7c8a3e` · `#a3ad6f`) per il tralcio e le foglie,
`--stag-vite-oro` (`#96702e` · `#d2a660`) per la foglia che ha già girato, `--stag-oro`
(`#7d6a1c` · `#d9bf6b`) per il paglierino abbassato quanto basta a fare da testo.

**Fonti:** [Garda Colli Mantovani DOC — disciplinare, art. 6](https://www.agraria.org/vini/garda-colli-mantovani-doc.htm) ·
[Lambrusco Mantovano DOC — disciplinare, art. 6](https://www.agraria.org/vini/lambrusco-mantovano-doc.htm) ·
[Strada dei Vini e dei Sapori Mantovani](https://www.mantovastrada.it/)

## Come si rigenera la tela

Gli `.dc.html` e `canvas.json` sono il sorgente e stanno nel repo. Il file impacchettato
(`tema-vendemmia.html`, 2,5 MB: l'editor di Claude Design attorno al disegno) **non** è versionato —
si rifà dalla skill `design`, che rilegge questi file e ripubblica sullo stesso indirizzo.

Non si modifica mai il file impacchettato: si modificano gli `.dc.html` qui accanto e si riparte da
quelli.

## E l'implementazione?

- [`assets/stagioni.css`](../../assets/stagioni.css) — palette, aloni del fondale, tralcio, nota, caduta
- [`assets/stagioni.js`](../../assets/stagioni.js) — le quattro specie che scendono, ognuna con la sua fisica
- [`build.mjs`](../../build.mjs) — `STAGIONI` / `STAGIONE` in cima: una riga per cambiare mese, e lì
  dentro stanno anche le sei parole e le due zone, che sono contenuto e non decorazione

Il perché di ogni scelta è nel [README del sito](../../README.md#-il-vestito-del-mese).
