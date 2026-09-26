import { html, type Html } from '../lib/html';
import { METEOMINCIO } from '../services/weather/meteomincio.ts';

/*
 * Markup meteo reso dal server (STYLE.md «METEO»: modulo informativo tecnico):
 * struttura stabile con segnaposto, riempita da `src/weather/client.ts`.
 * Il meteo è contenuto secondario: non blocca nulla e senza JavaScript
 * rimanda alla fonte.
 */

const sourceLink = html`<a href="${METEOMINCIO.url}" rel="noopener noreferrer">${METEOMINCIO.name}</a>`;

/** Stato del dato: punto colorato e parola (WEATHER.md «Data freshness»), aggiornato dal client. */
const stateIndicator = html`<span class="weather__state"><span class="status-dot" aria-hidden="true"></span><span data-weather-state>In attesa</span></span>`;

/**
 * Meteo della Home, in primo piano sotto l'apertura (WEATHER.md «Homepage»):
 * il pannello di adesso con temperatura, vento e pioggia in grande, poi
 * l'approfondimento — prossime ore in una striscia che scorre, prossimi
 * giorni, gli altri dati della stazione. /meteo resta la pagina completa.
 */
export function weatherHome(): Html {
  const pending = (label: string) => html`<p class="weather__pending text-small" data-weather-pending>${label}</p>`;
  return html`<div class="weather weather--home" data-weather="home" data-state="loading">
  <div class="weather-now panel panel--raised">
    <div class="panel__head">
      <span class="panel__title">Adesso · ${METEOMINCIO.location}</span>
      <span class="panel__meta">${stateIndicator}</span>
    </div>
    <div class="panel__body">
      <div class="weather__current" data-weather-current>
        <p class="weather__skeleton" aria-hidden="true"></p>
      </div>
    </div>
    <div class="panel__foot">
      <span class="weather__status" data-weather-status aria-live="polite">Caricamento del meteo…</span>
      <span>Fonte: ${sourceLink}</span>
    </div>
  </div>
  <div class="weather-more">
    <div class="weather-more__hours">
      <h3>Prossime ore</h3>
      <div data-weather-hours>${pending('Caricamento della previsione…')}</div>
    </div>
    <div class="weather-more__days">
      <h3>Prossimi giorni</h3>
      <div data-weather-days>${pending('Caricamento della previsione…')}</div>
    </div>
    <div class="weather-more__station">
      <h3>Dalla stazione</h3>
      <div data-weather-local>${pending('In attesa dei dati.')}</div>
    </div>
    <p class="weather__status weather-more__status" data-weather-forecast-status aria-live="polite"></p>
  </div>
  <noscript><p class="caption">Il meteo richiede JavaScript: consulta ${sourceLink}.</p></noscript>
</div>`;
}

/** Pagina /meteo (WEATHER.md «Pagina meteo»): sezioni fisse, dati al caricamento. */
export function weatherFull(): Html {
  const pending = (label: string) => html`<p class="weather__pending text-small" data-weather-pending>${label}</p>`;
  return html`<div class="weather weather--full" data-weather="full" data-state="loading">
  <section class="section" aria-labelledby="meteo-attuale">
    <div class="section__head"><h2 id="meteo-attuale">Condizioni attuali</h2><span class="section__meta">${stateIndicator}</span><p class="section__intro">Stazione di ${METEOMINCIO.location}.</p></div>
    <div class="weather__current" data-weather-current>
      <p class="weather__skeleton" aria-hidden="true"></p>
    </div>
    <p class="weather__status" data-weather-status aria-live="polite">Caricamento del meteo…</p>
  </section>
  <section class="section" aria-labelledby="meteo-oraria">
    <div class="section__head"><h2 id="meteo-oraria">Previsione oraria</h2><p class="section__intro">Prossime 24 ore, modello ${METEOMINCIO.forecastModel} della stazione.</p></div>
    <div data-weather-hourly>${pending('Caricamento della previsione…')}</div>
  </section>
  <section class="section" aria-labelledby="meteo-giornaliera">
    <div class="section__head"><h2 id="meteo-giornaliera">Previsione giornaliera</h2><p class="section__intro">Prossimi giorni.</p></div>
    <div data-weather-daily>${pending('Caricamento della previsione…')}</div>
    <p class="weather__status" data-weather-forecast-status aria-live="polite"></p>
  </section>
  <div class="weather__details">
    <section class="section" aria-labelledby="meteo-vento">
      <h2 id="meteo-vento">Vento</h2>
      <div data-weather-wind>${pending('In attesa dei dati.')}</div>
    </section>
    <section class="section" aria-labelledby="meteo-precipitazioni">
      <h2 id="meteo-precipitazioni">Precipitazioni</h2>
      <div data-weather-rain>${pending('In attesa dei dati.')}</div>
    </section>
    <section class="section" aria-labelledby="meteo-sole">
      <h2 id="meteo-sole">Sole</h2>
      <div data-weather-sun>${pending('In attesa dei dati.')}</div>
    </section>
    <section class="section" aria-labelledby="meteo-locali">
      <h2 id="meteo-locali">Dati locali</h2>
      <div data-weather-local>${pending('In attesa dei dati.')}</div>
    </section>
  </div>
  <section class="section" aria-labelledby="meteo-fonte">
    <h2 id="meteo-fonte">Fonte</h2>
    <p class="source-label">Fonte: ${sourceLink}</p>
    <p class="text-small">Stazione meteorologica di ${METEOMINCIO.location}: condizioni attuali dalla stazione, previsioni dal modello ${METEOMINCIO.forecastModel} gestito dalla stazione. I dati sono forniti dalla fonte senza garanzia e integrano, non sostituiscono, le previsioni ufficiali.</p>
    <noscript><p class="caption">Il meteo richiede JavaScript: consulta ${sourceLink}.</p></noscript>
  </section>
</div>`;
}
