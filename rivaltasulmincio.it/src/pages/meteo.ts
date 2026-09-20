import type { PageResult } from '../app/page';
import { pageHeader } from '../components/page-header';
import { weatherFull } from '../components/weather';
import { html } from '../lib/html';
import { METEOMINCIO } from '../services/weather/meteomincio.ts';

/** Pagina meteo (WEATHER.md): struttura resa dal server, dati dalla stazione al caricamento. */
export function render(): PageResult {
  return {
    title: 'Meteo',
    description: `Meteo di Rivalta sul Mincio: condizioni attuali della stazione ${METEOMINCIO.name} e previsione oraria e giornaliera.`,
    main: html`
      ${pageHeader({
        title: 'Meteo',
        lead: `Condizioni attuali e previsioni dalla stazione meteorologica di ${METEOMINCIO.location}, ${METEOMINCIO.name}. Dato locale, aggiornato in tempo reale.`,
      })}
      ${weatherFull()}
    `,
  };
}
