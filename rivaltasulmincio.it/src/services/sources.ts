import { sourceHierarchy, sources } from '../data/sources';
import type { Source, SourceHierarchyRule, SourceType } from '../types';

const TYPE_LABELS: Record<SourceType, string> = {
  municipality: 'Comune',
  region: 'Regione',
  province: 'Provincia',
  'national-institute': 'Istituto nazionale',
  agency: 'Ente pubblico',
  geodata: 'Dati geografici aperti',
  weather: 'Stazione meteo',
  press: 'Stampa',
  local: 'Documentazione locale',
  other: 'Altro',
};

/** Tutte le fonti, in ordine di preferenza. */
export function listSources(): Source[] {
  return [...sources].sort((a, b) => a.rank - b.rank);
}

export function getSource(id: string | undefined): Source | undefined {
  return id ? sources.find((source) => source.id === id) : undefined;
}

/** Fonti con un URL verificato: le uniche che si possono linkare. */
export function linkedSources(): Source[] {
  return listSources().filter((source) => Boolean(source.url));
}

/** La fonte geografica di riferimento (OSM.md). */
export function geodataSource(): Source | undefined {
  return listSources().find((source) => source.type === 'geodata');
}

export function isOfficial(source: Source | undefined): boolean {
  return source?.badge === 'official' && source.verified === true;
}

export function sourceTypeLabel(type: SourceType): string {
  return TYPE_LABELS[type];
}

export function listHierarchy(): SourceHierarchyRule[] {
  return sourceHierarchy;
}
