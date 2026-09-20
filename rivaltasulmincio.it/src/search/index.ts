import { archiveArticles, articlePath } from '../journal/service';
import { journalTypeLabel } from '../journal/taxonomy';
import { isOfficial, listSources } from '../services/sources';
import type { SearchEntry } from '../types';

/**
 * Indice di ricerca unificato: ogni dataset contribuisce con le proprie voci
 * attraverso il rispettivo servizio, senza duplicare la logica di ricerca.
 * Viene scritto in `search-index.json` a build time e letto dal client.
 */
export function buildSearchIndex(now = new Date()): SearchEntry[] {
  const fonti: SearchEntry[] = listSources().map((source) => ({
    id: source.id,
    kind: 'Fonte',
    title: source.name,
    text: source.scope,
    url: `/fonti#${source.id}`,
    official: isOfficial(source) || undefined,
  }));

  const articoli: SearchEntry[] = archiveArticles(now).map((article) => ({
    id: article.id,
    kind: journalTypeLabel(article.type),
    title: article.title,
    text: [article.excerpt, article.location?.name, ...(article.tags ?? [])].filter(Boolean).join(' '),
    url: articlePath(article),
  }));

  return [...articoli, ...fonti];
}
