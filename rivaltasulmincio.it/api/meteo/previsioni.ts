import { errorResponse, jsonResponse } from '../../src/services/weather/http.ts';
import { meteomincio } from '../../src/services/weather/meteomincio.ts';

/*
 * GET /api/meteo/previsioni — previsione oraria e giornaliera (WXSIM).
 * Il modello gira poche volte al giorno: cache di 15 minuti, rinnovo in
 * background fino a un'ora.
 */
export async function GET(_request: Request): Promise<Response> {
  try {
    return jsonResponse(await meteomincio.getForecast(), { maxAge: 900, staleWhileRevalidate: 3600 });
  } catch (error) {
    return errorResponse(error);
  }
}
