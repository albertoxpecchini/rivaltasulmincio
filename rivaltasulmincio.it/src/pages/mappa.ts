import type { PageResult } from '../app/page';
import { emptyState } from '../components/empty-state';
import { html } from '../lib/html';
import { geodataSource } from '../services/sources';

/**
 * Mappa: la rotta esiste perché è un accesso primario dell'atlante
 * (FUNDAMENTA.md, 404.md). Il motore cartografico e i dati arriveranno con
 * MAP.md e i dataset OSM; fino ad allora la pagina dichiara lo stato reale.
 */
export function render(): PageResult {
  const osm = geodataSource();
  return {
    title: 'Mappa',
    description:
      "La mappa di Rivalta sul Mincio: luoghi, strade, attività e servizi collegati ai dati dell'atlante.",
    main: html`
      <div class="page-header">
        <h1>Mappa</h1>
        <p class="lead">La mappa collega ogni luogo di Rivalta sul Mincio alle sue coordinate, alle entità dell'atlante e alla relativa scheda.</p>
      </div>
      ${emptyState({
        title: 'Mappa interattiva non ancora disponibile',
        text: 'I dati cartografici del progetto sono in preparazione. Ogni luogo resterà consultabile anche come contenuto testuale, senza dipendere dalla mappa.',
      })}
      ${
        osm
          ? html`<p class="source-label">Base cartografica prevista: <a href="${osm.url}" rel="noopener noreferrer">${osm.name}</a>${
              osm.attribution
                ? html`<span><a href="${osm.attributionUrl}" rel="noopener noreferrer">${osm.attribution}</a></span>`
                : ''
            }${osm.license ? html`<span>${osm.license}</span>` : ''}</p>`
          : ''
      }
    `,
  };
}
