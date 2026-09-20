import fs from 'node:fs';
import path from 'node:path';
import type { ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

type EntryServer = typeof import('../src/entry-server');

const ENTRY = '/src/entry-server.ts';
const NOT_FOUND_URL = '/404';

/**
 * Plugin di sviluppo e anteprima.
 *
 * - dev: ogni richiesta HTML viene resa con `src/entry-server.ts`
 *   (stesso codice del prerender), l'indice di ricerca viene generato al volo;
 * - preview: riproduce l'hosting statico: `/fonti` → `fonti/index.html`,
 *   percorsi inesistenti → `404.html` con stato 404.
 *
 * Un URL malformato (percent-encoding incompleto) non deve mai rompere la
 * pagina (404.md): in entrambi i casi risponde la pagina 404.
 */
export function atlante(): Plugin {
  return {
    name: 'atlante:ssg',

    configureServer(server) {
      const renderPage = async (res: ServerResponse, url: string): Promise<void> => {
        const entry = (await server.ssrLoadModule(ENTRY)) as EntryServer;
        const templatePath = path.resolve(server.config.root, 'index.html');
        const template = await server.transformIndexHtml(url, fs.readFileSync(templatePath, 'utf8'));
        const page = entry.render(url);
        sendHtml(res, page.status, entry.inject(template, page));
      };

      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = requestPath(req.originalUrl ?? req.url);
          try {
            if (url.endsWith('.json')) {
              const entry = (await server.ssrLoadModule(ENTRY)) as EntryServer;
              const feeds = entry.feeds();
              if (url in feeds) {
                sendJson(res, feeds[url]);
                return;
              }
            }
            if (!wantsHtml(req.headers.accept)) return next();
            await renderPage(res, isDecodable(url) ? url : NOT_FOUND_URL);
          } catch (error) {
            if (error instanceof URIError) {
              renderPage(res, NOT_FOUND_URL).catch(next);
              return;
            }
            if (error instanceof Error) server.ssrFixStacktrace(error);
            next(error);
          }
        });
      };
    },

    configurePreviewServer(server) {
      const outDir = path.resolve(server.config.root, server.config.build.outDir);
      return () => {
        server.middlewares.use((req, res, next) => {
          if (!wantsHtml(req.headers.accept)) return next();
          const page = staticPage(outDir, requestPath(req.originalUrl ?? req.url));
          if (page) {
            sendHtml(res, 200, fs.readFileSync(page, 'utf8'));
            return;
          }
          const notFound = path.join(outDir, '404.html');
          if (!fs.existsSync(notFound)) return next();
          sendHtml(res, 404, fs.readFileSync(notFound, 'utf8'));
        });
      };
    },
  };
}

function requestPath(url: string | undefined): string {
  return (url ?? '/').split('?')[0];
}

/** `decodeURIComponent` è la decodifica usata da Vite: è quella che deve riuscire. */
function isDecodable(url: string): boolean {
  try {
    decodeURIComponent(url);
    return true;
  } catch {
    return false;
  }
}

/** Come l'hosting statico: `/` → `index.html`, `/fonti` o `/fonti/` → `fonti/index.html`. */
function staticPage(outDir: string, url: string): string | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(url);
  } catch {
    return null;
  }
  pathname = pathname.replace(/\/+$/, '') || '/';
  if (pathname.includes('..')) return null;
  const file = path.join(outDir, pathname === '/' ? 'index.html' : path.join(pathname, 'index.html'));
  return fs.existsSync(file) ? file : null;
}

function wantsHtml(accept: string | undefined): boolean {
  return typeof accept === 'string' && accept.includes('text/html');
}

function sendHtml(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body);
}

function sendJson(res: ServerResponse, data: unknown): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}
