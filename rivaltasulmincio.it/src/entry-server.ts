/*
 * Entry lato server: usato dal plugin di sviluppo e dal prerender.
 * Espone solo funzioni pure: nessun accesso al DOM, nessun fetch.
 */
export { render, renderNotFound } from './app/render';
export { allPaths as paths } from './app/router';
export { inject } from './app/template';
export { buildSearchIndex as searchIndex } from './search/index';
