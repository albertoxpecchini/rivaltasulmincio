/**
 * update-post-categories.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggiorna le categorie dei post importati da rivaltasulmincio.com leggendo
 * le label Blogger e applicando il mapping canonico.
 *
 * PREREQUISITI
 *   Post già importati con source_url valorizzato (usato come chiave di match).
 *
 * VARIABILI D'AMBIENTE RICHIESTE
 *   SUPABASE_URL              URL del progetto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY Chiave service role (necessaria per PATCH)
 *
 * VARIABILI D'AMBIENTE OPZIONALI
 *   SUPABASE_ANON_KEY  Chiave anon (usata per SELECT in sola lettura)
 *   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY Alias accettati
 *   SOURCE_SITE_URL  Default: https://www.rivaltasulmincio.com
 *   DRY_RUN          Se '1', stampa le modifiche senza applicarle
 *   MAX_POSTS        Limite massimo post (default: 1000)
 *
 * UTILIZZO
 *   DRY_RUN=1 node scripts/update-post-categories.mjs
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... DRY_RUN=1 node scripts/update-post-categories.mjs
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/update-post-categories.mjs
 */

// ── Configurazione ──────────────────────────────────────────────────────────

const SOURCE_SITE_URL      = (process.env.SOURCE_SITE_URL || 'https://www.rivaltasulmincio.com').replace(/\/$/, '');
const SUPABASE_URL         = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ANON_KEY    = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const DRY_RUN              = String(process.env.DRY_RUN || '0') === '1';
const MAX_POSTS            = Math.max(1, parseInt(process.env.MAX_POSTS || '1000', 10));
const FETCH_TIMEOUT_MS     = 15_000;
const HAS_SERVICE_KEY      = Boolean(SUPABASE_SERVICE_KEY);
const HAS_ANON_KEY         = Boolean(SUPABASE_ANON_KEY);
const PREVIEW_ONLY_MODE    = DRY_RUN || !HAS_SERVICE_KEY;

// ── Mapping label Blogger → categoria canonica ───────────────────────────────

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

const BADGE_COLOR_BY_CATEGORY = {
  'Ambiente':        'default',
  'Anniversari':     'green',
  'Assemblea':       'default',
  'Canoa':           'green',
  'Ciclismo':        'default',
  'Festa del Pesce': 'green',
  'Iniziative':      'green',
  'Love-luccio':     'green',
  'Mincio-art':      'default',
  'Natale':          'green',
  'Rassegna Stampa': 'default',
  'Tesseramento':    'default',
  'Video':           'default',
};

function mapBloggerLabels(labels) {
  if (!Array.isArray(labels) || !labels.length) return 'Iniziative';
  for (const label of labels) {
    const mapped = BLOGGER_LABEL_MAP[String(label).toLowerCase().trim()];
    if (mapped) return mapped;
  }
  return 'Iniziative';
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(msg + '\n'); }
function warn(msg) { process.stderr.write('[WARN] ' + msg + '\n'); }
function err(msg)  { process.stderr.write('[ERROR] ' + msg + '\n'); }

function requireEnv() {
  const missing = [];
  if (!SUPABASE_URL)         missing.push('SUPABASE_URL');
  if (!HAS_SERVICE_KEY && !HAS_ANON_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY oppure SUPABASE_ANON_KEY');
  }
  if (missing.length) {
    err('Variabili d\'ambiente mancanti: ' + missing.join(', '));
    process.exit(1);
  }

  if (DRY_RUN) {
    log('Modalità DRY RUN attiva – nessuna scrittura su DB.');
  }

  if (!HAS_SERVICE_KEY) {
    warn('SUPABASE_SERVICE_ROLE_KEY non impostata: esecuzione in sola anteprima (nessun PATCH).');
  }
}

function sbReadHeaders() {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  return {
    'apikey':        key,
    'Authorization': `Bearer ${key}`,
    'Content-Type':  'application/json',
  };
}

function sbWriteHeaders() {
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

async function readSupabaseError(res) {
  const text = await res.text();
  if (!text) return '(corpo risposta vuoto)';
  try {
    const data = JSON.parse(text);
    if (data && typeof data === 'object') {
      const parts = [];
      if (data.code) parts.push(`code=${data.code}`);
      if (data.message) parts.push(`message=${data.message}`);
      if (data.hint) parts.push(`hint=${data.hint}`);
      if (data.details) parts.push(`details=${data.details}`);
      if (parts.length) return parts.join(' | ');
    }
  } catch (_) {
    // Non JSON: restituisci testo grezzo troncato.
  }
  return text.slice(0, 300);
}

// ── Fetch post da Supabase con source_url ─────────────────────────────────────

async function fetchAllImportedPosts() {
  const allPosts = [];
  const pageSize = 500;
  let offset = 0;

  log('Recupero post importati da Supabase...');

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/posts?source_url=not.is.null&select=id,source_url,category&limit=${pageSize}&offset=${offset}`;
    let res;
    try {
      res = await fetchWithTimeout(url, { headers: sbReadHeaders() });
    } catch (e) {
      throw new Error(`Errore rete su SELECT posts (offset=${offset}): ${e.message}`);
    }
    if (!res.ok) {
      const details = await readSupabaseError(res);
      throw new Error(`SELECT posts fallita (${res.status}): ${details}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) break;
    allPosts.push(...data);
    log(`  Recuperati ${allPosts.length} post finora...`);
    if (data.length < pageSize) break;
    offset += pageSize;
    if (allPosts.length >= MAX_POSTS) break;
  }

  log(`  Totale post importati trovati: ${allPosts.length}`);
  return allPosts;
}

// ── Fetch feed Blogger completo ───────────────────────────────────────────────

async function fetchBloggerFeed() {
  const entries = [];
  const maxPerPage = 150;
  let startIndex = 1;
  let totalResults = Infinity;

  log(`\nRecupero feed Blogger: ${SOURCE_SITE_URL}/feeds/posts/default`);

  while (entries.length < MAX_POSTS && startIndex <= totalResults) {
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
      log(`  Totale post nel feed Blogger: ${totalResults}`);
    }
    const batch = data.feed?.entry || [];
    if (!batch.length) break;
    entries.push(...batch);
    log(`  start-index ${startIndex}: ${batch.length} voci (totale: ${entries.length})`);
    startIndex += maxPerPage;
  }

  return entries;
}

// ── Costruisce mappa source_url → labels ──────────────────────────────────────

function buildLabelMap(bloggerEntries) {
  const map = new Map();
  for (const entry of bloggerEntries) {
    const altLink = entry.link?.find(l => l.rel === 'alternate');
    const url = altLink?.href || '';
    if (!url) continue;
    const labels = Array.isArray(entry.category)
      ? entry.category.map(c => c.term || '').filter(Boolean)
      : [];
    map.set(url, labels);
    // Normalizza anche senza trailing slash
    const trimmed = url.replace(/\/$/, '');
    if (trimmed !== url) map.set(trimmed, labels);
  }
  return map;
}

// ── Update su Supabase ────────────────────────────────────────────────────────

async function updatePostCategory(id, category, badge_color) {
  if (PREVIEW_ONLY_MODE) return true;
  const url = `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}`;
  try {
    const res = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: { ...sbWriteHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ category, badge_color }),
    });
    if (res.ok || res.status === 204) return true;
    const details = await readSupabaseError(res);
    warn(`  PATCH fallito per id=${id} (${res.status}): ${details}`);
    return false;
  } catch (e) {
    warn(`  Errore PATCH per id=${id}: ${e.message}`);
    return false;
  }
}

// ── Entrypoint principale ─────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════════════');
  log(' Update categorie post: Blogger labels → categorie canoniche');
  log('═══════════════════════════════════════════════════════════');
  log(`Sorgente: ${SOURCE_SITE_URL}`);
  log(`DRY_RUN:  ${DRY_RUN}`);
  log(`WRITE:    ${PREVIEW_ONLY_MODE ? 'no (anteprima)' : 'yes (PATCH abilitato)'}`);
  log('');

  requireEnv();

  // 1. Recupera post importati da Supabase
  const importedPosts = await fetchAllImportedPosts();
  if (!importedPosts.length) {
    log('\nNessun post importato trovato. Verifica che i post abbiano source_url.');
    process.exit(0);
  }

  // 2. Recupera feed Blogger
  const bloggerEntries = await fetchBloggerFeed();
  if (!bloggerEntries.length) {
    log('\nNessuna voce trovata nel feed Blogger. Verifica la raggiungibilità del sito.');
    process.exit(0);
  }

  // 3. Costruisci mappa source_url → labels
  const labelMap = buildLabelMap(bloggerEntries);
  log(`\nMappa costruita: ${labelMap.size} URL con labels.`);

  // 4. Aggiorna categorie
  log('\nAggiornamento categorie...\n');
  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const post of importedPosts) {
    const sourceUrl = post.source_url;
    const labels = labelMap.get(sourceUrl) || labelMap.get(sourceUrl?.replace(/\/$/, ''));

    if (!labels) {
      log(`  [no-match] ${sourceUrl?.slice(0, 80)}`);
      noMatch++;
      continue;
    }

    const newCategory = mapBloggerLabels(labels);
    const newBadgeColor = BADGE_COLOR_BY_CATEGORY[newCategory] || 'default';

    if (post.category === newCategory) {
      skipped++;
      continue;
    }

    log(`  [update] "${newCategory}" ← [${labels.join(', ')}]`);
    log(`           ${sourceUrl?.slice(0, 80)}`);

    if (PREVIEW_ONLY_MODE) {
      log(`           [preview] categoria: ${post.category} → ${newCategory}`);
      updated++;
      continue;
    }

    const ok = await updatePostCategory(post.id, newCategory, newBadgeColor);
    if (ok) updated++;
  }

  // 5. Riepilogo
  log('\n═══════════════════════════════════════════════════════════');
  log(' Completato');
  log('═══════════════════════════════════════════════════════════');
  log(`  Post controllati:  ${importedPosts.length}`);
  log(`  ${PREVIEW_ONLY_MODE ? 'Da aggiornare:' : 'Aggiornati:'}        ${updated}`);
  log(`  Già corretti:      ${skipped}`);
  log(`  Senza match URL:   ${noMatch}`);
  if (PREVIEW_ONLY_MODE) {
    log('\n  ⚠ Modalità anteprima: nessun dato scritto su DB.');
    if (!HAS_SERVICE_KEY) {
      log('    Per abilitare PATCH imposta SUPABASE_SERVICE_ROLE_KEY.');
    }
  }
  log('');
}

main().catch(e => {
  err('Errore fatale: ' + e.message);
  process.exit(1);
});
