import type { SourceReference } from './source';

/*
 * Giornale (JOURNAL.md «SCHEMA ARTICOLO»).
 * Le etichette dei tipi stanno in `src/journal/taxonomy.ts`.
 */

export type JournalType =
  | 'breaking'
  | 'cronaca'
  | 'avviso'
  | 'evento'
  | 'cultura'
  | 'sport'
  | 'associazioni'
  | 'scuola'
  | 'territorio'
  | 'ambiente'
  | 'natura'
  | 'meteo'
  | 'mincio'
  | 'commercio'
  | 'agricoltura'
  | 'comunita'
  | 'storia'
  | 'memoria-locale'
  | 'viabilita'
  | 'trasporti'
  | 'servizi'
  | 'comune'
  | 'provincia-regione'
  | 'lavori-pubblici'
  | 'sicurezza'
  | 'protezione-civile'
  | 'salute-pubblica'
  | 'necrologio'
  | 'economia-locale'
  | 'foto-dal-paese'
  | 'video'
  | 'documento'
  | 'approfondimento'
  | 'dati'
  | 'anniversario'
  | 'retrospettiva'
  | 'aggiornamento'
  | 'correzione';

export type JournalStatus = 'draft' | 'scheduled' | 'published' | 'updated' | 'archived';

export type JournalArticle = {
  /** ID stabile (`article-001`): non cambia mai. */
  id: string;
  /** Slug stabile: definisce l'URL `/giornale/AAAA/MM/slug` e non segue le modifiche al titolo. */
  slug: string;
  type: JournalType;

  title: string;
  subtitle?: string;
  excerpt?: string;
  /** Testo in Markdown ristretto: i blocchi ammessi e la loro resa stanno in CONTENT.md. */
  content: string;

  status: JournalStatus;
  featured?: boolean;
  breaking?: boolean;
  breakingUntil?: string;
  pinned?: boolean;
  /** 1 ordinario · 2 rilevante · 3 importante · 4 urgente · 5 emergenza. */
  priority?: 1 | 2 | 3 | 4 | 5;

  publishedAt: string;
  updatedAt?: string;
  validFrom?: string;
  validUntil?: string;

  author?: string;
  organization?: string;

  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };

  event?: {
    startsAt?: string;
    endsAt?: string;
    venue?: string;
    organizer?: string;
    price?: string;
    bookingUrl?: string;
  };

  image?: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
    /** Dimensioni reali: riservano lo spazio e dicono se l'immagine è verticale. */
    width?: number;
    height?: number;
  };

  gallery?: string[];
  videoUrl?: string;
  documentUrl?: string;

  source?: SourceReference;

  tags?: string[];
  relatedPlaces?: string[];
  relatedBusinesses?: string[];
  relatedEvents?: string[];

  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };

  revisions?: {
    id: string;
    createdAt: string;
    changes: string;
  }[];
};
