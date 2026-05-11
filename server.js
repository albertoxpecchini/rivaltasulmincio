const http = require('http');
const crypto = require('crypto');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const LOCAL_PORT = 2858;
const ROOT = path.resolve(__dirname);
const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const HTML_ASSET_VERSION_RE = /((?:href|src)=["'])(\/(?:partials\/[^"']+\.(?:css|js)|theme\.css))(?:\?[^"']*)?(["'])/gi;
const COMPRESSIBLE_TYPE_RE = /^(text\/|application\/(?:javascript|json)|image\/svg\+xml)/i;
const BROTLI_OPTIONS = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 4
  }
};

function getAssetVersion(assetPath) {
  const diskPath = path.join(ROOT, assetPath.replace(/^\//, ''));
  try {
    return Math.floor(fs.statSync(diskPath).mtimeMs).toString(36);
  } catch (_) {
    return '1';
  }
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
  if (process.env.NODE_ENV !== 'production') return 'no-store';

  if (isPage) {
    return 'public, max-age=0, must-revalidate';
  }

  const requestUrl = new URL(rawUrl || '/', 'http://localhost');
  if (requestUrl.searchParams.has('v')) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=86400, stale-while-revalidate=3600';
}

function compressBody(req, contentType, body) {
  const accepts = String(req.headers['accept-encoding'] || '');
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);

  if (!COMPRESSIBLE_TYPE_RE.test(contentType || '') || bytes.length < 1024) {
    return { body: bytes };
  }

  if (accepts.includes('br')) {
    return {
      body: zlib.brotliCompressSync(bytes, BROTLI_OPTIONS),
      encoding: 'br'
    };
  }

  if (accepts.includes('gzip')) {
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
  const p = path.join(ROOT, 'partials', `${resolvedName}.html`);
  try {
    return versionHtmlAssetUrls(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return `<!-- partial "${name}" not found -->`;
  }
}

function injectTopbarAssets(html) {
  if (!html.includes('data-rsm-topbar')) return html;

  let result = html;
  const hasTopbarCss = /<link[^>]+href=["'][^"']*\/partials\/topbar\.css(?:\?[^"']*)?["'][^>]*>/i.test(result);
  const hasTopbarJs = /<script[^>]+src=["'][^"']*\/partials\/topbar\.client\.js(?:\?[^"']*)?["'][^>]*><\/script>/i.test(result);
  const hasFontsApiPreconnect = /<link[^>]+href=["']https:\/\/fonts\.googleapis\.com["'][^>]*>/i.test(result);
  const hasFontsStaticPreconnect = /<link[^>]+href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>/i.test(result);
  const hasTopbarFonts = /<link[^>]+href=["'][^"']*family=Syne:wght@500;600;700;800&family=Space\+Grotesk:wght@400;500;600;700&display=swap["'][^>]*>/i.test(result);

  if (result.includes('</head>')) {
    const headInjections = [];

    if (!hasFontsApiPreconnect) {
      headInjections.push('  <link rel="preconnect" href="https://fonts.googleapis.com" />');
    }
    if (!hasFontsStaticPreconnect) {
      headInjections.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />');
    }
    if (!hasTopbarFonts) {
      headInjections.push('  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" />');
    }
    if (!hasTopbarCss) {
      headInjections.push(`  <link rel="stylesheet" href="${versionedAssetPath('/partials/topbar.css')}" />`);
    }

    if (headInjections.length) {
      result = result.replace('</head>', `${headInjections.join('\n')}\n</head>`);
    }
  }
  if (!hasTopbarJs && result.includes('</body>')) {
    result = result.replace('</body>', `  <script src="${versionedAssetPath('/partials/topbar.client.js')}" defer></script>\n</body>`);
  }
  return result;
}

function injectPartials(html) {
  const withPartials = versionHtmlAssetUrls(
    html.replace(/<!--PARTIAL:([a-zA-Z0-9_-]+)-->/g, (_, name) => loadPartial(name))
  );
  return injectTopbarAssets(withPartials);
}
const LEGACY_PAGE_SUFFIX = `.${'ht'}${'ml'}`;
const HTML_PAGES = new Set([
  'write',
  'reset',
  'profile',
  'preferenze',
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
  'storia'
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

  const filePath  = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const ext       = path.extname(filePath).toLowerCase();
  const isPage    = isHtmlPage(filePath);
  const cacheControl = getCacheControl(req.url, isPage);

  fs.readFile(filePath, isPage ? 'utf8' : null, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const body = isPage ? injectPartials(data) : data;
    const contentType = isPage ? HTML_CONTENT_TYPE : (MIME[ext] || 'application/octet-stream');
    const etag = createEntityTag(body);

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, {
        ...SECURITY_HEADERS,
        'Cache-Control': cacheControl,
        ETag: etag
      });
      res.end();
      return;
    }

    const compressed = compressBody(req, contentType, body);
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

    res.writeHead(200, headers);
    res.end(compressed.body);
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
