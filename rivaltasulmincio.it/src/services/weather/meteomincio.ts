import { parseClientraw } from './clientraw.ts';
import type { WeatherData, WeatherForecast, WeatherProvider } from './types.ts';
import { parseWxsimCsv } from './wxsim.ts';

/*
 * Provider MeteoMincio (WEATHER.md «Fonte principale»).
 *
 * Il sito non offre API né feed: pubblica i file della stazione in chiaro,
 * gli stessi che legge il suo cruscotto. Non mandano header CORS, perciò il
 * browser non può leggerli direttamente e serve una funzione in mezzo
 * (`api/meteo/*`). Verificato il 20 settembre 2026:
 *
 *   clientraw.txt   condizioni attuali (Weather Display), aggiornato ogni ~25 s
 *   latest.csv      previsione oraria a nove giorni del modello WXSIM della stazione
 *
 * Condizioni d'uso dichiarate dal sito: uso commerciale vietato, dati senza
 * garanzia, pubblicazione dei contenuti senza consenso dell'amministratore
 * vietata. Il progetto è non commerciale, cita la fonte e non archivia nulla.
 */
export const METEOMINCIO = {
  name: 'MeteoMincio',
  url: 'https://www.meteomincio.it/',
  sourceId: 'source-008',
  currentUrl: 'https://www.meteomincio.it/clientraw.txt',
  forecastUrl: 'https://www.meteomincio.it/latest.csv',
  forecastModel: 'WXSIM',
  location: 'Rivalta sul Mincio',
  userAgent: 'rivaltasulmincio.it (+https://www.rivaltasulmincio.it)',
  timeoutMs: 8000,
} as const;

async function fetchText(url: string): Promise<string> {
  // Il loro server manda max-age=86400 su file che cambiano di continuo: il parametro scavalca la cache.
  const response = await fetch(`${url}?${Date.now()}`, {
    headers: { 'User-Agent': METEOMINCIO.userAgent },
    signal: AbortSignal.timeout(METEOMINCIO.timeoutMs),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`la fonte ha risposto ${response.status}`);
  return response.text();
}

export const meteomincio: WeatherProvider = {
  async getCurrent(): Promise<WeatherData> {
    const parsed = parseClientraw(await fetchText(METEOMINCIO.currentUrl));
    const { station, ...data } = parsed;
    const now = new Date().toISOString();
    return {
      location: { name: METEOMINCIO.location, lat: station?.lat, lon: station?.lon },
      ...data,
      source: METEOMINCIO.name,
      sourceUrl: METEOMINCIO.url,
      updatedAt: data.observedAt ?? now,
      fetchedAt: now,
    };
  },

  async getForecast(): Promise<WeatherForecast> {
    const parsed = parseWxsimCsv(await fetchText(METEOMINCIO.forecastUrl));
    const now = new Date().toISOString();
    return {
      ...parsed,
      model: METEOMINCIO.forecastModel,
      source: METEOMINCIO.name,
      sourceUrl: METEOMINCIO.url,
      updatedAt: parsed.issuedAt,
      fetchedAt: now,
    };
  },
};
