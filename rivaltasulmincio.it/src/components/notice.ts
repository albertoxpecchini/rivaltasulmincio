import { formatDateShort, isoDay } from '../lib/dates';
import { html, type Html } from '../lib/html';
import type { Notice } from '../types';
import { icon } from './icons';

/**
 * Striscia d'avviso in cima alla pagina (JOURNAL.md «AVVISO»: cosa cambia,
 * periodo, dove; BORDERS.md «Warning»: bordo giallo per lo stato temporaneo).
 *
 * Esce dal build con `hidden`: la fa comparire il client, dopo un po' o quando
 * il puntatore sale verso il bordo alto (src/notices/client.ts), e lì si
 * chiude. Senza JavaScript il CSS la mostra ferma sopra la testata, senza ×.
 * `data-valid-until` serve al client per toglierla da una pagina statica
 * rimasta online oltre la scadenza.
 */
export function noticeBar(notice: Notice): Html {
  const id = `avviso-${notice.id}`;
  const lastDay = new Date(Date.parse(notice.validUntil) - 1).toISOString();

  return html`<aside class="notice-bar" id="${id}" aria-labelledby="${id}-titolo" data-notice-bar data-valid-until="${notice.validUntil}" hidden>
  <div class="notice-bar__inner container">
    ${notice.logo ? html`<img class="notice-bar__logo" src="${notice.logo.src}" alt="${notice.logo.alt}" width="${notice.logo.width}" height="${notice.logo.height}" decoding="async" />` : ''}
    <p class="notice-bar__meta"><span class="notice-bar__topic">Avviso · ${notice.topic}</span> <span>Dal <time datetime="${isoDay(notice.validFrom)}">${formatDateShort(notice.validFrom)}</time> al <time datetime="${isoDay(lastDay)}">${formatDateShort(lastDay)}</time></span></p>
    <p class="notice-bar__title" id="${id}-titolo">${notice.title}</p>
    <dl class="notice-bar__figures">
      ${notice.figures.map((figure) => html`<div><dt>${figure.label}</dt><dd>${figure.value}</dd></div>`)}
    </dl>
    <p class="notice-bar__text">${notice.text} <span class="notice-bar__source">Fonte: <a href="${notice.source.url}" rel="noopener noreferrer">${notice.source.name}</a>, <time datetime="${notice.source.date}">${formatDateShort(notice.source.date)}</time></span></p>
    <button class="notice-bar__close" type="button" data-notice-close aria-label="Chiudi l'avviso">${icon('x', 20)}</button>
  </div>
</aside>`;
}
