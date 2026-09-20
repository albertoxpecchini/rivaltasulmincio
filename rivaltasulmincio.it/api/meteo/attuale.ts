import { errorResponse, jsonResponse } from '../../src/services/weather/http.ts';
import { meteomincio } from '../../src/services/weather/meteomincio.ts';

/*
 * GET /api/meteo/attuale — condizioni attuali della stazione di Rivalta.
 * La stazione aggiorna ogni ~25 s e la misura letta è vecchia di circa un
 * minuto: cache di 60 s, poi rinnovo in background fino a 10 minuti.
 */
export async function GET(_request: Request): Promise<Response> {
  try {
    return jsonResponse(await meteomincio.getCurrent(), { maxAge: 60, staleWhileRevalidate: 600 });
  } catch (error) {
    return errorResponse(error);
  }
}
