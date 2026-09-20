import { html, type Html } from '../lib/html';
import { icon } from './icons';

/**
 * Badge «fonte ufficiale» (OFFICIAL-SOURCES.md): spunta blu con nome
 * accessibile. Indica solo che la fonte è ufficiale e verificata, non
 * un'approvazione del progetto.
 */
export function officialBadge(options: { compact?: boolean } = {}): Html {
  if (options.compact) {
    return html`<span class="badge-official" role="img" aria-label="Fonte ufficiale" title="Fonte ufficiale">${icon('circle-check', 18)}</span>`;
  }
  return html`<span class="badge-official">${icon('circle-check', 18)}<span class="badge-official__text">Fonte ufficiale</span></span>`;
}
