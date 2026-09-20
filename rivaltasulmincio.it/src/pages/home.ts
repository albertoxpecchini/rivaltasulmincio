import type { PageResult } from '../app/page';
import { site } from '../app/site';
import { emptyState } from '../components/empty-state';
import { officialBadge } from '../components/official-badge';
import { searchForm } from '../components/search';
import { section } from '../components/section';
import { journalCard } from '../journal/card';
import { homeSelection } from '../journal/service';
import { html } from '../lib/html';
import { isOfficial, listSources } from '../services/sources';

/** Home: identità, ricerca, giornale, fonti (FUNDAMENTA.md «HOME»). Le altre sezioni arrivano con i relativi dati. */
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
        id: 'fonti',
        title: 'Fonti',
        intro: 'Ogni dato del progetto mantiene la propria provenienza.',
        body: fonti,
        more: { href: '/fonti', label: 'Tutte le fonti' },
      })}
    `,
  };
}
