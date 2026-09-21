/*
 * Locandina (JOURNAL.md «MEDIA», IMAGES.md «Metadati»).
 *
 * La locandina del sito è il documento originale degli organizzatori: il suo
 * HTML arriva dal file sorgente tramite `scripts/locandina-import.ts` e viene
 * pubblicato così com'è, non ricostruito. Per questo qui non c'è uno schema
 * del contenuto — giornate, menù, contrade: quello vive nel foglio stesso.
 * Restano i dati che il sito deve conoscere per collegarlo, indicizzarlo e
 * mostrarne l'anteprima.
 */
export type Poster = {
  /** ID stabile (`poster-001`). */
  id: string;
  /** Articolo del giornale a cui appartiene (`JournalArticle.slug`). */
  articleSlug: string;
  /** Titolo della locandina, per la testata della pagina e i collegamenti. */
  title: string;
  /** Descrizione breve: cosa mostra il foglio. */
  description: string;
  /**
   * Nome del file importato in `data/journal/locandine/<file>.html`.
   * Il markup vero e proprio viene caricato da `src/data/posters.ts`.
   */
  file: string;
  /** Il markup del foglio, riempito a build time da `src/data/posters.ts`. */
  markup: string;
  /**
   * Testo cercabile del foglio: orari, menù, contrade, contatti.
   * Serve alla ricerca, che non può leggere dentro il markup.
   */
  search: string;
  /** Riproduzione fotografica del foglio, per anteprima e download. */
  image: {
    src: string;
    widths: number[];
    width: number;
    height: number;
    alt: string;
  };
};
