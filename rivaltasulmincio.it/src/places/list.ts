import { categoryMark } from '../components/map';
import { html, type Html } from '../lib/html';
import type { Place, PlaceCategory } from '../types';
import { formatAddress, placeLabel, placePath } from './service';
import { PLACE_CATEGORIES } from './taxonomy';

/** Elenco dei luoghi di una categoria: alternativa testuale alla mappa (OSM.md «Accessibilità»). */
export function placeList(places: Place[]): Html {
  return html`<ul class="place-list list-plain">
  ${places.map((place) => {
    const path = placePath(place);
    const label = placeLabel(place);
    return html`<li class="place-item">
    <span class="place-item__name">${path ? html`<a href="${path}">${label}</a>` : label}</span>
    <span class="place-item__meta">${place.kind}${formatAddress(place.address) ? html` · ${formatAddress(place.address)}` : ''}</span>
  </li>`;
  })}
</ul>`;
}

export function categoryHeading(category: PlaceCategory, count: number): Html {
  return html`<h2 class="category-heading" id="${category}">${categoryLine(category, count)}</h2>`;
}

/** Contrassegno, etichetta e conteggio di una categoria: per link ed elenchi, non è un titolo. */
export function categoryLine(category: PlaceCategory, count: number): Html {
  const info = PLACE_CATEGORIES[category];
  return html`<span class="category-line">${categoryMark(category, 18)} ${info.label} <span class="category-count tabular">${count}</span></span>`;
}
