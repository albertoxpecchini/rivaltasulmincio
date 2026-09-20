import type { IconName } from '../../components/icons.ts';
import type { WeatherCondition, WeatherConditionKey } from './types.ts';

/*
 * Condizioni meteo: chiave interna → etichetta e icona (ICONS.md, niente emoji).
 * Le tabelle di traduzione dai codici della fonte stanno qui, in un solo posto.
 */

export const CONDITION_LABELS: Record<WeatherConditionKey, string> = {
  sereno: 'Sereno',
  'sereno-notte': 'Sereno',
  'poco-nuvoloso': 'Poco nuvoloso',
  'poco-nuvoloso-notte': 'Poco nuvoloso',
  nuvoloso: 'Nuvoloso',
  coperto: 'Coperto',
  nebbia: 'Nebbia',
  pioggerella: 'Pioggerella',
  pioggia: 'Pioggia',
  neve: 'Neve',
  temporale: 'Temporale',
  vento: 'Ventoso',
};

/** Nome dell'icona Lucide per ogni condizione. */
export const CONDITION_ICONS: Record<WeatherConditionKey, IconName> = {
  sereno: 'sun',
  'sereno-notte': 'moon',
  'poco-nuvoloso': 'cloud-sun',
  'poco-nuvoloso-notte': 'cloud-moon',
  nuvoloso: 'cloud',
  coperto: 'cloudy',
  nebbia: 'cloud-fog',
  pioggerella: 'cloud-drizzle',
  pioggia: 'cloud-rain',
  neve: 'cloud-snow',
  temporale: 'cloud-lightning',
  vento: 'wind',
};

export function condition(key: WeatherConditionKey, label = CONDITION_LABELS[key]): WeatherCondition {
  return { key, label };
}

/**
 * Codice «icona» di Weather Display (campo 48 di clientraw.txt), 0–37.
 * Tradotto dal numero e non dal testo (campo 49), che arriva in inglese e
 * con gli spazi scritti come underscore. Verificato contro il cruscotto
 * della stazione (ajaxWDwx3.js).
 */
const CLIENTRAW_CONDITIONS: Record<number, [WeatherConditionKey, string]> = {
  0: ['sereno', 'Sereno'],
  1: ['sereno-notte', 'Sereno'],
  2: ['nuvoloso', 'Nuvoloso'],
  3: ['nuvoloso', 'Nuvoloso'],
  4: ['poco-nuvoloso-notte', 'Poco nuvoloso'],
  5: ['poco-nuvoloso', 'Poco nuvoloso'],
  6: ['nebbia', 'Nebbia'],
  7: ['nebbia', 'Foschia'],
  8: ['pioggia', 'Pioggia forte'],
  9: ['poco-nuvoloso', 'Poco nuvoloso'],
  10: ['nebbia', 'Foschia'],
  11: ['nebbia', 'Nebbia'],
  12: ['pioggia', 'Pioggia forte'],
  13: ['coperto', 'Coperto'],
  14: ['pioggia', 'Pioggia'],
  15: ['pioggia', 'Rovesci'],
  16: ['neve', 'Neve'],
  17: ['temporale', 'Temporale'],
  18: ['coperto', 'Coperto'],
  19: ['poco-nuvoloso', 'Parzialmente nuvoloso'],
  20: ['pioggia', 'Pioggia'],
  21: ['pioggia', 'Pioggia'],
  22: ['pioggia', 'Rovesci'],
  23: ['neve', 'Nevischio'],
  24: ['neve', 'Rovesci di nevischio'],
  25: ['neve', 'Neve'],
  26: ['neve', 'Neve in scioglimento'],
  27: ['neve', 'Rovesci di neve'],
  28: ['sereno', 'Sereno'],
  29: ['temporale', 'Rovesci temporaleschi'],
  30: ['temporale', 'Rovesci temporaleschi'],
  31: ['temporale', 'Temporale'],
  32: ['vento', "Tromba d'aria"],
  33: ['vento', 'Ventoso'],
  34: ['poco-nuvoloso', 'Ha smesso di piovere'],
  35: ['pioggia', 'Pioggia e vento'],
  36: ['sereno', 'Alba'],
  37: ['sereno-notte', 'Tramonto'],
};

export function clientrawCondition(code: number | undefined): WeatherCondition | undefined {
  if (code == null) return undefined;
  const entry = CLIENTRAW_CONDITIONS[code];
  return entry ? condition(entry[0], entry[1]) : undefined;
}

/**
 * Codici di WXSIM (colonne «WX Type 1» = cielo, «WX Type 2» = fenomeno) del
 * file latest.csv. I fenomeni prevalgono sul cielo; la rugiada non è una
 * condizione da mostrare.
 */
const WXSIM_PHENOMENA: [RegExp, WeatherConditionKey, string][] = [
  [/T-?STORM|THUNDER|TSTM/i, 'temporale', 'Temporale'],
  [/SNOW|FLURR/i, 'neve', 'Neve'],
  [/SLEET|FRZ|ICE PEL/i, 'neve', 'Nevischio'],
  [/CHNC\.? ?SHWR|CHANCE/i, 'pioggia', 'Possibili rovesci'],
  [/SHWR|SHOWER/i, 'pioggia', 'Rovesci'],
  [/HVY RAIN|HEAVY RAIN/i, 'pioggia', 'Pioggia forte'],
  [/RAIN/i, 'pioggia', 'Pioggia'],
  [/DRIZZLE|DRZL/i, 'pioggerella', 'Pioggerella'],
  [/FOG/i, 'nebbia', 'Nebbia'],
  [/HAZE|MIST/i, 'nebbia', 'Foschia'],
  [/WINDY|BLOW|BREEZY/i, 'vento', 'Ventoso'],
];

const WXSIM_SKY: [RegExp, WeatherConditionKey, WeatherConditionKey, string][] = [
  // [pattern, chiave di giorno, chiave di notte, etichetta]
  [/SUNNY|CLEAR|CLR-FAIR|^FAIR$/i, 'sereno', 'sereno-notte', 'Sereno'],
  [/M\.SUNNY|FAIR-P\.C\.|P\.CLOUDY/i, 'poco-nuvoloso', 'poco-nuvoloso-notte', 'Poco nuvoloso'],
  [/P\.-M\.CLDY|M\.CLOUDY/i, 'nuvoloso', 'nuvoloso', 'Nuvoloso'],
  [/M\.C\.-CLDY|CLOUDY|OVERCAST|OVC/i, 'coperto', 'coperto', 'Coperto'],
];

export function wxsimCondition(sky: string, phenomenon: string, daytime: boolean): WeatherCondition | undefined {
  for (const [pattern, key, label] of WXSIM_PHENOMENA) {
    if (pattern.test(phenomenon)) return condition(key, label);
  }
  for (const [pattern, day, night, label] of WXSIM_SKY) {
    if (pattern.test(sky)) return condition(daytime ? day : night, label);
  }
  return undefined;
}

/** Peso per scegliere la condizione «del giorno»: prevale il fenomeno più rilevante. */
export const CONDITION_SEVERITY: Record<WeatherConditionKey, number> = {
  temporale: 6,
  neve: 5,
  pioggia: 4,
  pioggerella: 3,
  nebbia: 2,
  vento: 2,
  coperto: 1,
  nuvoloso: 1,
  'poco-nuvoloso': 0,
  'poco-nuvoloso-notte': 0,
  sereno: 0,
  'sereno-notte': 0,
};

/** I sedici settori della rosa dei venti, in italiano: Ovest è O. */
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];

export function compassLabel(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16];
}
