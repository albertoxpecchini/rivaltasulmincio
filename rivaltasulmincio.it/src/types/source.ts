/*
 * Fonti (FUNDAMENTA.md «FONTI», BRAND.md «Regola sulle fonti», OFFICIAL-SOURCES.md).
 */

/** Riferimento minimo a una fonte, allegato a un dato. */
export type SourceReference = {
  name: string;
  url?: string;
  type?: string;
  checkedAt?: string;
  /** Collegamento al registro fonti (`Source.id`), quando la fonte è censita. */
  sourceId?: string;
};

export type SourceType =
  | 'municipality'
  | 'region'
  | 'province'
  | 'national-institute'
  | 'agency'
  | 'geodata'
  | 'weather'
  | 'press'
  | 'local'
  | 'other';

/** Voce del registro fonti (`data/sources/sources.json`). */
export type Source = {
  id: string;
  name: string;
  type: SourceType;
  /** Ordine di preferenza (BRAND.md): 1 = più autorevole. */
  rank: number;
  /** Quale tipo di informazione fornisce. */
  scope: string;
  url?: string;
  domain?: string;
  /** Badge «fonte ufficiale» (OFFICIAL-SOURCES.md): solo per fonti verificate. */
  badge?: 'official';
  verified?: boolean;
  verifiedAt?: string;
  license?: string;
  attribution?: string;
  attributionUrl?: string;
  /** Condizioni d'uso dichiarate dalla fonte, quando note. */
  terms?: string;
  /** Ultimo controllo di raggiungibilità dell'URL da parte del progetto. */
  checkedAt?: string;
};

/** Gerarchia delle fonti per tipo di informazione (FUNDAMENTA.md). */
export type SourceHierarchyRule = {
  information: string;
  sourceId?: string;
  note?: string;
};
