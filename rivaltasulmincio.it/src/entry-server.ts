/*
 * Entry lato server: usato dal plugin di sviluppo e dal prerender.
 * Espone solo funzioni pure: nessun accesso al DOM, nessun fetch.
 */
import { mapFeed } from './places/service';
import { buildSearchIndex } from './search/index';

export { render, renderNotFound } from './app/render';
export { allPaths as paths } from './app/router';
export { inject } from './app/template';

/** File JSON statici generati a build time e serviti al volo in sviluppo. */
export function feeds(): Record<string, unknown> {
  return {
    '/search-index.json': buildSearchIndex(),
    '/places.json': mapFeed(),
  };
}
