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
const NOT_AVAILABLE = 'Dato non disponibile';
const TIME_ZONE = 'Europe/Rome';

export async function mountWeather(root: HTMLElement): Promise<void> {
  if (root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  const full = root.dataset.weather === 'full';

  const current = await getJson<WeatherData>(CURRENT_URL);
  const status = slot(root, 'status');
  if ('error' in current) {
    root.dataset.state = 'error';
    slot(root, 'current')?.replaceChildren(el('p', { class: 'weather__error' }, 'Meteo temporaneamente non disponibile.'));
    if (status) status.textContent = 'Fonte non raggiungibile. Riprova più tardi.';
    for (const name of ['wind', 'rain', 'sun', 'local']) slot(root, name)?.replaceChildren(el('p', { class: 'text-small' }, NOT_AVAILABLE));
  } else {
    const ageMinutes = minutesSince(current.observedAt);
    const stale = ageMinutes != null && ageMinutes > STALE_AFTER_MINUTES;
    root.dataset.state = stale ? 'stale' : 'success';
    slot(root, 'current')?.replaceChildren(...currentBlock(current, full));
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
  }

  if (!full) return;
  const forecast = await getJson<WeatherForecast>(FORECAST_URL);
  const forecastStatus = slot(root, 'forecast-status');
  if ('error' in forecast) {
    const message = el('p', { class: 'weather__error' }, 'Previsione temporaneamente non disponibile.');
    slot(root, 'hourly')?.replaceChildren(message);
    slot(root, 'daily')?.replaceChildren(message.cloneNode(true));
    return;
  }
  slot(root, 'hourly')?.replaceChildren(hourlyTable(forecast.hourly));
  slot(root, 'daily')?.replaceChildren(dailyTable(forecast.daily));
  if (forecastStatus) forecastStatus.textContent = `Previsione ${forecast.model} emessa il ${formatIssued(forecast.issuedAt)}.`;
}

// ── rendering ────────────────────────────────────────────────────────────────

function currentBlock(data: WeatherData, full: boolean): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  const headline = el('div', { class: 'weather__headline' });
  headline.append(el('p', { class: 'stat weather__temperature' }, data.temperature == null ? NOT_AVAILABLE : `${format(data.temperature, 1)}°`));
  if (data.condition) headline.append(conditionNode(data.condition, 28));
  nodes.push(headline);

  const row = el('p', { class: 'weather__row' });
  if (data.feelsLike != null) row.append(el('span', {}, `Percepita ${format(data.feelsLike, 1)} °C`));
  if (data.windSpeed != null) row.append(el('span', {}, `Vento ${format(data.windSpeed, 0)} km/h${data.windDirectionLabel ? ` ${data.windDirectionLabel}` : ''}`));
  if (data.humidity != null) row.append(el('span', {}, `Umidità ${format(data.humidity, 0)} %`));
  if (full && data.pressure != null) row.append(el('span', {}, `Pressione ${format(data.pressure, 1)} hPa`));
  if (row.childElementCount) nodes.push(row);
  return nodes;
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
