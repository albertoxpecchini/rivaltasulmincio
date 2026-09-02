# I loghi

Undici file, e li cerca `build.mjs` (array `LOGHI`) per la striscia in fondo a
[`/color-walk`](../../_build/color-walk.body.html).

Il nome file **non è una proposta, è la chiave**: il logo compare da sé al primo build dopo
che il file è entrato qui. Se ne manca uno, al suo posto la pagina scrive il nome — che in
una striscia di loghi si legge come una scelta, non come un'immagine rotta — e il build lo
elenca fra gli avvisi a ogni compilazione, finché non arriva.

L'estensione la sceglie il build: cerca `.svg`, poi `.png`, `.webp`, `.jpg`, e si ferma alla
prima che trova. **Un SVG vince sempre su tutto**: se un giorno arriva `anspi.svg`, il PNG
resta sul disco ma non lo guarda più nessuno.

## Quelli che ci sono

| File | Chi | Misura | Peso | Collegamento |
| :--- | :--- | :--- | ---: | :--- |
| `anspi.png` | ANSPI — Associazione Nazionale San Paolo Italia, oratori e circoli | 300 × 155 | 8,9 kB | [anspi.it](https://www.anspi.it) |
| `comune-rodigo.webp` | Comune di Rodigo (stemma) — patrocinio | 382 × 500 | 72,3 kB | [comune.rodigo.mn.it](https://comune.rodigo.mn.it) |
| `ap.png` | Alberto Pecchini | 512 × 512 | 4,4 kB | [albertopecchini.it](https://albertopecchini.it) |

## Quelli che mancano

Decisi il 2 settembre 2026, i file non ancora qui dentro. **Il nome dev'essere esattamente
questo**, l'estensione la si sceglie fra quelle sopra:

| File da salvare | Chi | Cosa mette |
| :--- | :--- | :--- |
| `polizia-locale.*` | Corpo Intercomunale di Polizia Locale Mantova Ovest | gli attraversamenti |
| `avis-rivalta.*` | AVIS Rivalta sul Mincio | offre l'aperitivo |
| `pizzangolo.*` | Pizzangolo, pizzeria | le teglie di pizza |
| `marchini.*` | Panificio Marchini dal 1923 | pane e grissini, da confermare |
| `storti.*` | Storti Salumi | da confermare |
| `farmacia-tona.*` | Farmacia Tona | — |
| `fior-di-loto.*` | Fiordiloto profumeria | — |
| `non-solo-lady.*` | Non Solo Lady, parrucchiere di Marco Marazzi | — |

> «Marazzi» e «Non Solo Lady» sono **la stessa attività**: il parrucchiere di Marco Marazzi
> in Piazza Chiesa 1b. Un logo solo, col nome dell'insegna.

## Come stanno in pagina

Le piastrelle sono **bianche in tutti e due i temi**, apposta: un logo a colori su fondo
scuro perde i suoi, e questi non sono nostri da ritoccare.

Attenzione a due cose, che si vedono solo a file dentro:

- **Un marchio bianco su fondo trasparente sparisce.** Il profilo di Non Solo Lady è bianco:
  va salvato **col suo fondo nero**, non ritagliato in trasparenza, o sulla piastrella
  bianca non resta niente da vedere.
- **La forma decide l'altezza.** Marchi di forme diverse alla stessa altezza si leggono
  sbagliati: il largo sembra il doppio degli altri e uno stemma una miniatura. Si pareggiano
  **a occhio** nel foglio di stile della pagina — `.sb-cw-logo--anspi` (2,1rem),
  `--rodigo` (3,4rem), `--quadro` (3,2rem, per Polizia Locale, Farmacia Tona e Non Solo
  Lady), `--ap`, e 2,4rem per tutti gli altri. Chi sostituisce un file con uno di forma
  diversa deve ripassare di lì.

Lo stemma del Comune pesa 72 kB per un disegno che in pagina è alto una cinquantina di
pixel: è un tratto fitto e il webp non lo comprime meglio di così. Se dà fastidio, la strada
è ridisegnarlo in SVG — non ricomprimerlo.

## L'ordine, e cosa dichiara

Non è casuale: prima chi risponde dell'evento (ANSPI), poi chi lo permette — il Comune che
dà il patrocinio e la Polizia Locale che tiene gli attraversamenti — poi chi mette cibo,
bevande e una mano, e in fondo chi ha fatto il sito. Sotto la striscia la riga lo dice a
parole: «Organizza l'Associazione San Filippo Neri ANSPI APS-ETS di Rodigo · **Con il
patrocinio del Comune di Rodigo e la collaborazione della Polizia Locale Mantova Ovest**».

> Sono marchi di qualcun altro. Vanno presi dalla fonte ufficiale, non ridisegnati a occhio,
> e stanno in pagina se chi li porta è d'accordo che ci stiano. Per il Comune e per la
> Polizia Locale «d'accordo» vuol dire un patrocinio chiesto e concesso, non un file
> ricevuto su WhatsApp: finché non è formale, la dicitura è una promessa scoperta.
