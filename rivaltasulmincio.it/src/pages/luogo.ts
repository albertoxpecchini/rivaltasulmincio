import type { PageContext, PageResult } from '../app/page';
import { icon } from '../components/icons';
import { categoryMark, singleMap } from '../components/map';
import { crumbs } from '../components/page-header';
import { sourceLabel } from '../components/source-label';
import { formatDate } from '../lib/dates';
import { formatCoordinates } from '../lib/geo';
import { html, type Html } from '../lib/html';
import { findPlace, formatAddress, namedPlaces, osmElementUrl } from '../places/service';
import { categoryLabel } from '../places/taxonomy';
import type { Place } from '../types';

const NOT_AVAILABLE = 'Dato non disponibile';

/** Una scheda per ogni luogo con nome, anche se non più presente in OSM (archivio). */
export function paths(): string[] {
  return namedPlaces().map((place) => `/luoghi/${place.slug}`);
}

export function render({ params }: PageContext): PageResult | null {
  const place = findPlace(params.slug ?? '');
  if (!place?.name) return null;

  const address = formatAddress(place.address);
  const osmUrl = osmElementUrl(place.osm);

  return {
    title: place.name,
    description: `${place.name}: ${place.kind.toLowerCase()} a Rivalta sul Mincio${address ? `, ${address}` : ''}. Dati da OpenStreetMap.`,
    main: html`<article class="place">
  <header class="place__header">
    ${crumbs([
      { href: '/luoghi', label: 'Luoghi' },
      { href: `/luoghi#${place.category}`, label: categoryLabel(place.category) },
      { label: place.name },
    ])}
    <p class="place__kind">${categoryMark(place.category)} <span class="tag tag--accent">${categoryLabel(place.category)}</span> <span>${place.kind}</span>${
      place.status === 'removed' ? html` <span class="tag tag--muted">Non più presente in OpenStreetMap</span>` : ''
    }</p>
    <h1>${place.name}</h1>
    ${address ? html`<p class="lead">${address}</p>` : ''}
  </header>
  <div class="place__layout">
    <dl class="facts">
      <div><dt>Indirizzo</dt><dd>${address ?? NOT_AVAILABLE}</dd></div>
      <div><dt>Telefono</dt><dd>${place.contact?.phone ? html`<a href="tel:${place.contact.phone}">${place.contact.phone}</a>` : NOT_AVAILABLE}</dd></div>
      <div><dt>Sito web</dt><dd>${place.contact?.website ? html`<a href="${place.contact.website}" rel="noopener noreferrer">${place.contact.website}</a>` : NOT_AVAILABLE}</dd></div>
      ${place.contact?.email ? html`<div><dt>Email</dt><dd><a href="mailto:${place.contact.email}">${place.contact.email}</a></dd></div>` : ''}
      <div><dt>Orari</dt><dd>${place.openingHours ? html`<span class="mono">${place.openingHours}</span>` : 'Orario non disponibile'}</dd></div>
      <div><dt>Coordinate</dt><dd class="mono">${formatCoordinates(place)}</dd></div>
      <div><dt>ID</dt><dd class="mono">${place.id} · ${place.osm.osmType}/${place.osm.osmId}</dd></div>
    </dl>
    ${singleMap({ id: 'luogo-mappa', center: place, label: place.name })}
  </div>
  <p class="button-group">
    <a class="button button--primary" href="/mappa#${place.id}">${icon('map', 16)} Vedi sulla mappa</a>
    <a class="button button--secondary" href="${osmUrl}" rel="noopener noreferrer">Vedi su OpenStreetMap ${icon('external-link', 16)}</a>
  </p>
  ${technicalData(place)}
  <footer class="place__footer">
    ${sourceLabel({ source: { ...place.source, url: osmUrl }, updatedAt: place.updatedAt })}
    ${place.source.checkedAt ? html`<p class="caption">Verificato su OpenStreetMap il ${formatDate(place.source.checkedAt)}. Un dato assente in OpenStreetMap non significa che il luogo non lo abbia.</p>` : ''}
    <p><a href="/luoghi#${place.category}">Tutti i luoghi: ${categoryLabel(place.category)}</a></p>
  </footer>
</article>`,
  };
}

/** Tag OSM grezzi, per chi vuole il dato tecnico (OSM.md «Schede»). */
function technicalData(place: Place): Html {
  const entries = Object.entries(place.osm.tags).sort(([a], [b]) => a.localeCompare(b));
  return html`<details class="place__technical">
  <summary>Dati tecnici OpenStreetMap</summary>
  <div class="table-wrap">
    <table class="table">
      <caption class="visually-hidden">Tag OpenStreetMap dell'elemento ${place.osm.osmType} ${place.osm.osmId}</caption>
      <thead><tr><th scope="col">Chiave</th><th scope="col">Valore</th></tr></thead>
      <tbody>
        ${entries.map(([key, value]) => html`<tr><td><code>${key}</code></td><td>${value}</td></tr>`)}
      </tbody>
    </table>
  </div>
  <p class="caption">Elemento <code>${place.osm.osmType}/${place.osm.osmId}</code>${
    place.osm.also?.length ? html`, riunito con ${place.osm.also.map((ref) => html`<code>${ref.osmType}/${ref.osmId}</code>`).reduce<Html[]>((acc, cur, i) => (i ? [...acc, html`, `, cur] : [cur]), [])}` : ''
  }.</p>
</details>`;
}
