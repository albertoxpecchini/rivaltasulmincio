const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.resolve(__dirname);
const MIME = {
  '.html': 'text/html; charset=utf-8',
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
  const normalizedPath = path.normalize(decodedPath === '/' ? '/index.html' : decodedPath);
  const absolutePath = path.resolve(ROOT, '.' + normalizedPath);

  if (!absolutePath.startsWith(ROOT)) {
    return null;
  }

  return absolutePath;
}

http.createServer((req, res) => {
  const filePath  = getSafeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const ext       = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=86400'
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server avviato → http://localhost:${PORT}`);
});
