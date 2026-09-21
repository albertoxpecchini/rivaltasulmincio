import type { PageContext, PageResult } from '../app/page';
import { crumbs } from '../components/page-header';
import { sourceLabel } from '../components/source-label';
import { posterFor, posters } from '../data/posters';
import { posterBlock, posterImage } from '../journal/poster';
import { archiveArticles, articlePath, findArticle } from '../journal/service';
import { yearMonth } from '../lib/dates';
import { html } from '../lib/html';

/*
 * Visualizzatore della locandina (JOURNAL.md «MEDIA»).
 *
 * La locandina ha una pagina propria perché è un documento a sé: si apre, si
 * ingrandisce, si stampa e si condivide senza portarsi dietro l'articolo. Il
 * programma è HTML vero — testo che si seleziona, si cerca e si legge con lo
 * screen reader — e sotto resta la riproduzione fedele del foglio distribuito
 * in paese, scaricabile alla risoluzione piena.
 */

/**
 * Un percorso per ogni locandina il cui articolo è consultabile: la locandina
 * vive sotto l'articolo, quindi se l'articolo non c'è non c'è nemmeno lei.
 */
export function paths(): string[] {
  const now = new Date();
  const withPoster = new Set(posters.map((poster) => poster.articleSlug));
  return archiveArticles(now)
    .filter((article) => withPoster.has(article.slug))
    .map((article) => `${articlePath(article)}/locandina`);
}

export function render({ params }: PageContext): PageResult | null {
  const now = new Date();
  const article = findArticle(params.year ?? '', params.month ?? '', params.slug ?? '', now);
  if (!article) return null;
  const poster = posterFor(article.slug);
  if (!poster) return null;

  const { year, month } = yearMonth(article.publishedAt);

  return {
    title: `Locandina · ${article.title}`,
    description: article.seo?.description ?? article.excerpt,
    main: html`<div class="poster-page">
  ${crumbs([
    { href: '/giornale', label: 'Giornale' },
    { label: `${year}/${month}` },
    { href: articlePath(article), label: article.title },
    { label: 'Locandina' },
  ])}

  ${posterBlock(poster)}

  <section class="poster-page__original" aria-labelledby="locandina-originale">
    <h2 id="locandina-originale">Il foglio distribuito in paese</h2>
    <p class="lead">La locandina come è stata stampata e affissa. Sopra, lo stesso programma in testo, che si legge e si cerca anche da telefono.</p>
    ${posterImage(poster)}
    <p>
      <a class="button button--secondary" href="${poster.image.src}" download>Scarica la locandina</a>
    </p>
  </section>

  <footer class="poster-page__footer">
    ${sourceLabel({ source: article.source })}
    <p><a href="${articlePath(article)}">Torna all'articolo</a></p>
  </footer>
</div>`,
  };
}
