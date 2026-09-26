/*
 * Avviso a tempo (JOURNAL.md «AVVISI TEMPORANEI»): una striscia breve che
 * affianca le pagine finché la condizione dura, poi sparisce dalla Home.
 * Non è un articolo: dice cosa cambia, per quanto, dove, e da quale fonte.
 */
export type Notice = {
  /** ID stabile, usato anche per l'id del titolo (`avviso-<id>`). */
  id: string;
  /** Argomento, in mono sopra il titolo: «Carburanti». */
  topic: string;
  title: string;
  /** Cifre da leggere a colpo d'occhio: etichetta e valore già formattato. */
  figures: { label: string; value: string }[];
  text: string;
  /** Istante ISO da cui la condizione vale; l'avviso si mostra anche prima, come annuncio. */
  validFrom: string;
  /** Istante ISO (escluso) in cui la condizione finisce e l'avviso sparisce. */
  validUntil: string;
  /** Luoghi del paese toccati dall'avviso (`Place.slug`): la loro scheda lo mostra. */
  places: string[];
  /**
   * Marchio del soggetto dell'avviso, così com'è distribuito (LOGO.md «Relazione
   * con enti»: loghi esterni con asset e regole propri). Identifica di chi si
   * parla, non suggerisce collaborazione.
   */
  logo?: { src: string; alt: string; width: number; height: number };
  source: { name: string; url: string; date: string };
};
