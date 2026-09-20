/*
 * Configurazione cartografica (OSM.md «Tile», «Attribution»).
 * Tile standard della OSM Foundation, ammesse per uso interattivo leggero
 * con attribuzione visibile e senza download massivo (Tile Usage Policy).
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_ZOOM = {
  /** Vista del paese. */
  village: 15,
  /** Scheda di un singolo luogo. */
  single: 17,
  min: 12,
  max: 19,
} as const;

/** Dimensioni marker (ICONS.md «Marker»): 24 di base, 28 selezionato. */
export const MARKER_SIZE = 24;
