import type { PageResult } from '../app/page';
import { emptyState } from '../components/empty-state';
import { journalCard } from '../journal/card';
import { archiveByYear } from '../journal/service';
import { html } from '../lib/html';

/** Archivio del giornale, per anno. Filtri e ricerca arriveranno con i contenuti. */
export function render(): PageResult {
  const now = new Date();
  const years = archiveByYear(now);

  const body =
    years.length === 0
      ? emptyState({
          title: 'Nessun articolo pubblicato',
          text: "L'archivio del giornale è vuoto.",
        })
      : years.map(
          (group) => html`<section class="archive-year" aria-labelledby="anno-${group.year}">
            <h2 id="anno-${group.year}">${group.year}</h2>
            <div class="grid">${group.articles.map((article) => journalCard(article, { now, level: 3 }))}</div>
          </section>`,
        );

  return {
    title: 'Giornale',
    description: 'Notizie, avvisi, eventi e aggiornamenti da Rivalta sul Mincio.',
    main: html`
      <div class="page-header">
        <h1>Giornale</h1>
        <p class="lead">Notizie, avvisi, eventi e aggiornamenti da Rivalta sul Mincio. L'archivio conserva anche i contenuti non più attuali.</p>
      </div>
      ${body}
    `,
  };
}
