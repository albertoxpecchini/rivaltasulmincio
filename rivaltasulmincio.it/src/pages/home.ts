import type { PageResult } from '../app/page';
import { site } from '../app/site';
import { emptyState } from '../components/empty-state';
import { mapBlock } from '../components/map';
import { officialBadge } from '../components/official-badge';
import { searchForm } from '../components/search';
import { section } from '../components/section';
import { weatherCompact } from '../components/weather';
import { journalCard } from '../journal/card';
import { homeSelection } from '../journal/service';
import { formatDate } from '../lib/dates';
import { html } from '../lib/html';
import { MAP_ZOOM } from '../map/config';
import { categoryLine } from '../places/list';
import { activePlaces, mapCenter, osmDataTimestamp, placesByCategory } from '../places/service';
import { isOfficial, listSources } from '../services/sources';

/** Home: identità, ricerca, giornale, mappa, meteo, fonti (FUNDAMENTA.md «HOME»). Le altre sezioni arrivano con i relativi dati. */
export function render(): PageResult {
  const now = new Date();
  const { lead, others } = homeSelection(now);

  const giornale = lead
    ? html`<div class="grid">
        ${journalCard(lead, { now, level: 3, lead: true })}
        ${others.map((article) => journalCard(article, { now, level: 3 }))}
      </div>`
    : emptyState({
        title: 'Nessun articolo pubblicato',
        text: 'Il giornale non ha ancora contenuti pubblicati.',
      });

  const groups = placesByCategory();
  const osmTimestamp = osmDataTimestamp();
  const mappa = html`<div class="home-map">
    ${mapBlock({
      id: 'home-mappa',
      mode: 'embed',
      center: mapCenter(),
      zoom: MAP_ZOOM.village,
      label: 'Mappa di Rivalta sul Mincio',
      updatedAt: osmTimestamp ? formatDate(osmTimestamp) : undefined,
    })}
    <div class="home-map__data">
      <p class="stat">${activePlaces().length}</p>
      <p class="home-map__stat-label">luoghi censiti in OpenStreetMap</p>
      <ul class="category-list list-plain">
        ${groups.map((group) => html`<li><a href="/luoghi#${group.category}">${categoryLine(group.category, group.places.length)}</a></li>`)}
      </ul>
    </div>
  </div>`;

  const fonti = html`<ul class="compact-sources list-plain">
    ${listSources().map(
      (source) => html`<li>
        <span class="compact-sources__name">${source.name}${isOfficial(source) ? officialBadge({ compact: true }) : ''}</span>
        <span class="compact-sources__scope">${source.scope}</span>
      </li>`,
    )}
  </ul>`;

  return {
    title: site.name,
    description: site.description,
    main: html`
      <div class="hero">
        <p class="label">Atlante digitale locale</p>
        <h1>${site.name}</h1>
        <p class="lead">${site.tagline}</p>
        <p class="hero__text">${site.institutional}</p>
        ${searchForm()}
      </div>
      ${section({
        id: 'giornale',
        title: 'Giornale',
        intro: 'Ultime notizie da Rivalta sul Mincio',
        body: giornale,
        more: { href: '/giornale', label: 'Vedi tutto il giornale' },
      })}
      ${section({
        id: 'mappa',
        title: 'Mappa',
        intro: 'Il paese e la campagna vicina, luogo per luogo.',
        body: mappa,
        more: { href: '/mappa', label: 'Apri la mappa' },
      })}
      ${
        site.features.weather
          ? section({
              id: 'meteo',
              title: 'Meteo',
              intro: 'La stazione meteorologica del paese.',
              body: weatherCompact(),
              more: { href: '/meteo', label: 'Meteo completo' },
            })
          : ''
      }
      ${section({
        id: 'fonti',
        title: 'Fonti',
        intro: 'Ogni dato del progetto mantiene la propria provenienza.',
        body: fonti,
        more: { href: '/fonti', label: 'Tutte le fonti' },
      })}
    `,
  };
}
