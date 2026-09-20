import type { PageResult } from '../app/page';
import { icon } from '../components/icons';
import { searchForm } from '../components/search';
import { html } from '../lib/html';

/** Pagina 404 (404.md): errore chiaro, recupero immediato, stesso stile dell'atlante; le coordinate vuote dicono «posizione non trovata». */
export function render(): PageResult {
  return {
    title: 'Pagina non trovata',
    description: 'Questa pagina non esiste oppure non è più disponibile.',
    robots: 'noindex',
    status: 404,
    main: html`<div class="not-found">
  <p class="not-found__coords">${icon('crosshair', 16)}<span>Lat —.—————</span><span>Lon —.—————</span><span>Posizione non trovata</span></p>
  <h1><span class="not-found__code display">404</span> <span class="not-found__title">Pagina non trovata</span></h1>
  <p class="lead">Questa pagina non esiste oppure non è più disponibile.</p>
  <div class="button-group">
    <a class="button button--primary" href="/">Torna alla home</a>
    <a class="button button--secondary" href="/mappa">Esplora la mappa ${icon('arrow-right', 16)}</a>
  </div>
  ${searchForm()}
</div>`,
  };
}
