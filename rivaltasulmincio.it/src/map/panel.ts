import { iconMarkup } from '../components/icons';
import { categoryLabel } from '../places/taxonomy';
import type { MapPlace } from '../types';

/*
 * Pannello del luogo selezionato (STYLE.md «Pagine dettaglio», OSM.md «Schede»).
 * Costruito con il DOM, mai con HTML interpolato: i testi vengono dai dati.
 */
export function renderPanel(panel: HTMLElement, place: MapPlace | null): void {
  panel.replaceChildren();
  if (!place) {
    panel.append(el('p', { class: 'map-panel__empty' }, 'Seleziona un luogo sulla mappa.'));
    return;
  }

  const label = place.name ?? (place.street ? `${place.kind} · ${place.street}` : place.kind);
  panel.append(
    el('p', { class: 'map-panel__kind' }, el('span', { class: 'label' }, categoryLabel(place.category)), ' · ', place.kind),
    el('h2', { class: 'map-panel__title' }, label),
  );
  if (place.name && place.street) panel.append(el('p', { class: 'map-panel__meta' }, place.street));

  const actions = el('p', { class: 'map-panel__actions' });
  if (place.page) actions.append(el('a', { class: 'button button--primary', href: place.page }, 'Apri la scheda'));
  const osmLink = el('a', { class: 'button button--secondary', href: `https://www.openstreetmap.org/${place.osm}`, rel: 'noopener noreferrer' }, 'Vedi su OpenStreetMap');
  osmLink.insertAdjacentHTML('beforeend', iconMarkup('external-link', 16));
  actions.append(osmLink);
  panel.append(actions, el('p', { class: 'source-label' }, 'Fonte: OpenStreetMap'));
}

function el(tag: string, attrs: Record<string, string> = {}, ...children: (Node | string)[]): HTMLElement {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}
