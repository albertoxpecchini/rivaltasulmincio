import postersJson from '../../data/journal/posters.json';
import type { Poster } from '../types';

/*
 * Locandine: dataset → tipo, con il markup del foglio caricato dal file
 * importato. `import.meta.glob` con `query: '?raw'` legge i frammenti a build
 * time, così il markup finisce nell'HTML statico senza richieste in più.
 */
const markups = import.meta.glob('../../data/journal/locandine/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function markupOf(file: string): string {
  const path = `../../data/journal/locandine/${file}.html`;
  const markup = markups[path];
  if (markup === undefined) {
    throw new Error(
      `locandina "${file}": manca ${path}. Importarla con "node scripts/locandina-import.ts <sorgente> ${file}".`,
    );
  }
  return markup;
}

export const posters: Poster[] = (postersJson as Omit<Poster, 'markup'>[]).map((poster) => ({
  ...poster,
  markup: markupOf(poster.file),
}));

/** La locandina di un articolo, quando esiste. */
export function posterFor(articleSlug: string): Poster | undefined {
  return posters.find((poster) => poster.articleSlug === articleSlug);
}
