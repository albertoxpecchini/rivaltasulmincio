/**
 * import-events-from-com.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Importa eventi da rivaltasulmincio.com in rivaltasulmincio.it (Supabase).
 *
 * PREREQUISITI
 *   1. Esegui supabase-migration-add-import-columns.sql su Supabase.
 *   2. Crea il bucket 'post-images' (pubblico) oppure lascia che lo script
 *      lo crei automaticamente (richiede SUPABASE_SERVICE_ROLE_KEY).
 *
 * VARIABILI D'AMBIENTE RICHIESTE
 *   SUPABASE_URL              URL del progetto Supabase (es. https://xxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY Chiave service role (bypassa RLS)
 *   IMPORT_ADMIN_USER_ID      UUID dell'utente admin a cui assegnare i post importati
 *
 * VARIABILI D'AMBIENTE OPZIONALI
 *   SOURCE_SITE_URL           Default: https://rivaltasulmincio.com
 *   DRY_RUN                   Se '1', stampa preview senza scrivere su DB/Storage
 *   WP_EVENTS_CATEGORY        Slug/ID categoria WordPress da filtrare (default: nessun filtro)
 *   MAX_POSTS                 Limite massimo post da importare (default: 500)
 *   AUTHOR_USERNAME           Username visualizzato come autore (default: 'proloco')
 *
 * UTILIZZO
 *   DRY_RUN=1 node scripts/import-events-from-com.mjs
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... IMPORT_ADMIN_USER_ID=... node scripts/import-events-from-com.mjs
 */

import { createHash } from 'node:crypto';

// ── Configurazione ──────────────────────────────────────────────────────────

const SOURCE_SITE_URL        = (process.env.SOURCE_SITE_URL || 'https://www.rivaltasulmincio.com').replace(/\/$/, '');
const SUPABASE_URL           = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const IMPORT_ADMIN_USER_ID   = process.env.IMPORT_ADMIN_USER_ID || '';
const DRY_RUN                = String(process.env.DRY_RUN || '0') === '1';
const WP_EVENTS_CATEGORY     = process.env.WP_EVENTS_CATEGORY || '';
const MAX_POSTS              = Math.max(1, parseInt(process.env.MAX_POSTS || '500', 10));
const AUTHOR_USERNAME        = process.env.AUTHOR_USERNAME || 'proloco';
const STORAGE_BUCKET         = 'post-images';
const IMPORT_CATEGORY        = 'Eventi';
const FETCH_TIMEOUT_MS       = 15_000;
const MAX_TITLE_LENGTH       = 120;
const MAX_EXCERPT_LENGTH     = 200;
const MIN_TITLE_LENGTH       = 3;
const MIN_CONTENT_LENGTH     = 10;

// ── Helpers generici ────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(msg + '\n'); }
function warn(msg) { process.stderr.write('[WARN] ' + msg + '\n'); }
function err(msg)  { process.stderr.write('[ERROR] ' + msg + '\n'); }

function requireEnv() {
  if (DRY_RUN) {
    log('Modalità DRY RUN attiva – nessuna scrittura su DB o Storage.');
    if (!SUPABASE_URL)   warn('SUPABASE_URL non impostato (ignorato in DRY_RUN).');
    if (!SUPABASE_SERVICE_KEY) warn('SUPABASE_SERVICE_ROLE_KEY non impostato (ignorato in DRY_RUN).');
    if (!IMPORT_ADMIN_USER_ID) warn('IMPORT_ADMIN_USER_ID non impostato (ignorato in DRY_RUN).');
    return;
  }
  const missing = [];
  if (!SUPABASE_URL)           missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY)   missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!IMPORT_ADMIN_USER_ID)   missing.push('IMPORT_ADMIN_USER_ID');
  if (missing.length) {
    err('Variabili d\'ambiente mancanti: ' + missing.join(', '));
    process.exit(1);
  }
}

function sbHeaders() {
  return {
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type':  'application/json',
  };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Conversione HTML → testo in stile markdown ────────────────────────────

function htmlToMarkdown(html) {
  if (!html) return '';
  let text = html;

  // Converti tag di blocco in separatori di paragrafo
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');

  // Intestazioni → solo separatore di paragrafo (niente markdown ##)
  text = text.replace(/<h[1-6][^>]*>/gi, '');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');

  // Blockquote → solo contenuto, senza markup
  text = text.replace(/<blockquote[^>]*>/gi, '');
  text = text.replace(/<\/blockquote>/gi, '\n\n');

  // Enfasi → markdown
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Link: tieni solo il testo visibile
  text = text.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // Rimuovi tutti i tag rimasti
  text = text.replace(/<[^>]+>/g, '');

  // Decode entità HTML comuni
  text = text
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Normalizza spaziatura
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

function stripHtml(html) {
  if (!html) return '';
  return htmlToMarkdown(html).replace(/^[#*]+\s*/gm, '').trim();
}

// ── Validazione URL immagine ────────────────────────────────────────────────

function isValidHttpsImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    // Accetta solo URL con estensione immagine nota o senza estensione (CDN dinamici)
    const pathname = u.pathname.toLowerCase();
    const hasImgExt = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/.test(pathname);
    const isDynamic = !pathname.includes('.');
    return hasImgExt || isDynamic;
  } catch (_) {
    return false;
  }
}

// ── Rilevamento e fetch WordPress REST API ───────────────────────────────────

async function detectWordPress() {
  try {
    const res = await fetchWithTimeout(`${SOURCE_SITE_URL}/wp-json/wp/v2/`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data && (data.name || data.namespaces));
  } catch (_) {
    return false;
  }
}

async function fetchWpPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  // Costruisci query string
  const baseParams = new URLSearchParams({ per_page: '100', _embed: '1' });
  if (WP_EVENTS_CATEGORY) {
    // Prova sia come slug che come ID
    baseParams.set('categories', WP_EVENTS_CATEGORY);
  }

  log(`Recupero post da WordPress REST API: ${SOURCE_SITE_URL}/wp-json/wp/v2/posts`);

  do {
    const url = `${SOURCE_SITE_URL}/wp-json/wp/v2/posts?${baseParams}&page=${page}`;
    let res;
    try {
      res = await fetchWithTimeout(url);
    } catch (e) {
      warn(`Errore fetch pagina ${page}: ${e.message}`);
      break;
    }

    if (!res.ok) {
      if (res.status === 400 && page > 1) break; // fine paginazione
      warn(`WordPress API ha restituito ${res.status} per pagina ${page}`);
      break;
    }

    const xTotal = res.headers.get('X-WP-TotalPages');
    if (xTotal) totalPages = parseInt(xTotal, 10) || 1;

    const data = await res.json();
    if (!Array.isArray(data) || !data.length) break;

    for (const wpPost of data) {
      if (posts.length >= MAX_POSTS) break;
      posts.push(normalizeWpPost(wpPost));
    }

    log(`  Pagina ${page}/${totalPages}: ${data.length} post (totale finora: ${posts.length})`);
    page += 1;
  } while (page <= totalPages && posts.length < MAX_POSTS);

  return posts;
}

function normalizeWpPost(wpPost) {
  const title    = stripHtml(wpPost.title?.rendered || '').trim();
  const excerpt  = stripHtml(wpPost.excerpt?.rendered || '').trim();
  const content  = htmlToMarkdown(wpPost.content?.rendered || '').trim();
  const date     = wpPost.date_gmt ? new Date(wpPost.date_gmt + 'Z').toISOString() : (wpPost.date || null);
  const link     = wpPost.link || '';

  // Immagine in evidenza (featured media) via _embed
  let imageUrl = null;
  const embedded = wpPost._embedded;
  if (embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    imageUrl = embedded['wp:featuredmedia'][0].source_url;
  } else if (embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url) {
    imageUrl = embedded['wp:featuredmedia'][0].media_details.sizes.large.source_url;
  }

  return { title, excerpt, content, date, link, imageUrl };
}

// ── Blogger JSON feed ────────────────────────────────────────────────────────

async function detectBlogger() {
  try {
    const res = await fetchWithTimeout(`${SOURCE_SITE_URL}/feeds/posts/default?alt=json&max-results=1`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data?.feed?.['openSearch$totalResults'] || data?.feed?.entry);
  } catch (_) {
    return false;
  }
}

// ── Mapping label Blogger → categoria canonica ─────────────────────────────

const BLOGGER_LABEL_MAP = {
  'ambiente':         'Ambiente',
  'anniversari':      'Anniversari',
  'assemblea':        'Assemblea',
  'canoa':            'Canoa',
  'ciclismo':         'Ciclismo',
  'festa del pesce':  'Festa del Pesce',
  'festa-del-pesce':  'Festa del Pesce',
  'iniziative':       'Iniziative',
  'love-luccio':      'Love-luccio',
  'mincio-art':       'Mincio-art',
  'natale':           'Natale',
  'rassegna stampa':  'Rassegna Stampa',
  'rassegna-stampa':  'Rassegna Stampa',
  'tesseramento':     'Tesseramento',
  'video':            'Video',
};

function mapBloggerLabels(labels) {
  if (!Array.isArray(labels) || !labels.length) return 'Iniziative';
  for (const label of labels) {
    const mapped = BLOGGER_LABEL_MAP[String(label).toLowerCase().trim()];
    if (mapped) return mapped;
  }
  return 'Iniziative';
}

function bloggerThumbToFull(url) {
  if (!url) return null;
  // Blogger thumbnail URLs have a size token like /s72-c/ or /s400/ — upgrade to s960
  return url.replace(/\/s\d+(-c)?\//, '/s960/');
}

function normalizeBloggerPost(entry) {
  const title      = stripHtml(entry.title?.['$t'] || '').trim();
  const contentHtml = entry.content?.['$t'] || entry.summary?.['$t'] || '';
  const content    = htmlToMarkdown(contentHtml).trim();
  const excerpt    = stripHtml(entry.summary?.['$t'] || contentHtml).slice(0, MAX_EXCERPT_LENGTH).trim() || null;
  const date       = entry.published?.['$t'] ? new Date(entry.published['$t']).toISOString() : null;
  const altLink    = entry.link?.find(l => l.rel === 'alternate');
  const link       = altLink?.href || '';
  const imageUrl   = bloggerThumbToFull(entry['media$thumbnail']?.url);
  const labels     = Array.isArray(entry.category)
    ? entry.category.map(c => c.term || '').filter(Boolean)
    : [];
  return { title, excerpt, content, date, link, imageUrl, labels };
}

async function fetchBloggerPosts() {
  const posts = [];
  const maxPerPage = 150;
  let startIndex = 1;
  let totalResults = Infinity;

  log(`Recupero post da Blogger JSON feed: ${SOURCE_SITE_URL}/feeds/posts/default`);

  while (posts.length < MAX_POSTS && startIndex <= totalResults) {
    const url = `${SOURCE_SITE_URL}/feeds/posts/default?alt=json&max-results=${maxPerPage}&start-index=${startIndex}`;
    let res;
    try {
      res = await fetchWithTimeout(url);
    } catch (e) {
      warn(`Errore fetch Blogger (start=${startIndex}): ${e.message}`);
      break;
    }
    if (!res.ok) {
      warn(`Blogger feed ha restituito ${res.status}`);
      break;
    }
    const data = await res.json();
    if (startIndex === 1) {
      totalResults = parseInt(data.feed?.['openSearch$totalResults']?.['$t'] || '0', 10) || 0;
      log(`  Totale post nel feed: ${totalResults}`);
    }
    const entries = data.feed?.entry || [];
    if (!entries.length) break;
    for (const entry of entries) {
      if (posts.length >= MAX_POSTS) break;
      posts.push(normalizeBloggerPost(entry));
    }
    log(`  start-index ${startIndex}: ${entries.length} post (totale finora: ${posts.length})`);
    startIndex += maxPerPage;
  }

  return posts;
}

// ── Scraping HTML (fallback per siti non-WordPress né Blogger) ────────────────

async function fetchHtmlFallback() {
  const posts = [];

  // Prova diversi URL di archivio eventi comuni
  const archiveUrls = [
    `${SOURCE_SITE_URL}/eventi/`,
    `${SOURCE_SITE_URL}/events/`,
    `${SOURCE_SITE_URL}/notizie/`,
    `${SOURCE_SITE_URL}/news/`,
    `${SOURCE_SITE_URL}/`,
  ];

  let archiveHtml = '';
  let usedUrl = '';
  for (const url of archiveUrls) {
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        archiveHtml = await res.text();
        usedUrl = url;
        break;
      }
    } catch (_) {
      continue;
    }
  }

  if (!archiveHtml) {
    warn('Impossibile recuperare la pagina archivio eventi dal sito sorgente.');
    return posts;
  }

  log(`Scraping HTML da: ${usedUrl}`);

  // Estrai tutti i link ad articoli/eventi dalla pagina archivio.
  // Costruisci il pattern dell'host dalla SOURCE_SITE_URL configurata.
  const sourceHost = new URL(SOURCE_SITE_URL).host.replace(/\./g, '\\.');
  const linkRegex = new RegExp(`href="(https?://${sourceHost}/[a-z0-9\\-/]+/?)"[^>]*>`, 'gi');
  const seen = new Set();
  const postLinks = [];
  let m;
  while ((m = linkRegex.exec(archiveHtml)) !== null && postLinks.length < MAX_POSTS) {
    const href = m[1].replace(/\/$/, '');
    if (seen.has(href)) continue;
    // Filtra link generici (menu, categoria, ecc.) – tieni solo "slug" con almeno 2 segmenti
    const u = new URL(href);
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length < 1) continue;
    // Escludi pagine note
    const skip = ['wp-content', 'wp-includes', 'wp-admin', 'feed', 'tag', 'category', 'author', 'page'];
    if (skip.some(s => segments[0] === s)) continue;
    seen.add(href);
    postLinks.push(href);
  }

  log(`  Trovati ${postLinks.length} link potenziali da scrapare.`);

  for (const link of postLinks.slice(0, MAX_POSTS)) {
    try {
      const post = await scrapePostPage(link);
      if (post) posts.push(post);
    } catch (e) {
      warn(`Errore scraping ${link}: ${e.message}`);
    }
  }

  return posts;
}

async function scrapePostPage(url) {
  let res;
  try {
    res = await fetchWithTimeout(url);
  } catch (e) {
    warn(`Timeout/errore per ${url}: ${e.message}`);
    return null;
  }
  if (!res.ok) return null;
  const html = await res.text();

  // Titolo: <title>, og:title, o primo h1
  const titleFromOg = (html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/) ||
                       html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/))?.[1] || '';
  const titleFromH1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const titleFromTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const title = stripHtml(titleFromOg || titleFromH1 || titleFromTitle).split('|')[0].split('–')[0].trim();

  if (!title || title.length < MIN_TITLE_LENGTH) return null;

  // Contenuto principale: <article>, <main>, o <div class="entry-content|post-content|...">
  let contentHtml = '';
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch    = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const entryMatch   = html.match(/<div[^>]+class="[^"]*(?:entry-content|post-content|article-body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  contentHtml = (articleMatch || mainMatch || entryMatch || [])[1] || '';

  const content = htmlToMarkdown(contentHtml).trim();
  if (!content || content.length < MIN_CONTENT_LENGTH) return null;

  // Data: og:article:published_time, time[datetime], meta[itemprop=datePublished]
  const dateMatch =
    html.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/) ||
    html.match(/<time[^>]+datetime="([^"]+)"/) ||
    html.match(/<meta[^>]+itemprop="datePublished"[^>]+content="([^"]+)"/);
  const date = dateMatch ? dateMatch[1] : null;

  // Immagine: og:image
  const imageMatch =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/) ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
  const imageUrl = imageMatch ? imageMatch[1] : null;

  return { title, content, date, link: url, imageUrl };
}

// ── Supabase Storage: upload immagine ────────────────────────────────────────

async function ensureStorageBucket() {
  if (DRY_RUN) return;
  const url = `${SUPABASE_URL}/storage/v1/bucket`;
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ id: STORAGE_BUCKET, name: STORAGE_BUCKET, public: true }),
    });
    if (res.ok || res.status === 409) {
      // 409 = already exists → OK
      return;
    }
    const text = await res.text();
    warn(`Creazione bucket: ${res.status} ${text}`);
  } catch (e) {
    warn(`Errore creazione bucket: ${e.message}`);
  }
}

async function downloadImage(imageUrl) {
  if (!imageUrl || !isValidHttpsImageUrl(imageUrl)) return null;
  try {
    const res = await fetchWithTimeout(imageUrl);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, contentType };
  } catch (_) {
    return null;
  }
}

function imageExtFromContentType(ct) {
  if (!ct) return '.jpg';
  if (ct.includes('png'))  return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif'))  return '.gif';
  if (ct.includes('svg'))  return '.svg';
  return '.jpg';
}

async function uploadImageToStorage(imageUrl, postLink) {
  if (DRY_RUN) return `https://example.com/dry-run-image.jpg`;
  const img = await downloadImage(imageUrl);
  if (!img) return null;

  const ext      = imageExtFromContentType(img.contentType);
  const hash     = createHash('sha256').update(postLink || imageUrl).digest('hex').slice(0, 16);
  const filename = `imported-${hash}${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`;

  try {
    const res = await fetchWithTimeout(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type':  img.contentType,
        'x-upsert':      'true',
      },
      body: img.buffer,
    });

    if (!res.ok) {
      const text = await res.text();
      warn(`Upload immagine fallito (${res.status}): ${text.slice(0, 200)}`);
      return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
  } catch (e) {
    warn(`Errore upload immagine: ${e.message}`);
    return null;
  }
}

// ── Supabase DB: dedup e inserimento post ────────────────────────────────────

async function sourceUrlExists(sourceUrl) {
  const url = `${SUPABASE_URL}/rest/v1/posts?source_url=eq.${encodeURIComponent(sourceUrl)}&select=id&limit=1`;
  try {
    const res = await fetchWithTimeout(url, { headers: sbHeaders() });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (_) {
    return false;
  }
}

async function insertPost(payload) {
  if (DRY_RUN) {
    log('  [DRY RUN] Verrebbe inserito: ' + JSON.stringify({
      title: payload.title,
      category: payload.category,
      published_at: payload.published_at,
      source_url: payload.source_url,
      image_url: payload.image_url,
    }));
    return true;
  }

  const url = `${SUPABASE_URL}/rest/v1/posts`;
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify([payload]),
    });

    if (res.ok || res.status === 201) return true;

    // 409 = duplicate key su source_url → già importato
    if (res.status === 409) {
      warn(`  Già importato (409): ${payload.source_url}`);
      return false;
    }

    const text = await res.text();
    warn(`  Insert fallito (${res.status}): ${text.slice(0, 300)}`);
    return false;
  } catch (e) {
    warn(`  Errore insert: ${e.message}`);
    return false;
  }
}

// ── Entrypoint principale ────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════════════');
  log(' Import eventi: rivaltasulmincio.com → rivaltasulmincio.it');
  log('═══════════════════════════════════════════════════════════');
  log(`Sorgente: ${SOURCE_SITE_URL}`);
  log(`DRY_RUN:  ${DRY_RUN}`);
  log('');

  requireEnv();

  // 1. Recupera post/eventi dalla sorgente
  let rawPosts = [];
  let mode = 'unknown';

  log('Fase 1 — Rilevamento tipo sito...');
  const isWp = await detectWordPress();
  if (isWp) {
    log('  ✓ WordPress rilevato → uso REST API');
    mode = 'wordpress';
    rawPosts = await fetchWpPosts();
  } else {
    log('  ✗ WordPress non rilevato. Verifico Blogger...');
    const isBlogger = await detectBlogger();
    if (isBlogger) {
      log('  ✓ Blogger rilevato → uso JSON feed');
      mode = 'blogger';
      rawPosts = await fetchBloggerPosts();
    } else {
      log('  ✗ Né WordPress né Blogger → uso scraping HTML');
      mode = 'html-scrape';
      rawPosts = await fetchHtmlFallback();
    }
  }

  log(`\nFase 1 completata: ${rawPosts.length} post trovati (modalità: ${mode})`);

  if (!rawPosts.length) {
    log('\nNessun post da importare. Verifica che il sito sorgente sia raggiungibile.');
    process.exit(0);
  }

  // 2. Assicurati che il bucket Storage esista
  log('\nFase 2 — Verifica bucket Storage...');
  await ensureStorageBucket();
  log('  ✓ Bucket "post-images" pronto.');

  // 3. Per ogni post: upload immagine + insert DB
  log('\nFase 3 — Importazione post...');
  let imported = 0;
  let skipped  = 0;
  let errors   = 0;

  for (let i = 0; i < rawPosts.length; i++) {
    const raw = rawPosts[i];
    log(`\n[${i + 1}/${rawPosts.length}] "${raw.title.slice(0, 60)}"`);

    // Dedup: controlla se source_url è già nel DB
    if (!DRY_RUN && raw.link) {
      const exists = await sourceUrlExists(raw.link);
      if (exists) {
        log('  → Già presente (source_url duplicato). Skip.');
        skipped++;
        continue;
      }
    }

    // Upload immagine
    let storedImageUrl = null;
    if (raw.imageUrl) {
      log(`  Immagine: ${raw.imageUrl.slice(0, 80)}`);
      storedImageUrl = await uploadImageToStorage(raw.imageUrl, raw.link);
      if (storedImageUrl) {
        log(`  ✓ Upload: ${storedImageUrl.slice(0, 80)}`);
      } else {
        log('  ✗ Upload immagine fallito (il post sarà importato senza immagine).');
      }
    }

    // Normalizza contenuto: assicurati che rispetti i vincoli del trigger
    const title   = (raw.title || '').slice(0, MAX_TITLE_LENGTH).trim();
    let content   = (raw.content || title).trim();
    if (content.length < MIN_CONTENT_LENGTH) content = title;

    // Tronca titolo troppo corto/lungo
    if (title.length < MIN_TITLE_LENGTH) {
      warn('  Titolo troppo breve. Skip.');
      errors++;
      continue;
    }

    const publishedAt = raw.date ? new Date(raw.date).toISOString() : new Date().toISOString();

    const mappedCategory = (mode === 'blogger' && raw.labels) ? mapBloggerLabels(raw.labels) : IMPORT_CATEGORY;

    const payload = {
      title,
      content,
      category:        mappedCategory,
      badge_color:     'green',
      image_url:       storedImageUrl,
      image_type:      null,
      source_url:      raw.link || null,
      event_date:      raw.date ? new Date(raw.date).toISOString() : null,
      published:       true,
      published_at:    publishedAt,
      user_id:         IMPORT_ADMIN_USER_ID || null,
      author_username: AUTHOR_USERNAME,
    };

    const ok = await insertPost(payload);
    if (ok) imported++;
    else errors++;
  }

  // 4. Riepilogo
  log('\n═══════════════════════════════════════════════════════════');
  log(' Importazione completata');
  log('═══════════════════════════════════════════════════════════');
  log(`  Post trovati:    ${rawPosts.length}`);
  log(`  Importati:       ${imported}`);
  log(`  Già presenti:    ${skipped}`);
  log(`  Errori:          ${errors}`);
  if (DRY_RUN) log('\n  ⚠ DRY_RUN attivo — nessun dato scritto su DB o Storage.');
  log('');
}

main().catch(e => {
  err('Errore non gestito: ' + e.message);
  if (e.stack) err(e.stack);
  process.exit(1);
});
