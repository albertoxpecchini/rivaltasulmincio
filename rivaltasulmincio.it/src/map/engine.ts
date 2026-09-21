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
  /*
   * Una mappa inserita in una pagina non deve catturare lo scroll finché non
   * viene attivata: la rotella sul desktop, il trascinamento a un dito su touch
   * (RESPONSIVE.md «Matrice input»). Pinch e due dita funzionano sempre.
   */
  const touch = embedded && window.matchMedia('(pointer: coarse)').matches;

  const map = L.map(container, {
    center: [options.center.lat, options.center.lng],
    zoom: options.zoom,
    minZoom: MAP_ZOOM.min,
    maxZoom: MAP_ZOOM.max,
    zoomAnimation: !reduceMotion,
    fadeAnimation: !reduceMotion,
    markerZoomAnimation: !reduceMotion,
    scrollWheelZoom: !embedded,
    dragging: !touch,
    attributionControl: true,
  });

  L.tileLayer(TILE_URL, { maxZoom: MAP_ZOOM.max, attribution: TILE_ATTRIBUTION }).addTo(map);
  L.control.scale({ imperial: false }).addTo(map);

  if (embedded) {
    const hint = touch ? createHint(container) : null;
    const enable = (): void => {
      map.scrollWheelZoom.enable();
      if (touch) map.dragging.enable();
      if (hint) hint.hidden = true;
    };
    const disable = (): void => {
      map.scrollWheelZoom.disable();
      if (touch) map.dragging.disable();
      if (hint) hint.hidden = false;
    };
    container.addEventListener('click', enable);
    container.addEventListener('focusin', enable);
    container.addEventListener('mouseleave', disable);
    container.addEventListener('focusout', (event) => {
      if (!container.contains(event.relatedTarget as Node | null)) disable();
    });
    if (touch) {
      document.addEventListener(
        'touchstart',
        (event) => {
          if (!container.contains(event.target as Node | null)) disable();
        },
        { passive: true },
      );
    }
  }

  return map;
}

/** Avviso sopra la mappa finché il trascinamento a un dito non è attivo. */
function createHint(container: HTMLElement): HTMLElement {
  const hint = document.createElement('p');
  hint.className = 'map-canvas__hint caption';
  hint.textContent = 'Tocca la mappa per muoverla';
  container.append(hint);
  return hint;
}
