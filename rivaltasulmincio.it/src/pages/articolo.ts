import type { PageContext, PageResult } from '../app/page';
import { site } from '../app/site';
import { icon } from '../components/icons';
import { crumbs } from '../components/page-header';
import { renderContent } from '../content/render';
import { autoExcerpt } from '../content/text';
import { sourceLabel } from '../components/source-label';
import { posterFor } from '../data/posters';
import { statusTags } from '../journal/card';
import { archiveArticles, articlePath, findArticle, isEventOver } from '../journal/service';
import { journalTypeLabel } from '../journal/taxonomy';
import { formatDate, formatTime, yearMonth } from '../lib/dates';
import { html, type Html } from '../lib/html';
import type { JournalArticle } from '../types';

const NOT_AVAILABLE = 'Dato non disponibile';

/** Un percorso per ogni articolo consultabile: `/giornale/AAAA/MM/slug`. */
export function paths(): string[] {
  return archiveArticles(new Date()).map(articlePath);
}

export function render({ params }: PageContext): PageResult | null {
  const now = new Date();
  const article = findArticle(params.year ?? '', params.month ?? '', params.slug ?? '', now);
  if (!article) return null;

  const { year, month } = yearMonth(article.publishedAt);
  /* L'estratto scritto a mano vince sempre; quello ricavato dal testo è l'ultima risorsa. */
  const description = article.seo?.description || article.excerpt || autoExcerpt(article.content) || site.description;

  return {
    title: article.seo?.title ?? article.title,
    description,
    main: html`<article class="article">
  <header class="article__header">
    ${crumbs([{ href: '/giornale', label: 'Giornale' }, { label: `${year}/${month}` }])}
    <p class="article__kind"><span class="tag tag--accent">${journalTypeLabel(article.type)}</span>${statusTags(article, now)}</p>
    <h1>${article.title}</h1>
    ${article.subtitle ? html`<p class="lead">${article.subtitle}</p>` : ''}
    <p class="article__meta">
      <span>Pubblicato <time datetime="${article.publishedAt}">${formatDate(article.publishedAt, { time: true })}</time></span>
      ${article.updatedAt ? html`<span>Aggiornato <time datetime="${article.updatedAt}">${formatDate(article.updatedAt, { time: true })}</time></span>` : ''}
      ${article.author ? html`<span>Autore ${article.author}</span>` : ''}
      ${article.organization ? html`<span>Organizzazione ${article.organization}</span>` : ''}
      ${article.location?.name ? html`<span>Luogo ${article.location.name}</span>` : ''}
    </p>
  </header>
  ${poster(article)}
  ${eventBlock(article, now)}
  <div class="article__body prose">${renderContent(article.content)}</div>
  ${
    article.documentUrl
      ? html`<p><a class="button button--secondary" href="${article.documentUrl}" rel="noopener noreferrer">Apri il documento originale</a></p>`
      : ''
  }
  <footer class="article__footer">
    ${sourceLabel({ source: article.source, updatedAt: article.updatedAt })}
    ${
      article.tags?.length
        ? html`<p class="article__tags"><span class="label">Tag</span>${article.tags.map((tag) => html`<span class="tag">${tag}</span>`)}</p>`
        : ''
    }
    <p><a href="/giornale">Tutto il giornale</a></p>
  </footer>
</article>`,
  };
}

/**
 * Apertura dell'articolo: l'immagine dell'articolo e, quando esiste una
 * locandina, il collegamento al foglio originale.
 */
function poster(article: JournalArticle): Html {
  const sheet = posterFor(article.slug);
  if (!sheet) return figure(article);
  return html`${figure(article)}
  <p class="article__poster">
    <a class="button button--primary" href="${articlePath(article)}/locandina">Apri la locandina ${icon('arrow-right', 16)}</a>
    <span class="article__poster-note">Il foglio affisso in paese, a schermo intero: si ingrandisce, si stampa e si scarica.</span>
  </p>`;
}

function figure(article: JournalArticle): Html {
  const image = article.image;
  if (!image) return html``;
  const caption = [image.caption, image.credit ? `Foto: ${image.credit}` : undefined].filter(Boolean).join(' ');
  return html`<figure class="article__figure">
    <img
      src="${image.src}"
      alt="${image.alt}"
      ${image.width ? html`width="${image.width}"` : ''}
      ${image.height ? html`height="${image.height}"` : ''}
      decoding="async"
    />
    ${caption ? html`<figcaption class="caption">${caption}</figcaption>` : ''}
  </figure>`;
}

/** Blocco evento (JOURNAL.md «EVENTI»): data, ora, luogo, organizzatore. */
function eventBlock(article: JournalArticle, now: Date): Html {
  const event = article.event;
  if (!event) return html``;
  return html`<dl class="facts">
    <div><dt>Data</dt><dd>${event.startsAt ? html`<time datetime="${event.startsAt}">${formatDate(event.startsAt)}</time>` : NOT_AVAILABLE}</dd></div>
    <div><dt>Ora</dt><dd>${event.startsAt ? formatTime(event.startsAt) : NOT_AVAILABLE}</dd></div>
    <div><dt>Luogo</dt><dd>${event.venue ?? article.location?.name ?? NOT_AVAILABLE}</dd></div>
    <div><dt>Organizzatore</dt><dd>${event.organizer ?? article.organization ?? NOT_AVAILABLE}</dd></div>
    ${event.price ? html`<div><dt>Prezzo</dt><dd>${event.price}</dd></div>` : ''}
    ${event.bookingUrl ? html`<div><dt>Prenotazione</dt><dd><a href="${event.bookingUrl}" rel="noopener noreferrer">${event.bookingUrl}</a></dd></div>` : ''}
    ${isEventOver(article, now) ? html`<div><dt>Stato</dt><dd>Evento concluso</dd></div>` : ''}
  </dl>`;
}
