const http = require('http');
const crypto = require('crypto');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// Supabase connection constants (same project used by supabase.config.js client-side)
const SUPABASE_PROJECT_URL = 'https://tljwxymcavgpzntksjtx.supabase.co';
const SUPABASE_ANON_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsand4eW1jYXZncHpudGtzanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODM2MzksImV4cCI6MjA5Mjg1OTYzOX0.4mLVUxTO2SGeVWDDn7Vw0NuSDB82T3v6IWO-BVlrzC0';

const ROOT = path.resolve(__dirname);
const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const HTML_ASSET_VERSION_RE = /((?:href|src)=["'])(\/(?:partials\/[^"']+\.(?:css|js)|rsm-bi\.css))(?:\?[^"']*)?(["'])/gi;
const COMPRESSIBLE_TYPE_RE = /^(text\/|application\/(?:javascript|json)|image\/svg\+xml)/i;
const BI_CSS_HREF = '/vendor/bootstrap-italia/css/bootstrap-italia.min.css';
const BI_JS_SRC = '/vendor/bootstrap-italia/js/bootstrap-italia.bundle.min.js';
const BI_FONTS_PATH = '/vendor/bootstrap-italia/fonts';
const RSM_CSS_HREF = '/rsm-bi.css';
const SUPABASE_SDK_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOCAL_PORT = Number(process.env.PORT || 2858);
const LONG_CACHE_TTL_MS = 5 * 60 * 1000;
const ASSET_VERSION_CACHE_TTL_MS = IS_PRODUCTION ? LONG_CACHE_TTL_MS : 1000;
const PARTIAL_CACHE_TTL_MS = IS_PRODUCTION ? LONG_CACHE_TTL_MS : 1000;
const RESPONSE_CACHE_TTL_MS = IS_PRODUCTION ? 30 * 1000 : 0;
const RESPONSE_CACHE_MAX_ENTRIES = 256;
const RESPONSE_CACHE_MAX_ENTRY_BYTES = 512 * 1024;
const RESPONSE_CACHE_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const BROTLI_OPTIONS = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 4
  }
};
const ASSET_VERSION_CACHE = new Map();
const PARTIAL_CACHE = new Map();
const RESPONSE_CACHE = new Map();
let responseCacheBytes = 0;

function cacheIsFresh(entry, ttlMs) {
  return Boolean(entry) && (Date.now() - entry.ts) < ttlMs;
}

function preferredEncoding(rawHeader) {
  const accepts = String(rawHeader || '');
  if (accepts.includes('br')) return 'br';
  if (accepts.includes('gzip')) return 'gzip';
  return 'identity';
}

function makeResponseCacheKey(rawUrl, encoding) {
  return JSON.stringify([rawUrl || '/', encoding]);
}

function isCacheableMethod(method) {
  return method === 'GET' || method === 'HEAD';
}

function getCachedResponse(key) {
  if (!RESPONSE_CACHE_TTL_MS) return null;
  const entry = RESPONSE_CACHE.get(key);
  if (!cacheIsFresh(entry, RESPONSE_CACHE_TTL_MS)) {
    if (entry) {
      responseCacheBytes -= Number(entry.body?.length || 0);
      RESPONSE_CACHE.delete(key);
    }
    return null;
  }
  return entry;
}

function setCachedResponse(key, payload) {
  if (!RESPONSE_CACHE_TTL_MS || !payload) return;
  const entryBytes = Number(payload.body?.length || 0);
  if (entryBytes > RESPONSE_CACHE_MAX_ENTRY_BYTES) return;

  const current = RESPONSE_CACHE.get(key);
  if (current) {
    responseCacheBytes -= Number(current.body?.length || 0);
  }

  RESPONSE_CACHE.set(key, { ...payload, ts: Date.now() });
  responseCacheBytes += entryBytes;

  while (
    RESPONSE_CACHE.size > RESPONSE_CACHE_MAX_ENTRIES ||
    responseCacheBytes > RESPONSE_CACHE_MAX_TOTAL_BYTES
  ) {
    const keys = RESPONSE_CACHE.keys();
    const oldest = keys.next();
    if (oldest.done) break;
    const stale = RESPONSE_CACHE.get(oldest.value);
    responseCacheBytes -= Number(stale?.body?.length || 0);
    RESPONSE_CACHE.delete(oldest.value);
  }
}

function matchesEtag(ifNoneMatchHeader, etag) {
  const header = String(ifNoneMatchHeader || '').trim();
  if (!header) return false;
  if (header === '*') return true;
  const normalize = (value) => {
    let token = String(value || '').trim();
    token = token.replace(/^W\//i, '').trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    return token;
  };
  const target = normalize(etag);
  return header.split(',').some(v => {
    const token = v.trim();
    return token === '*' || normalize(token) === target;
  });
}

function getAssetVersion(assetPath) {
  const cached = ASSET_VERSION_CACHE.get(assetPath);
  if (cacheIsFresh(cached, ASSET_VERSION_CACHE_TTL_MS)) {
    return cached.value;
  }
  const diskPath = path.join(ROOT, assetPath.replace(/^\//, ''));
  let version = '1';
  try {
    version = Math.floor(fs.statSync(diskPath).mtimeMs).toString(36);
  } catch (_) {}
  ASSET_VERSION_CACHE.set(assetPath, { value: version, ts: Date.now() });
  return version;
}

function versionedAssetPath(assetPath) {
  return `${assetPath}?v=${getAssetVersion(assetPath)}`;
}

function versionHtmlAssetUrls(html) {
  return html.replace(HTML_ASSET_VERSION_RE, (_, prefix, assetPath, suffix) => {
    return `${prefix}${versionedAssetPath(assetPath)}${suffix}`;
  });
}

function createEntityTag(body) {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const hash = crypto.createHash('sha1').update(bytes).digest('base64').replace(/[+/=]/g, '').slice(0, 16);
  return `W/"${hash}"`;
}

function getCacheControl(rawUrl, isPage) {
  if (!IS_PRODUCTION) return 'no-store';

  if (isPage) {
    return 'public, max-age=0, must-revalidate';
  }

  const requestUrl = new URL(rawUrl || '/', 'http://localhost');
  if (requestUrl.searchParams.has('v')) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=86400, stale-while-revalidate=3600';
}

function compressBody(contentType, body, encoding) {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);

  if (!COMPRESSIBLE_TYPE_RE.test(contentType || '') || bytes.length < 1024) {
    return { body: bytes };
  }

  if (encoding === 'br') {
    return {
      body: zlib.brotliCompressSync(bytes, BROTLI_OPTIONS),
      encoding: 'br'
    };
  }

  if (encoding === 'gzip') {
    return {
      body: zlib.gzipSync(bytes, { level: 6 }),
      encoding: 'gzip'
    };
  }

  return { body: bytes };
}

// ── Partial injection ──────────────────────────────────────────────────────
function loadPartial(name) {
  const resolvedName = name === 'footer'
    ? 'footbar'
    : (name === 'nav' ? 'topbar' : name);
  const cached = PARTIAL_CACHE.get(resolvedName);
  if (cacheIsFresh(cached, PARTIAL_CACHE_TTL_MS)) {
    return cached.value;
  }
  const p = path.join(ROOT, 'partials', `${resolvedName}.html`);
  let partial;
  try {
    partial = versionHtmlAssetUrls(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    partial = `<!-- partial "${name}" not found -->`;
  }
  PARTIAL_CACHE.set(resolvedName, { value: partial, ts: Date.now() });
  return partial;
}

function injectTopbarAssets(html) {
  if (!html.includes('data-rsm-topbar')) return html;

  let result = html;
  const hasBiCss = result.includes(BI_CSS_HREF);
  const hasRsmCss = result.includes(RSM_CSS_HREF);
  const hasBiJs = result.includes(BI_JS_SRC);
  const hasTopbarJs = /<script[^>]+src=["'][^"']*\/partials\/topbar\.client\.js(?:\?[^"']*)?["'][^>]*><\/script>/i.test(result);
  const hasSupabaseSdk = /<script[^>]+src=["'][^"']*supabase-js@2[^"']*["'][^>]*><\/script>/i.test(result);
  const hasSupabaseConfig = /<script[^>]+src=["'][^"']*supabase\.config\.js(?:\?[^"']*)?["'][^>]*><\/script>/i.test(result);

  if (result.includes('</head>')) {
    const headInjections = [];
    if (!hasBiCss) {
      headInjections.push(`  <link rel="stylesheet" href="${BI_CSS_HREF}" />`);
    }
    if (!hasRsmCss) {
      headInjections.push(`  <link rel="stylesheet" href="${versionedAssetPath(RSM_CSS_HREF)}" />`);
    }
    if (headInjections.length) {
      result = result.replace('</head>', `${headInjections.join('\n')}\n</head>`);
    }
  }

  if (result.includes('</body>')) {
    const bodyInjections = [];
    if (!hasBiJs) {
      bodyInjections.push(`  <script src="${BI_JS_SRC}"></script>`);
      bodyInjections.push(`  <script>if(window.bootstrap&&bootstrap.loadFonts)bootstrap.loadFonts('${BI_FONTS_PATH}');</script>`);
    }
    if (!hasSupabaseSdk) {
      bodyInjections.push(`  <script src="${SUPABASE_SDK_SRC}"></script>`);
    }
    if (!hasSupabaseConfig) {
      bodyInjections.push('  <script src="/supabase.config.js"></script>');
    }
    if (!hasTopbarJs) {
      bodyInjections.push(`  <script src="${versionedAssetPath('/partials/topbar.client.js')}"></script>`);
    }
    if (bodyInjections.length) {
      result = result.replace('</body>', `${bodyInjections.join('\n')}\n</body>`);
    }
  }
  return result;
}

function injectNewsletterModal(html) {
  // Inject the newsletter modal partial into every page that does not already include it.
  if (html.includes('id="newsletter-modal"')) return html;
  if (!html.includes('</body>')) return html;
  const modal = loadPartial('newsletter-modal');
  return html.replace('</body>', modal + '\n</body>');
}

function injectPartials(html) {
  const withPartials = versionHtmlAssetUrls(
    html.replace(/<!--PARTIAL:([a-zA-Z0-9_-]+)-->/g, (_, name) => loadPartial(name))
  );
  return injectNewsletterModal(injectTopbarAssets(withPartials));
}
const LEGACY_PAGE_SUFFIX = `.${'ht'}${'ml'}`;
const HTML_PAGES = new Set([
  'write',
  'reset',
  'profile',
  'post',
  'modifica-profilo',
  'dashboard',
  'login',
  'index',
  'category',
  'db-test',
  'privacy',
  'cookie',
  'note-legali',
  'storia',
  'origini'
]);
const MIME = {
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.gif':  'image/gif',
  '.mp4':  'video/mp4',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

let _changelogCache     = null;
let _changelogCacheTime = 0;
const CHANGELOG_TTL_MS  = 300_000; // 5 minuti

async function handleChangelog(req, res) {
  const now = Date.now();
  if (_changelogCache && now - _changelogCacheTime < CHANGELOG_TTL_MS) {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' });
    res.end(_changelogCache);
    return;
  }

  try {
    const REPO = 'albertoxpecchini/rivaltasulmincio';
    const UA   = { 'User-Agent': 'rivaltasulmincio-server/1.0' };

    const listRes = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=5`, { headers: UA });
    if (!listRes.ok) throw new Error(`gh-list ${listRes.status}`);
    const commits = await listRes.json();
    if (!Array.isArray(commits) || !commits[0]) throw new Error('no-commits');

    const recentCommits = commits.slice(0, 5);

    const detailEntries = await Promise.all(recentCommits.map(async (commit) => {
      try {
        const detailRes = await fetch(`https://api.github.com/repos/${REPO}/commits/${commit.sha}`, { headers: UA });
        if (!detailRes.ok) return [commit.sha, null];
        const detail = await detailRes.json();
        return [commit.sha, detail];
      } catch (_) {
        return [commit.sha, null];
      }
    }));
    const detailBySha = new Map(detailEntries);

    const c0     = commits[0];
    const sha    = c0.sha;
    const msg    = c0.commit.message.split('\n')[0];
    const author = c0.commit.author.name;
    const date   = c0.commit.author.date;
    const url    = c0.html_url;

    const detail = detailBySha.get(sha);
    if (!detail) throw new Error('gh-detail missing');
    const files  = detail.files  || [];
    const stats  = detail.stats  || {};

    let changes = [];
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

    if (ANTHROPIC_KEY && files.length) {
      const fileList = files.slice(0, 24).map(f =>
        `${f.status}: ${f.filename} (+${f.additions} -${f.deletions})`
      ).join('\n');

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Commit al sito rivaltasulmincio.it.\nMessaggio: ${msg}\nFile modificati:\n${fileList}\n\nScrivi 3-5 voci brevi in italiano (max 9 parole ciascuna) che descrivono cosa è cambiato. Rispondi SOLO con un array JSON di stringhe. Esempio: ["Aggiornato layout /storia", "Corretto bug nel menu"]`
          }]
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const text   = aiData.content?.[0]?.text || '';
        try {
          const match = text.match(/\[[\s\S]*\]/);
          changes = match ? JSON.parse(match[0]) : [];
        } catch (_) { changes = []; }
      }
    }

    if (!changes.length) {
      changes = files.slice(0, 5).map(f => {
        const name = f.filename.split('/').pop().replace(/\.[^/.]+$/, '') || f.filename;
        const act  = f.status === 'added' ? 'Aggiunto' : f.status === 'removed' ? 'Rimosso' : 'Aggiornato';
        return `${act}: ${name}`;
      });
    }
    if (!changes.length) changes = [msg || 'Aggiornamento sito'];

    const recent_commit_rows = recentCommits.map((c) => {
      const detailForCommit = detailBySha.get(c.sha);
      const detailFiles = Array.isArray(detailForCommit?.files) ? detailForCommit.files : [];
      return {
        sha: c.sha,
        short_sha: c.sha.slice(0, 7),
        message: (c.commit?.message || '').split('\n')[0] || 'Aggiornamento sito',
        author: c.commit?.author?.name || 'Autore sconosciuto',
        date: c.commit?.author?.date || null,
        url: c.html_url,
        files_changed: detailFiles.length,
        changed_files: detailFiles.slice(0, 6).map(f => f.filename)
      };
    });

    const payload = JSON.stringify({
      sha, message: msg, author, date, url,
      changes,
      files_changed: files.length,
      stats: { total: stats.total || 0, add: stats.additions || 0, del: stats.deletions || 0 },
      recent_commits: recent_commit_rows
    });

    _changelogCache     = payload;
    _changelogCacheTime = Date.now();

    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' });
    res.end(payload);

  } catch (e) {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ changes: ['Changelog non disponibile'], error: true }));
  }
}

// ── Keyword Wikipedia → Wikipedia title map ─────────────────────────────────
const KW_WIKI_TITLES = {
  'lago-di-garda':     'Lago di Garda',
  'ramsar':            'Convenzione di Ramsar',
  'natura-2000':       'Natura 2000',
  'mincio':            'Mincio',
  'zona-umida':        'Zona umida',
  'biodiversita':      'Biodiversità',
  'uccelli-acquatici': 'Uccelli acquatici',
  'airone-cenerino':   'Airone cenerino',
  'garzetta':          'Garzetta',
  'nitticora':         'Nitticora',
  'pianura-padana':    'Pianura Padana',
  'canneti':           'Phragmites australis',
  'fitodepurazione':   'Fitodepurazione',
  'eutrofizzazione':   'Eutrofizzazione',
  'canne-palustri':    'Phragmites australis',
  'arelle':            'Stuoia',
  'martin-pescatore':  'Alcedo atthis',
};

// In-memory cache: kwKey → { wiki, claude, ts }
const _kwContextCache = new Map();
const KW_CONTEXT_TTL  = 6 * 60 * 60 * 1000; // 6 ore

async function handleKwContext(req, res) {
  const url   = new URL(req.url, 'http://localhost');
  const kw    = (url.searchParams.get('kw') || '').slice(0, 60);
  const title = (url.searchParams.get('title') || '').slice(0, 80);

  if (!kw) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'missing kw' }));
    return;
  }

  // Serve dalla cache se fresca
  const cached = _kwContextCache.get(kw);
  if (cached && Date.now() - cached.ts < KW_CONTEXT_TTL) {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=21600' });
    res.end(JSON.stringify({ wiki: cached.wiki, claude: cached.claude }));
    return;
  }

  // ① Wikipedia IT – estratto
  let wikiExtract = '';
  const wikiTitle = KW_WIKI_TITLES[kw];
  if (wikiTitle) {
    try {
      const wRes = await fetch(
        `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
        { headers: { 'User-Agent': 'rivaltasulmincio/1.0 (info@prolocorivalta.mn.it)' } }
      );
      if (wRes.ok) {
        const wData = await wRes.json();
        const raw   = wData.extract || '';
        // Prima frase, troncata a 240 caratteri
        const sentences = raw.match(/[^.!?]+[.!?]+\s*/g) || [raw];
        const first = (sentences[0] || raw).trim();
        wikiExtract = first.length > 240 ? first.slice(0, 237) + '…' : first;
      }
    } catch (_) { /* Wikipedia irraggiungibile */ }
  }

  // ② Claude – frase contestuale a Rivalta
  let claudeSentence = '';
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (ANTHROPIC_KEY) {
    try {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 100,
          system: 'Sei una guida naturalistica delle Valli del Mincio (Rivalta sul Mincio, Mantova). Scrivi esattamente 1 frase breve, concreta e specifica (max 22 parole) che spiega perché questo concetto è importante per chi visita le Valli del Mincio o il borgo di Rivalta. Niente generalità. Solo la frase, in italiano.',
          messages: [{ role: 'user', content: `Concetto: ${title || kw}` }]
        })
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        claudeSentence = (aiData.content?.[0]?.text || '').trim();
      }
    } catch (_) { /* Claude irraggiungibile */ }
  }

  _kwContextCache.set(kw, { wiki: wikiExtract, claude: claudeSentence, ts: Date.now() });

  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=21600' });
  res.end(JSON.stringify({ wiki: wikiExtract, claude: claudeSentence }));
}

async function handleAiAutofill(req, res) {
  const GEMINI_KEY    = process.env.GEMINI_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const useGemini     = Boolean(GEMINI_KEY);

  if (!GEMINI_KEY && !ANTHROPIC_KEY) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Chiave API AI non configurata. Imposta GEMINI_API_KEY o ANTHROPIC_API_KEY nelle variabili ambiente Vercel.' }));
    return;
  }

  const MAX_AI_BODY = 8 * 1024 * 1024;
  let rawBody = '';
  try {
    await new Promise((resolve, reject) => {
      req.on('data', chunk => {
        rawBody += chunk;
        if (rawBody.length > MAX_AI_BODY) { req.destroy(); reject(new Error('payload-too-large')); }
      });
      req.on('end', resolve);
      req.on('error', reject);
    });
  } catch (e) {
    res.writeHead(413, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Payload troppo grande.' }));
    return;
  }

  let body;
  try { body = JSON.parse(rawBody); } catch (_) { body = {}; }

  const mode = body.mode === 'image' ? 'image' : 'text';

  const SYSTEM_PROMPT = `Sei un redattore esperto per il sito di notizie locali di Rivalta sul Mincio (MN), Italia, gestito dalla Pro Loco.
Analizza il contenuto fornito e restituisci SOLO un oggetto JSON valido (nessun testo extra, nessun markdown, nessun backtick).

Istruzioni per la qualità del testo:
- "title": titolo giornalistico preciso, max 90 caratteri, in italiano corretto
- "subtitle": sottotitolo evocativo o contestuale, max 140 caratteri, stile editoriale
- "excerpt": 1-2 frasi di introduzione accattivanti, max 260 caratteri, tono caldo e invitante
- "content": articolo completo in italiano elegante, minimo 120 parole. Struttura: apertura coinvolgente → cos'è → quando e dove → chi organizza → cosa aspettarsi → come partecipare → chiusura. Paragrafi separati da \\n\\n.
- "event_start_at": solo la data in formato YYYY-MM-DD (es. 2026-05-24), NON includere l'ora
- "event_end_at": solo la data in formato YYYY-MM-DD oppure null
- "event_time_text": orario come "15:15" o "10:00 – 23:00" o null (separato dalla data)

Schema JSON richiesto (rispetta esattamente i nomi):
{
  "title": "...",
  "subtitle": "... o null",
  "excerpt": "...",
  "content": "...",
  "category": "una di: Ambiente|Anniversari|Assemblea|Canoa|Ciclismo|Cultura|Enogastronomia|Eventi|Festa del Pesce|Iniziative|Love-luccio|Mincio-art|Natale|Natura|Rassegna Stampa|Sagre|Sport|Tesseramento|Turismo|Video",
  "tone": "narrativo|istituzionale|giornalistico|conviviale",
  "target_audience": "famiglie|bambini|giovani|turisti|escursionisti|appassionati_natura o null",
  "event_start_at": "YYYY-MM-DD o null",
  "event_end_at": "YYYY-MM-DD o null",
  "event_time_text": "HH:MM o HH:MM – HH:MM o null",
  "location_text": "nome luogo o null",
  "address_text": "indirizzo completo o null",
  "organizer": "ente organizzatore o null",
  "contacts": "telefono o email o null",
  "price_text": "Gratuito o €5 o null",
  "keywords": ["parola1","parola2","parola3"],
  "tags": ["tag1","tag2"]
}
Non inventare informazioni non presenti. Rispondi SOLO con il JSON.`;

  if ((mode === 'image' || mode === 'both') && !String(body.data || '')) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Immagine mancante.' }));
    return;
  }
  if ((mode === 'text' || mode === 'both') && !String(body.text || '').trim() && mode !== 'image') {
    // text is optional for 'both' if image is provided
  }
  if (mode === 'text' && !String(body.text || '').trim()) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Testo mancante.' }));
    return;
  }
  if (!['text','image','both'].includes(mode)) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'mode non valido.' }));
    return;
  }

  let raw = '';
  try {
    if (useGemini) {
      const parts = [];
      if (mode === 'image') {
        parts.push({ inline_data: { mime_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } });
        parts.push({ text: 'Analizza questo volantino ed estrai le informazioni.' });
      } else if (mode === 'both') {
        const txt = String(body.text || '').trim().slice(0, 4000);
        parts.push({ inline_data: { mime_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } });
        parts.push({ text: 'Analizza questa immagine' + (txt ? ' e usa il seguente testo come contesto aggiuntivo:\n"""\n' + txt + '\n"""' : '') + '. Estrai tutte le informazioni disponibili.' });
      } else {
        parts.push({ text: String(body.text || '').slice(0, 8000) });
      }
      const geminiAbort = new AbortController();
      const geminiTimeout = setTimeout(() => geminiAbort.abort(), 20000);
      let geminiRes;
      try {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: geminiAbort.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
              }
            })
          }
        );
      } finally {
        clearTimeout(geminiTimeout);
      }
      if (!geminiRes.ok) {
        const errText = await geminiRes.text().catch(() => '');
        console.error('[ai-autofill] Gemini error', geminiRes.status, errText);
        res.writeHead(502, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Errore Gemini (' + geminiRes.status + ').' }));
        return;
      }
      const geminiData = await geminiRes.json();
      const gParts = geminiData.candidates?.[0]?.content?.parts || [];
      const gTextPart = gParts.find(p => !p.thought && typeof p.text === 'string') || gParts[0] || {};
      raw = (gTextPart.text || '').trim();
      console.error('[ai-autofill] Gemini raw len=' + raw.length + ' parts=' + gParts.length);
    } else {
      let messages;
      if (mode === 'image') {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: String(body.mediaType || 'image/jpeg'), data: String(body.data || '').slice(0, MAX_AI_BODY) } },
            { type: 'text', text: 'Analizza questo volantino ed estrai le informazioni per compilare il post.' }
          ]
        }];
      } else {
        messages = [{ role: 'user', content: String(body.text || '').slice(0, 8000) }];
      }
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: SYSTEM_PROMPT, messages })
      });
      if (!claudeRes.ok) {
        const errText = await claudeRes.text().catch(() => '');
        console.error('[ai-autofill] Claude error', claudeRes.status, errText);
        res.writeHead(502, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Errore AI (' + claudeRes.status + ').' }));
        return;
      }
      const claudeData = await claudeRes.json();
      raw = (claudeData.content?.[0]?.text || '').trim();
    }
  } catch (e) {
    console.error('[ai-autofill]', e.name, e.message);
    if (e.name === 'AbortError') {
      res.writeHead(504, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Timeout: la richiesta AI ha impiegato troppo. Riprova.' }));
    } else {
      res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Errore interno del server.' }));
    }
    return;
  }

  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw;
  let parsed;
  try { parsed = JSON.parse(jsonStr); } catch (parseErr) {
    console.error('[ai-autofill] parse fail:', parseErr.message, '| raw[0..300]:', raw.slice(0, 300));
    res.writeHead(502, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Risposta AI non analizzabile. Prova con un testo più strutturato.' }));
    return;
  }

  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(parsed));
}

const MAX_REQUEST_BODY_SIZE = 4096; // bytes
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > MAX_REQUEST_BODY_SIZE) {
        req.destroy();
        reject(new Error('payload-too-large'));
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (_) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function isValidEmail(str) {
  return typeof str === 'string' &&
    str.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

async function handleNewsletterSubscribe(req, res) {
  let body;
  try { body = await readJsonBody(req); } catch (_) { body = {}; }

  const email = String(body.email || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Inserisci un indirizzo email valido.' }));
    return;
  }

  // Use the service role key when available (bypasses RLS), otherwise the anon key
  // (RLS policy allows INSERT for anon on newsletter_subscribers).
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  try {
    const sbRes = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify({ email, source: 'web' })
    });

    if (!sbRes.ok && sbRes.status !== 409) {
      const errText = await sbRes.text().catch(() => '');
      throw new Error(`supabase-${sbRes.status}: ${errText}`);
    }

    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error('[newsletter/subscribe]', e.message);
    res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Errore interno. Riprova tra poco.' }));
  }
}

async function handleNewsletterSend(req, res) {
  // Admin-only endpoint: requires NEWSLETTER_ADMIN_SECRET env var.
  // Sends a newsletter to all active subscribers via SMTP (SMTP_* env vars)
  // or via the Resend API (RESEND_API_KEY env var).
  const adminSecret = process.env.NEWSLETTER_ADMIN_SECRET;
  if (!adminSecret) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Newsletter send not configured (NEWSLETTER_ADMIN_SECRET missing).' }));
    return;
  }

  const authHeader = req.headers['authorization'] || '';
  if (authHeader !== `Bearer ${adminSecret}`) {
    res.writeHead(401, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Non autorizzato.' }));
    return;
  }

  let body;
  try { body = await readJsonBody(req); } catch (_) { body = {}; }

  const subject = String(body.subject || '').trim();
  const htmlContent = String(body.html || '').trim();
  const textContent = String(body.text || '').trim();

  if (!subject || (!htmlContent && !textContent)) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Fornisci subject e html (o text).' }));
    return;
  }

  // Fetch all active subscribers using service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY non configurata.' }));
    return;
  }

  let subscribers;
  try {
    const sbRes = await fetch(
      `${SUPABASE_PROJECT_URL}/rest/v1/newsletter_subscribers?is_active=eq.true&select=email`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    );
    if (!sbRes.ok) throw new Error(`supabase-${sbRes.status}`);
    subscribers = await sbRes.json();
  } catch (e) {
    console.error('[newsletter/send] fetch-subscribers', e.message);
    res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Impossibile recuperare gli iscritti.' }));
    return;
  }

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, sent: 0, message: 'Nessun iscritto attivo.' }));
    return;
  }

  const emails = subscribers.map(s => s.email).filter(Boolean);
  const fromName  = process.env.NEWSLETTER_FROM_NAME  || 'Pro Loco Rivalta sul Mincio';
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'info@prolocorivalta.mn.it';

  // Try Resend API first, then log error if not configured
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: false,
      error: 'Email provider non configurato. Imposta RESEND_API_KEY nelle variabili d\'ambiente.',
      subscribers: emails.length
    }));
    return;
  }

  // Send via Resend (https://resend.com) – free tier: 3,000 emails/month
  // BCC approach: each batch is sent as one API call with recipients in BCC
  // so each subscriber receives only their own address in headers.
  let sent = 0;
  const errors = [];
  // Send in batches of 50 to respect rate limits
  const BATCH = 50;
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH);
    try {
      const rRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          bcc: batch,
          to: fromEmail,
          subject,
          html: htmlContent || undefined,
          text: textContent || undefined
        })
      });
      if (rRes.ok) {
        sent += batch.length;
      } else {
        const errBody = await rRes.text().catch(() => '');
        errors.push(`batch-${i}: ${rRes.status} ${errBody}`);
      }
    } catch (e) {
      errors.push(`batch-${i}: ${e.message}`);
    }
  }

  const ok = errors.length === 0;
  res.writeHead(ok ? 200 : 207, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok, sent, errors: errors.length ? errors : undefined }));
}

async function handleScanPhoto(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    res.writeHead(401, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Non autorizzato.' }));
    return;
  }

  try {
    const verifyRes = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY }
    });
    if (!verifyRes.ok) {
      res.writeHead(401, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Sessione scaduta.' }));
      return;
    }
  } catch (_) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Errore di autenticazione.' }));
    return;
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    res.writeHead(503, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'AI non configurata (GEMINI_API_KEY mancante).' }));
    return;
  }

  let body;
  try { body = await readJsonBody(req); } catch (_) { body = {}; }
  const imageUrl = String(body.imageUrl || '').trim();
  if (!imageUrl || !imageUrl.startsWith('https://')) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'URL immagine non valido.' }));
    return;
  }

  let imageBase64, mimeType;
  try {
    const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': 'rivaltasulmincio-server/1.0' } });
    if (!imgRes.ok) throw new Error(`image-fetch-${imgRes.status}`);
    const ct = imgRes.headers.get('content-type') || 'image/jpeg';
    mimeType = ct.split(';')[0].trim();
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength > 10 * 1024 * 1024) throw new Error('Immagine troppo grande (max 10 MB).');
    imageBase64 = Buffer.from(buf).toString('base64');
  } catch (e) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Impossibile leggere l'immagine: " + e.message }));
    return;
  }

  const PROMPT = `Sei un redattore per il sito di notizie locali di Rivalta sul Mincio (MN), Italia.
Analizza questa immagine e restituisci ESCLUSIVAMENTE un oggetto JSON valido.
Non scrivere nulla prima o dopo il JSON. Non usare markdown o backtick.

Restituisci questo schema JSON (rispetta esattamente i nomi dei campi):
{
  "title": "titolo articolo in italiano, max 80 caratteri",
  "subtitle": "sottotitolo opzionale max 120 caratteri, oppure null",
  "excerpt": "riassunto 1-2 frasi, max 160 caratteri",
  "content": "testo articolo in italiano, minimo 80 parole",
  "category": "una tra: Ambiente|Assemblea|Ciclismo|Cultura|Enogastronomia|Eventi|Iniziative|Natura|Sagre|Sport|Turismo|Video",
  "tone": "una tra: narrativo|istituzionale|giornalistico|promozionale",
  "reading_level": "una tra: semplice|medio|approfondito",
  "target_audience": "una tra: famiglie|bambini|giovani|turisti|escursionisti|appassionati_natura oppure null",
  "location_text": "nome del luogo visibile nell'immagine oppure null",
  "address_text": "indirizzo completo se visibile oppure null",
  "organizer": "nome organizzatore se visibile oppure null",
  "event_start_at": "solo la data YYYY-MM-DD se visibile es. 2026-06-15 oppure null (NON includere l'ora)",
  "event_end_at": "solo la data YYYY-MM-DD fine evento se visibile oppure null",
  "event_time_text": "orario leggibile es. 10:00–23:00 oppure null",
  "contacts": "telefono o email se visibili oppure null",
  "price_text": "Gratuito oppure €5 oppure null",
  "booking_url": "URL prenotazione se visibile oppure null",
  "cta_text": "testo pulsante azione es. Scopri il programma oppure null",
  "cta_url": "URL azione se visibile oppure null",
  "keywords": ["parola1", "parola2", "parola3"],
  "tags": ["tag1", "tag2"]
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: PROMPT }
          ]}],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('[scan-photo] Gemini error', geminiRes.status, errText);
      res.writeHead(geminiRes.status >= 500 ? 503 : 400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `AI non disponibile (${geminiRes.status}).` }));
      return;
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('risposta AI non valida');
    const fields = JSON.parse(jsonMatch[0]);
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(fields));
  } catch (e) {
    console.error('[scan-photo]', e.message);
    res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Errore AI: ' + e.message }));
  }
}

function getSafeFilePath(rawUrl) {
  const requestPath = (rawUrl || '/').split('?')[0].split('#')[0] || '/';
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch (err) {
    return null;
  }
  const normalizedPath = path.normalize(decodedPath === '/' ? '/index' : decodedPath);
  const absolutePath = path.resolve(ROOT, '.' + normalizedPath);

  if (!isInsideRoot(absolutePath)) {
    return null;
  }

  return absolutePath;
}

function isInsideRoot(absolutePath) {
  const relativePath = path.relative(ROOT, absolutePath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function isHtmlPage(filePath) {
  return HTML_PAGES.has(path.basename(filePath).toLowerCase());
}

function getHtmlRedirect(rawUrl) {
  const requestUrl = new URL(rawUrl || '/', 'http://localhost');
  if (!requestUrl.pathname.toLowerCase().endsWith(LEGACY_PAGE_SUFFIX)) {
    return null;
  }

  requestUrl.pathname = requestUrl.pathname.slice(0, -5) || '/index';
  return requestUrl.pathname + requestUrl.search;
}

function handler(req, res) {
  const cleanUrl = getHtmlRedirect(req.url);
  if (cleanUrl) {
    res.writeHead(308, {
      ...SECURITY_HEADERS,
      Location: cleanUrl,
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }

  const requestPath = (req.url || '/').split('?')[0].split('#')[0];
  const requestPathLower = requestPath.toLowerCase();
  if (requestPathLower === '/index') {
    res.writeHead(308, {
      ...SECURITY_HEADERS,
      Location: '/',
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }

  if (requestPathLower === '/me') {
    res.writeHead(308, {
      ...SECURITY_HEADERS,
      Location: '/dashboard',
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }

  if (requestPathLower === '/dashboard' && requestPath !== '/dashboard') {
    res.writeHead(308, {
      ...SECURITY_HEADERS,
      Location: '/dashboard',
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && requestPathLower === '/api/changelog') {
    handleChangelog(req, res);
    return;
  }

  if (req.method === 'GET' && requestPathLower === '/api/kw-context') {
    handleKwContext(req, res);
    return;
  }

  if (req.method === 'GET' && requestPathLower === '/api/env-check') {
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({
      hasGemini: !!process.env.GEMINI_API_KEY,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'undefined'
    }));
    return;
  }

  if (req.method === 'POST' && requestPathLower === '/api/ai-autofill') {
    handleAiAutofill(req, res);
    return;
  }

  if (req.method === 'POST' && requestPathLower === '/api/newsletter/subscribe') {
    handleNewsletterSubscribe(req, res);
    return;
  }

  if (req.method === 'POST' && requestPathLower === '/api/newsletter/send') {
    handleNewsletterSend(req, res);
    return;
  }

  if (req.method === 'POST' && requestPathLower === '/api/ai/scan-photo') {
    handleScanPhoto(req, res);
    return;
  }

  const filePath  = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const ext       = path.extname(filePath).toLowerCase();
  const isPage    = isHtmlPage(filePath);
  const cacheControl = getCacheControl(req.url, isPage);
  const encoding = preferredEncoding(req.headers['accept-encoding']);
  const responseCacheKey = makeResponseCacheKey(req.url, encoding);

  if (isCacheableMethod(req.method)) {
    const cached = getCachedResponse(responseCacheKey);
    if (cached) {
      if (matchesEtag(req.headers['if-none-match'], cached.etag)) {
        res.writeHead(304, {
          ...SECURITY_HEADERS,
          'Cache-Control': cacheControl,
          ETag: cached.etag
        });
        res.end();
        return;
      }
      res.writeHead(cached.statusCode, cached.headers);
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(cached.body);
      }
      return;
    }
  }

  fs.readFile(filePath, isPage ? 'utf8' : null, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const body = isPage ? injectPartials(data) : data;
    const contentType = isPage ? HTML_CONTENT_TYPE : (MIME[ext] || 'application/octet-stream');
    const etag = createEntityTag(body);

    if (matchesEtag(req.headers['if-none-match'], etag)) {
      res.writeHead(304, {
        ...SECURITY_HEADERS,
        'Cache-Control': cacheControl,
        ETag: etag
      });
      res.end();
      return;
    }

    const compressed = compressBody(contentType, body, encoding);
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      ETag: etag,
      'Content-Length': String(compressed.body.length)
    };

    if (compressed.encoding) {
      headers['Content-Encoding'] = compressed.encoding;
      headers.Vary = 'Accept-Encoding';
    }

    if (isCacheableMethod(req.method)) {
      setCachedResponse(responseCacheKey, {
        statusCode: 200,
        headers: { ...headers },
        body: compressed.body,
        etag
      });
    }

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(compressed.body);
    }
  });
}

module.exports = handler;

// Avvio server locale solo se eseguito direttamente (non in Vercel serverless)
if (require.main === module) {
  http.createServer(handler).listen(LOCAL_PORT, () => {
    console.log(`Server avviato -> http://localhost:${LOCAL_PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${LOCAL_PORT} gia in uso. Chiudi il processo esistente.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}
