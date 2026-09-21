import L from 'leaflet';
import { iconMarkup } from '../components/icons';
import { PLACE_CATEGORIES } from '../places/taxonomy';
import type { MapPlace, PlaceCategory } from '../types';
import { MARKER_SIZE, MARKER_TOUCH_SIZE } from './config';

/*
 * Marker dei luoghi: cerchio del colore di categoria con l'icona Lucide della
 * categoria (colore e icona insieme, mai solo il colore). Accessibile da
 * tastiera con nome leggibile. Su touch il bersaglio è più grande del cerchio
 * (RESPONSIVE.md «Pointer precision»: mouse = precisione, touch = target grandi).
 */
export function placeMarkerLabel(place: MapPlace): string {
  const name = place.name ?? (place.street ? `${place.kind} · ${place.street}` : place.kind);
  return place.name ? `${name} (${place.kind})` : name;
}

const hitSize = (): number => (window.matchMedia('(pointer: coarse)').matches ? MARKER_TOUCH_SIZE : MARKER_SIZE);

/** Icona di categoria: anche per la mappa di un singolo luogo, al posto dell'immagine predefinita di Leaflet. */
export function createPinIcon(category: PlaceCategory): L.DivIcon {
  const size = hitSize();
  return L.divIcon({
    className: 'map-marker-wrap',
    html: `<span class="map-marker" data-category="${category}">${iconMarkup(PLACE_CATEGORIES[category].icon, 14)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createPlaceMarker(place: MapPlace): L.Marker {
  const label = placeMarkerLabel(place);
  const icon = createPinIcon(place.category);
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
