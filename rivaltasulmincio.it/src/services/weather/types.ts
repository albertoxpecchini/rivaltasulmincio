/*
 * Dati meteo normalizzati (WEATHER.md «Schema dati»).
 * L'interfaccia non conosce il formato della fonte: vede solo questi tipi.
 * Ogni campo è presente solo se la fonte lo fornisce davvero.
 */

export type WeatherConditionKey =
  | 'sereno'
  | 'sereno-notte'
  | 'poco-nuvoloso'
  | 'poco-nuvoloso-notte'
  | 'nuvoloso'
  | 'coperto'
  | 'nebbia'
  | 'pioggerella'
  | 'pioggia'
  | 'neve'
  | 'temporale'
  | 'vento';

export type WeatherCondition = {
  key: WeatherConditionKey;
  /** Testo nella terminologia della fonte, in italiano. */
  label: string;
};

export type WeatherData = {
  location: { name: string; lat?: number; lon?: number };
  /** Ora della stazione (locale, senza fuso): è l'età reale della misura. */
  observedAt?: string;
  temperature?: number;
  feelsLike?: number;
  dewPoint?: number;
  /** Estremi di oggi. */
  temperatureMin?: number;
  temperatureMax?: number;
  condition?: WeatherCondition;
  /** Pioggia di oggi, mm. */
  precipitation?: number;
  /** Intensità istantanea, mm/h. */
  precipitationRate?: number;
  precipitationMonth?: number;
  precipitationYear?: number;
  humidity?: number;
  pressure?: number;
  /** Variazione barometrica recente, hPa. */
  pressureTrend?: number;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  windDirectionLabel?: string;
  uvIndex?: number;
  solarRadiation?: number;
  source: string;
  sourceUrl: string;
  /** Coincide con `observedAt`: è il vero aggiornamento del dato, non l'ora della richiesta. */
  updatedAt: string;
  /** Quando il progetto ha letto la fonte. */
  fetchedAt: string;
};

export type HourlyForecast = {
  /** Ora locale, senza fuso: `2026-09-21T15:00`. */
  time: string;
  temperature?: number;
  condition?: WeatherCondition;
  /** Precipitazione prevista nell'ora, mm. */
  precipitation?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  uvIndex?: number;
};

export type DailyForecast = {
  /** Data locale `2026-09-21`. */
  date: string;
  temperatureMin?: number;
  temperatureMax?: number;
  /** Totale del giorno, mm. */
  precipitation?: number;
  condition?: WeatherCondition;
  windSpeedMax?: number;
  uvIndexMax?: number;
};

export type WeatherForecast = {
  /** Emissione della previsione (ISO con fuso). */
  issuedAt: string;
  model: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  source: string;
  sourceUrl: string;
  updatedAt: string;
  fetchedAt: string;
};

export type WeatherError = { error: string };

/** Adapter: sostituire la fonte non deve toccare l'interfaccia (WEATHER.md «Adapter»). */
export interface WeatherProvider {
  getCurrent(): Promise<WeatherData>;
  getForecast(): Promise<WeatherForecast>;
}
