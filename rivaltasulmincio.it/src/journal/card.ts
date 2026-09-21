import { formatDate, formatDateShort } from '../lib/dates';
import { html, raw, type Html } from '../lib/html';
import type { JournalArticle } from '../types';
import { articlePath, isBreakingActive, isEventOver, isExpired } from './service';
import { journalTypeLabel } from './taxonomy';

/**
 * Articolo principale (JOURNAL.md «GERARCHIA HOME», STYLE.md «GIORNALE»):
 * pannello con testata tecnica (tipo, stato, data), titolo forte, estratto e
 * riga di metadata.
 */
export function journalLead(article: JournalArticle, options: { now: Date; level: 2 | 3 }): Html {
  const href = articlePath(article);
  const title =
    options.level === 2
      ? html`<h2 class="journal-lead__title"><a href="${href}">${article.title}</a></h2>`
      : html`<h3 class="journal-lead__title"><a href="${href}">${article.title}</a></h3>`;

  return html`<article class="journal-lead panel panel--raised">
  <div class="panel__head">
    <span class="panel__title">${journalTypeLabel(article.type)}</span>${statusTags(article, options.now)}
    <time class="panel__meta" datetime="${article.publishedAt}">${formatDateShort(article.publishedAt)}</time>
  </div>
  <div class="panel__body">
    ${leadImage(article)}
    ${title}
    ${article.excerpt ? html`<p class="journal-lead__excerpt">${article.excerpt}</p>` : ''}
  </div>
  <div class="panel__foot">
    <span><time datetime="${article.publishedAt}">${formatDate(article.publishedAt)}</time></span>
    ${article.location?.name ? html`<span>${article.location.name}</span>` : ''}
    ${article.source?.name ? html`<span>Fonte: ${article.source.name}</span>` : ''}
  </div>
</article>`;
}

/**
 * Immagine dell'articolo principale: la miniatura del giornale, sempre in 4:3
 * (IMAGES.md). `width`/`height` riservano lo spazio prima del caricamento.
 */
function leadImage(article: JournalArticle): Html {
  const image = article.image;
  if (!image) return html``;
  return html`<img
    class="journal-lead__image"
    src="${image.src}"
    alt="${image.alt}"
    ${image.width ? html`width="${image.width}"` : ''}
    ${image.height ? html`height="${image.height}"` : ''}
    loading="lazy"
    decoding="async"
  />`;
}

/** Articolo secondario come riga d'archivio: data · tipo · titolo · fonte. */
export function journalRow(article: JournalArticle, options: { now: Date }): Html {
  const href = articlePath(article);
  return html`<li class="journal-row">
  <time class="journal-row__date" datetime="${article.publishedAt}">${formatDateShort(article.publishedAt)}</time>
  <span class="journal-row__kind label">${journalTypeLabel(article.type)}</span>
  <span class="journal-row__title"><a href="${href}">${article.title}</a>${statusTags(article, options.now)}</span>
  <span class="journal-row__meta">${article.source?.name ?? article.location?.name ?? raw('')}</span>
</li>`;
}

export function journalRows(articles: JournalArticle[], options: { now: Date }): Html {
  return html`<ol class="journal-rows list-plain">${articles.map((article) => journalRow(article, options))}</ol>`;
}

/** Etichette di stato: breaking attivo, avviso scaduto, evento concluso. */
export function statusTags(article: JournalArticle, now: Date): Html[] {
  const tags: Html[] = [];
  if (isBreakingActive(article, now)) tags.push(html`<span class="tag tag--danger">Breaking</span>`);
  if (isExpired(article, now)) tags.push(html`<span class="tag tag--muted">Scaduto</span>`);
  if (isEventOver(article, now)) tags.push(html`<span class="tag tag--muted">Evento concluso</span>`);
  return tags;
}
