import { CONDITION_SEVERITY, wxsimCondition } from './conditions.ts';
import type { DailyForecast, HourlyForecast, WeatherCondition, WeatherForecast } from './types.ts';

/*
 * Parser di latest.csv, l'uscita oraria del modello WXSIM della stazione.
 * Verificato il 20 settembre 2026: 81 colonne, riga 1 intestazioni, riga 2
 * unità, poi una riga ogni mezz'ora per nove giorni. I numeri usano la
 * virgola decimale e la virgola è anche il separatore: una virgola fra due
 * cifre è decimale, ogni altra virgola separa. Ore locali (colonna «Time»,
 * DST), istante UTC nell'ultima colonna. «Tot.Prcp» è la precipitazione
 * accumulata dall'inizio della corsa: quella del passo è la differenza.
 */
const HOURLY_HOURS = 72;
const DAILY_DAYS = 7;

type Step = {
  time: string;
  date: string;
  minute: number;
  daytime: boolean;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  uvIndex?: number;
  precipitation: number;
  condition?: WeatherCondition;
};

export type ParsedWxsim = Pick<WeatherForecast, 'issuedAt' | 'hourly' | 'daily'>;

export function parseWxsimCsv(text: string): ParsedWxsim {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 3) throw new Error('wxsim: file vuoto o troncato');

  const header = splitRow(lines[0]);
  const column = (name: string): number => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`wxsim: colonna «${name}» assente`);
    return index;
  };
  const C = {
    year: column('Year'),
    month: column('Month'),
    day: column('Day'),
    time: column('Time'),
    sky: column('WX Type 1'),
    phenomenon: column('WX Type 2'),
    temperature: column('Temperature'),
    humidity: column('Rel.Hum.'),
    windSpeed: column('Wind Spd.'),
    windDirection: column('Wind Dir.'),
    precipitationTotal: column('Tot.Prcp'),
    sunAltitude: column('Sun Alt'),
    uv: column('UV Index'),
    utc: column('UTC Date/Time'),
  };

  const rows = lines.slice(2).map(splitRow).filter((row) => row.length === header.length);
  if (rows.length === 0) throw new Error('wxsim: nessuna riga di dati');
  const issuedAt = parseUtc(rows[0][C.utc]);
  if (!issuedAt) throw new Error('wxsim: istante di emissione assente');

  const steps: Step[] = [];
  let previousTotal = 0;
  for (const row of rows) {
    const year = num(row[C.year]);
    const month = num(row[C.month]);
    const day = num(row[C.day]);
    const time = num(row[C.time]);
    if (year == null || month == null || day == null || time == null) continue;
    const hour = Math.floor(time);
    const minute = Number.isInteger(time) ? 0 : 30;
    const date = `${year}-${two(month)}-${two(day)}`;
    const total = num(row[C.precipitationTotal]) ?? previousTotal;
    const precipitation = Math.max(0, round(total - previousTotal, 2) ?? 0);
    previousTotal = total;
    const daytime = (num(row[C.sunAltitude]) ?? 0) > 0;
    steps.push({
      time: `${date}T${two(hour)}:${two(minute)}`,
      date,
      minute,
      daytime,
      temperature: round(num(row[C.temperature])),
      humidity: round(num(row[C.humidity]), 0),
      windSpeed: round(num(row[C.windSpeed]), 0),
      windDirection: round(num(row[C.windDirection]), 0),
      uvIndex: round(num(row[C.uv])),
      precipitation,
      condition: wxsimCondition(row[C.sky], row[C.phenomenon], daytime),
    });
  }

  return { issuedAt, hourly: hourly(steps), daily: daily(steps) };
}

/** Un passo alle :30 o alle :00 copre la mezz'ora precedente: la pioggia va nell'ora in cui è caduta. */
function hourOfPrecipitation(step: Step): string {
  const [date, clock] = step.time.split('T');
  const [hour] = clock.split(':').map(Number);
  if (step.minute === 30) return `${date}T${two(hour)}:00`;
  const previous = new Date(`${date}T${two(hour)}:00:00Z`);
  previous.setUTCHours(previous.getUTCHours() - 1);
  return previous.toISOString().slice(0, 16);
}

function hourly(steps: Step[]): HourlyForecast[] {
  const rain = new Map<string, number>();
  for (const step of steps) {
    const key = hourOfPrecipitation(step);
    rain.set(key, round((rain.get(key) ?? 0) + step.precipitation, 2) ?? 0);
  }
  return steps
    .filter((step) => step.minute === 0)
    .slice(0, HOURLY_HOURS)
    .map((step) => ({
      time: step.time,
      temperature: step.temperature,
      condition: step.condition,
      precipitation: rain.get(step.time) ?? 0,
      humidity: step.humidity,
      windSpeed: step.windSpeed,
      windDirection: step.windDirection,
      uvIndex: step.uvIndex,
    }));
}

function daily(steps: Step[]): DailyForecast[] {
  const days = new Map<string, Step[]>();
  for (const step of steps) days.set(step.date, [...(days.get(step.date) ?? []), step]);

  return [...days.entries()].slice(0, DAILY_DAYS).map(([date, list]) => {
    const temperatures = list.map((s) => s.temperature).filter((t): t is number => t != null);
    const winds = list.map((s) => s.windSpeed).filter((w): w is number => w != null);
    const uvs = list.map((s) => s.uvIndex).filter((u): u is number => u != null);
    return {
      date,
      temperatureMin: temperatures.length ? Math.min(...temperatures) : undefined,
      temperatureMax: temperatures.length ? Math.max(...temperatures) : undefined,
      precipitation: round(list.reduce((sum, s) => sum + s.precipitation, 0), 1),
      condition: dominantCondition(list),
      windSpeedMax: winds.length ? Math.max(...winds) : undefined,
      uvIndexMax: uvs.length ? Math.max(...uvs) : undefined,
    };
  });
}

/** Il fenomeno più rilevante del giorno; a parità, il cielo di metà giornata. */
function dominantCondition(list: Step[]): WeatherCondition | undefined {
  const withCondition = list.filter((s) => s.condition);
  if (withCondition.length === 0) return undefined;
  const midday = withCondition.find((s) => s.time.endsWith('T13:00')) ?? withCondition.find((s) => s.daytime) ?? withCondition[0];
  let best = midday;
  for (const step of withCondition) {
    if (CONDITION_SEVERITY[step.condition!.key] > CONDITION_SEVERITY[best.condition!.key]) best = step;
  }
  return best.condition;
}

function splitRow(line: string): string[] {
  return line.split(/(?<!\d),|,(?!\d)/).map((cell) => cell.trim());
}

function num(raw: string | undefined): number | undefined {
  const n = Number.parseFloat(String(raw ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function round(n: number | undefined, decimals = 1): number | undefined {
  return n == null ? undefined : Number.parseFloat(n.toFixed(decimals));
}

function two(n: number): string {
  return String(n).padStart(2, '0');
}

/** `2026-09-20_17:00_UTC` → ISO con fuso. */
function parseUtc(raw: string | undefined): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})_(\d{2}):(\d{2})_UTC$/.exec(raw ?? '');
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00Z` : undefined;
}
