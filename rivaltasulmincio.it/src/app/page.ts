import type { Html } from '../lib/html';

/*
 * Contratto tra router, pagine e layout.
 * Una pagina riceve il percorso e i parametri, restituisce titolo, metadati e
 * il contenuto di <main>; il layout costruisce il documento completo.
 */

export type PageParams = Record<string, string>;

export type PageContext = {
  path: string;
  params: PageParams;
};

export type PageResult = {
  /** Titolo senza il nome del sito: il layout compone `<title>`. */
  title: string;
  description?: string;
  robots?: 'noindex';
  /** Stato HTTP, 200 se assente. */
  status?: number;
  main: Html;
};

export type PageModule = {
  /** `null` = contenuto inesistente → pagina 404. */
  render(context: PageContext): PageResult | null;
  /** Percorsi da generare, solo per rotte con parametri. */
  paths?(): string[];
};

export type RenderedDocument = {
  status: number;
  head: string;
  html: string;
};
