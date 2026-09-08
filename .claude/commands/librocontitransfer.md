---
description: Porta nel sito le fotografie scansionate dal libro «Eventi e Ricordi» — ritaglio, descrizioni, figure nel frammento, scheda del libro, registro, build e push
argument-hint: [percorsi delle scansioni + sezione di destinazione e data di ognuna]
---

# /librocontitransfer

Il lavoro è sempre lo stesso, e la divisione dei compiti anche.

**Fa l'utente:** sfoglia «Rivalta sul Mincio 2001‑2013 — Eventi e Ricordi», sceglie le immagini
pertinenti a una sezione del sito, le scansiona e ne manda i percorsi dicendo **dove vanno** e,
per ognuna, **quando** è stata scattata. Spesso aggiunge la pagina del libro: serve a te per
ritrovarla, **non va scritta in pagina** (vedi §5).

**Fai tu:** tutto il resto. Le descrizioni le scrivi tu — l'utente non le manda mai, e non gliele
si chiede.

Le immagini in `$ARGUMENTS` (o quelle nel messaggio) sono scansioni di un libro cartaceo, non
fotografie digitali: retinate, a volte capovolte, sempre troppo pesanti.

---

## Quello che l'utente può non dire, e che non gli si chiede

| Manca | Cosa fai |
| :--- | :--- |
| la descrizione / didascalia | la scrivi tu, guardando l'immagine |
| il nome del file | lo scegli tu (vedi §3) |
| il testo alternativo | lo scrivi tu (vedi §5) |
| dove esattamente nella sezione | decidi tu il punto che regge meglio, e lo motivi in una riga |
| il paragrafo che introduce le foto | lo scrivi tu, agganciandolo a quello che la sezione dice già |

Non chiedere quasi mai niente: la data serve al testo solo se il paragrafo di apertura la usa, e
in quel caso la si chiede in una riga. Tutto il resto lo decidi guardando.

---

## 1. Guarda ogni immagine prima di toccarla

`Read` su ogni file. Serve a tre cose:

- **l'orientamento.** Le scansioni escono spesso ruotate di 180°. Se sembra capovolta, riguardala
  ruotata (`sharp(...).rotate(180)` in un file di scarto nello scratchpad) prima di decidere;
- **la descrizione**, che si scrive guardando, non indovinando;
- **cosa c'è dentro davvero.** Se ci sono **volti riconoscibili di minori**, si fa il lavoro come
  richiesto ma lo si dice all'utente in chiaro alla fine, offrendo di togliere o ritagliare: sul
  libro stampato è una cosa, su un sito indicizzato è un'altra. Non è un veto, è un avviso.

## 2. Il ritaglio

Formato del sito: **1600 × 1067 (3:2), JPEG, sotto i 250 kB**. Il `blur(0.8)` non è un vezzo: la
scansione porta con sé il retino di stampa, e senza quello lo stesso file esce a 700 kB di puntini.

```js
sharp(SORGENTE)
  .rotate(180)                                   // solo se capovolta — altrimenti niente .rotate()
  .resize(1600, 1067, { fit: "cover" })
  .blur(0.8)                                     // toglie il retino
  .sharpen({ sigma: 0.7, m1: 0.4, m2: 0.5 })     // rimette il filo agli spigoli
  .jpeg({ quality: 76, mozjpeg: true })
  .toFile("assets/foto/archivio/<nome>.jpg");
```

Controlla il peso risultante. Se una supera i 250 kB, scendi di qualità (72) prima di alzare il
blur: sfocare ancora si vede, un punto di qualità no. Poi **riguarda il risultato** con `Read`.

## 3. Dove vanno, e come si chiamano

Tutto in **`assets/foto/archivio/`**. Non passano da `_build/luoghi.json` e non hanno uno slug:
non sono la fotografia di un posto ma di un **giorno**, e un posto lo si può rifotografare domani,
quella sera no.

Nome parlante in kebab-case, con l'anno: `buriel-2006-la-catasta.jpg`,
`giunta-rodigo-2003.jpg`, `comune-rodigo-2008-in-consiglio.jpg`.

## 4. La figura, scritta a mano nel frammento

Le figure d'archivio si scrivono nel `_build/<pagina>.body.html`, come le carte di `/storia`.
Gruppo da tre (o più) in `.sb-riv-foto-grid`, gruppo da **due** in
`.sb-riv-foto-grid sb-riv-foto-grid--due` — la griglia normale a 1024px va a tre colonne e due
tessere su tre lascerebbero mezza fila vuota.

```html
<figure class="sb-riv-foto">
  <div class="sb-panel"><div class="sb-panel-inner">
    <img src="assets/foto/archivio/<nome>.jpg" alt="…" loading="lazy" decoding="async" width="1600" height="1067">
  </div></div>
  <figcaption>Una frase che dice cosa succede.</figcaption>
</figure>
```

La didascalia finisce lì. **Niente `.sb-riv-foto-by` con data e pagina** appesa in coda: quella
classe serve al credito fotografico dei luoghi (`Foto: …`), non a citare il volume.

## 5. Le parole

**La didascalia** dice cosa sta succedendo, in una frase, al presente, senza aggettivi di
ammirazione: «Il fuoco è arrivato in cima: le feste sono finite», non «Suggestiva immagine del
falò».

**Non si citano data e pagina sotto la fotografia.** «10 ottobre 2008 — pag. 95» e simili non
vanno in pagina: sono apparato, e chi legge sta guardando una fotografia del suo paese, non
consultando una fonte. Da dove viene lo dice già la scheda del libro sotto al gruppo. Se una data
conta davvero per capire cosa si vede — che una cosa si faceva altrove, che è stata l'ultima volta
— si scrive **nel paragrafo di apertura**, in mezzo alla prosa, non in coda alla didascalia. La
pagina resta solo nell'indice interno di `assets/foto/README.md`, che non va online.

**Il testo alternativo** descrive quello che si vede a chi non lo vede: composizione, luce, cosa
c'è in primo piano e cosa dietro. Non è la didascalia ripetuta e non è un titolo. Lungo il giusto
per farsi un'immagine in testa, una frase o due.

**Il paragrafo di apertura** aggancia le fotografie a quello che la sezione dice già, e non è
riempitivo: è l'occasione per aggiungere un dato vero. Se le immagini raccontano che una cosa si
faceva altrove, scrivilo. Usa gli shortcode `{{luogo:…}}` per i posti nominati e **verifica prima
che lo slug esista** in `_build/luoghi.json`, o il build si ferma. Per i rimandi dentro la prosa,
`<a class="sb-inline" href="…">`.

## 6. La scheda del libro: sempre

Sotto **ogni** gruppo di immagini prese dal volume va il segnaposto:

```
  {{libro}}
```

Lo scioglie `renderLibro()` in `build.mjs` e stampa la copertina in 3D, il titolo, l'editore e il
grazie ad **Annasofia Sanfelici**. È una copia sola per tutto il sito: se il testo va cambiato, si
cambia lì, mai nei frammenti. Una fotografia d'archivio senza la provenienza è un'immagine trovata.

## 7. Le code

1. **`assets/foto/README.md`** — una riga nella tabella dell'archivio per ogni file nuovo
   (file, cosa, quando). È LF, non CRLF.
2. **`_build/aggiornamenti.json`** — una voce sola per l'infornata, `voce` di solito «Il paese»,
   `dove` l'ancora della sezione. Racconta cosa si vede, non cosa hai fatto al repo. È LF.
3. `node build.mjs` — deve passare pulito. Un `{{luogo:…}}` sbagliato lo ferma.

## 8. Guardare il risultato

Il sito ha `serve.mjs`. Per vedere davvero un blocco, senza aspettare che l'utente apra il browser:

```bash
node serve.mjs 8099 &
# ritaglia il blocco appena costruito da <pagina>.html in una paginetta di prova
# nella radice (ci vogliono i CSS a /assets/), togliendo loading="lazy" o in
# headless le immagini non si caricano
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1100,1200 \
  --virtual-time-budget=9000 --screenshot=<scratchpad>/prova.png \
  "http://localhost:8099/prova-tmp.html"
```

Poi `Read` sul png. **Cancella la paginetta di prova** prima di committare, e ferma il server.

## 9. Modificare i file, senza rompere i fine riga

I frammenti `_build/*.body.html`, `build.mjs`, `assets/*.css|js` e `api/*.mjs` stanno in **CRLF**
nel working tree; i `.json` e i `.md` in **LF**. Rispetta la convenzione del file che tocchi.

E: **niente heredoc di bash e niente `node -e "…"`** per scrivere questi blocchi — backtick,
`$` e backslash vengono mangiati dalla shell e il danno si scopre dopo, in pagina. Scrivi lo
script di patch in un file `.mjs` nello scratchpad con `Write` e lancialo con `node <file>`.

## 10. Chiudere

Commit e push da sé, senza chiedere. Messaggio in italiano nello stile del repo: una riga di
titolo che dice la cosa, e sotto i punti col perché delle scelte — non l'elenco dei file toccati.
Nel riassunto all'utente, riporta le didascalie che hai scritto: sono la parte che vorrà
correggere.
