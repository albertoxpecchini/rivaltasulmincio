import articlesJson from '../../data/journal/journal.json';
import type { JournalArticle } from '../types';

/** Articoli del giornale: dataset → tipo. La logica sta in `src/journal/service.ts`. */
export const articles: JournalArticle[] = articlesJson as JournalArticle[];
