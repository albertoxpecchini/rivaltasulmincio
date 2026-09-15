# Prompt per la locandina — Sagra dei Patroni, 26 e 27 settembre 2026

Questo file contiene **il prompt da copiare** (il blocco qui sotto) e, in coda, le note su
cosa è confermato e cosa no. Il prompt è scritto per un'AI che genera immagini o per un
grafico: dice cosa deve esserci, con che gerarchia, e in che stile.

> **Prima di usarlo, leggi «Cosa manca ancora» in fondo.** Per il risotto si prenota da
> [`/sagra-patroni`](../../sagra-patroni.html), che è già online — ma il modulo vero non c'è
> ancora. Restano da confermare il luogo del ritrovo e quello dei giochi.

---

## Il prompt

```
Disegna una locandina A4 verticale (210 × 297 mm, stampa) per la Sagra dei Patroni di
Rivalta sul Mincio, provincia di Mantova — sabato 26 e domenica 27 settembre 2026.

CHE COS'È
La festa patronale del paese: due giorni, con dentro la chiusura del Palio delle
Contrade. Il paese si divide in sei contrade che si sfidano tutto l'anno, e la regata
sul Mincio del sabato sera è la prova che chiude il Palio. È una festa di paese vera —
famiglie, bambini, tavolate — non un evento turistico patinato.

TESTO DA COMPORRE (esattamente questo, nessuna parola inventata)

Titolo grande:
  SAGRA DEI PATRONI
Sottotitolo:
  Rivalta sul Mincio · 26 e 27 settembre 2026

Blocco «SABATO 26 SETTEMBRE» — programma a orari, gli orari incolonnati a sinistra:
  15:00   Ritrovo in Piazza Chiesa e sfilata coi tamburini per il paese
  16:00   Giochi di una volta, giù verso Fondo Mincio
  18:00   Regata finale sul Mincio — la prova che chiude il Palio delle Contrade
  a seguire   Risotto per tutti, offerto dall'AVIS di Rivalta

Riga sotto il blocco del sabato:
  Bancarelle per tutta la giornata

Blocco «DOMENICA 27 SETTEMBRE»:
  12:00   Pranzo dei Patroni

Riquadro in evidenza, staccato dal programma:
  Per il risotto è gradita la prenotazione
  Si prenota su rivaltasulmincio.it/sagra-patroni
  (metti anche un codice QR che punta lì, come sulla locandina della Color Walk)

Piede:
  Le sei contrade: la Filanda · il Roccolo · le Colonie · i Piasaröi · la Plàtana · le Fanfane
  rivaltasulmincio.it/sagra-patroni

GERARCHIA
1. «SAGRA DEI PATRONI» domina il foglio.
2. Le due date subito sotto, leggibili da lontano.
3. I due blocchi giorno per giorno — il sabato pesa più della domenica, perché ha
   quattro appuntamenti contro uno, ma sono due blocchi della stessa famiglia, non uno
   grande e uno piccolo.
4. Gli orari sono la spina dorsale: incolonnati, in cifre, tutti della stessa misura.
   Uno deve poter leggere solo la colonna delle ore e capire la giornata.
5. La prenotazione del risotto è l'unica «chiamata all'azione»: staccata, riconoscibile.

STILE
Carattere Titillium Web (o un grottesco umanista simile), titoli in tondo con crenatura
stretta, mai tutto maiuscolo tranne il titolo e le intestazioni dei due giorni.
Palette: fondo neutro chiaro (bianco sporco #fbfbfb, grigi #f6f6f6 e #f0f0f0), testo
quasi nero #171717, e UN SOLO colore di sistema, l'azzurro #00A6EB, usato con parsimonia
sui fili e sulle intestazioni. Niente rosso: nel design di questo paese vuol dire
«errore».
Angoli tagliati a 45° in alto a sinistra e in basso a destra sui riquadri — mai
stondati. Lastre di grigio chiarissimo con un filo di luce sul bordo alto. Una griglia
tecnica leggera che sfuma verso il fondo.
Deve sembrare parte della stessa famiglia della locandina della Color Walk dello stesso
mese: stesso carattere, stessi angoli tagliati, stessa sobrietà.

IMMAGINE
Se serve un elemento figurativo, la cosa giusta è il fiume: il Mincio, le barche della
regata, i canneti. In alternativa i tamburini in corteo. Va come fascia a pieno taglio
in cima al foglio, con un filo azzurro sotto, e il testo sotto su fondo chiaro — mai
testo sopra la fotografia.
NON mettere: grafica da sagra anni '80, caratteri calligrafici, ghirlande, festoni,
bandierine triangolari, gradienti accesi, ombre morbide.

VINCOLI
Formato A4 verticale, margini di sicurezza 12 mm, tutto il testo dentro.
Deve restare leggibile stampata in bianco e nero su una A4, e riconoscibile a distanza
attaccata a una bacheca.
Lingua: italiano. Rispetta gli accenti: Piasaröi, Plàtana, Mincio.
```

---

## Da dove vengono questi dati

Dal messaggio di Rebecca del 13 settembre 2026, che è il recap del programma prima che
esca la seconda locandina. Gli stessi dati sono sul sito in
[`/eventi#dettaglio2026`](../../eventi.html), da cui vanno tenuti allineati a mano: se
cambia un orario in pagina, cambia anche qui e sulla locandina.

**Confermato:** le due date, i quattro orari del sabato (15:00, 16:00, 18:00, a seguire),
l'orario del pranzo della domenica, le bancarelle per tutto il giorno, il risotto offerto
dall'AVIS di Rivalta, la prenotazione gradita.

## Cosa manca ancora

| Cosa | Stato | Perché conta per la locandina |
| :--- | :--- | :--- |
| **Recapito per la prenotazione** | **deciso: la pagina** | Si prenota da [`/sagra-patroni`](../../sagra-patroni.html), che è già online col programma. Il modulo vero e la mail di conferma arrivano dopo, sul modello di `/color-walk`. Sulla locandina va l'indirizzo della pagina più un QR che punta lì. |
| Luogo del ritrovo delle 15:00 | non confermato | Nel prompt è scritto «Piazza Chiesa», che è l'ipotesi presa dal sito. Rebecca non l'ha detto: ha solo scritto «ore 15:00 ritrovo». Se i tamburini partono da altrove, la riga cambia. |
| Luogo dei giochi delle 16:00 | non confermato | Rebecca scrive «giù a fondo Mincio», ma anche «il parco non si può usare». Sul sito è scritto «da confermare». Sulla locandina, che è definitiva, o si conferma o si scrive solo «Fondo Mincio» senza nominare il parco. |
| Loghi e patrocini | da decidere | La locandina della Color Walk porta gli stemmi delle sei contrade, quello del Comune di Rodigo, la Polizia Locale Mantova Ovest e i marchi degli sponsor. Qui almeno l'AVIS di Rivalta ci va, visto che offre il risotto. Chiedere a Rebecca chi altro. |

## La pagina della sagra

Il 15 settembre 2026 è nata [`/sagra-patroni`](../../sagra-patroni.html): programma dei due
giorni, orari incolonnati, il Palio e la sezione della prenotazione. È lì che la locandina
manda per il risotto, ed è lì che punta il QR.

> **Il modulo di prenotazione non c'è ancora.** Oggi quella sezione dice che si aprirà, e non
> finge di essere aperta. Se la locandina esce prima che il modulo sia pronto, il QR porta a una
> pagina che annuncia la prenotazione invece di raccoglierla: va bene per il programma, meno per
> chi vuole prenotare subito. Meglio far uscire il modulo prima della stampa.

La prenotazione, quando si fa, si ricalca su `/color-walk`: `api/iscrizione-color-walk.mjs`
per il modulo, `api/_posta.mjs` per la mail di conferma. Con una differenza: il risotto lo
offre l'AVIS, quindi non c'è una quota — niente incasso, niente PayPal, niente ricevuta. Solo
la conta dei coperti.

## Se invece la locandina si disegna come le altre

La Color Walk non è stata generata da un'AI: è una tela di **Claude Design** esportata in
PNG e PDF. Il giro completo — tele, `.render.html` autonomo coi font in base64, screenshot
headless, riduzione con `sharp` — è descritto in
[`design/color-walk/README.md`](../color-walk/README.md). Se questa locandina deve entrare
nel sito come quella, conviene seguire quella strada invece che partire da un'immagine
generata: il testo resta modificabile e la stampa esce in A4 vera.
