const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) ||3001;
const ROOT = path.resolve(__dirname);
const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

// ── Partial injection ──────────────────────────────────────────────────────
const _partialCache = Object.create(null);

// footer: estratto live dal file index (fonte della verità).
// Gli altri partial vengono letti da partials/<name>.html.
function loadPartial(name) {
  if (name === 'footer') return extractFooterFromIndex();
  if (!(name in _partialCache)) {
    const p = path.join(ROOT, 'partials', `${name}.html`);
    try {
      _partialCache[name] = fs.readFileSync(p, 'utf8');
    } catch (_) {
      _partialCache[name] = `<!-- partial "${name}" not found -->`;
    }
  }
  return _partialCache[name];
}

let _footerCache = null;
function extractFooterFromIndex() {
  if (!_footerCache) {
    try {
      const src = fs.readFileSync(path.join(ROOT, 'index'), 'utf8');
      // Estrai <footer ...>...</footer> + eventuale <script> anno
      const m = src.match(/<footer\b[\s\S]*?<\/footer>\s*(?:<script>[^<]*year[^<]*<\/script>)?/);
      _footerCache = m ? m[0].trim() : '<!-- footer not found -->';
    } catch (_) {
      _footerCache = '<!-- footer not found -->';
    }
  }
  return _footerCache;
}

function injectPartials(html) {
  return html.replace(/<!--PARTIAL:([a-zA-Z0-9_-]+)-->/g, (_, name) => loadPartial(name));
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
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
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

  const filePath  = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const ext       = path.extname(filePath).toLowerCase();
  const isPage    = isHtmlPage(filePath);
  const cacheControl = process.env.NODE_ENV === 'production'
    ? (isPage ? 'no-store' : 'public, max-age=86400')
    : 'no-store';

  fs.readFile(filePath, isPage ? 'utf8' : null, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const body = isPage ? injectPartials(data) : data;
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': isPage ? HTML_CONTENT_TYPE : (MIME[ext] || 'application/octet-stream'),
      'Cache-Control': cacheControl
    });
    res.end(body);
  });
}

module.exports = handler;

// Avvio server locale solo se eseguito direttamente (non in Vercel serverless)
if (require.main === module) {
  http.createServer(handler).listen(PORT, () => {
    console.log(`Server avviato -> http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${PORT} gia in uso. Chiudi il processo esistente o usa una porta diversa con PORT=<numero>.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}
