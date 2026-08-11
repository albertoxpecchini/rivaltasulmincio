# Rivalta sul Mincio — sito informativo

Sito statico che pubblica il dossier completo di **Rivalta sul Mincio** (frazione del Comune di
Rodigo, provincia di Mantova): anagrafica, servizi, attività, comunità, viabilità, natura, eventi.

Realizzato nel design system **`.sb-`** di [albertopecchini.it](https://albertopecchini.it), da cui
proviene anche la footbar.

## Com'è fatto

HTML statico puro. Nessuna dipendenza, nessun framework, nessun build step in produzione: si serve
la cartella così com'è.

```
index.html … dati.html      le 9 pagine, GENERATE — non modificarle a mano
assets/sb.css               design system .sb- (token + primitive da albertopecchini.it)
assets/rivalta.css          classi di pagina .sb-riv-* (tabelle, stat, note, indici)
assets/rivalta.js           tema, bordo nav allo scroll, menu, voce attiva
data/rivalta_dataset.json   l'estratto OpenStreetMap completo (ODbL)
data/…-dossier.md           il dossier sorgente in Markdown
_build/head.html            guscio: <head> + nav, con {{TITLE}} e {{DESC}}
_build/foot.html            guscio: footer + script
_build/<pagina>.body.html   il contenuto di ogni pagina
build.mjs                   incolla guscio + contenuto
```

## Modificare il sito

Le nove pagine `.html` in radice sono **generate**: le modifiche vanno fatte in `_build/`, poi

```bash
node build.mjs
```

Nove pagine condividono la stessa nav e lo stesso footer. Tenerne nove copie a mano significa che
prima o poi otto sono aggiornate e una no, ed è sempre quella che qualcuno apre.

Titolo e descrizione di ogni pagina stanno in testa al rispettivo frammento, come due commenti:

```html
<!--title: Servizi — Rivalta sul Mincio-->
<!--desc: Comune e sportelli, farmacia e salute…-->
```

Per aggiungere una pagina basta creare `_build/nuova.body.html` con quei due commenti e rilanciare
il build; la voce nella nav va aggiunta a mano in `_build/head.html` e `_build/foot.html`.

## Aggiornare la rassegna stampa

La sezione «Rivalta sui giornali» in home si aggiorna da **`_build/notizie.json`**, poi `node build.mjs`.
Le schede sono ordinate da sola per data decrescente.

```json
{
  "titolo": "il titolo esatto dell'articolo",
  "testata": "Gazzetta di Mantova",
  "data": "2026-07-06",              // ISO, serve solo a ordinare
  "dataTesto": "6 luglio 2026",      // quello che si legge nella scheda
  "nota": "luogo o date dell'evento", // fatti nostri, non frasi dell'articolo
  "url": "https://…"
}
```

**Regola da non violare: si pubblica solo il titolo, la testata, la data e il link.** Mai il testo
dell'articolo, mai la sua fotografia — nemmeno in hotlink. Un titolo con rimando è indicizzazione e
manda traffico alla testata; copiarne foto o corpo è riproduzione, ed è la parte che le testate
tutelano davvero. Il campo `nota` va scritto da noi e contiene solo fatti verificabili (date, luogo),
non una parafrasi del pezzo.

Le voci vanno verificate prima di pubblicarle: titolo e data si controllano aprendo l'articolo.

## Regole di stile

Sono quelle del design system, non opinioni di questo repo:

- palette **neutra** (soli grigi) più **un'unica tinta**, il verde brand. Non si introduce un
  secondo colore vivo per distinguere qualcosa: si distingue con peso, spaziatura o bordo;
- ogni colore, ombra e bordo si scrive con `var(--sb-*)`. Gli unici valori letterali stanno nei due
  blocchi di token in cima a `assets/sb.css`;
- **un solo fondale** `position: fixed` per tutta la pagina. Nessuna sezione ha un bordo o uno
  sfondo proprio: fra una sezione e l'altra il contenuto scorre trasparente, senza righe di confine;
- niente reveal allo scroll, fade-in a cascata o contatori che partono entrando in viewport.
  Scorrere una pagina non è un evento da annunciare;
- tema chiaro/scuro **nativo**: `html.dark` ridichiara gli stessi token, non esiste un secondo
  foglio di stile. Senza scelta manuale il tema lo decide l'ora — 08:00–19:59 chiaro, il resto scuro.

## Dati

I geodati sono © **OpenStreetMap contributors**, licenza **ODbL**, estratti l'11 agosto 2026.
Le distanze sono in linea d'aria dal centro paese (45.18019 N, 10.67714 E), non stradali.

Dove il dossier in `data/` e il dataset grezzo divergono — numeri civici, parcheggi, barriere — **il
sito pubblica il dato grezzo**, perché è quello riverificabile aprendo `data/rivalta_dataset.json`.
La divergenza non è esposta al lettore: è annotata qui.

Scelte editoriali da mantenere nelle prossime modifiche:

- **niente voci anonime fra le attività commerciali.** Un «parrucchiere senza nome a ~175 m» non
  serve a chi cerca un parrucchiere. Negozi, bar e locali entrano in elenco solo con un nome;
- **niente meta-commento sulla completezza dei dati.** Beni pubblici e naturali privi di nome
  proprio si nominano per quello che sono («Area verde di Via Garibaldi»), non si etichettano come
  non mappati;
- orari e recapiti restano da riverificare alla fonte prima di usi ufficiali — è detto una volta
  sola, in `dati.html`, senza ripeterlo pagina per pagina.

## Sitemap e indicizzazione

`sitemap.xml` **è generato** da `build.mjs` insieme alle pagine, dalla stessa lista di frammenti: una
pagina nuova entra in sitemap da sé. Non modificarlo a mano — una sitemap scritta a mano è una
sitemap che prima o poi elenca un indirizzo che non esiste più, ed è peggio di non averla.

Il dominio di produzione sta in **una riga sola**, la costante `SITE` in cima a `build.mjs`. Da lì
escono sia il `<loc>` della sitemap sia il `<link rel="canonical">` e l'`og:url` di ogni pagina: se
non coincidessero al carattere, Search Console tratterebbe la stessa pagina come due.

Priorità e frequenza si dichiarano nel frammento, con due commenti facoltativi (default `0.7` e
`monthly`):

```html
<!--prio: 0.9-->
<!--freq: weekly-->
```

`lastmod` è la data di ultima modifica **del frammento sorgente**, non di oggi: rigenerare il sito
senza aver cambiato niente non deve dire ai motori che tutte e nove le pagine sono state riscritte.

`robots.txt` è statico e non ha esclusioni: nove pagine pubbliche, nessuna area riservata.

## Deploy (Vercel)

Il sito si serve così com'è: **su Vercel non gira nessuna build**. Le pagine si generano in locale con
`node build.mjs` e si committano già pronte.

`vercel.json` è quello che tiene in riga la piattaforma:

- `"framework": null` → preset **Other**. Il progetto era nato come SPA Vite e nelle impostazioni era
  rimasto il preset Vite: senza questa riga Vercel lancia `vite build` e fallisce con
  `vite: command not found` (exit 127), perché in questo repo Vite non esiste più;
- `"buildCommand"` e `"installCommand"` sono `echo` innocui. Devono essere **presenti**, non assenti:
  `vercel.json` ha la precedenza sulla dashboard, ma solo per i campi che dichiara — omettendoli
  tornerebbe a vincere il `vite build` salvato nelle impostazioni del progetto;
- `"outputDirectory": "."` → la radice del repo è già il sito.

`.vercelignore` tiene fuori dal deploy l'officina (`_build/`, `build.mjs`, `README.md`): online
vanno solo le pagine, `assets/` e `data/`.

**Non aggiungere `cleanUrls`.** Toglierebbe il `.html` dagli indirizzi, ma l'evidenza della voce
attiva nella nav confronta l'ultimo segmento del path con l'`href` dei link (`paese.html`): con gli
URL accorciati il confronto non torna più e il filo verde sparisce dalla voce corrente.

## Sviluppo locale

Serve una qualsiasi cartella statica, per esempio:

```bash
npx serve .
```

Aprire con `file://` funziona, ma i link relativi a `data/` possono comportarsi diversamente a
seconda del browser.
