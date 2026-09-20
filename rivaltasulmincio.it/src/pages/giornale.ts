import type { PageResult } from '../app/page';
import { emptyState } from '../components/empty-state';
import { pageHeader } from '../components/page-header';
import { journalRows } from '../journal/card';
import { archiveByYear } from '../journal/service';
import { html } from '../lib/html';

/** Archivio del giornale, per anno, come righe d'archivio. Filtri e ricerca arriveranno con i contenuti. */
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
            ${journalRows(group.articles, { now })}
          </section>`,
        );

  return {
    title: 'Giornale',
    description: 'Notizie, avvisi, eventi e aggiornamenti da Rivalta sul Mincio.',
    main: html`
      ${pageHeader({
        title: 'Giornale',
        lead: "Notizie, avvisi, eventi e aggiornamenti da Rivalta sul Mincio. L'archivio conserva anche i contenuti non più attuali.",
      })}
      ${body}
    `,
  };
}
