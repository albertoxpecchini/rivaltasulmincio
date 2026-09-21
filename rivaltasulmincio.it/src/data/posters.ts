import postersJson from '../../data/journal/posters.json';
import type { Poster } from '../types';

/** Locandine degli eventi: dataset → tipo. Il rendering sta in `src/journal/poster.ts`. */
export const posters: Poster[] = postersJson as Poster[];

/** La locandina di un articolo, quando esiste. */
export function posterFor(articleSlug: string): Poster | undefined {
  return posters.find((poster) => poster.articleSlug === articleSlug);
}
