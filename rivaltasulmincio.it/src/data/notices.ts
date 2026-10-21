import { isAfter } from '../lib/dates';
import type { Notice } from '../types';

/*
 * Avvisi a tempo. Una proroga si registra spostando `validUntil`; un avviso
 * scaduto smette di comparire da sé. Oggi non ce n'è nessuno: la striscia
 * sul tetto Eni ai carburanti è stata tolta il 21 ottobre 2026.
 */
export const notices: Notice[] = [];

/** Avvisi non ancora scaduti a `now`. */
export function activeNotices(now: Date): Notice[] {
  return notices.filter((notice) => isAfter(notice.validUntil, now));
}
