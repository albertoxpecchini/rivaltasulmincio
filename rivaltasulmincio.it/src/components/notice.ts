import { formatDateShort, isoDay } from '../lib/dates';
import { html, type Html } from '../lib/html';
import { findPlace } from '../places/service';
import type { Notice } from '../types';

/**
 * Striscia d'avviso (JOURNAL.md «AVVISO»: cosa cambia, periodo, area; BORDERS.md
 * «Warning»: bordo giallo per lo stato temporaneo). Marchio del soggetto a
 * sinistra, cifre in mono a colpo d'occhio, fonte in fondo.
 *
 * Il sito è statico: la build scarta gli avvisi già scaduti, ma una pagina può
 * restare online oltre la scadenza. `data-valid-until` permette al client di
 * toglierla quando il momento arriva (src/entry-client.ts).
 *
 * `places: false` nella scheda del luogo stesso, dove il rimando sarebbe a sé.
 */
export function noticeBanner(notice: Notice, options: { places?: boolean } = {}): Html {
  const titleId = `avviso-${notice.id}`;
  const lastDay = new Date(Date.parse(notice.validUntil) - 1).toISOString();
  const places = options.places === false ? [] : notice.places.flatMap((slug) => findPlace(slug) ?? []);

  return html`<aside class="notice" aria-labelledby="${titleId}" data-valid-until="${notice.validUntil}">
  ${notice.logo ? html`<img class="notice__logo" src="${notice.logo.src}" alt="${notice.logo.alt}" width="${notice.logo.width}" height="${notice.logo.height}" decoding="async" />` : ''}
  <p class="notice__meta"><span class="notice__topic">Avviso · ${notice.topic}</span> <span>Dal <time datetime="${isoDay(notice.validFrom)}">${formatDateShort(notice.validFrom)}</time> al <time datetime="${isoDay(lastDay)}">${formatDateShort(lastDay)}</time></span></p>
  <h2 class="notice__title" id="${titleId}">${notice.title}</h2>
  <dl class="notice__figures">
    ${notice.figures.map((figure) => html`<div><dt>${figure.label}</dt><dd>${figure.value}</dd></div>`)}
  </dl>
  <p class="notice__text">${notice.text}</p>
  <p class="notice__foot">
    ${places.map(
      (place) => html`<span>A Rivalta: <a href="/luoghi/${place.slug}">${place.kind.toLowerCase()} ${place.name}${place.address?.street ? `, ${[place.address.street, place.address.housenumber].filter(Boolean).join(' ')}` : ''}</a></span>`,
    )}
    <span>Fonte: <a href="${notice.source.url}" rel="noopener noreferrer">${notice.source.name}</a>, <time datetime="${notice.source.date}">${formatDateShort(notice.source.date)}</time></span>
  </p>
</aside>`;
}
