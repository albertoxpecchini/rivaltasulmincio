import metaJson from '../../data/osm/meta.json';
import placesJson from '../../data/places/places.json';
import type { OsmSyncMeta, Place } from '../types';

/** Luoghi e stato della sincronizzazione OSM: dataset → tipo. La logica sta in `src/places/service.ts`. */
// I tag OSM sono chiavi libere: il JSON importato viene tipizzato per intero come `Place`.
export const places: Place[] = placesJson as unknown as Place[];
export const osmMeta: OsmSyncMeta = metaJson as unknown as OsmSyncMeta;
