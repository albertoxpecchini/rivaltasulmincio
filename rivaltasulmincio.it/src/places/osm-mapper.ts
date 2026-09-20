import type { OsmType, PlaceCategory } from '../types/place.ts';

/*
 * Mappatura centralizzata OSM → categoria del progetto (OSM.md «Mapping categorie»):
 *
 *   tag OSM → categoria → tipo leggibile
 *
 * Un elemento entra nell'atlante solo se un tag corrisponde a una regola.
 * `unnamed: true` ammette anche elementi senza nome (parcheggi, fontanelle);
 * tutto il resto richiede un nome. Ciò che non è elencato resta fuori
 * (panchine, cestini, piscine private, giardini privati…).
 *
 * Usato sia dal sito sia da `scripts/osm-sync.ts`, quindi senza dipendenze:
 * Node lo esegue direttamente.
 */

export type OverpassElement = {
  type: OsmType;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type NormalizedFeature = {
  osmType: OsmType;
  osmId: number;
  name?: string;
  category: PlaceCategory;
  kind: string;
  lat: number;
  lng: number;
  geometry: 'point' | 'area';
  address?: { street?: string; housenumber?: string; postcode?: string; city?: string };
  contact?: { phone?: string; website?: string; email?: string };
  openingHours?: string;
  tags: Record<string, string>;
};

type Rule = { category: PlaceCategory; kind: string; unnamed?: boolean };

/** Ordine di priorità delle chiavi: la prima presente decide. */
const PRIMARY_KEYS = [
  'amenity',
  'shop',
  'tourism',
  'leisure',
  'historic',
  'office',
  'craft',
  'healthcare',
  'emergency',
  'highway',
  'natural',
  'waterway',
  'landuse',
  'place',
  'man_made',
] as const;

const RULES: Record<string, Rule> = {
  // Attività
  'amenity=restaurant': { category: 'attivita', kind: 'Ristorante' },
  'amenity=cafe': { category: 'attivita', kind: 'Bar' },
  'amenity=pub': { category: 'attivita', kind: 'Pub' },
  'amenity=fast_food': { category: 'attivita', kind: 'Fast food' },
  'amenity=ice_cream': { category: 'attivita', kind: 'Gelateria' },
  'amenity=marketplace': { category: 'attivita', kind: 'Mercato' },
  'amenity=car_wash': { category: 'attivita', kind: 'Autolavaggio' },
  'amenity=studio': { category: 'attivita', kind: 'Studio' },
  'amenity=veterinary': { category: 'attivita', kind: 'Veterinario' },
  'shop=supermarket': { category: 'attivita', kind: 'Supermercato' },
  'shop=convenience': { category: 'attivita', kind: 'Minimarket' },
  'shop=general': { category: 'attivita', kind: 'Alimentari' },
  'shop=bakery': { category: 'attivita', kind: 'Panificio' },
  'shop=butcher': { category: 'attivita', kind: 'Macelleria' },
  'shop=cheese': { category: 'attivita', kind: 'Caseificio' },
  'shop=greengrocer': { category: 'attivita', kind: 'Ortofrutta' },
  'shop=hairdresser': { category: 'attivita', kind: 'Parrucchiere' },
  'shop=beauty': { category: 'attivita', kind: 'Centro estetico' },
  'shop=florist': { category: 'attivita', kind: 'Fioraio' },
  'shop=garden_centre': { category: 'attivita', kind: 'Vivaio' },
  'shop=newsagent': { category: 'attivita', kind: 'Edicola' },
  'shop=tobacco': { category: 'attivita', kind: 'Tabaccheria' },
  'shop=optician': { category: 'attivita', kind: 'Ottico' },
  'shop=jewelry': { category: 'attivita', kind: 'Gioielleria' },
  'shop=bicycle': { category: 'attivita', kind: 'Negozio di biciclette' },
  'shop=car': { category: 'attivita', kind: 'Concessionaria' },
  'shop=car_repair': { category: 'attivita', kind: 'Officina' },
  'shop=clothes': { category: 'attivita', kind: 'Abbigliamento' },
  'shop=*': { category: 'attivita', kind: 'Negozio' },
  'craft=*': { category: 'attivita', kind: 'Artigiano' },
  'office=insurance': { category: 'attivita', kind: 'Assicurazioni' },
  'office=consulting': { category: 'attivita', kind: 'Consulenza' },
  'office=company': { category: 'attivita', kind: 'Azienda' },
  'office=government': { category: 'servizi', kind: 'Ufficio pubblico' },
  'office=*': { category: 'attivita', kind: 'Ufficio' },
  'tourism=hotel': { category: 'attivita', kind: 'Hotel' },
  'tourism=hostel': { category: 'attivita', kind: 'Ostello' },
  'tourism=guest_house': { category: 'attivita', kind: 'Affittacamere' },
  'tourism=apartment': { category: 'attivita', kind: 'Appartamento turistico' },
  'tourism=camp_site': { category: 'attivita', kind: 'Campeggio' },
  'leisure=adult_gaming_centre': { category: 'attivita', kind: 'Sala giochi' },

  // Servizi
  'amenity=pharmacy': { category: 'servizi', kind: 'Farmacia' },
  'amenity=doctors': { category: 'servizi', kind: 'Ambulatorio medico' },
  'amenity=dentist': { category: 'servizi', kind: 'Dentista' },
  'amenity=clinic': { category: 'servizi', kind: 'Poliambulatorio' },
  'amenity=hospital': { category: 'servizi', kind: 'Ospedale' },
  'healthcare=*': { category: 'servizi', kind: 'Sanità' },
  'amenity=bank': { category: 'servizi', kind: 'Banca' },
  'amenity=atm': { category: 'servizi', kind: 'Bancomat', unnamed: true },
  'amenity=post_office': { category: 'servizi', kind: 'Ufficio postale' },
  'amenity=post_box': { category: 'servizi', kind: 'Cassetta postale', unnamed: true },
  'amenity=school': { category: 'servizi', kind: 'Scuola' },
  'amenity=kindergarten': { category: 'servizi', kind: "Scuola dell'infanzia" },
  'amenity=townhall': { category: 'servizi', kind: 'Municipio' },
  'amenity=police': { category: 'servizi', kind: 'Forze dell’ordine' },
  'amenity=fire_station': { category: 'servizi', kind: 'Vigili del fuoco' },
  'amenity=community_centre': { category: 'servizi', kind: 'Centro civico' },
  'amenity=social_facility': { category: 'servizi', kind: 'Struttura sociale' },
  'amenity=drinking_water': { category: 'servizi', kind: 'Fontanella', unnamed: true },
  'amenity=toilets': { category: 'servizi', kind: 'Servizi igienici', unnamed: true },
  'emergency=defibrillator': { category: 'servizi', kind: 'Defibrillatore', unnamed: true },
  'landuse=cemetery': { category: 'servizi', kind: 'Cimitero' },

  // Cultura
  'amenity=library': { category: 'cultura', kind: 'Biblioteca' },
  'amenity=public_bookcase': { category: 'cultura', kind: 'Casetta dei libri' },
  'amenity=place_of_worship': { category: 'cultura', kind: 'Luogo di culto' },
  'amenity=theatre': { category: 'cultura', kind: 'Teatro' },
  'amenity=events_venue': { category: 'cultura', kind: 'Spazio eventi' },
  'tourism=museum': { category: 'cultura', kind: 'Museo' },
  'tourism=artwork': { category: 'cultura', kind: "Opera d'arte" },
  'tourism=attraction': { category: 'cultura', kind: 'Attrazione' },
  'tourism=information': { category: 'cultura', kind: 'Punto informativo' },

  // Sport
  'leisure=pitch': { category: 'sport', kind: 'Campo sportivo' },
  'leisure=sports_centre': { category: 'sport', kind: 'Centro sportivo' },
  'leisure=swimming_pool': { category: 'sport', kind: 'Piscina' },
  'leisure=fitness_centre': { category: 'sport', kind: 'Palestra' },
  'leisure=stadium': { category: 'sport', kind: 'Stadio' },
  'leisure=track': { category: 'sport', kind: 'Pista' },

  // Natura
  'leisure=park': { category: 'natura', kind: 'Parco' },
  'leisure=garden': { category: 'natura', kind: 'Giardino' },
  'leisure=playground': { category: 'natura', kind: 'Area giochi' },
  'leisure=nature_reserve': { category: 'natura', kind: 'Riserva naturale' },
  'leisure=bird_hide': { category: 'natura', kind: 'Osservatorio faunistico' },
  'tourism=picnic_site': { category: 'natura', kind: 'Area picnic', unnamed: true },
  'tourism=viewpoint': { category: 'natura', kind: 'Punto panoramico' },
  'natural=wood': { category: 'natura', kind: 'Bosco' },
  'landuse=forest': { category: 'natura', kind: 'Bosco' },

  // Mobilità
  'highway=bus_stop': { category: 'mobilita', kind: 'Fermata bus', unnamed: true },
  'amenity=parking': { category: 'mobilita', kind: 'Parcheggio', unnamed: true },
  'amenity=bicycle_parking': { category: 'mobilita', kind: 'Parcheggio bici', unnamed: true },
  'amenity=motorcycle_parking': { category: 'mobilita', kind: 'Parcheggio moto', unnamed: true },
  'amenity=charging_station': { category: 'mobilita', kind: 'Colonnina di ricarica', unnamed: true },
  'amenity=fuel': { category: 'mobilita', kind: 'Distributore' },
  'amenity=ferry_terminal': { category: 'mobilita', kind: 'Imbarcadero' },
  'leisure=marina': { category: 'mobilita', kind: 'Approdo' },
  'leisure=slipway': { category: 'mobilita', kind: 'Scivolo per barche', unnamed: true },

  // Storia
  'historic=monument': { category: 'storia', kind: 'Monumento' },
  'historic=memorial': { category: 'storia', kind: 'Memoriale' },
  'historic=tomb': { category: 'storia', kind: 'Tomba monumentale' },
  'historic=wayside_shrine': { category: 'storia', kind: 'Edicola votiva', unnamed: true },
  'historic=ruins': { category: 'storia', kind: 'Rovine' },
  'historic=*': { category: 'storia', kind: 'Luogo storico' },

  // Territorio
  'place=hamlet': { category: 'territorio', kind: 'Località' },
  'place=locality': { category: 'territorio', kind: 'Località' },
  'place=square': { category: 'territorio', kind: 'Piazza' },
  'landuse=farmyard': { category: 'territorio', kind: 'Corte' },
  'amenity=fountain': { category: 'territorio', kind: 'Fontana' },
  'amenity=shelter': { category: 'territorio', kind: 'Riparo' },
  'man_made=*': { category: 'territorio', kind: 'Manufatto' },

  // Acqua
  'natural=water': { category: 'acqua', kind: "Specchio d'acqua" },
  'waterway=river': { category: 'acqua', kind: 'Fiume' },
  'waterway=canal': { category: 'acqua', kind: 'Canale' },
  'waterway=stream': { category: 'acqua', kind: "Corso d'acqua" },
  'waterway=drain': { category: 'acqua', kind: 'Fossa' },
  'waterway=ditch': { category: 'acqua', kind: 'Fosso' },
};

/** Elemento OSM → luogo normalizzato, oppure `null` se non entra nell'atlante. */
export function normalizeElement(element: OverpassElement): NormalizedFeature | null {
  const tags = element.tags ?? {};
  if (tags.disused === 'yes' || tags.abandoned === 'yes') return null;

  const match = matchRule(tags);
  if (!match) return null;

  const name = tags.name?.trim() || undefined;
  if (!name && !match.rule.unnamed) return null;
  if (match.rule.category === 'mobilita' && (tags.access === 'private' || tags.access === 'no')) return null;

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;

  const address = pick({
    street: tags['addr:street'],
    housenumber: tags['addr:housenumber'],
    postcode: tags['addr:postcode'],
    city: tags['addr:city'],
  });
  const contact = pick({
    phone: tags.phone ?? tags['contact:phone'],
    website: tags.website ?? tags['contact:website'],
    email: tags.email ?? tags['contact:email'],
  });

  return {
    osmType: element.type,
    osmId: element.id,
    name,
    category: match.rule.category,
    kind: kindFor(match, tags),
    lat,
    lng,
    geometry: element.type === 'node' ? 'point' : 'area',
    address,
    contact,
    openingHours: tags.opening_hours,
    tags,
  };
}

function matchRule(tags: Record<string, string>): { key: string; value: string; rule: Rule } | null {
  for (const key of PRIMARY_KEYS) {
    const value = tags[key];
    if (!value) continue;
    const rule = RULES[`${key}=${value}`] ?? RULES[`${key}=*`];
    if (rule) return { key, value, rule };
  }
  return null;
}

function kindFor(match: { key: string; value: string; rule: Rule }, tags: Record<string, string>): string {
  if (match.key === 'amenity' && match.value === 'place_of_worship') {
    if (tags.building === 'chapel') return 'Cappella';
    if (tags.religion === 'christian') return 'Chiesa';
  }
  return match.rule.kind;
}

function pick<T extends Record<string, string | undefined>>(fields: T): T | undefined {
  const entries = Object.entries(fields).filter(([, value]) => value);
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
}
