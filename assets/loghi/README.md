# I loghi

Dodici file, e li cerca `build.mjs` (array `FASCE_LOGHI`) per il blocco «Chi c'è dietro» in
fondo a [`/color-walk`](../../_build/color-walk.body.html).

Il nome file **non è una proposta, è la chiave**: il logo compare da sé al primo build dopo
che il file è entrato qui. Se ne manca uno, al suo posto la pagina scrive il nome — che in
una striscia di loghi si legge come una scelta, non come un'immagine rotta — e il build lo
elenca fra gli avvisi a ogni compilazione, finché non arriva.

Il nome sta nell'array, non nella cartella: aggiungere un file qui dentro senza metterlo in
`FASCE_LOGHI` non lo fa comparire da nessuna parte.

L'estensione la sceglie il build: cerca `.svg`, poi `.png`, `.webp`, `.jpg`, e si ferma alla
prima che trova. **Un SVG vince sempre su tutto**: se un giorno arriva `anspi.svg`, il PNG
resta sul disco ma non lo guarda più nessuno.

## I dodici

| File | Chi | Misura | Peso |
| :--- | :--- | :--- | ---: |
| `parrocchia.svg` | Parrocchia Santi Vigilio e Donato di Rivalta — organizza | vettoriale | 88 kB (27 gzip) |
| `anspi.png` | ANSPI — la rete nazionale a cui il circolo è affiliato | 300 × 155 | 9 kB |
| `comune-rodigo.webp` | Comune di Rodigo (stemma) — patrocinio | 382 × 500 | 72 kB |
| `polizia-locale.webp` | Polizia Locale Mantova Ovest — attraversamenti | 300 × 300 | 18 kB |
| `avis-rivalta.webp` | AVIS Rivalta sul Mincio — offre l'aperitivo | 500 × 333 | 16 kB |
| `pizzangolo.webp` | Pizzangolo, pizzeria — le teglie di pizza | 500 × 333 | 62 kB |
| `marchini.webp` | Panificio Marchini dal 1923 | 500 × 281 | 28 kB |
| `storti.webp` | Storti Salumi | 500 × 167 | 22 kB |
| `farmacia-tona.webp` | Farmacia Tona | 500 × 500 | 41 kB |
| `fior-di-loto.webp` | Fiordiloto profumeria | 500 × 406 | 32 kB |
| `non-solo-lady.webp` | Non Solo Lady — parrucchiere di Marco Marazzi | 500 × 500 | 17 kB |
| `ap.png` | Alberto Pecchini | 512 × 512 | 4 kB |

> «Marazzi» e «Non Solo Lady» sono **la stessa attività**: il parrucchiere di Marco Marazzi
> in Piazza Chiesa 1b. Un logo solo, col nome dell'insegna.

## Quali portano da qualche parte

Tutte e dodici le tessere sono collegamenti. Sei portano a un sito vero, sei alla pagina
Facebook dell’attività — perché è l’unico posto in cui quelle sei stanno, e mandarci chi
clicca vale più di una figura che non fa niente. Il codice non lo sa e non gliene importa:
`renderPiastrella` mette il marcatore `<a>` se il marchio ha un `url` e lo lascia un `<div>` se non
ce l’ha, e quel ramo resta lì per il giorno in cui un marchio nuovo arriva senza indirizzo.

| Chi | Dove porta |
| :--- | :--- |
| Parrocchia Santi Vigilio e Donato | `sites.google.com/site/parrocchiadirivaltasm` |
| ANSPI | `anspi.it` |
| Comune di Rodigo | `comune.rodigo.mn.it` |
| Polizia Locale Mantova Ovest | la pagina del Corpo sul sito del Comune di Rodigo |
| Storti Salumi | `stortisalumi.it` |
| Alberto Pecchini | `albertopecchini.it` |
| AVIS Rivalta | `facebook.com/avisrsm` |
| Pizzangolo | `facebook.com/pizzangolotakeaway` |
| Panificio Marchini | `facebook.com/PanificioMarchini` |
| Farmacia Tona | `facebook.com/farmaciatona` |
| Fiordiloto | `facebook.com/profumeriaFDL` |
| Non Solo Lady | `facebook.com/nonsololady` |

Sono le sole tessere di tutto il sito che mandano su un social: qui è una scelta, non una
distrazione. Fuori da questa striscia il sito continua a non linkare Facebook.

**Tre indirizzi che sembrano giusti e non lo sono.** Provati il 3 settembre 2026, e da
allora è meglio non ripescarli senza riprovare:

- `menupizzangolo.altervista.org` — il vecchio sito di Pizzangolo, oggi risponde «Sito web
  archiviato».
- `panificiomarchini.it` — compare ancora nei motori di ricerca, ma il dominio non risolve
  più.
- `parrocchiadirivaltasm.it` — è quello che la Diocesi di Mantova indica per la parrocchia,
  e neanche quello risolve. Quello che sta in piedi è il vecchio Google Sites, ed è lì che si
  manda chi cerca gli orari delle messe.

E l’AVIS di Rivalta una pagina sua sui siti AVIS non ce l’ha: su `avis.mantova.it`
l’indirizzo della sezione rimanda all’assemblea del 16 febbraio 2026 e la scheda su
`avislombardia.it` dà 404. Il sito provinciale è un altro ente e sotto quel logo direbbe una
cosa che non è: meglio la pagina della sezione.

## Gli originali, e perché non sono questi

I marchi sono arrivati come PNG da uno a tre megabyte l'uno: **8,4 MB in tutto**, per
tessere che in pagina sono alte cinquanta pixel. Chi scorreva fino in fondo alla pagina col
telefono se li scaricava tutti.

Quelli serviti sono webp a **500 px sul lato lungo** — tre volte la misura in cui si vedono,
quindi nitidi anche su uno schermo retina — e pesano **236 kB in tutto**, trentacinque volte
meno. Gli originali stanno in `originali/`: restano nel repo perché sono le uniche copie che
abbiamo di marchi altrui, ma sono in [`.vercelignore`](../../.vercelignore) e in produzione
non ci vanno.

Lo stemma della parrocchia fa eccezione: è arrivato in **SVG** e SVG resta. Pesa 88 kB di
tracciati, ma è testo e viaggia gzippato a 27 kB — meno dello stemma del Comune — e resta
nitido a qualsiasi misura. Non ha un originale in `originali/` perché è già la fonte.

Se un logo raster va rifatto, si riparte da lì:

```
sharp('assets/loghi/originali/nome.png')
  .resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 88, effort: 6 })
```

## Come stanno in pagina

Le piastrelle sono **bianche in tutti e due i temi**, apposta: un logo a colori su fondo
scuro perde i suoi, e questi non sono nostri da ritoccare.

Attenzione a due cose:

- **Un marchio bianco su fondo trasparente sparisce.** Il profilo di Non Solo Lady è bianco,
  e sta in piedi solo perché il file si porta dietro **il suo fondo nero**. Chi un giorno lo
  ritagliasse in trasparenza, per farlo «pulito», lo farebbe sparire.
- **La forma decide l'altezza.** Marchi di forme diverse alla stessa altezza si leggono
  sbagliati: il largo sembra il doppio degli altri e uno stemma una miniatura. Si pareggiano
  **a occhio** nel foglio di stile della pagina — `.sb-cw-logo--anspi` (2,1rem),
  `--rodigo` (3,4rem), `--quadro` (3,2rem, per Parrocchia, Polizia Locale, Farmacia Tona e
  Non Solo Lady), `--ap`, e 2,4rem per tutti gli altri. Chi sostituisce un file con uno di forma
  diversa deve ripassare di lì.

Lo stemma del Comune pesa 72 kB per un disegno che in pagina è alto una cinquantina di
pixel: è un tratto fitto e il webp non lo comprime meglio di così. Se dà fastidio, la strada
è ridisegnarlo in SVG — non ricomprimerlo.

## Tre fasce, non una striscia

Non sono tutti la stessa cosa, e mescolarli direbbe una bugia: un patrocinio non è una
sponsorizzazione, e un marchio istituzionale infilato in fila con le pizzerie fa credere che
l'ente abbia pagato per starci. Perciò tre fasce separate da un filo, ognuna con la sua
frase **accanto ai marchi** e in un corpo che si legge — non un rigo in punta di piedi sotto
a tutto:

1. **Organizzano** — Parrocchia Santi Vigilio e Donato e ANSPI;
2. **Con il patrocinio del Comune di Rodigo e la collaborazione della Polizia Locale Mantova
   Ovest** — stemma del Comune e stemma del Corpo;
3. **Con il sostegno delle attività di Rivalta** — le sette del paese.

Poi una riga minuta col sito. La frase del punto 2 è **la formula che il Comune ha chiesto**:
si copia parola per parola, non si riscrive a orecchio.

Patrocinio e collaborazione sono **autorizzati** (2 settembre 2026), e quella frase è la
formula che il Comune ha chiesto: va copiata **parola per parola**, non riscritta a orecchio
ogni volta che si fa un materiale nuovo.

> Sono marchi di qualcun altro. Vanno presi dalla fonte ufficiale, non ridisegnati a occhio,
> e stanno in pagina finché l'accordo regge. Se un giorno cambia, cambiano insieme il logo e
> la riga sotto: una striscia che dichiara un patrocinio che non c'è più è peggio di una
> striscia vuota.
