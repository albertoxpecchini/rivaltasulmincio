import { posterFor } from '../data/posters';
import { archiveArticles, articlePath } from '../journal/service';
import { journalTypeLabel } from '../journal/taxonomy';
import { formatAddress, namedPlaces } from '../places/service';
import { categoryLabel } from '../places/taxonomy';
import { isOfficial, listSources } from '../services/sources';
import type { SearchEntry } from '../types';

/**
 * Indice di ricerca unificato: ogni dataset contribuisce con le proprie voci
 * attraverso il rispettivo servizio, senza duplicare la logica di ricerca.
 * Viene scritto in `search-index.json` a build time e letto dal client.
 */
export function buildSearchIndex(now = new Date()): SearchEntry[] {
  const visibili = archiveArticles(now);

  const articoli: SearchEntry[] = visibili.map((article) => ({
    id: article.id,
    kind: journalTypeLabel(article.type),
    title: article.title,
    text: [article.excerpt, article.location?.name, ...(article.tags ?? [])].filter(Boolean).join(' '),
    url: articlePath(article),
  }));

  /*
   * Le locandine sono pagine a sé: ci si arriva cercando l'orario, il menù o il
   * nome di una contrada, che nell'articolo non compaiono tutti.
   */
  const locandine: SearchEntry[] = visibili.flatMap((article) => {
    const poster = posterFor(article.slug);
    if (!poster) return [];
    return [
      {
        id: poster.id,
        kind: 'Locandina',
        title: `Locandina · ${article.title}`,
        text: poster.search,
        url: `${articlePath(article)}/locandina`,
      },
    ];
  });

  const luoghi: SearchEntry[] = namedPlaces()
    .filter((place) => place.status === 'active')
    .map((place) => ({
      id: place.id,
      kind: place.kind,
      title: place.name ?? place.kind,
      text: [categoryLabel(place.category), formatAddress(place.address)].filter(Boolean).join(' '),
      url: `/luoghi/${place.slug}`,
    }));

  const fonti: SearchEntry[] = listSources().map((source) => ({
    id: source.id,
    kind: 'Fonte',
    title: source.name,
    text: source.scope,
    url: `/fonti#${source.id}`,
    official: isOfficial(source) || undefined,
  }));

  return [...articoli, ...locandine, ...luoghi, ...fonti];
}
