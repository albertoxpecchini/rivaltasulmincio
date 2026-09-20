import { articles } from '../data/journal';
import { daysSince, isAfter, isBefore, yearMonth } from '../lib/dates';
import type { JournalArticle } from '../types';

/*
 * Regole editoriali del giornale (JOURNAL.md).
 * Tutte le funzioni ricevono `now`: il sito è statico, quindi «adesso» è il
 * momento della build.
 */

/**
 * JOURNAL.md chiede che un articolo `featured` non resti in evidenza senza
 * limite temporale, ma non fissa il limite: questo valore è il default del
 * progetto e può essere rivisto.
 */
export const FEATURED_MAX_AGE_DAYS = 30;

const VISIBLE_STATUSES = new Set<JournalArticle['status']>(['published', 'updated', 'archived']);
const CURRENT_STATUSES = new Set<JournalArticle['status']>(['published', 'updated']);

export function articlePath(article: JournalArticle): string {
  const { year, month } = yearMonth(article.publishedAt);
  return `/giornale/${year}/${month}/${article.slug}`;
}

/** Pubblicati e ancora correnti: quelli che la Home può mostrare. */
export function currentArticles(now: Date): JournalArticle[] {
  return articles
    .filter((article) => CURRENT_STATUSES.has(article.status) && !isAfter(article.publishedAt, now))
    .sort(byDateDesc);
}

/** Tutto l'archivio consultabile: correnti e archiviati, mai bozze o programmati. */
export function archiveArticles(now: Date): JournalArticle[] {
  return articles
    .filter((article) => VISIBLE_STATUSES.has(article.status) && !isAfter(article.publishedAt, now))
    .sort(byDateDesc);
}

export function findArticle(
  year: string,
  month: string,
  slug: string,
  now: Date,
): JournalArticle | undefined {
  return archiveArticles(now).find((article) => {
    const date = yearMonth(article.publishedAt);
    return article.slug === slug && date.year === year && date.month === month;
  });
}

export function isBreakingActive(article: JournalArticle, now: Date): boolean {
  if (!article.breaking) return false;
  return article.breakingUntil ? !isBefore(article.breakingUntil, now) : true;
}

/** Avviso o comunicazione con `validUntil` già passato. */
export function isExpired(article: JournalArticle, now: Date): boolean {
  return isBefore(article.validUntil, now);
}

export function isEventOver(article: JournalArticle, now: Date): boolean {
  if (article.type !== 'evento' || !article.event) return false;
  return isBefore(article.event.endsAt ?? article.event.startsAt, now);
}

/**
 * Selezione per la Home (JOURNAL.md «ARTICOLI IN EVIDENZA»):
 * 1. breaking attivo · 2. pinned · 3. featured recente · 4. più recente.
 * Gli avvisi scaduti escono dalla Home e restano in archivio.
 */
export function homeSelection(now: Date, limit = 5): { lead?: JournalArticle; others: JournalArticle[] } {
  const tier = (article: JournalArticle): number => {
    if (isBreakingActive(article, now)) return 0;
    if (article.pinned) return 1;
    if (article.featured && daysSince(article.publishedAt, now) <= FEATURED_MAX_AGE_DAYS) return 2;
    return 3;
  };
  const ranked = currentArticles(now)
    .filter((article) => !isExpired(article, now))
    .sort(
      (a, b) =>
        tier(a) - tier(b) || (b.priority ?? 1) - (a.priority ?? 1) || byDateDesc(a, b),
    );
  return { lead: ranked[0], others: ranked.slice(1, limit) };
}

/** Archivio raggruppato per anno, dal più recente. */
export function archiveByYear(now: Date): { year: string; articles: JournalArticle[] }[] {
  const groups = new Map<string, JournalArticle[]>();
  for (const article of archiveArticles(now)) {
    const { year } = yearMonth(article.publishedAt);
    groups.set(year, [...(groups.get(year) ?? []), article]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, list]) => ({ year, articles: list }));
}

function byDateDesc(a: JournalArticle, b: JournalArticle): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}
