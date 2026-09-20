import { clientrawCondition, compassLabel } from './conditions.ts';
import type { WeatherData } from './types.ts';

/*
 * Parser di clientraw.txt, il file di Weather Display pubblicato dalla
 * stazione: una riga, valori separati da spazio, posizione fissa. Comincia
 * per 12345 e finisce con !!, due sentinelle che riconoscono un file troncato
 * a metà upload. Gli indici sono quelli letti dal cruscotto della stazione
 * (ajaxWDwx3.js): temperature in °C, pressione in hPa, pioggia in mm, vento
 * in nodi (convertito in km/h).
 */
const FIELDS = {
  windAverage: 1,
  windGust: 2,
  windDirection: 3,
  temperature: 4,
  humidity: 5,
  pressure: 6,
  rainToday: 7,
  rainMonth: 8,
  rainYear: 9,
  rainRate: 10,
  hour: 29,
  minute: 30,
  second: 31,
  temperatureMax: 46,
  temperatureMin: 47,
  condition: 48,
  pressureTrend: 50,
  dewPoint: 72,
  date: 74,
  uv: 79,
  solarRadiation: 127,
  feelsLike: 130,
  latitude: 160,
  longitude: 161,
} as const;

const KNOTS_TO_KMH = 1.852;
const MIN_FIELDS = 140;

export type ParsedClientraw = Omit<WeatherData, 'source' | 'sourceUrl' | 'updatedAt' | 'fetchedAt' | 'location'> & {
  station?: { lat: number; lon: number };
};

export function parseClientraw(text: string): ParsedClientraw {
  const line = text.trim();
  if (!line.startsWith('12345') || !line.endsWith('!!')) {
    throw new Error('clientraw: file incompleto o formato non riconosciuto');
  }
  const fields = line.split(/\s+/);
  if (fields.length < MIN_FIELDS) throw new Error(`clientraw: campi insufficienti (${fields.length})`);

  const read = (key: keyof typeof FIELDS): number | undefined => number(fields[FIELDS[key]]);
  const knots = (key: keyof typeof FIELDS): number | undefined => round(mul(read(key), KNOTS_TO_KMH));
  const degrees = read('windDirection');
  const lat = read('latitude');
  // Weather Display scrive la longitudine con segno positivo verso ovest: la stazione è a est di Greenwich.
  const lon = read('longitude');

  return {
    observedAt: observedAt(fields),
    temperature: round(read('temperature')),
    feelsLike: round(read('feelsLike')),
    dewPoint: round(read('dewPoint')),
    temperatureMin: round(read('temperatureMin')),
    temperatureMax: round(read('temperatureMax')),
    condition: clientrawCondition(read('condition')),
    precipitation: round(read('rainToday')),
    precipitationRate: round(read('rainRate'), 2),
    precipitationMonth: round(read('rainMonth')),
    precipitationYear: round(read('rainYear')),
    humidity: round(read('humidity'), 0),
    pressure: round(read('pressure')),
    pressureTrend: round(read('pressureTrend')),
    windSpeed: knots('windAverage'),
    windGust: knots('windGust'),
    windDirection: degrees == null ? undefined : Math.round(degrees),
    windDirectionLabel: degrees == null ? undefined : compassLabel(degrees),
    uvIndex: round(read('uv')),
    solarRadiation: round(read('solarRadiation'), 0),
    station: lat != null && lon != null ? { lat, lon: Math.abs(lon) } : undefined,
  };
}

/** Weather Display scrive le assenze come -100 o 255: sentinelle, non misure. */
function number(raw: string | undefined): number | undefined {
  const n = Number.parseFloat(raw ?? '');
  if (!Number.isFinite(n) || n === -100 || n === 255) return undefined;
  return n;
}

function round(n: number | undefined, decimals = 1): number | undefined {
  return n == null ? undefined : Number.parseFloat(n.toFixed(decimals));
}

function mul(n: number | undefined, factor: number): number | undefined {
  return n == null ? undefined : n * factor;
}

/** Ora della stazione (locale, senza fuso): dice davvero quanto è vecchia la misura. */
function observedAt(fields: string[]): string | undefined {
  const [day, month, year] = String(fields[FIELDS.date]).split('/').map(Number);
  const hour = Number(fields[FIELDS.hour]);
  const minute = Number(fields[FIELDS.minute]);
  const second = Number(fields[FIELDS.second]);
  if (![day, month, year, hour, minute, second].every(Number.isFinite)) return undefined;
  const two = (v: number) => String(v).padStart(2, '0');
  return `${year}-${two(month)}-${two(day)}T${two(hour)}:${two(minute)}:${two(second)}`;
}
