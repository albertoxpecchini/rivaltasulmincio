import { html, type Html } from '../lib/html';

/**
 * Modulo di ricerca globale. Il markup è reso dal server per mantenere il
 * layout stabile; il comportamento è in `src/search/client.ts`.
 */
export function searchForm(options: { id?: string } = {}): Html {
  const id = options.id ?? 'ricerca';
  return html`<form class="search" role="search" data-search action="" method="get">
  <label class="label" for="${id}">Cerca</label>
  <div class="search__row">
    <input class="search__input" id="${id}" name="q" type="search" placeholder="Cerca Rivalta sul Mincio" autocomplete="off" spellcheck="false" aria-describedby="${id}-aiuto" />
    <button class="button button--primary" type="submit">Cerca</button>
  </div>
  <p class="search__status" data-search-status aria-live="polite"></p>
  <ul class="search__results list-plain" data-search-results hidden></ul>
  <p class="caption" id="${id}-aiuto">Fonti e articoli del giornale.</p>
  <noscript><p class="caption">La ricerca richiede JavaScript.</p></noscript>
</form>`;
}
