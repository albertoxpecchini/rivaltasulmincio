/*
 * Blocchi di contenuto (CONTENT.md).
 *
 * Il testo di un articolo viene letto una volta sola e diventa questa
 * struttura: da qui si ricava l'HTML della pagina, il testo per la ricerca e
 * l'estratto. Chi scrive l'articolo non tocca mai questi tipi: scrive
 * Markdown ristretto.
 */

export type TableCell = {
  text: string;
  /** Cella di intestazione: la prima colonna quando nomina la riga. */
  header?: boolean;
};

export type ContentBlock =
  /** `# Titolo` · `## Titolo` · `### Titolo` */
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  /** `%% sottotitolo`: l'occhiello sotto un titolo, non un titolo a sua volta. */
  | { kind: 'subtitle'; text: string }
  /** Testo normale. */
  | { kind: 'paragraph'; text: string }
  /** `// testo`: testo secondario, per precisazioni e contorno. */
  | { kind: 'small'; text: string }
  /** `> citazione` con `> — Autore` facoltativo in chiusura. */
  | { kind: 'quote'; text: string; cite?: string }
  /** `- voce` oppure `1. voce`. */
  | { kind: 'list'; ordered: boolean; start?: number; items: string[] }
  /** Tabella con intestazione e allineamento per colonna. */
  | { kind: 'table'; header: TableCell[]; align: ('left' | 'right' | 'center')[]; rows: TableCell[][] }
  /** `>> [Titolo] testo`: nota a margine, riquadrata. */
  | { kind: 'note'; title?: string; text: string }
  /** Blocco di codice recintato da ```. */
  | { kind: 'code'; language?: string; code: string };
