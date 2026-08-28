# I loghi

Tre file, e li cerca `build.mjs` per la striscia in fondo a [`/color-walk`](../../_build/color-walk.body.html).

Il nome file **non è una proposta, è la chiave**: il logo compare da sé al primo build dopo
che il file è entrato qui. Se ne manca uno, al suo posto la pagina scrive il nome — che in
una striscia di loghi si legge come una scelta, non come un'immagine rotta.

L'estensione la sceglie il build: cerca `.svg`, poi `.png`, `.webp`, `.jpg`, e si ferma alla
prima che trova. **Un SVG vince sempre su tutto**: se un giorno arriva `anspi.svg`, il PNG
resta sul disco ma non lo guarda più nessuno.

| File | Chi | Misura | Peso | Collegamento |
| :--- | :--- | :--- | ---: | :--- |
| `anspi.png` | ANSPI — Associazione Nazionale San Paolo Italia, oratori e circoli | 300 × 155 | 8,9 kB | [anspi.it](https://www.anspi.it) |
| `comune-rodigo.webp` | Comune di Rodigo (stemma) | 382 × 500 | 72,3 kB | [comune.rodigo.mn.it](https://comune.rodigo.mn.it) |
| `ap.png` | Alberto Pecchini | 512 × 512 | 4,4 kB | [albertopecchini.it](https://albertopecchini.it) |

## Come stanno in pagina

Le piastrelle sono **bianche in tutti e due i temi**, apposta: un logo a colori su fondo
scuro perde i suoi, e questi non sono nostri da ritoccare.

I tre marchi hanno tre forme diverse — uno largo, uno verticale, uno quadrato — e la stessa
altezza per tutti li farebbe leggere sbagliati: il largo sembrerebbe il doppio degli altri e
lo stemma una miniatura. Si pareggiano **a occhio**, ognuno con la sua altezza, nel foglio di
stile della pagina (`.sb-cw-logo--anspi`, `--rodigo`, `--ap`). Chi sostituisce un file con
uno di forma diversa deve ripassare di lì.

Lo stemma pesa 72 kB per un disegno che in pagina è alto una cinquantina di pixel: è un
tratto fitto e il webp non lo comprime meglio di così. Se dà fastidio, la strada è
ridisegnarlo in SVG — non ricomprimerlo.

> ANSPI e Comune di Rodigo sono marchi di qualcun altro. Vanno presi dalla fonte ufficiale,
> non ridisegnati a occhio, e stanno in pagina se chi li porta è d'accordo che ci stiano.
> Se il rapporto ha un nome — patrocinio, collaborazione, organizzazione — quel nome va
> scritto sopra la striscia: oggi i tre loghi stanno lì senza dichiarare niente.
