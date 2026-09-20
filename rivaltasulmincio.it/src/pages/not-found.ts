import type { PageResult } from '../app/page';
import { searchForm } from '../components/search';
import { html } from '../lib/html';

/** Pagina 404 (404.md): errore chiaro, recupero immediato, stesso stile dell'atlante. */
export function render(): PageResult {
  return {
    title: 'Pagina non trovata',
    description: 'Questa pagina non esiste oppure non è più disponibile.',
    robots: 'noindex',
    status: 404,
    main: html`<div class="not-found">
  <h1><span class="not-found__code">404</span> <span class="not-found__title">Pagina non trovata</span></h1>
  <p class="lead">Questa pagina non esiste oppure non è più disponibile.</p>
  <div class="button-group">
    <a class="button button--primary" href="/">Torna alla home</a>
    <a class="button button--secondary" href="/mappa">Esplora la mappa</a>
  </div>
  ${searchForm()}
</div>`,
  };
}
