import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '../lib/geo';
import { MAP_ZOOM, TILE_ATTRIBUTION, TILE_URL } from './config';

/*
 * Motore cartografico: crea la mappa Leaflet con tile e attribuzione.
 * Non conosce i dati del progetto: quelli arrivano da `markers.ts` e `mount.ts`.
 */
export type MapMode = 'full' | 'embed' | 'single';

export function createMap(container: HTMLElement, options: { center: LatLng; zoom: number; mode: MapMode }): L.Map {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const embedded = options.mode !== 'full';

  const map = L.map(container, {
    center: [options.center.lat, options.center.lng],
    zoom: options.zoom,
    minZoom: MAP_ZOOM.min,
    maxZoom: MAP_ZOOM.max,
    zoomAnimation: !reduceMotion,
    fadeAnimation: !reduceMotion,
    markerZoomAnimation: !reduceMotion,
    // Una mappa inserita in una pagina non deve catturare lo scroll finché non viene attivata.
    scrollWheelZoom: !embedded,
    attributionControl: true,
  });

  L.tileLayer(TILE_URL, { maxZoom: MAP_ZOOM.max, attribution: TILE_ATTRIBUTION }).addTo(map);
  L.control.scale({ imperial: false }).addTo(map);

  if (embedded) {
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    container.addEventListener('click', enable);
    container.addEventListener('focusin', enable);
    container.addEventListener('mouseleave', disable);
    container.addEventListener('focusout', (event) => {
      if (!container.contains(event.relatedTarget as Node | null)) disable();
    });
  }

  return map;
}
