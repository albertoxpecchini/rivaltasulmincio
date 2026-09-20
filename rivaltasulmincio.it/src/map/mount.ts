import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import type { MapPlace, PlaceCategory } from '../types';
import { MAP_ZOOM } from './config';
import { createMap, type MapMode } from './engine';
import { createPlaceMarker, setMarkerSelected } from './markers';
import { renderPanel } from './panel';

/*
 * Montaggio della mappa su un elemento `[data-map]` reso dal server.
 *
 *   data-map="full"    mappa completa: feed dei luoghi, filtri, pannello, hash #place-id
 *   data-map="embed"   mappa in pagina: feed dei luoghi, il clic porta a /mappa#place-id
 *   data-map="single"  un solo luogo (data-label)
 *
 * Attributi comuni: data-center="lat,lng", data-zoom, data-feed, data-panel, data-filters, data-status.
 * I marker vicini si raggruppano in cluster con conteggio (OSM.md «Clustering»).
 */
export async function mountMap(root: HTMLElement): Promise<void> {
  if (root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  const mode = (root.dataset.map ?? 'embed') as MapMode;
  const [lat, lng] = (root.dataset.center ?? '').split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const zoom = Number(root.dataset.zoom) || (mode === 'single' ? MAP_ZOOM.single : MAP_ZOOM.village);

  root.querySelector('.map-canvas__fallback')?.remove();
  const map = createMap(root, { center: { lat, lng }, zoom, mode });

  if (mode === 'single') {
    const label = root.dataset.label ?? '';
    L.marker([lat, lng], { title: label, alt: label, keyboard: false }).addTo(map);
    return;
  }

  const status = query<HTMLElement>(root.dataset.status);
  const panel = query<HTMLElement>(root.dataset.panel);
  const filters = query<HTMLFormElement>(root.dataset.filters);
  const feedUrl = root.dataset.feed ?? '/places.json';

  let places: MapPlace[];
  try {
    const response = await fetch(feedUrl, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    places = (await response.json()) as MapPlace[];
  } catch {
    if (status) status.textContent = 'Luoghi temporaneamente non disponibili sulla mappa.';
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cluster = L.markerClusterGroup({
    maxClusterRadius: 40,
    disableClusteringAtZoom: 18,
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    animate: !reduceMotion,
    animateAddingMarkers: false,
    iconCreateFunction: (group) => {
      const count = group.getChildCount();
      return L.divIcon({
        className: 'map-cluster-wrap',
        html: `<span class="map-cluster" role="img" aria-label="${count} luoghi">${count}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    },
  }).addTo(map);

  const byCategory = new Map<PlaceCategory, L.Marker[]>();
  const markers = new Map<string, L.Marker>();
  let selectedId: string | null = null;

  const select = (place: MapPlace, options: { reveal?: boolean } = {}): void => {
    if (mode === 'embed') {
      window.location.href = `/mappa#${place.id}`;
      return;
    }
    const previous = selectedId ? markers.get(selectedId) : undefined;
    if (previous) setMarkerSelected(previous, false);
    selectedId = place.id;
    const marker = markers.get(place.id);
    if (marker) {
      if (options.reveal) cluster.zoomToShowLayer(marker, () => setMarkerSelected(marker, true));
      else setMarkerSelected(marker, true);
    }
    if (panel) renderPanel(panel, place);
    history.replaceState(null, '', `#${place.id}`);
  };

  for (const place of places) {
    const marker = createPlaceMarker(place);
    marker.on('click', () => select(place));
    // Dopo un cluster il marker viene ricreato: lo stato «selezionato» va riapplicato.
    marker.on('add', () => setMarkerSelected(marker, place.id === selectedId));
    markers.set(place.id, marker);
    byCategory.set(place.category, [...(byCategory.get(place.category) ?? []), marker]);
  }
  cluster.addLayers([...markers.values()]);

  const visible = new Set<PlaceCategory>(byCategory.keys());
  const updateStatus = (): void => {
    if (!status) return;
    const count = [...visible].reduce((sum, category) => sum + (byCategory.get(category)?.length ?? 0), 0);
    status.textContent = `${count} ${count === 1 ? 'luogo' : 'luoghi'} sulla mappa`;
  };

  if (filters) {
    if (window.matchMedia('(min-width: 1024px)').matches) filters.closest('details')?.setAttribute('open', '');
    filters.addEventListener('change', () => {
      for (const input of filters.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
        const category = input.value as PlaceCategory;
        const group = byCategory.get(category);
        if (!group) continue;
        if (input.checked && !visible.has(category)) {
          cluster.addLayers(group);
          visible.add(category);
        } else if (!input.checked && visible.has(category)) {
          cluster.removeLayers(group);
          visible.delete(category);
        }
      }
      updateStatus();
    });
  }
  updateStatus();

  if (mode === 'full') {
    if (panel) renderPanel(panel, null);
    const wanted = places.find((place) => place.id === window.location.hash.slice(1));
    if (wanted) {
      map.setView([wanted.lat, wanted.lng], MAP_ZOOM.single, { animate: false });
      select(wanted, { reveal: true });
    }
  }
}

/** Selettore opzionale dagli attributi `data-*`: assente = nessun elemento. */
function query<T extends Element>(selector: string | undefined): T | null {
  return selector ? document.querySelector<T>(selector) : null;
}
