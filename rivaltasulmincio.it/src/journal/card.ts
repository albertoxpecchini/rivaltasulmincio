import { formatDate } from '../lib/dates';
import { html, raw, type Html } from '../lib/html';
import type { JournalArticle } from '../types';
import { articlePath, isBreakingActive, isEventOver, isExpired } from './service';
import { journalTypeLabel } from './taxonomy';

/** Scheda articolo per Home e archivio (JOURNAL.md «GERARCHIA HOME»). */
export function journalCard(
  article: JournalArticle,
  options: { now: Date; level: 2 | 3; lead?: boolean },
): Html {
  const href = articlePath(article);
  const title =
    options.level === 2
      ? html`<h2 class="journal-card__title"><a href="${href}">${article.title}</a></h2>`
      : html`<h3 class="journal-card__title"><a href="${href}">${article.title}</a></h3>`;

  return html`<article class="journal-card${options.lead ? ' journal-card--lead' : ''}">
  ${
    article.image
      ? html`<img class="journal-card__image" src="${article.image.src}" alt="${article.image.alt}"${options.lead ? '' : raw(' loading="lazy"')} />`
      : ''
  }
  <p class="journal-card__kind"><span class="label">${journalTypeLabel(article.type)}</span>${statusTags(article, options.now)}</p>
  ${title}
  ${article.excerpt ? html`<p class="journal-card__excerpt">${article.excerpt}</p>` : ''}
  <p class="journal-card__meta">
    <time datetime="${article.publishedAt}">${formatDate(article.publishedAt)}</time>
    ${article.location?.name ? html`<span>${article.location.name}</span>` : ''}
    ${article.source?.name ? html`<span>Fonte: ${article.source.name}</span>` : ''}
  </p>
</article>`;
}

/** Etichette di stato: breaking attivo, avviso scaduto, evento concluso. */
export function statusTags(article: JournalArticle, now: Date): Html[] {
  const tags: Html[] = [];
  if (isBreakingActive(article, now)) tags.push(html`<span class="tag tag--danger">Breaking</span>`);
  if (isExpired(article, now)) tags.push(html`<span class="tag tag--muted">Scaduto</span>`);
  if (isEventOver(article, now)) tags.push(html`<span class="tag tag--muted">Evento concluso</span>`);
  return tags;
}
