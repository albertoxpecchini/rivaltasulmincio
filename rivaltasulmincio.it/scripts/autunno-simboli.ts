/*
 * I simboli dell'autunno: dieci fogli di nove disegni ciascuno, generati con
 * gpt-image-2 (tramite Replicate) su fondo trasparente, ritagliati uno a uno
 * e montati in un atlante per lo sfondo animato (src/stagione/autunno.ts).
 *
 *   node scripts/autunno-simboli.ts genera [numero…]   → data/autunno/fogli/NN-nome.png
 *   node scripts/autunno-simboli.ts ritaglia           → data/autunno/simboli/NN-M-nome.webp
 *                                                        public/foto/autunno/simboli-{1x,2x}.avif
 *                                                        data/autunno/simboli.json
 *
 * La chiave sta in ../.env.local (REPLICATE_API_KEY), alla radice del repo.
 * Il primo foglio fa da riferimento di stile per gli altri nove, così i
 * novanta disegni escono dalla stessa mano. I fogli generati restano fuori
 * da git (sono grandi e si rifanno con questo script); i ritagli a piena
 * risoluzione e l'atlante invece si committano.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ENV_FILE = path.resolve(root, '..', '.env.local');
const FOGLI_DIR = path.join(root, 'data/autunno/fogli');
const SIMBOLI_DIR = path.join(root, 'data/autunno/simboli');
const ATLANTE_DIR = path.join(root, 'public/foto/autunno');
const DATI_FILE = path.join(root, 'data/autunno/simboli.json');

const MODELLO = 'openai/gpt-image-2';
const LATO = 2048;
/** Lato della cella dell'atlante a 1x; l'atlante 2x ha celle doppie. */
const CELLA = 128;
const COLONNE = 10;

/** Come si muove un simbolo nello sfondo: le foglie ruzzolano, il resto dondola. */
type Movimento = 'foglia' | 'oggetto';

interface Foglio {
  nome: string;
  movimento: Movimento;
  /** Frequenza relativa nello sfondo: le foglie devono dominare. */
  peso: number;
  /** Nove simboli, in ordine di lettura (riga per riga, da sinistra). */
  simboli: { nome: string; testo: string }[];
}

const FOGLI: Foglio[] = [
  {
    nome: 'foglie-acero',
    movimento: 'foglia',
    peso: 4,
    simboli: [
      { nome: 'foglia-acero-rossa', testo: 'a bright red maple leaf' },
      { nome: 'foglia-acero-arancio', testo: 'an orange maple leaf' },
      { nome: 'foglia-acero-gialla', testo: 'a golden yellow maple leaf' },
      { nome: 'foglia-acero-campestre', testo: 'a small field maple leaf, ochre with rounded lobes' },
      { nome: 'foglia-platano', testo: 'a large plane tree leaf, brown and orange' },
      { nome: 'foglia-platano-verde', testo: 'a plane tree leaf turning from green to yellow' },
      { nome: 'foglia-acero-secca', testo: 'a dry brown maple leaf, curled at the edges' },
      { nome: 'foglia-acero-bicolore', testo: 'a maple leaf half red and half green' },
      { nome: 'samare-acero', testo: 'a pair of maple samaras (helicopter seeds) joined at the base' },
    ],
  },
  {
    nome: 'foglie-bosco',
    movimento: 'foglia',
    peso: 4,
    simboli: [
      { nome: 'foglia-quercia', testo: 'a rust brown oak leaf with rounded lobes' },
      { nome: 'foglia-quercia-gialla', testo: 'a golden yellow oak leaf' },
      { nome: 'foglia-castagno', testo: 'a long serrated chestnut tree leaf, orange' },
      { nome: 'foglia-faggio', testo: 'a copper colored beech leaf, oval with wavy edge' },
      { nome: 'foglia-carpino', testo: 'a yellow hornbeam leaf with strong parallel veins' },
      { nome: 'foglia-nocciolo', testo: 'a round hazel leaf, yellow brown with a pointed tip' },
      { nome: 'foglia-noce', testo: 'an olive yellow walnut leaflet, long and smooth' },
      { nome: 'foglia-olmo', testo: 'a yellow elm leaf with an asymmetric base' },
      { nome: 'foglia-ciliegio', testo: 'a red orange cherry tree leaf' },
    ],
  },
  {
    nome: 'foglie-mincio',
    movimento: 'foglia',
    peso: 4,
    simboli: [
      { nome: 'foglia-pioppo', testo: 'a triangular bright yellow poplar leaf' },
      { nome: 'foglia-salice', testo: 'a long narrow pale yellow willow leaf' },
      { nome: 'foglia-ontano', testo: 'a round alder leaf, brown green with a notched tip' },
      { nome: 'foglia-tiglio', testo: 'a heart shaped yellow linden leaf' },
      { nome: 'foglia-gelso', testo: 'a lobed yellow mulberry leaf' },
      { nome: 'foglia-vite', testo: 'a grape vine leaf in red and purple' },
      { nome: 'foglia-fico', testo: 'a big deeply lobed fig leaf, yellow brown' },
      { nome: 'foglia-ginkgo', testo: 'a fan shaped golden ginkgo leaf' },
      { nome: 'foglia-betulla', testo: 'a small yellow birch leaf with serrated edge' },
    ],
  },
  {
    nome: 'semi-e-bacche',
    movimento: 'oggetto',
    peso: 2,
    simboli: [
      { nome: 'ghianda', testo: 'a single acorn with its cap' },
      { nome: 'ghiande-ramoscello', testo: 'two acorns on a short twig with one small oak leaf' },
      { nome: 'castagna', testo: 'a shiny brown chestnut' },
      { nome: 'riccio-castagna', testo: 'an open spiky chestnut burr with chestnuts inside' },
      { nome: 'noce', testo: 'a walnut in its shell' },
      { nome: 'nocciole', testo: 'a cluster of three hazelnuts in their husks' },
      { nome: 'pigna', testo: 'a brown pine cone' },
      { nome: 'rosa-canina', testo: 'a rosehip branch with red hips' },
      { nome: 'sorbo', testo: 'a cluster of orange rowan berries with a small leaf' },
    ],
  },
  {
    nome: 'frutta',
    movimento: 'oggetto',
    peso: 2,
    simboli: [
      { nome: 'mela', testo: 'a red apple with a leaf' },
      { nome: 'pera', testo: 'a yellow green pear' },
      { nome: 'uva', testo: 'a bunch of dark purple grapes with a vine leaf' },
      { nome: 'cachi', testo: 'an orange persimmon with its green calyx' },
      { nome: 'melograno', testo: 'a pomegranate split open showing red seeds' },
      { nome: 'mela-cotogna', testo: 'a yellow quince' },
      { nome: 'zucca', testo: 'a big orange pumpkin with a stem' },
      { nome: 'zucca-piccola', testo: 'a small striped green and orange gourd' },
      { nome: 'fico', testo: 'a purple fig, one cut open showing the pink inside' },
    ],
  },
  {
    nome: 'funghi-e-campi',
    movimento: 'oggetto',
    peso: 1,
    simboli: [
      { nome: 'porcino', testo: 'a porcini mushroom with a brown cap and thick stem' },
      { nome: 'amanita', testo: 'a red fly agaric mushroom with white dots' },
      { nome: 'finferli', testo: 'two yellow chanterelle mushrooms' },
      { nome: 'chiodini', testo: 'a cluster of small honey mushrooms' },
      { nome: 'pannocchia', testo: 'a corn cob with the husk pulled back' },
      { nome: 'spiga', testo: 'a golden ear of wheat' },
      { nome: 'ramo-bacche', testo: 'a dry twig with red berries' },
      { nome: 'ramo-secco', testo: 'a bare dry twig' },
      { nome: 'ceppo', testo: 'a small cut log showing its rings' },
    ],
  },
  {
    nome: 'animali',
    movimento: 'oggetto',
    peso: 1,
    simboli: [
      { nome: 'riccio', testo: 'a hedgehog' },
      { nome: 'scoiattolo', testo: 'a red squirrel holding an acorn' },
      { nome: 'pettirosso', testo: 'a robin' },
      { nome: 'oca', testo: 'a wild goose flying with spread wings' },
      { nome: 'gufo', testo: 'a small owl' },
      { nome: 'volpe', testo: 'a fox sitting with its tail curled around' },
      { nome: 'lumaca', testo: 'a snail on a small leaf' },
      { nome: 'cornacchia', testo: 'a crow' },
      { nome: 'airone', testo: 'a grey heron standing on one leg' },
    ],
  },
  {
    nome: 'cielo-e-meteo',
    movimento: 'oggetto',
    peso: 1,
    simboli: [
      { nome: 'nuvola-pioggia', testo: 'a grey cloud with falling rain drops' },
      { nome: 'goccia', testo: 'a single water drop' },
      { nome: 'vento', testo: 'a gust of wind drawn as swirling lines carrying one small leaf' },
      { nome: 'nebbia', testo: 'a soft band of fog' },
      { nome: 'ombrello', testo: 'an open burnt orange umbrella' },
      { nome: 'arcobaleno', testo: 'a small rainbow with a cloud at one end' },
      { nome: 'sole', testo: 'a pale autumn sun' },
      { nome: 'luna', testo: 'a crescent moon with one star' },
      { nome: 'stormo', testo: 'a V formation of migrating birds, drawn as one compact group' },
    ],
  },
  {
    nome: 'cose-calde',
    movimento: 'oggetto',
    peso: 1,
    simboli: [
      { nome: 'tazza-te', testo: 'a steaming cup of tea' },
      { nome: 'sciarpa', testo: 'a striped wool scarf' },
      { nome: 'berretto', testo: 'a wool beanie with a pompom' },
      { nome: 'stivali', testo: 'a pair of rubber boots' },
      { nome: 'rastrello', testo: 'a garden rake with one leaf caught in it' },
      { nome: 'cesto', testo: 'a wicker basket full of apples' },
      { nome: 'lanterna', testo: 'an old metal lantern with a warm light' },
      { nome: 'candela', testo: 'a lit candle' },
      { nome: 'maglione', testo: 'a knitted wool sweater' },
    ],
  },
  {
    nome: 'campagna-e-fiume',
    movimento: 'oggetto',
    peso: 1,
    simboli: [
      { nome: 'caldarroste', testo: 'a paper cone of roasted chestnuts' },
      { nome: 'torta-di-mele', testo: 'a slice of apple pie' },
      { nome: 'marmellata', testo: 'a jam jar with a cloth cover' },
      { nome: 'tifa', testo: 'a cattail with its brown velvet head' },
      { nome: 'canna', testo: 'a marsh reed with a feathery plume' },
      { nome: 'loto', testo: 'a dry lotus seed pod on its stem' },
      { nome: 'ninfea', testo: 'a water lily leaf tinted red by autumn' },
      { nome: 'balla-di-fieno', testo: 'a round hay bale' },
      { nome: 'spaventapasseri', testo: 'a friendly scarecrow' },
    ],
  },
];

/* ── Prompt ──────────────────────────────────────────────────────────────── */

const STILE = [
  'High-end cartoon illustration style: bold clean dark brown outlines of even weight,',
  'flat vivid colors with soft cel shading and one small highlight, rounded friendly shapes, crisp edges.',
  'Warm autumn palette: rust red, burnt orange, ochre, golden yellow, olive green, chestnut brown, cream.',
].join(' ');

const REGOLE = [
  'The background is fully TRANSPARENT: no backdrop, no ground, no sky, no color fill, no paper texture.',
  'No drop shadows, no cast shadows, no glow, no reflections.',
  'No frame, no box around the cells, no grid lines, no text, no labels, no numbers, no watermark.',
  'Each item is one self-contained object fully inside its own cell, centered in the cell, roughly the same visual size as the others,',
  'with wide empty space between items: nothing overlaps, nothing touches another item, nothing touches the edge of the image.',
].join(' ');

function prompt(foglio: Foglio, conRiferimento: boolean): string {
  const elenco = foglio.simboli.map((simbolo, i) => `${i + 1}) ${simbolo.testo}`).join('; ');
  return [
    'A sticker sheet of exactly 9 separate autumn illustrations arranged in a neat 3 by 3 grid.',
    STILE,
    conRiferimento
      ? 'Match exactly the illustration style, line weight, shading and palette of the attached reference sheet (which shows different items); draw these NEW items instead of the ones in the reference.'
      : '',
    REGOLE,
    `The 9 items, in reading order (row by row, left to right), are: ${elenco}.`,
    'Every item must be clearly different from the others and instantly recognizable.',
  ]
    .filter(Boolean)
    .join(' ');
}

/* ── Replicate ───────────────────────────────────────────────────────────── */

function chiave(): string {
  if (process.env.REPLICATE_API_KEY) return process.env.REPLICATE_API_KEY;
  if (!fs.existsSync(ENV_FILE)) throw new Error(`manca ${ENV_FILE} con REPLICATE_API_KEY`);
  const riga = fs
    .readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .find((line) => line.startsWith('REPLICATE_API_KEY='));
  if (!riga) throw new Error(`REPLICATE_API_KEY non è in ${ENV_FILE}`);
  return riga.slice('REPLICATE_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
}

function fileFoglio(indice: number): string {
  return path.join(FOGLI_DIR, `${String(indice + 1).padStart(2, '0')}-${FOGLI[indice]!.nome}.png`);
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

interface Predizione {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  urls: { get: string };
}

async function predici(key: string, input: Record<string, unknown>): Promise<string> {
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  let predizione: Predizione;
  // Con poco credito Replicate accetta una raffica di cinque richieste: al 429 si aspetta e si riprova.
  for (let tentativo = 1; ; tentativo++) {
    const response = await fetch(`https://api.replicate.com/v1/models/${MODELLO}/predictions`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'wait=60' },
      body: JSON.stringify({ input }),
    });
    const json = (await response.json()) as Predizione & { detail?: string };
    if (response.status === 429 && tentativo <= 8) {
      const attesa = 10000 * tentativo;
      console.log(`Replicate: troppe richieste, riprovo tra ${attesa / 1000} s`);
      await sleep(attesa);
      continue;
    }
    if (!response.ok) throw new Error(`Replicate ${response.status}: ${json.detail ?? JSON.stringify(json)}`);
    predizione = json;
    break;
  }

  while (predizione.status === 'starting' || predizione.status === 'processing') {
    await sleep(4000);
    predizione = (await (await fetch(predizione.urls.get, { headers })).json()) as Predizione;
  }
  if (predizione.status !== 'succeeded') throw new Error(`predizione ${predizione.id} ${predizione.status}: ${predizione.error ?? ''}`);

  const output = Array.isArray(predizione.output) ? predizione.output[0] : predizione.output;
  if (!output) throw new Error(`predizione ${predizione.id} senza output`);
  return output;
}

/** Carica un file su Replicate e ne restituisce l'URL da usare come input. */
async function carica(key: string, file: string): Promise<string> {
  const form = new FormData();
  form.append('content', new Blob([fs.readFileSync(file)], { type: 'image/png' }), path.basename(file));
  const response = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const json = (await response.json()) as { urls?: { get: string }; detail?: string };
  if (!response.ok || !json.urls) throw new Error(`upload ${response.status}: ${json.detail ?? JSON.stringify(json)}`);
  return json.urls.get;
}

/** Al massimo `quante` lavorazioni alla volta. */
async function aGruppi<T>(voci: T[], quante: number, lavoro: (voce: T) => Promise<void>): Promise<void> {
  const coda = [...voci];
  const operai = Array.from({ length: Math.min(quante, coda.length) }, async () => {
    for (let voce = coda.shift(); voce !== undefined; voce = coda.shift()) await lavoro(voce);
  });
  await Promise.all(operai);
}

async function genera(richiesti: number[]): Promise<void> {
  const key = chiave();
  fs.mkdirSync(FOGLI_DIR, { recursive: true });

  // I fogli già scaricati non si rifanno: ogni generazione costa.
  const indici = richiesti.filter((indice) => {
    if (!fs.existsSync(fileFoglio(indice))) return true;
    console.log(`foglio ${indice + 1} «${FOGLI[indice]!.nome}»: già presente, lo tengo`);
    return false;
  });
  if (indici.length === 0) return;

  const primo = fileFoglio(0);
  let riferimento: string | undefined;
  if (fs.existsSync(primo) && indici.some((i) => i !== 0)) {
    riferimento = await carica(key, primo);
    console.log('riferimento di stile: foglio 1');
  }

  const generaUno = async (indice: number): Promise<void> => {
    const foglio = FOGLI[indice]!;
    const conRiferimento = indice !== 0 && riferimento !== undefined;
    if (indice !== 0 && !conRiferimento) {
      throw new Error('genera prima il foglio 1: fa da riferimento di stile per gli altri');
    }
    const input: Record<string, unknown> = {
      prompt: prompt(foglio, conRiferimento),
      quality: 'high',
      background: 'transparent',
      output_format: 'png',
      aspect_ratio: `${LATO}x${LATO}`,
      number_of_images: 1,
      moderation: 'low',
    };
    if (conRiferimento) input.input_images = [riferimento];

    console.log(`foglio ${indice + 1} «${foglio.nome}»: genero…`);
    const url = await predici(key, input);
    const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(fileFoglio(indice), bytes);
    console.log(`foglio ${indice + 1} «${foglio.nome}»: ${(bytes.length / 1024).toFixed(0)} KB → ${path.relative(root, fileFoglio(indice))}`);
  };

  // Il primo da solo (fa da riferimento), gli altri a gruppi di tre.
  if (indici.includes(0)) {
    await generaUno(0);
    if (indici.some((i) => i !== 0)) riferimento = await carica(key, primo);
  }
  await aGruppi(
    indici.filter((i) => i !== 0),
    3,
    generaUno,
  );
}

/* ── Ritaglio ────────────────────────────────────────────────────────────── */

interface Scatola {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  area: number;
}

/** Componenti connesse (8 vicini) dei pixel con alfa sopra soglia. */
function componenti(alpha: Uint8Array, w: number, h: number, soglia: number): Scatola[] {
  const etichetta = new Int32Array(w * h).fill(-1);
  const pila = new Int32Array(w * h);
  const scatole: Scatola[] = [];
  for (let inizio = 0; inizio < w * h; inizio++) {
    if (alpha[inizio]! < soglia || etichetta[inizio]! >= 0) continue;
    const id = scatole.length;
    const scatola: Scatola = { x0: w, y0: h, x1: 0, y1: 0, area: 0 };
    let sp = 0;
    pila[sp++] = inizio;
    etichetta[inizio] = id;
    while (sp > 0) {
      const p = pila[--sp]!;
      const x = p % w;
      const y = (p - x) / w;
      scatola.area += 1;
      if (x < scatola.x0) scatola.x0 = x;
      if (x > scatola.x1) scatola.x1 = x;
      if (y < scatola.y0) scatola.y0 = y;
      if (y > scatola.y1) scatola.y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const q = ny * w + nx;
          if (alpha[q]! >= soglia && etichetta[q]! < 0) {
            etichetta[q] = id;
            pila[sp++] = q;
          }
        }
      }
    }
    scatole.push(scatola);
  }
  return scatole;
}

function distanza(a: Scatola, b: Scatola): number {
  const dx = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1));
  const dy = Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1));
  return Math.hypot(dx, dy);
}

function unione(a: Scatola, b: Scatola): Scatola {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
    area: a.area + b.area,
  };
}

/**
 * Da tante componenti a nove gruppi. Prima via: la griglia 3×3 del foglio,
 * ogni pezzo va nella cella del suo centro (così gli uccelli di uno stormo o
 * una foglia staccata dal picciolo finiscono insieme). Se qualche cella
 * resta vuota, seconda via: i pezzi vicini si uniscono con margine
 * crescente e, se restano più di nove gruppi, si fondono i due più vicini
 * finché sono nove. I frammenti minuscoli si attaccano al gruppo più vicino
 * o si scartano.
 */
function raggruppa(scatole: Scatola[], lato: number): Scatola[] {
  const minima = Math.round(lato * lato * 0.00005); // ~200 px² a 2048
  const grandi = scatole.filter((s) => s.area >= minima);
  const piccole = scatole.filter((s) => s.area < minima);

  const celle: (Scatola | undefined)[] = Array.from({ length: 9 }, () => undefined);
  for (const s of grandi) {
    const colonna = Math.min(2, Math.floor((s.x0 + s.x1) / 2 / (lato / 3)));
    const riga = Math.min(2, Math.floor((s.y0 + s.y1) / 2 / (lato / 3)));
    const i = riga * 3 + colonna;
    const cella = celle[i];
    celle[i] = cella ? unione(cella, s) : s;
  }

  const gruppi = celle.every((c) => c !== undefined) ? (celle as Scatola[]) : perVicinanza(grandi, lato);

  for (const briciola of piccole) {
    let vicino = -1;
    let dmin = lato * 0.03;
    gruppi.forEach((g, i) => {
      const d = distanza(g, briciola);
      if (d < dmin) {
        dmin = d;
        vicino = i;
      }
    });
    if (vicino >= 0) gruppi[vicino] = unione(gruppi[vicino]!, briciola);
  }
  return gruppi;
}

function perVicinanza(pezzi: Scatola[], lato: number): Scatola[] {
  let grandi = [...pezzi];
  console.log(`  griglia irregolare: raggruppo per vicinanza (${grandi.length} pezzi)`);

  for (const margine of [0.015, 0.02, 0.025, 0.03, 0.04, 0.05]) {
    if (grandi.length <= 9) break;
    const passo = lato * margine;
    let fuso = true;
    while (fuso && grandi.length > 9) {
      fuso = false;
      esterno: for (let i = 0; i < grandi.length; i++) {
        for (let j = i + 1; j < grandi.length; j++) {
          if (distanza(grandi[i]!, grandi[j]!) <= passo) {
            grandi[i] = unione(grandi[i]!, grandi[j]!);
            grandi.splice(j, 1);
            fuso = true;
            break esterno;
          }
        }
      }
    }
  }

  while (grandi.length > 9) {
    let migliore = [0, 1, Number.POSITIVE_INFINITY] as [number, number, number];
    for (let i = 0; i < grandi.length; i++) {
      for (let j = i + 1; j < grandi.length; j++) {
        const d = distanza(grandi[i]!, grandi[j]!);
        if (d < migliore[2]) migliore = [i, j, d];
      }
    }
    grandi[migliore[0]] = unione(grandi[migliore[0]]!, grandi[migliore[1]]!);
    grandi.splice(migliore[1], 1);
  }

  // Ordine di lettura: tre righe per altezza del centro, poi da sinistra.
  grandi = grandi.sort((a, b) => a.y0 + a.y1 - (b.y0 + b.y1));
  const righe = [grandi.slice(0, 3), grandi.slice(3, 6), grandi.slice(6, 9)];
  return righe.flatMap((riga) => riga.sort((a, b) => a.x0 + a.x1 - (b.x0 + b.x1)));
}

interface Simbolo {
  nome: string;
  foglio: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

async function ritaglia(): Promise<void> {
  const sharp = (await import('sharp')).default;
  fs.mkdirSync(SIMBOLI_DIR, { recursive: true });
  fs.mkdirSync(ATLANTE_DIR, { recursive: true });

  const simboli: Simbolo[] = [];
  const strati: Record<1 | 2, { input: Buffer; left: number; top: number }[]> = { 1: [], 2: [] };
  const righe = Math.ceil((FOGLI.length * 9) / COLONNE);

  for (const [indice, foglio] of FOGLI.entries()) {
    const file = fileFoglio(indice);
    if (!fs.existsSync(file)) throw new Error(`manca ${path.relative(root, file)}: eseguire prima "genera"`);
    const immagine = sharp(file).ensureAlpha();
    const { data, info } = await immagine.raw().toBuffer({ resolveWithObject: true });
    const alpha = new Uint8Array(info.width * info.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3]!;

    const pezzi = componenti(alpha, info.width, info.height, 32);
    const gruppi = raggruppa(pezzi, info.width);
    if (gruppi.length !== 9) {
      throw new Error(`foglio ${indice + 1} «${foglio.nome}»: trovati ${gruppi.length} simboli invece di 9 (${pezzi.length} componenti)`);
    }
    console.log(`foglio ${indice + 1} «${foglio.nome}»: ${pezzi.length} componenti → 9 simboli`);

    for (const [posizione, gruppo] of gruppi.entries()) {
      const simbolo = foglio.simboli[posizione]!;
      const numero = indice * 9 + posizione;
      const bordo = 2;
      const regione = {
        left: Math.max(0, gruppo.x0 - bordo),
        top: Math.max(0, gruppo.y0 - bordo),
        width: Math.min(info.width, gruppo.x1 + bordo + 1) - Math.max(0, gruppo.x0 - bordo),
        height: Math.min(info.height, gruppo.y1 + bordo + 1) - Math.max(0, gruppo.y0 - bordo),
      };
      const ritaglio = await sharp(file).extract(regione).png().toBuffer();
      // Piena risoluzione, qualità 95: indistinguibile dal PNG, un quarto del peso.
      const nomeFile = `${String(indice + 1).padStart(2, '0')}-${posizione + 1}-${simbolo.nome}.webp`;
      await sharp(ritaglio).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toFile(path.join(SIMBOLI_DIR, nomeFile));

      // Nell'atlante: dentro la cella, centrato, con un pixel di respiro per lato.
      const colonna = numero % COLONNE;
      const riga = Math.floor(numero / COLONNE);
      let posto: Simbolo | undefined;
      for (const scala of [1, 2] as const) {
        const cella = CELLA * scala;
        const dentro = cella - 2 * scala;
        const { data: ridotto, info: misura } = await sharp(ritaglio)
          .resize({ width: dentro, height: dentro, fit: 'inside', kernel: 'lanczos3' })
          .png()
          .toBuffer({ resolveWithObject: true });
        const left = colonna * cella + Math.floor((cella - misura.width) / 2);
        const top = riga * cella + Math.floor((cella - misura.height) / 2);
        strati[scala].push({ input: ridotto, left, top });
        if (scala === 1) posto = { nome: simbolo.nome, foglio: indice, x: left, y: top, w: misura.width, h: misura.height };
      }
      simboli.push(posto!);
    }
  }

  // AVIF (IMAGES.md «Formati»): con la trasparenza pesa la metà del WebP a pari qualità.
  for (const scala of [1, 2] as const) {
    const cella = CELLA * scala;
    const file = path.join(ATLANTE_DIR, `simboli-${scala}x.avif`);
    await sharp({
      create: { width: COLONNE * cella, height: righe * cella, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite(strati[scala])
      // Il 2x si scarica solo sugli schermi densi: un po' più compresso, i simboli restano netti.
      .avif({ quality: scala === 1 ? 70 : 60, effort: 6 })
      .toFile(file);
    console.log(`atlante ${scala}x: ${COLONNE * cella}×${righe * cella}, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }

  const dati = {
    cella: CELLA,
    colonne: COLONNE,
    righe,
    fogli: FOGLI.map(({ nome, movimento, peso }) => ({ nome, movimento, peso })),
    simboli,
  };
  fs.writeFileSync(DATI_FILE, `${JSON.stringify(dati)}\n`, 'utf8');
  console.log(`${simboli.length} simboli → ${path.relative(root, DATI_FILE)}`);
}

/* ── Comando ─────────────────────────────────────────────────────────────── */

const [comando, ...argomenti] = process.argv.slice(2);
try {
  if (comando === 'genera') {
    const indici = argomenti.length > 0 ? argomenti.map((a) => Number(a) - 1) : FOGLI.map((_, i) => i);
    if (indici.some((i) => !Number.isInteger(i) || i < 0 || i >= FOGLI.length)) {
      throw new Error(`i fogli vanno da 1 a ${FOGLI.length}`);
    }
    await genera(indici);
  } else if (comando === 'ritaglia') {
    await ritaglia();
  } else {
    console.error('uso: node scripts/autunno-simboli.ts genera [numero…] | ritaglia');
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
