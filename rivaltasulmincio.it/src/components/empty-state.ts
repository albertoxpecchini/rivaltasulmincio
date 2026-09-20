import { html, type Html } from '../lib/html';

/** Stato vuoto (STYLE.md «Empty state»): dice chiaramente cosa manca, senza riempire. */
export function emptyState(options: { title: string; text?: string }): Html {
  return html`<div class="empty-state">
  <p class="empty-state__title">${options.title}</p>
  ${options.text ? html`<p>${options.text}</p>` : ''}
</div>`;
}
