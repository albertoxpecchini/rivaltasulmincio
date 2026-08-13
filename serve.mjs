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

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
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
