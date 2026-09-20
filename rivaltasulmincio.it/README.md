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
```

Richiede Node ≥ 22.18 (il prerender è TypeScript eseguito direttamente da Node).

## Come funziona

Il sito è HTML statico generato a build time, senza framework:

```text
data/*.json  →  src/data (tipi)  →  src/services, src/journal (regole)  →  src/pages  →  src/layouts  →  HTML
```

- `vite build` produce il bundle client e `dist/server/entry-server.js`;
- `scripts/prerender.ts` rende ogni percorso in `dist/<percorso>/index.html`, più `404.html` e `search-index.json`;
- in sviluppo `scripts/vite-plugin-atlante.ts` rende ogni richiesta con lo stesso `entry-server`.

Il markup si scrive con il tag `html` di `src/lib/html.ts`: ogni interpolazione è escapata, `raw()` solo per markup generato dal progetto.

## Struttura

```text
data/            dataset (JSON): sources/, journal/
public/          asset statici serviti tali e quali
scripts/         plugin di sviluppo e prerender
src/
  app/           router, contratto di pagina, identità del sito, template
  components/    testata, piè di pagina, sezione, ricerca, badge, stati
  data/          caricamento tipizzato dei dataset
  journal/       tassonomia, regole editoriali, scheda articolo
  layouts/       documento HTML completo
  lib/           html, date
  pages/         una funzione per rotta
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
