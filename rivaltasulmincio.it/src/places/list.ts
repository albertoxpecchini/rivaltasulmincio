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

export function categoryHeading(category: PlaceCategory, count: number, level: 2 | 3 = 2): Html {
  const info = PLACE_CATEGORIES[category];
  const inner = html`${categoryMark(category, 18)} ${info.label} <span class="category-count tabular">${count}</span>`;
  return level === 2
    ? html`<h2 class="category-heading" id="${category}">${inner}</h2>`
    : html`<h3 class="category-heading" id="${category}">${inner}</h3>`;
}
