import * as articolo from '../pages/articolo';
import * as fonti from '../pages/fonti';
import * as giornale from '../pages/giornale';
import * as home from '../pages/home';
import * as locandina from '../pages/locandina';
import * as luoghi from '../pages/luoghi';
import * as luogo from '../pages/luogo';
import * as mappa from '../pages/mappa';
import * as meteo from '../pages/meteo';
import type { PageModule, PageParams } from './page';

/*
 * Tabella delle rotte (FUNDAMENTA.md «PAGINE»). Si aggiunge una rotta solo
 * quando esiste contenuto reale da servire; le rotte con `:parametro`
 * dichiarano i propri percorsi tramite `paths()`.
 */
type Route = { pattern: string; page: PageModule };

export const routes: Route[] = [
  { pattern: '/', page: home },
  { pattern: '/giornale', page: giornale },
  { pattern: '/giornale/:year/:month/:slug', page: articolo },
  { pattern: '/giornale/:year/:month/:slug/locandina', page: locandina },
  { pattern: '/mappa', page: mappa },
  { pattern: '/luoghi', page: luoghi },
  { pattern: '/luoghi/:slug', page: luogo },
  { pattern: '/meteo', page: meteo },
  { pattern: '/fonti', page: fonti },
];

/** Percorso pulito: senza query, frammento, slash finale o `index.html`. */
export function normalizePath(url: string): string {
  let path = url.split('?')[0].split('#')[0];
  try {
    path = decodeURI(path);
  } catch {
    // percorso malformato: si prosegue con la stringa così com'è, finirà in 404
  }
  if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

export function match(path: string): { page: PageModule; params: PageParams } | null {
  const segments = split(path);
  for (const route of routes) {
    const params = matchPattern(split(route.pattern), segments);
    if (params) return { page: route.page, params };
  }
  return null;
}

/** Tutti i percorsi da generare a build time. */
export function allPaths(): string[] {
  return routes.flatMap((route) => {
    if (route.page.paths) return route.page.paths();
    return route.pattern.includes(':') ? [] : [route.pattern];
  });
}

function split(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function matchPattern(pattern: string[], segments: string[]): PageParams | null {
  if (pattern.length !== segments.length) return null;
  const params: PageParams = {};
  for (let i = 0; i < pattern.length; i++) {
    const expected = pattern[i];
    const actual = segments[i];
    if (expected.startsWith(':')) params[expected.slice(1)] = actual;
    else if (expected !== actual) return null;
  }
  return params;
}
