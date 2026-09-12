# Il carattere del sito

I quattro `.woff2` qui dentro sono **Inter**, di Rasmus Andersson, ed è il
carattere con cui è scritto tutto il sito.

## Perché Inter e non Helvetica

Il sito nasce disegnato in Helvetica, e per un po' lo è stato davvero: la
versione libera si chiama TeX Gyre Heros e ha le misure esatte di Helvetica.
Ma ha **due soli pesi**, il tondo e il nero.

Helvetica vera la scala ce l'ha intera — Ultra Light, Thin, Light, Roman,
Medium, Bold, Heavy, Black — ed è quella scala a fare la grafica svizzera: un
titolo in Black sopra un testo in Regular non è un titolo più grande, è
un'altra voce. Con due pesi quel salto non si può fare, e i titoli restano
didascalie ingrandite.

Inter quella scala ce l'ha, da 100 a 900, ed è libera (SIL Open Font License).
Non è Helvetica: è disegnata per gli schermi, le lettere sono un po' più
aperte, la «a» e la «R» hanno un altro taglio. In cambio si legge meglio ai
corpi piccoli e arriva fino al Black.

Se un giorno si vuole Helvetica vera **con tutta la scala**, serve una licenza
webfont da Monotype o MyFonts: si sostituiscono questi file, si cambiano i
nomi nei quattro `@font-face` in cima a `assets/sb.css`, e basta — il resto
del sito chiede il carattere a una variabile sola, `--sb-font`.

## Un file, tutti i pesi

Inter è un **carattere variabile**: dentro un solo `.woff2` c'è ogni peso fra
100 e 900, compresi quelli intermedi che nessuno ha disegnato a mano. Quattro
file in tutto, invece dei sedici che servirebbero a coprire otto pesi in due
stili.

| file                    | peso  | cosa contiene                        |
|-------------------------|-------|--------------------------------------|
| `inter-lat.woff2`       | 48 kB | tondo, lettere di base (precaricato) |
| `inter-latext.woff2`    | 85 kB | tondo, lettere accentate             |
| `inter-lat-i.woff2`     | 51 kB | corsivo, lettere di base             |
| `inter-latext-i.woff2`  | 92 kB | corsivo, lettere accentate           |

I due sottoinsiemi non sono un vezzo: `latin` sono le lettere inglesi,
`latin-ext` tutte le accentate. `unicode-range` dice al browser quale gli
serve, e scarica solo quello.

## La scala dei pesi

Non è decorazione: è il modo in cui la pagina si legge prima di essere letta.

| peso |            | dove                                          |
|------|------------|-----------------------------------------------|
| 900  | Black      | titolo della home, titoli di pagina, i numeri  |
| 800  | Heavy      | titoli di sezione                              |
| 700  | Bold       | il neretto dentro il testo                     |
| 500  | Medium     | occhielli, etichette, intestazioni di tabella  |
| 400  | Regular    | il testo che si legge                          |

Gli occhielli stanno a 500 e non a 700 perché sono maiuscoletti spaziati: le
maiuscole hanno già più inchiostro delle minuscole, e la spaziatura le fa
pesare ancora di più. A 700 diventavano un muro.

## La licenza

**SIL Open Font License 1.1**. Libera: si può usare, modificare e
ridistribuire, anche dentro un sito come questo.

> <https://github.com/rsms/inter/blob/master/LICENSE.txt>

I file vengono da Google Fonts, che serve la stessa versione: qui stanno in
locale perché il sito non chieda niente a server di terzi per mostrare il
proprio testo.
