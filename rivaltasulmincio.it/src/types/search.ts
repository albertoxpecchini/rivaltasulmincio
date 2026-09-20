/** Voce dell'indice di ricerca unificato (FUNDAMENTA.md «RICERCA»). */
export type SearchEntry = {
  id: string;
  /** Etichetta del tipo di risultato, mostrata all'utente. */
  kind: string;
  title: string;
  /** Testo secondario usato per la corrispondenza. */
  text: string;
  url: string;
  official?: boolean;
};
