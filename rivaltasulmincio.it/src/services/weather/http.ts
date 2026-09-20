import type { WeatherError } from './types.ts';

/*
 * Risposte delle funzioni `api/meteo/*` (WEATHER.md «Cache», «Error state»).
 * La CDN tiene la risposta per `maxAge` secondi e intanto la rinnova dietro
 * le quinte (stale-while-revalidate): la fonte viene interrogata al massimo
 * una volta per periodo, qualunque sia il traffico. Anche il guasto resta in
 * cache per pochi secondi, così una fonte offline non riceve una richiesta a
 * ogni apertura di pagina.
 */
export function jsonResponse(data: unknown, cache: { maxAge: number; staleWhileRevalidate: number }, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${cache.maxAge}, stale-while-revalidate=${cache.staleWhileRevalidate}`,
    },
  });
}

export function errorResponse(error: unknown): Response {
  const body: WeatherError = { error: error instanceof Error ? error.message : String(error) };
  return jsonResponse(body, { maxAge: 10, staleWhileRevalidate: 60 }, 503);
}

export function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ error: 'metodo non consentito' }), {
    status: 405,
    headers: { Allow: 'GET, HEAD', 'Content-Type': 'application/json; charset=utf-8' },
  });
}
