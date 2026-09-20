/*
 * Sincronizzazione OpenStreetMap → data/places/places.json (OSM.md «Sincronizzazione»).
 *
 *   fetch → validate → normalize → deduplicate → diff → update → cache
 *
 * Uso:  npm run osm:sync            interroga Overpass e aggiorna i dataset
 *       npm run osm:sync -- --offline   riusa data/osm/raw/overpass.json
 *
 * Gli ID e gli slug dei luoghi esistenti non cambiano mai; i luoghi spariti da
 * OSM restano nel dataset con `status: "removed"` (archivio del progetto).
 */
import fs from 'node:fs';
import path from 'node:path';
import { distanceM } from '../src/lib/geo.ts';
import { slugify } from '../src/lib/slug.ts';
import { normalizeElement, type NormalizedFeature, type OverpassElement } from '../src/places/osm-mapper.ts';
import type { Place } from '../src/types/place.ts';

const root = path.resolve(import.meta.dirname, '..');
const files = {
  area: path.join(root, 'data/osm/area.json'),
  raw: path.join(root, 'data/osm/raw/overpass.json'),
  meta: path.join(root, 'data/osm/meta.json'),
  places: path.join(root, 'data/places/places.json'),
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'rivaltasulmincio.it atlas sync (https://www.rivaltasulmincio.it)';
const OSM_SOURCE_ID = 'source-007';
/** Due elementi con stesso nome e tipo entro questa distanza sono lo stesso luogo. */
const SAME_PLACE_M = 150;

type Area = { centerOsm: { osmType: 'node'; osmId: number }; radiusM: number; note: string };
type OverpassResponse = { osm3s?: { timestamp_osm_base?: string }; elements: OverpassElement[] };

const area = JSON.parse(fs.readFileSync(files.area, 'utf8')) as Area;
const query = buildQuery(area);
const offline = process.argv.includes('--offline');

const raw = offline ? (JSON.parse(fs.readFileSync(files.raw, 'utf8')) as OverpassResponse) : await fetchOverpass(query);
if (!Array.isArray(raw.elements)) {
  console.error('osm-sync: risposta Overpass senza `elements`.');
  process.exit(1);
}
if (!offline) write(files.raw, JSON.stringify(raw, null, 1));

const centerElement = raw.elements.find((e) => e.type === 'node' && e.id === area.centerOsm.osmId);
if (!centerElement?.lat || !centerElement.lon) {
  console.error(`osm-sync: nodo centrale ${area.centerOsm.osmId} assente nella risposta.`);
  process.exit(1);
}
const center = { lat: centerElement.lat, lng: centerElement.lon };
const now = new Date().toISOString();

// normalize
const features = raw.elements
  .filter((e) => !(e.type === 'node' && e.id === area.centerOsm.osmId))
  .map(normalizeElement)
  .filter((f): f is NormalizedFeature => f !== null)
  .filter((f) => distanceM(center, f) <= area.radiusM * 1.1)
  .sort((a, b) => distanceM(center, a) - distanceM(center, b) || a.osmId - b.osmId);

// deduplicate
const kept: (NormalizedFeature & { also: { osmType: NormalizedFeature['osmType']; osmId: number }[] })[] = [];
for (const feature of features) {
  const twin = feature.name
    ? kept.find(
        (k) =>
          k.name?.toLowerCase() === feature.name?.toLowerCase() &&
          k.kind === feature.kind &&
          (k.category === 'acqua' || distanceM(k, feature) <= SAME_PLACE_M),
      )
    : undefined;
  if (twin) twin.also.push({ osmType: feature.osmType, osmId: feature.osmId });
  else kept.push({ ...feature, also: [] });
}

// diff + update
const existing: Place[] = fs.existsSync(files.places) ? (JSON.parse(fs.readFileSync(files.places, 'utf8')) as Place[]) : [];
const byOsm = new Map(existing.map((p) => [`${p.osm.osmType}/${p.osm.osmId}`, p]));
const usedSlugs = new Set(existing.map((p) => p.slug));
let nextNumber = existing.reduce((max, p) => Math.max(max, Number(p.id.replace('place-', '')) || 0), 0) + 1;
const seen = new Set<string>();
const stats = { fetched: raw.elements.length, normalized: features.length, kept: kept.length, added: 0, modified: 0, removed: 0 };

for (const feature of kept) {
  const key = `${feature.osmType}/${feature.osmId}`;
  seen.add(key);
  const fields = placeFields(feature);
  const current = byOsm.get(key);
  if (current) {
    const changed = JSON.stringify(placeFields(toFeature(current))) !== JSON.stringify(fields) || current.status !== 'active';
    Object.assign(current, fields, { status: 'active', source: sourceFor(feature) });
    if (changed) {
      current.updatedAt = now;
      stats.modified++;
    }
    continue;
  }
  const id = `place-${String(nextNumber++).padStart(3, '0')}`;
  const slug = uniqueSlug(feature, usedSlugs);
  const place: Place = { id, slug, ...fields, status: 'active', source: sourceFor(feature), createdAt: now, updatedAt: now };
  existing.push(place);
  byOsm.set(key, place);
  stats.added++;
}

for (const place of existing) {
  const key = `${place.osm.osmType}/${place.osm.osmId}`;
  if (!seen.has(key) && place.status === 'active') {
    place.status = 'removed';
    place.updatedAt = now;
    stats.removed++;
  }
}

existing.sort((a, b) => a.id.localeCompare(b.id));
write(files.places, JSON.stringify(existing, null, 2));
write(
  files.meta,
  JSON.stringify(
    {
      syncedAt: now,
      osmTimestamp: raw.osm3s?.timestamp_osm_base ?? null,
      source: { name: 'OpenStreetMap', sourceId: OSM_SOURCE_ID, license: 'ODbL', attribution: '© OpenStreetMap contributors' },
      area: { ...area, center },
      query,
      counts: { ...stats, total: existing.length, active: existing.filter((p) => p.status === 'active').length },
    },
    null,
    2,
  ),
);

console.log(
  `osm-sync: ${stats.fetched} elementi OSM → ${stats.normalized} riconosciuti → ${stats.kept} luoghi; ` +
    `aggiunti ${stats.added}, modificati ${stats.modified}, rimossi ${stats.removed}; totale ${existing.length}`,
);

// ── funzioni ────────────────────────────────────────────────────────────────

function buildQuery(a: Area): string {
  const r = a.radiusM;
  const keys = ['amenity', 'shop', 'tourism', 'leisure', 'historic', 'office', 'craft', 'healthcare', 'emergency'];
  const named = ['natural', 'waterway', 'landuse', 'man_made'];
  return [
    '[out:json][timeout:90];',
    `node(${a.centerOsm.osmId})->.c;`,
    '(',
    '  .c;',
    ...keys.map((k) => `  nwr["${k}"](around.c:${r});`),
    `  nwr["highway"="bus_stop"](around.c:${r});`,
    ...named.map((k) => `  nwr["${k}"]["name"](around.c:${r});`),
    `  nwr["place"](around.c:${r});`,
    ');',
    'out center tags;',
  ].join('\n');
}

async function fetchOverpass(data: string): Promise<OverpassResponse> {
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
    body: new URLSearchParams({ data }),
  });
  if (!response.ok) {
    console.error(`osm-sync: Overpass ha risposto ${response.status}.`);
    process.exit(1);
  }
  return (await response.json()) as OverpassResponse;
}

type PlaceFields = Omit<Place, 'id' | 'slug' | 'status' | 'source' | 'createdAt' | 'updatedAt'>;

function placeFields(f: NormalizedFeature & { also?: Place['osm']['also'] }): PlaceFields {
  return {
    name: f.name,
    category: f.category,
    kind: f.kind,
    lat: f.lat,
    lng: f.lng,
    geometry: f.geometry,
    address: f.address,
    contact: f.contact,
    openingHours: f.openingHours,
    osm: { osmType: f.osmType, osmId: f.osmId, also: f.also?.length ? f.also : undefined, tags: f.tags },
  };
}

function toFeature(p: Place): NormalizedFeature & { also?: Place['osm']['also'] } {
  return {
    osmType: p.osm.osmType,
    osmId: p.osm.osmId,
    name: p.name,
    category: p.category,
    kind: p.kind,
    lat: p.lat,
    lng: p.lng,
    geometry: p.geometry,
    address: p.address,
    contact: p.contact,
    openingHours: p.openingHours,
    tags: p.osm.tags,
    also: p.osm.also,
  };
}

function sourceFor(f: NormalizedFeature): Place['source'] {
  return {
    name: 'OpenStreetMap',
    sourceId: OSM_SOURCE_ID,
    url: `https://www.openstreetmap.org/${f.osmType}/${f.osmId}`,
    type: 'geodata',
    checkedAt: now,
  };
}

function uniqueSlug(f: NormalizedFeature, used: Set<string>): string {
  const base = f.name ? slugify(f.name) : `${slugify(f.kind)}-${f.osmId}`;
  let slug = base || `luogo-${f.osmId}`;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  used.add(slug);
  return slug;
}

function write(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content + '\n', 'utf8');
}
