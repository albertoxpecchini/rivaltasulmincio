export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;

/** Distanza in metri lungo la sfera (haversine): basta per ordinare e filtrare luoghi. */
export function distanceM(a: LatLng, b: LatLng): number {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** «45.18019, 10.67714»: cinque decimali, circa un metro. */
export function formatCoordinates(point: LatLng): string {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}
