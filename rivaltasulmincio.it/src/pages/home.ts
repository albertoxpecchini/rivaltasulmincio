import type { PageResult } from '../app/page';
import { site } from '../app/site';
import { emptyState } from '../components/empty-state';
import { mapBlock } from '../components/map';
import { noticeBanner } from '../components/notice';
import { officialBadge } from '../components/official-badge';
import { searchForm } from '../components/search';
import { section } from '../components/section';
import { statNumber } from '../components/stat';
import { weatherCompact } from '../components/weather';
import { activeNotices } from '../data/notices';
import { journalLead, journalRows } from '../journal/card';
import { archiveArticles, homeSelection } from '../journal/service';
import { formatDateShort } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { MAP_ZOOM } from '../map/config';
import { categoryLine } from '../places/list';
import { activePlaces, mapCenter, osmDataTimestamp, placesByCategory } from '../places/service';
import { isOfficial, listSources, sourceTypeLabel } from '../services/sources';
import { METEOMINCIO } from '../services/weather/meteomincio.ts';

/**
 * Home (FUNDAMENTA.md «HOME», STYLE.md «HOME»): hero con coordinate e stato dei
 * dati, poi moduli numerati che si alternano — giornale, mappa, dati, meteo,
 * fonti. Servizi e territorio arriveranno con i relativi dataset: qui non si
 * inventa nulla, ogni numero viene dai dati reali.
 */
export function render(): PageResult {
  const now = new Date();
  const today = formatDateShort(now.toISOString());
  const { lead, others } = homeSelection(now);
  const groups = placesByCategory();
  const places = activePlaces().length;
  const center = mapCenter();
  const osmTimestamp = osmDataTimestamp();
  const osmDate = osmTimestamp ? formatDateShort(osmTimestamp) : undefined;
  const sources = listSources();
  const official = sources.filter(isOfficial).length;
  const articles = archiveArticles(now).length;

  const hero = html`<div class="hero grid-paper">
    <div class="hero__main">
      <p class="kicker">Atlante digitale locale <span class="kicker__sep" aria-hidden="true">/</span> <span>${center.lat.toFixed(5)} N</span> <span>${center.lng.toFixed(5)} E</span></p>
      <h1 class="hero__title display">Rivalta<br />sul Mincio</h1>
      <p class="lead">${site.tagline}</p>
      ${searchForm()}
      <p class="hero__text">${site.institutional}</p>
    </div>
    <aside class="hero__panel inverse" aria-labelledby="stato-dati">
      <p class="panel__title" id="stato-dati">Stato dei dati</p>
      <dl class="hero__data">
        <div><dt>Luoghi</dt><dd>${places}</dd></div>
        <div><dt>Categorie</dt><dd>${groups.length}</dd></div>
        <div><dt>Articoli</dt><dd>${articles}</dd></div>
        <div><dt>Fonti</dt><dd>${sources.length}</dd></div>
        ${osmDate ? html`<div><dt>Dati OSM</dt><dd><time datetime="${osmTimestamp}">${osmDate}</time></dd></div>` : ''}
        ${site.features.weather ? html`<div><dt>Meteo</dt><dd>${METEOMINCIO.name}</dd></div>` : ''}
        <div><dt>Build</dt><dd><time datetime="${now.toISOString()}">${today}</time></dd></div>
      </dl>
    </aside>
  </div>`;

  const giornale = lead
    ? html`<div class="journal-home">
        ${journalLead(lead, { now, level: 3 })}
        ${others.length > 0 ? journalRows(others, { now }) : ''}
      </div>`
    : emptyState({
        title: 'Nessun articolo pubblicato',
        text: 'Il giornale non ha ancora contenuti pubblicati.',
      });

  const mappa = html`<div class="home-map">
    ${mapBlock({
      id: 'home-mappa',
      mode: 'embed',
      center,
      zoom: MAP_ZOOM.village,
      label: 'Mappa di Rivalta sul Mincio',
      title: 'Mappa · OpenStreetMap',
      updatedAt: osmDate,
    })}
    <div class="home-map__data panel">
      <div class="panel__head"><span class="panel__title">Luoghi per categoria</span></div>
      <div class="panel__body">
        <div class="home-map__stat">
          <p>${statNumber(places)}</p>
          <p class="label">luoghi censiti in OpenStreetMap</p>
        </div>
        <ul class="category-list list-plain">
          ${groups.map((group) => html`<li><a href="/luoghi#${group.category}">${categoryLine(group.category, group.places.length)}</a></li>`)}
        </ul>
      </div>
      <div class="panel__foot"><span>Fonte OpenStreetMap</span>${osmDate ? html`<span>${osmDate}</span>` : ''}</div>
    </div>
  </div>`;

  const dati = html`<div class="data-grid">
    ${datum('Luoghi', places, osmDate ? `OpenStreetMap · ${osmDate}` : 'OpenStreetMap')}
    ${datum('Categorie', groups.length, 'Tassonomia del progetto')}
    ${datum('Articoli', articles, 'Giornale · archivio')}
    ${datum('Fonti', sources.length, `${official} ${official === 1 ? 'ufficiale verificata' : 'ufficiali verificate'}`)}
  </div>`;

  const fonti = html`<ul class="compact-sources list-plain">
    ${sources.map(
      (source) => html`<li>
        <span class="compact-sources__name">${source.name}${isOfficial(source) ? officialBadge({ compact: true }) : ''}</span>
        <span class="tag tag--muted">${sourceTypeLabel(source.type)}</span>
        <span class="compact-sources__scope">${source.scope}</span>
        <span class="compact-sources__meta">${source.checkedAt ? html`Verificata ${formatDateShort(source.checkedAt)}` : 'Da verificare'}</span>
      </li>`,
    )}
  </ul>`;

  const modules: Parameters<typeof section>[0][] = [
    {
      id: 'giornale',
      title: 'Giornale',
      meta: today,
      intro: 'Ultime notizie da Rivalta sul Mincio.',
      body: giornale,
      more: { href: '/giornale', label: 'Tutto il giornale' },
    },
    {
      id: 'mappa',
      title: 'Mappa',
      meta: `${places} luoghi`,
      intro: 'Il paese e la campagna vicina, luogo per luogo.',
      body: mappa,
      more: { href: '/mappa', label: 'Apri la mappa' },
    },
    {
      id: 'dati',
      title: 'Dati',
      meta: `Build ${today}`,
      intro: 'Quanto contiene oggi l’atlante. Ogni numero ha una fonte.',
      body: dati,
    },
    ...(site.features.weather
      ? [
          {
            id: 'meteo',
            title: 'Meteo',
            meta: METEOMINCIO.location,
            intro: 'La stazione meteorologica del paese.',
            body: weatherCompact(),
            more: { href: '/meteo', label: 'Meteo completo' },
          },
        ]
      : []),
    {
      id: 'fonti',
      title: 'Fonti',
      meta: `${sources.length} registrate`,
      intro: 'Ogni dato del progetto mantiene la propria provenienza.',
      body: fonti,
      more: { href: '/fonti', label: 'Tutte le fonti' },
    },
  ];

  return {
    title: site.name,
    description: site.description,
    main: html`
      ${hero}
      ${activeNotices(now).map((notice) => noticeBanner(notice))}
      ${modules.map((module, index) => section({ ...module, code: String(index + 1).padStart(2, '0') }))}
    `,
  };
}

/** Blocco della console dati (STYLE.md «DATI»): etichetta, numero grande, metadata. */
function datum(label: string, value: number, meta: string): Html {
  return html`<div class="datum">
    <p class="label">${label}</p>
    <p>${statNumber(value)}</p>
    <p class="datum__meta">${meta}</p>
  </div>`;
}
