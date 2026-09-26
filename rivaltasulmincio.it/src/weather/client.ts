import { iconMarkup } from '../components/icons';
import { CONDITION_ICONS } from '../services/weather/conditions.ts';
import type {
  DailyForecast,
  HourlyForecast,
  WeatherCondition,
  WeatherData,
  WeatherError,
  WeatherForecast,
} from '../services/weather/types.ts';

/*
 * Meteo lato client: legge `/api/meteo/*` e riempie i segnaposto resi dal
 * server. Stati: loading → success | stale | error. Le ore della stazione e
 * delle previsioni sono locali (Europe/Rome), senza fuso.
 */

const CURRENT_URL = '/api/meteo/attuale';
const FORECAST_URL = '/api/meteo/previsioni';
const STALE_AFTER_MINUTES = 15;
const HOURLY_ROWS = 24;
/** Home: la striscia delle prossime ore e i giorni sono un assaggio; /meteo ha tutto. */
const HOME_HOURS = 12;
const HOME_DAYS = 5;
const NOT_AVAILABLE = 'Dato non disponibile';
const TIME_ZONE = 'Europe/Rome';

export async function mountWeather(root: HTMLElement): Promise<void> {
  if (root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  const full = root.dataset.weather === 'full';
  const home = root.dataset.weather === 'home';

  const current = await getJson<WeatherData>(CURRENT_URL);
  const status = slot(root, 'status');
  const state = slot(root, 'state');
  if ('error' in current) {
    root.dataset.state = 'error';
    if (state) state.textContent = 'Non disponibile';
    slot(root, 'current')?.replaceChildren(el('p', { class: 'weather__error' }, 'Meteo temporaneamente non disponibile.'));
    if (status) status.textContent = 'Fonte non raggiungibile. Riprova più tardi.';
    for (const name of ['wind', 'rain', 'sun', 'local']) slot(root, name)?.replaceChildren(el('p', { class: 'text-small' }, NOT_AVAILABLE));
  } else {
    const ageMinutes = minutesSince(current.observedAt);
    const stale = ageMinutes != null && ageMinutes > STALE_AFTER_MINUTES;
    root.dataset.state = stale ? 'stale' : 'success';
    // WEATHER.md «Data freshness»: lo stato si dichiara solo quando è noto.
    if (state) state.textContent = stale ? 'Ultimo dato' : current.observedAt ? 'Live' : 'Aggiornato';
    slot(root, 'current')?.replaceChildren(...(home ? nowBlock(current) : currentBlock(current, full)));
    if (status) {
      status.textContent = current.observedAt
        ? stale
          ? `Ultimo dato disponibile: ${formatDateTime(current.observedAt)}`
          : `Aggiornato alle ${formatClock(current.observedAt)}`
        : 'Ora della misura non disponibile';
    }
    if (full) {
      slot(root, 'wind')?.replaceChildren(facts([
        ['Velocità', unit(current.windSpeed, 'km/h', 0)],
        ['Raffica', unit(current.windGust, 'km/h', 0)],
        ['Direzione', current.windDirection == null ? undefined : `${current.windDirectionLabel ?? ''} ${current.windDirection}°`.trim()],
      ]));
      slot(root, 'rain')?.replaceChildren(facts([
        ['Oggi', unit(current.precipitation, 'mm')],
        ['Intensità', unit(current.precipitationRate, 'mm/h', 2)],
        ['Mese', unit(current.precipitationMonth, 'mm')],
        ['Anno', unit(current.precipitationYear, 'mm')],
      ]));
      slot(root, 'sun')?.replaceChildren(facts([
        ['Indice UV', unit(current.uvIndex, '', 1)],
        ['Radiazione solare', unit(current.solarRadiation, 'W/m²', 0)],
      ]));
      slot(root, 'local')?.replaceChildren(facts([
        ['Minima di oggi', unit(current.temperatureMin, '°C')],
        ['Massima di oggi', unit(current.temperatureMax, '°C')],
        ['Punto di rugiada', unit(current.dewPoint, '°C')],
        ['Pressione', unit(current.pressure, 'hPa')],
        ['Tendenza', current.pressureTrend == null ? undefined : `${current.pressureTrend > 0 ? '+' : ''}${format(current.pressureTrend, 1)} hPa`],
        ['Stazione', current.location.lat != null && current.location.lon != null ? `${current.location.lat.toFixed(5)}, ${current.location.lon.toFixed(5)}` : undefined],
      ]));
    }
    if (home) {
      slot(root, 'local')?.replaceChildren(facts([
        ['Minima di oggi', unit(current.temperatureMin, '°C')],
        ['Massima di oggi', unit(current.temperatureMax, '°C')],
        ['Raffica', unit(current.windGust, 'km/h', 0)],
        ['Pressione', current.pressure == null ? undefined : `${format(current.pressure, 1)} hPa${current.pressureTrend == null ? '' : ` (${current.pressureTrend > 0 ? '+' : ''}${format(current.pressureTrend, 1)})`}`],
        ['Punto di rugiada', unit(current.dewPoint, '°C')],
        ['Pioggia del mese', unit(current.precipitationMonth, 'mm')],
        ['Pioggia dell’anno', unit(current.precipitationYear, 'mm')],
        ['Indice UV', unit(current.uvIndex, '', 1)],
      ]));
    }
  }

  if (!full && !home) return;
  const forecast = await getJson<WeatherForecast>(FORECAST_URL);
  const forecastStatus = slot(root, 'forecast-status');
  if ('error' in forecast) {
    const message = el('p', { class: 'weather__error' }, 'Previsione temporaneamente non disponibile.');
    for (const name of ['hourly', 'daily', 'hours', 'days']) slot(root, name)?.replaceChildren(message.cloneNode(true));
    return;
  }
  slot(root, 'hourly')?.replaceChildren(hourlyTable(forecast.hourly));
  slot(root, 'daily')?.replaceChildren(dailyTable(forecast.daily));
  slot(root, 'hours')?.replaceChildren(hourStrip(forecast.hourly));
  slot(root, 'days')?.replaceChildren(dayList(forecast.daily));
  if (forecastStatus) forecastStatus.textContent = `Previsione ${forecast.model} emessa il ${formatIssued(forecast.issuedAt)}.`;
}

// ── rendering ────────────────────────────────────────────────────────────────

function currentBlock(data: WeatherData, full: boolean): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  const headline = el('div', { class: 'weather__headline' });
  headline.append(el('p', { class: 'stat weather__temperature' }, data.temperature == null ? NOT_AVAILABLE : `${format(data.temperature, 1)}°`));
  if (data.condition) headline.append(conditionNode(data.condition, 28));
  nodes.push(headline);

  // Misure secondarie come coppie etichetta → valore (STYLE.md «METEO»).
  const metrics = el('dl', { class: 'weather__metrics' });
  const metric = (label: string, value: string | undefined): void => {
    if (value == null) return;
    metrics.append(el('div', {}, el('dt', {}, label), el('dd', {}, value)));
  };
  metric('Percepita', unit(data.feelsLike, '°C'));
  metric('Vento', data.windSpeed == null ? undefined : `${format(data.windSpeed, 0)} km/h${data.windDirectionLabel ? ` ${data.windDirectionLabel}` : ''}`);
  metric('Umidità', unit(data.humidity, '%', 0));
  if (full) metric('Pressione', unit(data.pressure, 'hPa'));
  if (metrics.childElementCount) nodes.push(metrics);
  return nodes;
}

/**
 * Adesso, per la Home: temperatura e condizione a sinistra, poi vento, pioggia
 * e umidità come numeri grandi, ciascuno con un dato di contorno sotto.
 */
function nowBlock(data: WeatherData): HTMLElement[] {
  const main = el('div', { class: 'weather-now__main' });
  main.append(el('p', { class: 'stat weather__temperature' }, data.temperature == null ? NOT_AVAILABLE : `${format(data.temperature, 1)}°`));
  if (data.condition) main.append(conditionNode(data.condition, 28));
  if (data.feelsLike != null) main.append(el('p', { class: 'weather-now__note' }, `Percepita ${unit(data.feelsLike, '°C')}`));

  // Il numero in grande, l'unità (e la direzione del vento) più piccola accanto.
  const figures = el('dl', { class: 'weather-now__figures' });
  const figure = (label: string, value: [string, string] | undefined, note: string | undefined): void => {
    const dd = el('dd', { class: 'weather-now__value' });
    if (value) dd.append(value[0], el('span', { class: 'weather-now__unit' }, ` ${value[1]}`));
    else dd.append(NOT_AVAILABLE);
    const row = el('div', {}, el('dt', {}, label), dd);
    if (note) row.append(el('dd', { class: 'weather-now__note' }, note));
    figures.append(row);
  };
  figure(
    'Vento',
    data.windSpeed == null ? undefined : [format(data.windSpeed, 0), `km/h${data.windDirectionLabel ? ` ${data.windDirectionLabel}` : ''}`],
    data.windGust == null ? undefined : `Raffica ${unit(data.windGust, 'km/h', 0)}`,
  );
  figure(
    'Pioggia oggi',
    data.precipitation == null ? undefined : [format(data.precipitation, 1), 'mm'],
    data.precipitationRate ? `Adesso ${unit(data.precipitationRate, 'mm/h', 1)}` : data.precipitationMonth == null ? undefined : `Mese ${unit(data.precipitationMonth, 'mm')}`,
  );
  figure(
    'Umidità',
    data.humidity == null ? undefined : [format(data.humidity, 0), '%'],
    data.pressure == null ? undefined : `Pressione ${unit(data.pressure, 'hPa', 0)}`,
  );
  return [main, figures];
}

/**
 * Prossime ore in una striscia che scorre di lato (WEATHER.md «Responsive»:
 * orario a scorrimento orizzontale, mai una tabella larga su mobile). La
 * condizione è un'icona con il suo nome, leggibile anche senza vederla.
 */
function hourStrip(hours: HourlyForecast[]): HTMLElement {
  const now = localNow();
  const upcoming = hours.filter((h) => h.time >= now.slice(0, 13) + ':00').slice(0, HOME_HOURS);
  if (upcoming.length === 0) return el('p', { class: 'text-small' }, 'Nessuna ora futura nella previsione disponibile.');
  const list = el('ol', { class: 'weather-hours list-plain', tabindex: '0', 'aria-label': 'Previsione delle prossime ore' });
  const today = now.slice(0, 10);
  let previous = today;
  for (const h of upcoming) {
    // Il giorno si scrive solo dove cambia: la prima ora di domani apre la sua colonna con «Domani».
    const day = h.time.slice(0, 10);
    const newDay = day !== previous;
    previous = day;
    const item = el(
      'li',
      newDay ? { class: 'weather-hours__new-day' } : {},
      el('span', { class: 'weather-hours__day' }, newDay ? dayLabel(day, today) : ' '),
      el('span', { class: 'weather-hours__time' }, h.time.slice(11, 16)),
    );
    if (h.condition) item.append(conditionIcon(h.condition, 24));
    item.append(
      el('span', { class: 'weather-hours__temp' }, degrees(h.temperature)),
      el('span', { class: 'weather-hours__detail' }, h.precipitation == null ? '—' : `${format(h.precipitation, 1)} mm`),
      el('span', { class: 'weather-hours__detail' }, h.windSpeed == null ? '—' : `${format(h.windSpeed, 0)} km/h`),
    );
    list.append(item);
  }
  return list;
}

/** Prossimi giorni in righe: giorno, condizione, minima e massima, pioggia. */
function dayList(days: DailyForecast[]): HTMLElement {
  const today = localNow().slice(0, 10);
  const upcoming = days.filter((d) => d.date >= today).slice(0, HOME_DAYS);
  if (upcoming.length === 0) return el('p', { class: 'text-small' }, 'Nessun giorno futuro nella previsione disponibile.');
  const list = el('ul', { class: 'weather-days list-plain' });
  for (const d of upcoming) {
    const temps = el('span', { class: 'weather-days__temps' });
    temps.append(
      el('span', { class: 'weather-days__min' }, el('span', { class: 'visually-hidden' }, 'minima '), degrees(d.temperatureMin)),
      el('span', { class: 'weather-days__max' }, el('span', { class: 'visually-hidden' }, 'massima '), degrees(d.temperatureMax)),
    );
    list.append(
      el(
        'li',
        {},
        el('span', { class: 'weather-days__day' }, dayLabel(d.date, today)),
        d.condition ? conditionNode(d.condition, 20) : el('span', {}, NOT_AVAILABLE),
        temps,
        el('span', { class: 'weather-days__rain' }, d.precipitation == null ? '—' : `${format(d.precipitation, 1)} mm`),
      ),
    );
  }
  return list;
}

/** Solo l'icona, con il nome della condizione come testo accessibile e suggerimento. */
function conditionIcon(condition: WeatherCondition, size: number): HTMLElement {
  const node = el('span', { class: 'weather-hours__icon', role: 'img', 'aria-label': condition.label, title: condition.label });
  node.insertAdjacentHTML('afterbegin', iconMarkup(CONDITION_ICONS[condition.key], size));
  return node;
}

function conditionNode(condition: WeatherCondition, size: number): HTMLElement {
  const node = el('span', { class: 'weather__condition' });
  node.insertAdjacentHTML('afterbegin', iconMarkup(CONDITION_ICONS[condition.key], size));
  node.append(el('span', {}, condition.label));
  return node;
}

function facts(rows: [string, string | undefined][]): HTMLElement {
  const list = el('dl', { class: 'facts' });
  for (const [label, value] of rows) {
    list.append(el('div', {}, el('dt', {}, label), el('dd', {}, value ?? NOT_AVAILABLE)));
  }
  return list;
}

function hourlyTable(hours: HourlyForecast[]): HTMLElement {
  const now = localNow();
  const upcoming = hours.filter((h) => h.time >= now.slice(0, 13) + ':00').slice(0, HOURLY_ROWS);
  if (upcoming.length === 0) return el('p', { class: 'text-small' }, 'Nessuna ora futura nella previsione disponibile.');
  return table(
    [['Ora'], ['Condizione'], ['Temperatura', true], ['Pioggia', true], ['Vento', true], ['Umidità', true]],
    upcoming.map((h) => [
      el('th', { scope: 'row', class: 'tabular' }, dayPrefix(h.time.slice(0, 10), now.slice(0, 10)) + h.time.slice(11, 16)),
      h.condition ? conditionNode(h.condition, 20) : NOT_AVAILABLE,
      unit(h.temperature, '°C') ?? NOT_AVAILABLE,
      h.precipitation ? `${format(h.precipitation, 1)} mm` : '—',
      h.windSpeed == null ? NOT_AVAILABLE : `${format(h.windSpeed, 0)} km/h${h.windDirection == null ? '' : ` ${compass(h.windDirection)}`}`,
      unit(h.humidity, '%', 0) ?? NOT_AVAILABLE,
    ]),
  );
}

function dailyTable(days: DailyForecast[]): HTMLElement {
  const today = localNow().slice(0, 10);
  const upcoming = days.filter((d) => d.date >= today);
  if (upcoming.length === 0) return el('p', { class: 'text-small' }, 'Nessun giorno futuro nella previsione disponibile.');
  return table(
    [['Giorno'], ['Condizione'], ['Minima', true], ['Massima', true], ['Pioggia', true], ['Vento max', true], ['UV max', true]],
    upcoming.map((d) => [
      el('th', { scope: 'row' }, dayLabel(d.date, today)),
      d.condition ? conditionNode(d.condition, 20) : NOT_AVAILABLE,
      unit(d.temperatureMin, '°C', 0) ?? NOT_AVAILABLE,
      unit(d.temperatureMax, '°C', 0) ?? NOT_AVAILABLE,
      d.precipitation ? `${format(d.precipitation, 1)} mm` : '—',
      unit(d.windSpeedMax, 'km/h', 0) ?? NOT_AVAILABLE,
      unit(d.uvIndexMax, '', 0) ?? NOT_AVAILABLE,
    ]),
  );
}

/** Colonne `[etichetta, numerica]`: le numeriche sono allineate a destra (TYPOGRAPHY.md «Tabelle»). */
function table(headers: [string, boolean?][], rows: (string | HTMLElement)[][]): HTMLElement {
  const wrap = el('div', { class: 'table-wrap' });
  const tableNode = el('table', { class: 'table weather-table' });
  const head = el('tr', {});
  for (const [label, numeric] of headers) head.append(el('th', numeric ? { scope: 'col', class: 'num' } : { scope: 'col' }, label));
  tableNode.append(el('thead', {}, head));
  const body = el('tbody', {});
  for (const cells of rows) {
    const tr = el('tr', {});
    cells.forEach((cell, index) => {
      if (cell instanceof HTMLElement && cell.tagName === 'TH') tr.append(cell);
      else tr.append(el('td', headers[index]?.[1] ? { class: 'num' } : {}, cell));
    });
    body.append(tr);
  }
  tableNode.append(body);
  wrap.append(tableNode);
  return wrap;
}

// ── dati ─────────────────────────────────────────────────────────────────────

async function getJson<T>(url: string): Promise<T | WeatherError> {
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    const body = (await response.json()) as T | WeatherError;
    if (!response.ok && !('error' in (body as object))) return { error: `HTTP ${response.status}` };
    return body;
  } catch {
    return { error: 'fonte non raggiungibile' };
  }
}

function slot(root: HTMLElement, name: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-weather-${name}]`);
}

function el(tag: string, attrs: Record<string, string> = {}, ...children: (Node | string)[]): HTMLElement {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

// ── formati ──────────────────────────────────────────────────────────────────

const numberFormats = new Map<number, Intl.NumberFormat>();

function format(n: number, decimals: number): string {
  let formatter = numberFormats.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    numberFormats.set(decimals, formatter);
  }
  return formatter.format(n);
}

function unit(n: number | undefined, suffix: string, decimals = 1): string | undefined {
  if (n == null) return undefined;
  return suffix ? `${format(n, decimals)} ${suffix}` : format(n, decimals);
}

/** «24°»: gradi interi, senza unità, per le celle strette. */
function degrees(n: number | undefined): string {
  return n == null ? '—' : `${format(n, 0)}°`;
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
function compass(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16];
}

/** Adesso, nel fuso di Rivalta, come ISO locale senza fuso: confrontabile con le ore della fonte. */
function localNow(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function minutesSince(localIso: string | undefined): number | undefined {
  if (!localIso) return undefined;
  const then = Date.parse(`${localIso}Z`);
  const now = Date.parse(`${localNow()}:00Z`);
  return Number.isFinite(then) && Number.isFinite(now) ? (now - then) / 60_000 : undefined;
}

function formatClock(localIso: string): string {
  return localIso.slice(11, 16);
}

function formatDateTime(localIso: string): string {
  const [date, clock] = localIso.split('T');
  return `${formatDay(date)}, ${clock.slice(0, 5)}`;
}

function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(y, m - 1, d)));
}

function dayLabel(date: string, today: string): string {
  if (date === today) return 'Oggi';
  if (date === nextDay(today)) return 'Domani';
  const [y, m, d] = date.split('-').map(Number);
  const label = new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', weekday: 'long', day: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayPrefix(date: string, today: string): string {
  if (date === today) return '';
  return date === nextDay(today) ? 'domani ' : `${date.slice(8, 10)}/${date.slice(5, 7)} `;
}

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatIssued(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
