# rivaltasulmincio.it

Applicazione web di **Rivalta sul Mincio — il paese, in ogni suo dato**.
Le specifiche del progetto sono i file `.md` nella cartella superiore, a partire da `FUNDAMENTA.md`.

## Comandi

```text
npm install        dipendenze
npm run dev        server di sviluppo (rendering identico alla build)
npm run build      build client + server, poi prerender in dist/
npm run preview    anteprima di dist/ (404 servita con stato 404)
npm run typecheck  controllo tipi
npm run osm:sync   aggiorna i luoghi da OpenStreetMap (Overpass); --offline riusa l'ultima risposta
```

Richiede Node ≥ 22.18 (gli script in `scripts/` sono TypeScript eseguito direttamente da Node).

## Come funziona

Il sito è HTML statico generato a build time, senza framework:

```text
data/*.json  →  src/data (tipi)  →  src/services, src/journal, src/places (regole)  →  src/pages  →  src/layouts  →  HTML
```

- `vite build` produce il bundle client e `dist/server/entry-server.js`;
- `scripts/prerender.ts` rende ogni percorso in `dist/<percorso>/index.html`, più `404.html` e i feed JSON (`search-index.json`, `places.json`);
- in sviluppo `scripts/vite-plugin-atlante.ts` rende ogni richiesta con lo stesso `entry-server`.

Il markup si scrive con il tag `html` di `src/lib/html.ts`: ogni interpolazione è escapata, `raw()` solo per markup generato dal progetto.

## Stile

STYLE.md guida il linguaggio visivo (marrone, rosso bruciato, crema, carbone; sans + monospace; pannelli, bordi, griglia, metadata). I valori stanno solo in `src/styles/tokens.css`, con la struttura dei token che STYLE.md rende obbligatoria; i componenti usano i token semantici, mai valori diretti.

- **Font** — Geist e Geist Mono, self-hosted dai pacchetti `@fontsource-variable/geist` e `@fontsource-variable/geist-mono` (licenza OFL-1.1, file LICENSE nei pacchetti), solo i sottoinsiemi latin e latin-ext, dichiarati in `src/styles/fonts.css`; Vite copia i woff2 in `dist/assets` con hash.
- **Superfici scure** — la classe `inverse` ridefinisce i token semantici (testo, bordi, accento, superfici): un componente dentro un pannello scuro non cambia codice.
- **Pannelli** — `panel` con `panel__head` (mono, maiuscolo), `panel__body`, `panel__foot`; è il modulo ricorrente di giornale, mappa, meteo, fonti e dati.
- **Motion** — `src/animations/`: reveal delle sezioni e contatori dei numeri con la Web Animations API, solo per ciò che sta sotto la piega, niente con `prefers-reduced-motion`. Nessuna libreria finché CSS e WAAPI bastano (ANIMATIONS.md «Gerarchia strumenti»).

## Mappa

Tre strati separati (FUNDAMENTA.md «MAPPA»):

- **dati** — `data/places/places.json`, generato da `scripts/osm-sync.ts`: Overpass → `src/places/osm-mapper.ts` (tag OSM → categoria → tipo) → deduplica → diff con il dataset esistente. ID e slug non cambiano mai; un luogo sparito da OSM resta con `status: "removed"`. Area e criteri in `data/osm/area.json`, esito in `data/osm/meta.json`, risposta grezza in `data/osm/raw/`.
- **motore** — `src/map/` (Leaflet, tile OSM, marker per categoria, pannello). Caricato solo quando un elemento `[data-map]` entra nel viewport.
- **interfaccia** — `src/components/map.ts` rende il markup dal server; `/luoghi` e `/luoghi/<slug>` sono l'alternativa testuale completa.

## Fotografie

Fotografie originali del progetto, riprese dal sito precedente (IMAGES.md).

- **dati** — `data/images/place-images.json`: una voce per luogo fotografato, legata a `Place.slug`. Contiene alt text, dimensioni reali della variante più grande e le larghezze disponibili; l'alt descrive il contenuto reale, non «foto di».
- **file** — `public/foto/luoghi/<slug>-<larghezza>.webp`, sei larghezze (480, 720, 960, 1440, 1600, 2200): la 2200 è la resa massima disponibile, perché gli originali sono 2600px. Il browser scarica solo la variante che gli serve, quindi su telefono restano una trentina di KB.
- **interfaccia** — `src/components/figure.ts` costruisce `srcset`/`sizes` dalle larghezze; `src/places/images.ts` dice se un luogo ha una fotografia. La scheda `/luoghi/<slug>` la mostra sotto il titolo, quando c'è. L'immagine non si ritaglia mai: un tetto di 40rem d'altezza limita le verticali, che si restringono al loro rapporto invece di lasciare fasce vuote.

Oggi 50 luoghi su 184 hanno una fotografia. I luoghi senza restano identici a prima: la figura appare solo se esiste la voce.

## Meteo

Fonte: la stazione MeteoMincio (WEATHER.md). Il sito non ha API: pubblica i file della stazione senza header CORS, quindi il browser non può leggerli direttamente.

- **funzioni** — `api/meteo/attuale.ts` (clientraw.txt, cache CDN 60 s) e `api/meteo/previsioni.ts` (latest.csv del modello WXSIM, cache 15 min): firma Web standard, eseguite da Vercel in produzione e dal plugin in dev/preview;
- **servizio** — `src/services/weather/`: parser (`clientraw.ts`, `wxsim.ts`), condizioni e icone (`conditions.ts`), provider (`meteomincio.ts`), tipi normalizzati (`types.ts`). Solo import con estensione `.ts`, perché Node li esegue direttamente;
- **interfaccia** — `src/components/weather.ts` rende i segnaposto, `src/weather/client.ts` li riempie con stati loading, success, stale ed error.

Interruttore: `site.features.weather` in `src/app/site.ts` toglie il blocco dalla Home e la voce dalla navigazione.

## Struttura

```text
api/             funzioni serverless (meteo)
data/            dataset (JSON): sources/, journal/, places/, osm/, images/
public/          asset statici serviti tali e quali (foto/luoghi/)
scripts/         plugin di sviluppo, prerender, sincronizzazione OSM
src/
  animations/    reveal e contatori (client)
  app/           router, contratto di pagina, identità del sito, template
  components/    testata, piè di pagina, sezione, testata di pagina, ricerca, badge, icone, numeri, mappa (markup), fotografie
  data/          caricamento tipizzato dei dataset
  journal/       tassonomia, regole editoriali, scheda articolo
  layouts/       documento HTML completo
  lib/           html, date, slug, geo
  map/           motore Leaflet, marker, pannello, montaggio
  nav/           menu della testata sotto i 768 px (client)
  pages/         una funzione per rotta
  places/        tassonomia, mappatura OSM, regole, elenchi, fotografie
  search/        indice unificato (server) e comportamento (client)
  services/      fonti, meteo
  styles/        token e fogli di stile per strati
  types/         tipi condivisi
  weather/       comportamento del blocco meteo (client)
```

## Aggiungere un articolo

Aggiungere un oggetto a `data/journal/journal.json` seguendo il tipo `JournalArticle` (`src/types/journal.ts`) e le regole di `JOURNAL.md`: `id` e `slug` stabili, `publishedAt` in ISO 8601 con fuso, `status: "published"`, fonte quando il contenuto deriva da una fonte esterna. L'URL sarà `/giornale/AAAA/MM/slug`.

## Provvisorio

- `public/favicon.svg` è un simbolo temporaneo: il logo ufficiale (LOGO.md) non esiste ancora.
- COLORS.md, TYPOGRAPHY.md e FONT.md descrivono ancora il sistema precedente (verde, font di sistema): dove contraddicono il nuovo STYLE.md vale STYLE.md. RADIUS.md e SHADOWS.md non esistono: i valori sono decisi in `tokens.css` seguendo la direzione di STYLE.md.
- La Home non ha ancora i moduli «servizi» e «territorio» previsti da STYLE.md «HOME»: arriveranno con i relativi dataset.
- La testata usa il nome in testo al posto del logo, per lo stesso motivo.
- Il contenuto degli articoli è testo semplice a paragrafi; il rendering ricco sarà definito da `CONTENT.md`.
- L'area dei luoghi è un raggio attorno al nodo OSM del paese; confini precisi arriveranno con `BOUNDARIES.md`.
