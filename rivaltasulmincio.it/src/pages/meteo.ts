import type { PageResult } from '../app/page';
import { weatherFull } from '../components/weather';
import { html } from '../lib/html';
import { METEOMINCIO } from '../services/weather/meteomincio.ts';

/** Pagina meteo (WEATHER.md): struttura resa dal server, dati dalla stazione al caricamento. */
export function render(): PageResult {
  return {
    title: 'Meteo',
    description: `Meteo di Rivalta sul Mincio: condizioni attuali della stazione ${METEOMINCIO.name} e previsione oraria e giornaliera.`,
    main: html`
      <div class="page-header">
        <h1>Meteo</h1>
        <p class="lead">Condizioni attuali e previsioni dalla stazione meteorologica di ${METEOMINCIO.location}, ${METEOMINCIO.name}. Dato locale, aggiornato in tempo reale.</p>
      </div>
      ${weatherFull()}
    `,
  };
}
