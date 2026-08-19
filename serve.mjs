/* ═══════════════════════════════════════════════════════════════════════════
   Anteprima locale — zero dipendenze, `node serve.mjs`.

   Aprire le pagine con `file://` non funziona: da quando i link interni sono
   root-assoluti (`/paese`, `/` per la home), con `file://` puntano alla radice
   del disco. Serve un server, e questo è il più stupido che faccia il lavoro.

   L'unica cosa che non è banale è che riproduce "cleanUrls": true di
   vercel.json: `/paese` serve `paese.html`. Senza, in locale ogni link interno
   darebbe 404 e si finirebbe per non fidarsi dell'anteprima — che è l'unico
   motivo per cui esiste.

   Come build.mjs, questo file resta a casa: sta in .vercelignore, in
   produzione l'HTML è statico e lo serve Vercel.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || process.argv[2] || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

/* In produzione `api/meteo.mjs` lo esegue Vercel, che alla risposta HTTP
   attacca due comodità che Node da solo non ha: `status()` e `json()`. In
   anteprima le mettiamo qui, così la stessa identica funzione gira anche in
   locale e la pagina si può guardare viva prima di pubblicarla — che senza
   sarebbe l'unico pezzo del sito impossibile da provare a casa.

   `?` e `#` sono già stati tolti a monte: qui arriva solo il nome. */
const apiPreview = async (nome, req, res) => {
  const file = join(ROOT, "api", `${nome}.mjs`);
  if (!/^[a-z0-9-]+$/.test(nome) || !(await isFile(file))) return false;

  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => {
    if (!res.hasHeader("content-type")) res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(b));
  };

  // `?${Date.now()}` sull'import: altrimenti Node tiene in memoria la prima
  // versione del modulo e le modifiche non si vedono senza riavviare.
  const { default: handler } = await import(`${pathToFileURL(file).href}?${Date.now()}`);
  await handler(req, res);
  return true;
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  /* Tutto ciò che sta sotto /api/ finisce qui e non prosegue: se il nome non
     corrisponde a una funzione è un 404, mai il sorgente servito come file. */
  if (url.startsWith("/api/")) {
    const nome = url.slice(5);
    if (!(await apiPreview(nome, req, res))) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end(`404 ${url}`);
    }
    console.log(`${res.statusCode} ${url}`);
    return;
  }

  // Via lo slash iniziale e ogni `..`: senza, un indirizzo costruito a mano
  // leggerebbe file fuori dalla cartella del sito.
  let rel = normalize(url).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  if (rel === "") rel = "index.html";

  let file = join(ROOT, rel);
  if (!(await isFile(file)) && !extname(file)) {
    if (await isFile(`${file}.html`)) file += ".html";
    else if (await isFile(join(file, "index.html"))) file = join(file, "index.html");
  }

  if (!(await isFile(file))) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end(`404 ${url}`);
    console.log(`404 ${url}`);
    return;
  }

  res.writeHead(200, {
    "content-type": TYPES[extname(file)] || "application/octet-stream",
    // In anteprima la cache è solo un modo per guardare la versione di ieri.
    "cache-control": "no-store",
  });
  res.end(await readFile(file));
  console.log(`200 ${url}`);
}).listen(PORT, () => console.log(`Anteprima su http://localhost:${PORT}  (Ctrl+C per fermare)`));
