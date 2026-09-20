import { osmMeta, places } from '../data/places';
import type { LatLng } from '../lib/geo';
import type { MapPlace, OsmReference, Place, PlaceCategory } from '../types';
import { PLACE_CATEGORIES, PLACE_CATEGORY_ORDER, type CategoryInfo } from './taxonomy';

const collator = new Intl.Collator('it');

/** Luoghi presenti nell'ultima sincronizzazione: con nome in ordine alfabetico, poi gli altri per tipo. */
export function activePlaces(): Place[] {
  return places.filter((place) => place.status === 'active').sort(byLabel);
}

/** Luoghi con nome (quelli che hanno una pagina), archiviati compresi. */
export function namedPlaces(): Place[] {
  return places.filter((place) => place.name).sort(byLabel);
}

export function findPlace(slug: string): Place | undefined {
  return places.find((place) => place.slug === slug);
}

export function placesByCategory(): { category: PlaceCategory; info: CategoryInfo; places: Place[] }[] {
  const active = activePlaces();
  return PLACE_CATEGORY_ORDER.map((category) => ({
    category,
    info: PLACE_CATEGORIES[category],
    places: active.filter((place) => place.category === category),
  })).filter((group) => group.places.length > 0);
}

/** Etichetta sempre disponibile: nome, oppure tipo e via per gli elementi senza nome. */
export function placeLabel(place: Pick<Place, 'name' | 'kind' | 'address'>): string {
  if (place.name) return place.name;
  return place.address?.street ? `${place.kind} · ${place.address.street}` : place.kind;
}

/** Percorso della scheda: solo i luoghi con nome ne hanno una. */
export function placePath(place: Pick<Place, 'name' | 'slug'>): string | undefined {
  return place.name ? `/luoghi/${place.slug}` : undefined;
}

export function formatAddress(address: Place['address']): string | undefined {
  if (!address) return undefined;
  const line = [address.street, address.housenumber].filter(Boolean).join(' ');
  const town = [address.postcode, address.city].filter(Boolean).join(' ');
  return [line, town].filter(Boolean).join(', ') || undefined;
}

export function osmElementUrl(ref: OsmReference): string {
  return `https://www.openstreetmap.org/${ref.osmType}/${ref.osmId}`;
}

/** Centro della mappa: il nodo OSM del paese, letto dalla sincronizzazione. */
export function mapCenter(): LatLng {
  return osmMeta.area.center;
}

export function osmDataTimestamp(): string | undefined {
  return osmMeta.osmTimestamp ?? undefined;
}

/** Dati minimi per marker e pannello, scritti in `/places.json`. */
export function mapFeed(): MapPlace[] {
  return activePlaces().map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    kind: place.kind,
    lat: place.lat,
    lng: place.lng,
    street: place.address?.street,
    page: placePath(place),
    osm: `${place.osm.osmType}/${place.osm.osmId}`,
  }));
}

function byLabel(a: Place, b: Place): number {
  if (Boolean(a.name) !== Boolean(b.name)) return a.name ? -1 : 1;
  return collator.compare(placeLabel(a), placeLabel(b));
}
