import type { LatLng } from '../lib/geo';
import { formatCoordinates } from '../lib/geo';
import { html, type Html } from '../lib/html';
import { PLACE_CATEGORIES } from '../places/taxonomy';
import type { PlaceCategory } from '../types';
import { icon } from './icons';

/*
 * Markup della mappa reso dal server. Il comportamento è in `src/map/mount.ts`,
 * caricato solo quando la mappa entra nel viewport.
 */

export type CategoryFilter = { category: PlaceCategory; count: number };

export function mapBlock(options: {
  id: string;
  mode: 'full' | 'embed';
  center: LatLng;
  zoom: number;
  label: string;
  filters?: CategoryFilter[];
  updatedAt?: string;
}): Html {
  const { id, mode } = options;
  const canvas = html`<div class="map-canvas map-canvas--${mode}" id="${id}" data-map="${mode}" data-center="${options.center.lat},${options.center.lng}" data-zoom="${options.zoom}" data-feed="/places.json" data-status="#${id}-stato"${mode === 'full' ? html` data-panel="#${id}-pannello" data-filters="#${id}-filtri"` : ''} role="region" aria-label="${options.label}">
  <p class="map-canvas__fallback">La mappa interattiva richiede JavaScript. <a href="/luoghi">Elenco dei luoghi</a></p>
</div>`;

  return html`<div class="map-block map-block--${mode}">
  ${options.filters ? filterForm(id, options.filters) : ''}
  <div class="map-layout">
    ${canvas}
    ${
      mode === 'full'
        ? html`<aside class="map-panel" id="${id}-pannello" aria-labelledby="${id}-pannello-titolo" aria-live="polite">
      <h2 class="visually-hidden" id="${id}-pannello-titolo">Luogo selezionato</h2>
      <p class="map-panel__empty">Seleziona un luogo sulla mappa.</p>
    </aside>`
        : ''
    }
  </div>
  <p class="map-block__foot caption"><span id="${id}-stato" data-map-status></span>${
    options.updatedAt ? html`<span>Dati OpenStreetMap al ${options.updatedAt}</span>` : ''
  }<span>© OpenStreetMap contributors, ODbL</span></p>
</div>`;
}

/** Mappa di un singolo luogo, con le coordinate scritte accanto per chi non la vede. */
export function singleMap(options: { id: string; center: LatLng; label: string }): Html {
  return html`<div class="map-block map-block--single">
  <div class="map-canvas map-canvas--single" id="${options.id}" data-map="single" data-center="${options.center.lat},${options.center.lng}" data-label="${options.label}" role="region" aria-label="Posizione: ${options.label}">
    <p class="map-canvas__fallback">Coordinate: <span class="tabular">${formatCoordinates(options.center)}</span></p>
  </div>
  <p class="map-block__foot caption"><span>© OpenStreetMap contributors, ODbL</span></p>
</div>`;
}

function filterForm(id: string, filters: CategoryFilter[]): Html {
  return html`<details class="map-filters">
  <summary>${icon('sliders-horizontal', 18)} Filtra per categoria</summary>
  <form class="map-filters__form" id="${id}-filtri">
    <fieldset>
      <legend class="visually-hidden">Categorie visibili sulla mappa</legend>
      ${filters.map(
        (filter) => html`<label class="map-filters__option">
        <input type="checkbox" name="categoria" value="${filter.category}" checked />
        <span class="category-mark" data-category="${filter.category}">${icon(PLACE_CATEGORIES[filter.category].icon, 14)}</span>
        <span>${PLACE_CATEGORIES[filter.category].label}</span>
        <span class="map-filters__count tabular">${filter.count}</span>
      </label>`,
      )}
    </fieldset>
  </form>
</details>`;
}

/** Contrassegno di categoria (icona nel colore della categoria), per elenchi e intestazioni. */
export function categoryMark(category: PlaceCategory, size = 16): Html {
  return html`<span class="category-mark" data-category="${category}">${icon(PLACE_CATEGORIES[category].icon, size)}</span>`;
}
