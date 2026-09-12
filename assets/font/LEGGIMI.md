# Il carattere del sito

I quattro `.woff2` qui dentro sono **TeX Gyre Heros**, ed è il carattere con
cui è scritto tutto il sito.

## Perché non è Helvetica, pur essendo Helvetica

Il sito è disegnato in Helvetica. Ma Helvetica è un carattere che si compra —
è di Monotype — e soprattutto è installata solo su Mac e su iPhone: su Windows
e su Android non c'è, e il browser ripiegherebbe su un carattere qualsiasi.
La stessa riga andrebbe a capo in un punto sul telefono e in un altro sul
portatile, e i titoli cambierebbero ingombro da uno schermo all'altro.

TeX Gyre Heros è la Helvetica del mondo TeX: disegnata sulle **stesse misure**
— stessa larghezza per ogni lettera, stesse proporzioni, stesso taglio
orizzontale dei terminali. Il testo occupa lo stesso spazio, va a capo negli
stessi punti. Ed è **libera**: si può ridistribuire, ed è il motivo per cui
questi file stanno nel repository invece di essere chiesti a un sito terzo.

In `assets/sb.css` la regola `@font-face` mette `local("Helvetica")` **prima**
di questi file: chi ha Helvetica installata — i Mac, gli iPhone — usa la sua e
non scarica niente. Gli altri ricevono i 52 kB del file.

## I file

| file               | peso | quando si scarica                    |
|--------------------|------|--------------------------------------|
| `heros-400.woff2`  | 51 kB | sempre (è precaricato, vedi head.html) |
| `heros-700.woff2`  | 51 kB | alla prima parola in neretto          |
| `heros-400i.woff2` | 53 kB | al primo corsivo (le citazioni)       |
| `heros-700i.woff2` | 51 kB | raro: corsivo dentro un neretto       |

Sono ricavati dagli `.otf` originali con `wawoff2` (è fra le devDependencies).
Il `.woff2` è lo stesso disegno compresso: 130 kB diventano 51.

Due pesi e basta — tondo e nero, coi rispettivi corsivi — perché sono quelli
che Helvetica ha. Il sito prima ne usava cinque (400, 500, 600, 700, 800):
cinque gradazioni di enfasi sono una gerarchia che nessuno legge. Il grassetto
o c'è o non c'è.

## La licenza

**GUST Font License (GFL)**, la stessa di tutta la collezione TeX Gyre. È una
licenza libera: si può usare, modificare e **ridistribuire**, anche dentro un
sito come questo. Il testo completo:

> <https://www.gust.org.pl/projects/e-foundry/licenses>

Gli autori sono la GUST e-foundry (Bogusław Jackowski, Janusz M. Nowacki), a
partire dalla Nimbus Sans di URW++.

Se un giorno il sito dovesse passare alla Helvetica vera, serve una licenza
**webfont** presa da Monotype o MyFonts: arrivano dei `.woff2` come questi e
un PDF di licenza col dominio. A quel punto si sostituiscono i quattro file e
si cambiano i nomi in `@font-face`, in cima a `assets/sb.css`. Nient'altro:
il resto del sito chiede il carattere a una variabile sola, `--sb-font`.
