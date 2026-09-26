import { isAfter } from '../lib/dates';
import type { Notice } from '../types';

/*
 * Avvisi a tempo. Una proroga si registra spostando `validUntil`; un avviso
 * scaduto resta qui, e la Home smette di mostrarlo da sé.
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
    text: 'Prezzo massimo sui carburanti venduti da Enilive, circa 17 centesimi sotto le medie di oggi. Per 30 giorni, prorogabili fino a fine anno.',
    // 30 giorni dal 28 settembre: fino al 27 ottobre compreso (dopo il cambio d'ora del 25).
    validFrom: '2026-09-28T00:00:00+02:00',
    validUntil: '2026-10-28T00:00:00+01:00',
    places: ['eni'],
    logo: { src: '/loghi/enilive.svg', alt: 'Enilive', width: 469, height: 526 },
    source: {
      name: 'Comunicato Eni',
      url: 'https://www.eni.com/it-IT/media/comunicati-stampa/2026/09/cs-eni-aggiudica-dal-28-settembre-tetto-prezzi-gasolio-benzina.html',
      date: '2026-09-25',
    },
  },
];

/** Avvisi non ancora scaduti a `now`, eventualmente solo quelli di un luogo. */
export function activeNotices(now: Date, place?: string): Notice[] {
  return notices.filter(
    (notice) => isAfter(notice.validUntil, now) && (place === undefined || notice.places.includes(place)),
  );
}
