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
import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || process.argv.find((a) => /^\d+$/.test(a)) || 8080);

/* `node serve.mjs --guarda` accende anche il build in sorveglianza, come
   figlio di questo processo. È il motivo per cui il terminale torna a essere
   uno solo: finora il giro era cambia il frammento, vai nell'altro terminale,
   rilancia il build, torna nel browser, ricarica. Di quattro gesti, tre erano
   sempre gli stessi. */
const GUARDA = process.argv.includes("--guarda");
if (GUARDA) {
  const figlio = spawn(process.execPath, ["build.mjs", "--guarda"], { stdio: "inherit" });
  // Se il guardiano muore, muore anche l'anteprima: un server che mostra
  // pagine che non si aggiornano più è peggio di un server spento, perché
  // sembra che funzioni.
  figlio.on("exit", (codice) => {
    console.log(`\nIl build in sorveglianza è uscito (${codice}). Chiudo anche l'anteprima.`);
    process.exit(codice ?? 0);
  });
  for (const segnale of ["SIGINT", "SIGTERM"]) process.on(segnale, () => (figlio.kill(), process.exit(0)));
}


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

/* ── Il ricarico ──────────────────────────────────────────────────────────
   Il build riscrive le pagine in radice; questo se ne accorge e lo dice al
   browser, che si ricarica da sé. Sono venti righe e un `EventSource`, che i
   browser hanno da sempre: niente WebSocket, niente pacchetti, niente che
   debba essere installato per guardare una pagina.

   Lo script si inietta al momento di servire, non si scrive nei file: quello
   che sta su disco resta identico a quello che va in produzione. Un'anteprima
   che modifica i file che mostra è un'anteprima di cui non ci si può fidare.

   Solo `assets/` e le pagine in radice: assets/foto/_w/ no, perché ci scrive
   il build a ogni ritocco e ricaricare a ogni derivata tagliata vorrebbe dire
   ricaricare settanta volte di fila. */
const ascoltatori = new Set();
let annuncio = null;

const annuncia = () => {
  clearTimeout(annuncio);
  // Un build tocca più file di fila: si aspetta che abbia finito, o il browser
  // si ricarica una volta per pagina riscritta.
  annuncio = setTimeout(() => {
    for (const r of ascoltatori) r.write("data: ricarica\n\n");
  }, 120);
};

const rilevante = (f) => {
  const p = String(f || "").replace(/\\/g, "/");
  if (!p || p.includes("_w/") || /~$/.test(p) || /\.tmp$/i.test(p)) return false;
  return /\.(html|css|js)$/i.test(p);
};

for (const d of [".", "assets"]) {
  try {
    watch(d, { recursive: d !== "." }, (_, f) => rilevante(f) && annuncia());
  } catch {}
}

const SCRIPT_RICARICO = `<script>
/* Solo in anteprima: lo inietta serve.mjs, non sta in nessun file. */
(function(){var s=new EventSource("/__ricarica");
s.onmessage=function(){location.reload()};
s.onerror=function(){/* il server e' giu': EventSource riprova da se' */}})();
</script>
`;

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  if (url === "/__ricarica") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    res.write("retry: 500\n\n");
    ascoltatori.add(res);
    req.on("close", () => ascoltatori.delete(res));
    return;
  }

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
    // Come fa Vercel: un indirizzo che non esiste riceve la pagina 404 del
    // sito, non una riga di testo. Altrimenti l'unica pagina che non si può
    // raggiungere navigando resterebbe anche l'unica mai vista prima di
    // pubblicarla.
    const pagina404 = join(ROOT, "404.html");
    if (await isFile(pagina404)) {
      res.writeHead(404, { "content-type": TYPES[".html"], "cache-control": "no-store" });
      res.end(await readFile(pagina404));
      console.log(`404 ${url} → 404.html`);
      return;
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end(`404 ${url}`);
    console.log(`404 ${url}`);
    return;
  }

  const tipo = TYPES[extname(file)] || "application/octet-stream";
  res.writeHead(200, {
    "content-type": tipo,
    // In anteprima la cache è solo un modo per guardare la versione di ieri.
    "cache-control": "no-store",
  });
  const corpo = await readFile(file);
  // Lo script del ricarico entra qui, all'ultimo momento, e solo nell'HTML.
  res.end(
    tipo === TYPES[".html"] ? String(corpo).replace(/<\/body>/i, `${SCRIPT_RICARICO}</body>`) : corpo
  );
  console.log(`200 ${url}`);
}).listen(PORT, () =>
  console.log(
    `Anteprima su http://localhost:${PORT}  (Ctrl+C per fermare)` +
      (GUARDA ? "" : `\nCon «node serve.mjs --guarda» il build si rifà da sé e la pagina si ricarica.`)
  )
);
