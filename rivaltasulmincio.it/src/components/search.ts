import { html, type Html } from '../lib/html';
import { icon } from './icons';

/**
 * Modulo di ricerca globale (STYLE.md «SEARCH»: come la ricerca di un IDE,
 * con il tasto rapido indicato solo su desktop). Il markup è reso dal server
 * per mantenere il layout stabile; il comportamento è in `src/search/client.ts`.
 */
export function searchForm(options: { id?: string } = {}): Html {
  const id = options.id ?? 'ricerca';
  return html`<form class="search" role="search" data-search action="" method="get">
  <label class="visually-hidden" for="${id}">Cerca</label>
  <div class="search__row">
    <div class="search__field">
      ${icon('search', 18)}
      <input class="search__input" id="${id}" name="q" type="search" placeholder="Cerca Rivalta sul Mincio" autocomplete="off" spellcheck="false" aria-describedby="${id}-aiuto" />
      <kbd class="kbd search__kbd" aria-hidden="true" data-search-kbd>Ctrl K</kbd>
    </div>
    <button class="button button--primary" type="submit">Cerca</button>
  </div>
  <p class="search__status mono" data-search-status aria-live="polite"></p>
  <ul class="search__results list-plain" data-search-results hidden></ul>
  <p class="caption" id="${id}-aiuto">Luoghi, fonti e articoli del giornale.</p>
  <noscript><p class="caption">La ricerca richiede JavaScript.</p></noscript>
</form>`;
}
