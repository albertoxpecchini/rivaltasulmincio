/*
 * Importa la locandina dal suo file sorgente e ne ricava il frammento HTML
 * che il sito pubblica, più i loghi che vi compaiono.
 *
 * Il sorgente è un «bundle»: una pagina che porta dentro di sé, in base64, i
 * propri font e le proprie immagini, e un template con qualche direttiva del
 * suo editor (`<sc-if>`, `{{ variabili }}`, `sc-camel-view-box`). Questo
 * script risolve quelle direttive e non tocca nient'altro: la locandina che
 * finisce nel sito è quella vera, non una ricostruzione.
 *
 *   node scripts/locandina-import.ts <bundle.html> <nome>
 *
 * Produce:
 *   data/journal/locandine/<nome>.html   frammento da pubblicare
 *   public/loghi/<nome>/*.webp           le immagini della locandina
 *   public/font/<nome>/*.woff2           i caratteri della locandina
 *   src/styles/locandine/<nome>.css      le @font-face relative
 *
 * Le immagini escono dal bundle alla loro risoluzione piena e vengono
 * convertite in WebP con ffmpeg, senza rimpicciolirle. I caratteri vengono
 * serviti dal sito, non da un CDN esterno: la locandina si vede uguale anche
 * senza rete di terzi e non lascia richieste altrove.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const [source, name] = process.argv.slice(2);
if (!source || !name) {
  console.error('uso: node scripts/locandina-import.ts <bundle.html> <nome>');
  process.exit(1);
}

/** Le variabili dell'editor, col valore che la locandina ha davvero. */
const VALUES: Record<string, boolean> = {
  musicaSabato: true,
  musicaDomenica: false,
  minotti: true,
};

/*
 * Correzioni di `alt` sbagliati nel sorgente. Sulla locandina stampata un alt
 * errato non si vede; qui lo legge lo screen reader, quindi va corretto.
 * Chiave: l'alt del sorgente più l'ordine con cui compare (0 = il primo).
 */
const ALT_FIXES: { alt: string; occurrence: number; correct: string }[] = [
  // Il secondo «AVIS di Rivalta» è in realtà il sigillo della parrocchia.
  { alt: 'AVIS di Rivalta', occurrence: 1, correct: 'Parrocchia di Rivalta' },
];

const bundle = fs.readFileSync(source, 'utf8');

const manifest = readIsland<Record<string, { mime?: string; data?: string }>>('manifest');
const template = readIsland<string>('template');

/** Un'isola di dati del bundle: `<script type="__bundler/NOME">…</script>`. */
function readIsland<T>(kind: string): T {
  const open = bundle.indexOf(`<script type="__bundler/${kind}"`);
  if (open < 0) throw new Error(`manca l'isola "${kind}" nel bundle`);
  const start = bundle.indexOf('>', open) + 1;
  return JSON.parse(bundle.slice(start, bundle.indexOf('</script>', start))) as T;
}

/* ── 1. Il corpo della locandina ─────────────────────────────────────────── */

const pageStart = template.indexOf('<section class="page"');
const pageEnd = template.indexOf('</doc-page>');
if (pageStart < 0 || pageEnd < 0) throw new Error('non trovo la pagina dentro il template');
let markup = template.slice(pageStart, pageEnd);

/* ── 2. Le direttive dell'editor ─────────────────────────────────────────── */

/** `<sc-if value="{{ x }}">…</sc-if>`: tiene il contenuto se `x` è vero. */
function resolveConditionals(html: string): string {
  const open = /<sc-if\s+value="\{\{\s*(\w+)\s*\}\}"[^>]*>/;
  for (let guard = 0; guard < 100; guard++) {
    const match = open.exec(html);
    if (!match) return html;
    const bodyStart = match.index + match[0].length;
    // Il tag può contenerne altri: si conta l'annidamento fino alla chiusura.
    let depth = 1;
    let cursor = bodyStart;
    while (depth > 0) {
      const next = /<(\/?)sc-if[\s>]/g;
      next.lastIndex = cursor;
      const tag = next.exec(html);
      if (!tag) throw new Error('<sc-if> senza chiusura');
      depth += tag[1] ? -1 : 1;
      cursor = tag.index + tag[0].length;
    }
    const closeStart = html.lastIndexOf('</sc-if>', cursor);
    const body = VALUES[match[1]] ? html.slice(bodyStart, closeStart) : '';
    html = html.slice(0, match.index) + body + html.slice(closeStart + '</sc-if>'.length);
  }
  throw new Error('troppi <sc-if> annidati');
}

markup = resolveConditionals(markup);

// `sc-camel-view-box` è come l'editor scrive `viewBox`, che in HTML è camelCase.
markup = markup.replace(/sc-camel-([a-z-]+)=/g, (_, attribute: string) =>
  `${attribute.replace(/-([a-z])/g, (__, letter: string) => letter.toUpperCase())}=`,
);

// `ref="{{ pageRef }}"` serviva all'editor per misurare il foglio.
markup = markup.replace(/\s*ref="\{\{[^}]*\}\}"/g, '');

const leftover = markup.match(/\{\{[^}]*\}\}|<sc-[a-z]/);
if (leftover) throw new Error(`direttiva non risolta: ${leftover[0]}`);

/* ── 3. Gli `alt` sbagliati nel sorgente ─────────────────────────────────── */

for (const fix of ALT_FIXES) {
  let seen = -1;
  let fixed = false;
  markup = markup.replace(new RegExp(`alt="${escapeRegExp(fix.alt)}"`, 'g'), (whole) => {
    seen += 1;
    if (seen !== fix.occurrence) return whole;
    fixed = true;
    return `alt="${fix.correct}"`;
  });
  if (!fixed) console.warn(`  · correzione alt non applicata: «${fix.alt}» #${fix.occurrence}`);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ── 4. Le immagini ──────────────────────────────────────────────────────── */

const logoDir = path.join(root, 'public', 'loghi', name);
fs.rmSync(logoDir, { recursive: true, force: true });
fs.mkdirSync(logoDir, { recursive: true });

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const used = new Map<string, string>();
const taken = new Set<string>();
markup = markup.replace(/src="([0-9a-f-]{36})"/g, (whole, uuid: string) => {
  const cached = used.get(uuid);
  if (cached) return `src="${cached}"`;
  const entry = manifest[uuid];
  if (!entry?.data) {
    console.warn(`  · immagine ${uuid} assente dal manifest: lasciata com'è`);
    return whole;
  }
  const slug = slugOf(whole, markup, used.size);
  const url = writeImage(slug, entry.mime ?? '', Buffer.from(entry.data, 'base64'));
  used.set(uuid, url);
  return `src="${url}"`;
});

/** Nome del file: l'`alt` dell'immagine, che descrive già cos'è. */
function slugOf(needle: string, html: string, index: number): string {
  const at = html.indexOf(needle);
  const tag = html.slice(html.lastIndexOf('<img', at), html.indexOf('>', at));
  const alt = /alt="([^"]*)"/.exec(tag)?.[1] ?? '';
  const slug = alt
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&amp;/g, 'e')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `immagine-${index + 1}`;
}

/** Scrive l'immagine in WebP alla sua risoluzione piena. */
function writeImage(slug: string, mime: string, data: Buffer): string {
  const extension = EXTENSIONS[mime] ?? 'bin';
  if (extension === 'svg') {
    // Un SVG del bundle può essere compresso (svgz): si riconosce dai magic byte.
    const svg = data[0] === 0x1f && data[1] === 0x8b ? gunzip(data) : data;
    const file = uniqueName(slug, 'svg');
    fs.writeFileSync(path.join(logoDir, file), stripMetadata(svg));
    return `/loghi/${name}/${file}`;
  }
  const temporary = path.join(logoDir, `${slug}.source.${extension}`);
  fs.writeFileSync(temporary, data);
  const file = uniqueName(slug, 'webp');
  // `-q:v 95`: la locandina va tenuta alla qualità piena.
  execFileSync('ffmpeg', ['-nostdin', '-loglevel', 'error', '-y', '-i', temporary, '-c:v', 'libwebp', '-q:v', '95', path.join(logoDir, file)]);
  fs.rmSync(temporary);
  return `/loghi/${name}/${file}`;
}

function uniqueName(slug: string, extension: string): string {
  let file = `${slug}.${extension}`;
  for (let n = 2; taken.has(file); n++) file = `${slug}-${n}.${extension}`;
  taken.add(file);
  return file;
}

function gunzip(data: Buffer): Buffer {
  return execFileSync('node', ['-e', 'process.stdout.write(require("zlib").gunzipSync(require("fs").readFileSync(0)))'], { input: data, maxBuffer: 64 * 1024 * 1024 });
}

/** Via i blocchi di metadati (C2PA): pesano e non servono a chi guarda. */
function stripMetadata(svg: Buffer): Buffer {
  return Buffer.from(svg.toString('utf8').replace(/<metadata>[\s\S]*?<\/metadata>/g, ''), 'utf8');
}

/* ── 5. I caratteri ──────────────────────────────────────────────────────── */

/*
 * Il template dichiara le sue `@font-face` con l'uuid al posto dell'URL. Si
 * estraggono i file e si riscrive la regola verso `/font/<nome>/…`, tenendo
 * `unicode-range` così il browser scarica solo il sottoinsieme che gli serve.
 */
const fontDir = path.join(root, 'public', 'font', name);
fs.rmSync(fontDir, { recursive: true, force: true });
fs.mkdirSync(fontDir, { recursive: true });

const faces: string[] = [];
const fontFamilies = new Set<string>();

for (const face of template.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const body = face[1];
  const uuid = /src:\s*url\("([0-9a-f-]{36})"\)/.exec(body)?.[1];
  if (!uuid) continue;
  const entry = manifest[uuid];
  if (!entry?.data) continue;

  const family = /font-family:\s*'([^']+)'/.exec(body)?.[1] ?? 'font';
  const weight = /font-weight:\s*(\d+)/.exec(body)?.[1] ?? '400';
  const style = /font-style:\s*(\w+)/.exec(body)?.[1] ?? 'normal';
  const range = /unicode-range:\s*([^;]+)/.exec(body)?.[1]?.trim();
  fontFamilies.add(family);

  const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Il sottoinsieme sta nell'unicode-range: «latin» o «latin-ext».
  const subset = range?.includes('U+0100') ? 'latin-ext' : 'latin';
  const file = `${slug}-${weight}-${style}-${subset}.woff2`;
  fs.writeFileSync(path.join(fontDir, file), Buffer.from(entry.data, 'base64'));

  faces.push(
    `@font-face {\n` +
      `  font-family: '${family}';\n` +
      `  font-style: ${style};\n` +
      `  font-weight: ${weight};\n` +
      `  font-display: swap;\n` +
      `  src: url('/font/${name}/${file}') format('woff2');\n` +
      (range ? `  unicode-range: ${range};\n` : '') +
      `}`,
  );
}

const cssDir = path.join(root, 'src', 'styles', 'locandine');
fs.mkdirSync(cssDir, { recursive: true });
const cssFile = path.join(cssDir, `${name}.css`);
fs.writeFileSync(
  cssFile,
  `/*\n * Caratteri della locandina «${name}» (${[...fontFamilies].join(', ')}).\n` +
    ` * Generato da scripts/locandina-import.ts: non modificare a mano.\n` +
    ` * Serviti dal sito, non da un CDN esterno.\n */\n${faces.join('\n\n')}\n`,
  'utf8',
);

/* ── 6. Il frammento ─────────────────────────────────────────────────────── */

const outDir = path.join(root, 'data', 'journal', 'locandine');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${name}.html`);

fs.writeFileSync(
  outFile,
  `<!--\n  Generato da scripts/locandina-import.ts: non modificare a mano.\n  Sorgente: ${path.basename(source)}\n-->\n${markup.trim()}\n`,
  'utf8',
);

console.log(
  `locandina "${name}": ${used.size} immagini, ${faces.length} caratteri, ${Math.round(markup.length / 1024)} KB di markup`,
);
console.log(`  → ${path.relative(root, outFile)}`);
console.log(`  → ${path.relative(root, logoDir)}/`);
console.log(`  → ${path.relative(root, fontDir)}/`);
console.log(`  → ${path.relative(root, cssFile)}`);
