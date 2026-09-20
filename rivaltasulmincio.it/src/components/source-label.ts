import { formatDate } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { getSource, isOfficial } from '../services/sources';
import type { SourceReference } from '../types';
import { officialBadge } from './official-badge';

/** «Fonte: … · Aggiornato: …» (STYLE.md «Fonti»), con badge se la fonte è ufficiale. */
export function sourceLabel(options: { source?: SourceReference; updatedAt?: string }): Html {
  const registry = getSource(options.source?.sourceId);
  const name = options.source?.name ?? registry?.name;
  const url = options.source?.url ?? registry?.url;
  if (!name && !options.updatedAt) return html``;

  return html`<p class="source-label">${
    name
      ? html`<span>Fonte: ${url ? html`<a href="${url}" rel="noopener noreferrer">${name}</a>` : name}</span>`
      : ''
  }${isOfficial(registry) ? officialBadge({ compact: true }) : ''}${
    options.updatedAt
      ? html`<span>Aggiornato: <time datetime="${options.updatedAt}">${formatDate(options.updatedAt)}</time></span>`
      : ''
  }</p>`;
}
