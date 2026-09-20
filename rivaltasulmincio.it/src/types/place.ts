import type { SourceReference } from './source';

/*
 * Luoghi (FUNDAMENTA.md «MODELLO DATI», OSM.md «Dati locali + OSM»).
 * Oggi i luoghi derivano da OpenStreetMap; i dati curati dal progetto
 * (descrizioni, fotografie) si aggiungeranno allo stesso record.
 */

export type PlaceCategory =
  | 'attivita'
  | 'servizi'
  | 'cultura'
  | 'sport'
  | 'natura'
  | 'mobilita'
  | 'storia'
  | 'territorio'
  | 'acqua';

export type OsmType = 'node' | 'way' | 'relation';

export type OsmReference = {
  osmType: OsmType;
  osmId: number;
};

export type Place = {
  /** ID stabile (`place-001`): non cambia mai. */
  id: string;
  /** Slug stabile: URL `/luoghi/<slug>`. */
  slug: string;
  /** Nome OSM; assente per elementi senza nome (parcheggi, fontanelle). */
  name?: string;
  category: PlaceCategory;
  /** Tipo leggibile: «Farmacia», «Parcheggio», «Corte». */
  kind: string;
  lat: number;
  lng: number;
  /** Elemento OSM originale: punto o centroide di area/linea. */
  geometry: 'point' | 'area';

  address?: {
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  /** Stringa `opening_hours` di OSM, non interpretata. */
  openingHours?: string;

  osm: OsmReference & {
    /** Altri elementi OSM riuniti in questo luogo (segmenti, duplicati). */
    also?: OsmReference[];
    tags: Record<string, string>;
  };

  /** `active` = presente nell'ultima sincronizzazione; `removed` = sparito da OSM, conservato in archivio. */
  status: 'active' | 'removed';
  source: SourceReference;
  createdAt: string;
  updatedAt: string;
};

/** Voce leggera per la mappa (`/places.json`): solo ciò che serve a marker e pannello. */
export type MapPlace = {
  id: string;
  name?: string;
  category: PlaceCategory;
  kind: string;
  lat: number;
  lng: number;
  street?: string;
  /** Pagina di dettaglio, solo per i luoghi con nome. */
  page?: string;
  /** `way/123`: per il link all'elemento OpenStreetMap. */
  osm: string;
};

/** Esito dell'ultima sincronizzazione (`data/osm/meta.json`). */
export type OsmSyncMeta = {
  syncedAt: string;
  osmTimestamp: string | null;
  source: { name: string; sourceId: string; license: string; attribution: string };
  area: {
    centerOsm: OsmReference;
    radiusM: number;
    note: string;
    center: { lat: number; lng: number };
  };
  query: string;
  counts: Record<string, number>;
};
