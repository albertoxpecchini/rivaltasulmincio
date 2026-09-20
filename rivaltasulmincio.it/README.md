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

## Mappa

Tre strati separati (FUNDAMENTA.md «MAPPA»):

- **dati** — `data/places/places.json`, generato da `scripts/osm-sync.ts`: Overpass → `src/places/osm-mapper.ts` (tag OSM → categoria → tipo) → deduplica → diff con il dataset esistente. ID e slug non cambiano mai; un luogo sparito da OSM resta con `status: "removed"`. Area e criteri in `data/osm/area.json`, esito in `data/osm/meta.json`, risposta grezza in `data/osm/raw/`.
- **motore** — `src/map/` (Leaflet, tile OSM, marker per categoria, pannello). Caricato solo quando un elemento `[data-map]` entra nel viewport.
- **interfaccia** — `src/components/map.ts` rende il markup dal server; `/luoghi` e `/luoghi/<slug>` sono l'alternativa testuale completa.

## Struttura

```text
data/            dataset (JSON): sources/, journal/, places/, osm/
public/          asset statici serviti tali e quali
scripts/         plugin di sviluppo, prerender, sincronizzazione OSM
src/
  app/           router, contratto di pagina, identità del sito, template
  components/    testata, piè di pagina, sezione, ricerca, badge, icone, mappa (markup)
  data/          caricamento tipizzato dei dataset
  journal/       tassonomia, regole editoriali, scheda articolo
  layouts/       documento HTML completo
  lib/           html, date, slug, geo
  map/           motore Leaflet, marker, pannello, montaggio
  pages/         una funzione per rotta
  places/        tassonomia, mappatura OSM, regole, elenchi
  search/        indice unificato (server) e comportamento (client)
  services/      fonti
  styles/        token e fogli di stile per strati
  types/         tipi condivisi
```

## Aggiungere un articolo

Aggiungere un oggetto a `data/journal/journal.json` seguendo il tipo `JournalArticle` (`src/types/journal.ts`) e le regole di `JOURNAL.md`: `id` e `slug` stabili, `publishedAt` in ISO 8601 con fuso, `status: "published"`, fonte quando il contenuto deriva da una fonte esterna. L'URL sarà `/giornale/AAAA/MM/slug`.

## Provvisorio

- `public/favicon.svg` è un simbolo temporaneo: il logo ufficiale (LOGO.md) non esiste ancora.
- La testata usa il nome in testo al posto del logo, per lo stesso motivo.
- Il contenuto degli articoli è testo semplice a paragrafi; il rendering ricco sarà definito da `CONTENT.md`.
- L'area dei luoghi è un raggio attorno al nodo OSM del paese; confini precisi arriveranno con `BOUNDARIES.md`.
