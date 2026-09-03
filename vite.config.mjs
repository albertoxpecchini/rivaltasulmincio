/* ═══════════════════════════════════════════════════════════════════════════
   Anteprima locale con Vite — `npm run dev`.

   Il sito resta HTML statico e senza build: `build.mjs` incolla le pagine,
   Vercel le serve così come sono. Vite qui non compila niente, fa solo da
   server d'anteprima — in cambio ricarica la pagina da sé a ogni salvataggio
   e sta in ascolto anche sull'indirizzo di rete, così le stesse pagine si
   possono aprire dal telefono mentre si lavora (è quasi l'unico modo onesto
   di guardare un sito che la maggior parte della gente aprirà da lì).

   Vite da solo però non sa due cose che in produzione fa Vercel, e senza
   quelle l'anteprima mentirebbe. Le rimette il plugin qui sotto:

     • "cleanUrls": true — `/paese` deve servire `paese.html`. Senza, ogni
       link interno del sito darebbe 404 in locale.
     • le funzioni in `api/` — `/api/meteo` deve eseguire `api/meteo.mjs`,
       con le due comodità che Vercel attacca alla risposta (`status()` e
       `json()`) e con il corpo della richiesta già letto in `req.body`.

   Come build.mjs e serve.mjs, questo file resta a casa: sta in .vercelignore.
   ═══════════════════════════════════════════════════════════════════════════ */
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, loadEnv } from "vite";

const ROOT = process.cwd();

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

/* Vercel consegna alla funzione un corpo già interpretato; Node no. Le due
   forme che il sito usa davvero sono JSON (il modulo della Color Walk) e
   nessun corpo (il meteo, che è una GET): oltre quelle si passa il testo
   grezzo, che è meglio di far finta di niente. */
const leggiCorpo = async (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  const pezzi = [];
  for await (const p of req) pezzi.push(p);
  const grezzo = Buffer.concat(pezzi).toString("utf8");
  if (!grezzo) return undefined;

  const tipo = req.headers["content-type"] || "";
  if (tipo.includes("application/json")) {
    try {
      return JSON.parse(grezzo);
    } catch {
      return undefined; // corpo malformato: la funzione vedrà req.body vuoto e risponderà 400, come in produzione
    }
  }
  if (tipo.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(grezzo));
  }
  return grezzo;
};

/* `?${Date.now()}` sull'import: altrimenti Node tiene in memoria la prima
   versione del modulo e le modifiche a `api/` non si vedono senza riavviare. */
const eseguiFunzione = async (nome, req, res) => {
  const file = join(ROOT, "api", `${nome}.mjs`);
  if (!/^[a-z0-9-]+$/.test(nome) || !(await isFile(file))) return false;

  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => {
    if (!res.hasHeader("content-type")) res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(b));
  };
  req.body = await leggiCorpo(req);

  const { default: handler } = await import(`${pathToFileURL(file).href}?${Date.now()}`);
  await handler(req, res);
  return true;
};

const anteprimaVercel = () => ({
  name: "anteprima-vercel",

  /* I middleware registrati qui girano PRIMA di quelli interni di Vite: è
     quello che serve, perché l'indirizzo va riscritto (`/paese` →
     `/paese.html`) prima che Vite si metta a cercare il file. */
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const [percorso, query] = req.url.split("?");
      const url = decodeURIComponent(percorso);

      /* Tutto ciò che sta sotto /api/ finisce qui e non prosegue: se il nome
         non corrisponde a una funzione è un 404, mai il sorgente servito
         come file. */
      if (url.startsWith("/api/")) {
        try {
          if (await eseguiFunzione(url.slice(5), req, res)) return;
        } catch (e) {
          server.config.logger.error(`/api ${url}: ${e.stack || e}`);
          res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({ errore: "la funzione ha sollevato un'eccezione — vedi il terminale" }));
        }
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        return res.end(`404 ${url}`);
      }

      // "cleanUrls": /paese → paese.html. Il `..` va tolto prima di toccare
      // il disco: senza, un indirizzo costruito a mano cercherebbe file fuori
      // dalla cartella del sito.
      if (url !== "/" && !extname(url) && !url.startsWith("/@")) {
        const rel = normalize(url).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
        if (rel && (await isFile(join(ROOT, `${rel}.html`)))) {
          req.url = `/${rel}.html${query ? `?${query}` : ""}`;
        }
      }

      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  /* Le funzioni in api/ leggono le chiavi da `process.env` — in produzione ce
     le mette Vercel. In locale, senza `ISCRITTI_CHIAVE` e le credenziali di
     PayPal, `/api/iscritti-color-walk` risponde 503 «zona iscritti non
     configurata» e la pagina /iscritti non si può nemmeno provare.

     Qui le peschiamo da un file `.env` in radice — `loadEnv` col prefisso ""
     prende tutte le variabili, non solo quelle `VITE_` — e le ribaltiamo in
     `process.env`, che è dove le cerca il codice della funzione, identico a
     com'è su Vercel. Chi ha già esportato la variabile nella shell vince: il
     file riempie solo i vuoti. Il `.env` sta nel .gitignore: sono segreti, e
     come il resto dell'officina non esce di qui. */
  for (const [k, v] of Object.entries(loadEnv(mode, ROOT, ""))) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  return {
    plugins: [anteprimaVercel()],

    /* "mpa": nove pagine indipendenti, nessuna applicazione a pagina singola.
       Senza, Vite servirebbe la home per ogni indirizzo che non trova e i 404
       resterebbero invisibili proprio in anteprima, che è dove servono. */
    appType: "mpa",

    // Le immagini e i fogli di stile stanno già in assets/ e vanno serviti da
    // lì: non c'è nessuna cartella public/ da copiare.
    publicDir: false,

    server: {
      /* `host: true` = in ascolto su tutti gli indirizzi della macchina, non
         solo su localhost. All'avvio Vite stampa due righe: Local (dal computer)
         e Network — quest'ultima è l'indirizzo 10.x della rete di casa, da
         aprire dal telefono o da un altro computer collegato allo stesso Wi-Fi.
         Non è scritto a mano qui apposta: cambia da solo quando cambia rete. */
      host: true,
      // La 5173 la occupa già un altro Vite su questo computer.
      port: 5174,
      // Meglio fallire che ritrovarsi su una porta a caso mentre il telefono
      // punta ancora alla 5174.
      strictPort: true,
    },
  };
});
