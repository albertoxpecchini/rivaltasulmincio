const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.resolve(__dirname);
const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const LEGACY_PAGE_SUFFIX = `.${'ht'}${'ml'}`;
const HTML_PAGES = new Set([
  'write',
  'reset',
  'profile',
  'preferenze',
  'post',
  'modifica-profilo',
  'me',
  'login',
  'index',
  'category',
  'db-test',
  'privacy',
  'cookie',
  'note-legali'
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
  return HTML_PAGES.has(path.basename(filePath));
}

function getHtmlRedirect(rawUrl) {
  const requestUrl = new URL(rawUrl || '/', 'http://localhost');
  if (!requestUrl.pathname.toLowerCase().endsWith(LEGACY_PAGE_SUFFIX)) {
    return null;
  }

  requestUrl.pathname = requestUrl.pathname.slice(0, -5) || '/index';
  return requestUrl.pathname + requestUrl.search;
}

http.createServer((req, res) => {
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

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': isPage ? HTML_CONTENT_TYPE : (MIME[ext] || 'application/octet-stream'),
      'Cache-Control': cacheControl
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server avviato -> http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} gia in uso. Chiudi il processo esistente o usa una porta diversa con PORT=<numero>.`);
    process.exit(1);
  } else {
    throw err;
  }
});
