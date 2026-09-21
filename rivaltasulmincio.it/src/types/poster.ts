/*
 * Locandina (JOURNAL.md «MEDIA», IMAGES.md «Metadati»).
 *
 * Una locandina è un documento grafico con un contenuto strutturato: fascia
 * oraria per giornata, menù, prezzi, contatti, promotori. Il progetto la
 * conserva come dato, non come immagine, così il programma resta testo vero —
 * leggibile, ricercabile, accessibile e stampabile — e l'immagine originale
 * rimane solo la riproduzione fedele del foglio distribuito in paese.
 *
 * Il rendering sta in `src/journal/poster.ts`: qui non si decide nulla di
 * grafico oltre al colore identitario di ciascuna giornata e contrada, che
 * appartiene alla locandina stessa e non al design system del sito.
 */

/** Voce oraria di una giornata: `time` può essere un'ora o «a seguire». */
export type PosterEntry = {
  /** «15:00», «a seguire». */
  time: string;
  /** Testo della voce. Il grassetto della locandina sta in `strong`. */
  text: string;
  /** Parti del testo in evidenza sulla locandina, come vi compaiono. */
  strong?: string[];
  /** Riquadro sotto la voce: prenotazioni, precisazioni. */
  note?: { label?: string; text: string };
};

/** Una giornata della locandina. */
export type PosterDay = {
  id: string;
  /** «SABATO 26 SETTEMBRE». */
  heading: string;
  /** Data ISO della giornata, per i dati strutturati. */
  date: string;
  /** Colore identitario della giornata sulla locandina. */
  color: string;
  entries: PosterEntry[];
};

/** Menù del pranzo con i relativi prezzi. */
export type PosterMenu = {
  title: string;
  courses: { text: string; strong?: boolean }[];
  /** «acqua e vino inclusi». */
  note?: string;
  prices: { label: string; value: string }[];
};

/** Le contrade che corrono il Palio. */
export type PosterContrada = {
  id: string;
  name: string;
  /** Colore della bandierina sulla locandina. */
  color: string;
  /** Testo su fondo chiaro: la bandierina gialla vuole testo scuro. */
  ink?: 'light' | 'dark';
  logo: string;
};

/** Riquadro della prenotazione obbligatoria. */
export type PosterBooking = {
  kicker: string;
  title: string;
  note?: string;
  contacts: { name: string; phone: string }[];
};

/** Logo di un ente promotore. */
export type PosterLogo = {
  name: string;
  src: string;
  width: number;
  height: number;
};

export type Poster = {
  /** ID stabile (`poster-001`). */
  id: string;
  /** Articolo del giornale a cui appartiene (`JournalArticle.slug`). */
  articleSlug: string;
  kicker: string;
  /** Titolo su due righe, come sulla locandina. */
  title: string[];
  place: string;
  dates: string;
  days: PosterDay[];
  menu?: PosterMenu;
  music?: { kicker: string; text: string; strong?: string[]; logo: string };
  highlight?: string;
  booking?: PosterBooking;
  contrade?: { label: string; items: PosterContrada[] };
  credits: { text: string; strong?: string[] };
  links: string[];
  logos: PosterLogo[];
  /** Riproduzione fedele del foglio distribuito in paese. */
  image: {
    src: string;
    widths: number[];
    width: number;
    height: number;
    alt: string;
  };
};
