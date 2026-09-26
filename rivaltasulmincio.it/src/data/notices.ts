import { isAfter } from '../lib/dates';
import type { Notice } from '../types';

/*
 * Avvisi a tempo. Una proroga si registra spostando `validUntil`; un avviso
 * scaduto resta qui, e le pagine smettono di mostrarlo da sé.
 */
export const notices: Notice[] = [
  {
    id: 'eni-tetto-carburanti',
    topic: 'Carburanti',
    title: 'Eni fissa un tetto al prezzo dei carburanti',
    figures: [
      { label: 'Gasolio', value: '2,19 €/l' },
      { label: 'Benzina', value: '1,99 €/l' },
    ],
    // Il distributore Eni di Strada Francesca Est non è della rete Enilive: la
    // stazione Enilive più vicina è a Goito (indirizzo dall'utente, che abita
    // qui; OpenStreetMap non ha l'indirizzo di quella stazione, solo il marchio).
    text: 'Vale nelle stazioni Enilive: la più vicina è a Goito, Strada Statale Goitese 417. Per 30 giorni, prorogabili fino a fine anno.',
    // 30 giorni dal 28 settembre: fino al 27 ottobre compreso (dopo il cambio d'ora del 25).
    validFrom: '2026-09-28T00:00:00+02:00',
    validUntil: '2026-10-28T00:00:00+01:00',
    logo: { src: '/loghi/enilive.svg', alt: 'Enilive', width: 469, height: 526 },
    source: {
      name: 'Comunicato Eni',
      url: 'https://www.eni.com/it-IT/media/comunicati-stampa/2026/09/cs-eni-aggiudica-dal-28-settembre-tetto-prezzi-gasolio-benzina.html',
      date: '2026-09-25',
    },
  },
];

/** Avvisi non ancora scaduti a `now`. */
export function activeNotices(now: Date): Notice[] {
  return notices.filter((notice) => isAfter(notice.validUntil, now));
}
