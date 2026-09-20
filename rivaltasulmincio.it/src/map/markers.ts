import L from 'leaflet';
import { iconMarkup } from '../components/icons';
import { PLACE_CATEGORIES } from '../places/taxonomy';
import type { MapPlace } from '../types';
import { MARKER_SIZE } from './config';

/*
 * Marker dei luoghi: cerchio del colore di categoria con l'icona Lucide della
 * categoria (colore e icona insieme, mai solo il colore). Accessibile da
 * tastiera con nome leggibile.
 */
export function placeMarkerLabel(place: MapPlace): string {
  const name = place.name ?? (place.street ? `${place.kind} · ${place.street}` : place.kind);
  return place.name ? `${name} (${place.kind})` : name;
}

export function createPlaceMarker(place: MapPlace): L.Marker {
  const label = placeMarkerLabel(place);
  const icon = L.divIcon({
    className: 'map-marker-wrap',
    html: `<span class="map-marker" data-category="${place.category}">${iconMarkup(PLACE_CATEGORIES[place.category].icon, 14)}</span>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  });
  const marker = L.marker([place.lat, place.lng], { icon, title: label, alt: label, keyboard: true, riseOnHover: true });
  marker.on('add', () => marker.getElement()?.setAttribute('aria-label', label));
  return marker;
}

export function setMarkerSelected(marker: L.Marker, selected: boolean): void {
  const element = marker.getElement();
  if (!element) return;
  element.classList.toggle('is-selected', selected);
  if (selected) marker.setZIndexOffset(1000);
  else marker.setZIndexOffset(0);
}
