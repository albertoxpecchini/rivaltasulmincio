import type { JournalType } from '../types';

/** Etichette dei tipi di contenuto (JOURNAL.md «TIPI DI CONTENUTO»). */
export const JOURNAL_TYPE_LABELS: Record<JournalType, string> = {
  breaking: 'Breaking',
  cronaca: 'Cronaca',
  avviso: 'Avviso',
  evento: 'Evento',
  cultura: 'Cultura',
  sport: 'Sport',
  associazioni: 'Associazioni',
  scuola: 'Scuola',
  territorio: 'Territorio',
  ambiente: 'Ambiente',
  natura: 'Natura',
  meteo: 'Meteo',
  mincio: 'Acqua / Mincio',
  commercio: 'Commercio',
  agricoltura: 'Agricoltura',
  comunita: 'Comunità',
  storia: 'Storia',
  'memoria-locale': 'Memoria locale',
  viabilita: 'Viabilità',
  trasporti: 'Trasporti',
  servizi: 'Servizi',
  comune: 'Comune',
  'provincia-regione': 'Provincia / Regione',
  'lavori-pubblici': 'Lavori pubblici',
  sicurezza: 'Sicurezza',
  'protezione-civile': 'Protezione Civile',
  'salute-pubblica': 'Salute pubblica',
  necrologio: 'Necrologio',
  'economia-locale': 'Economia locale',
  'foto-dal-paese': 'Foto dal paese',
  video: 'Video',
  documento: 'Documento',
  approfondimento: 'Approfondimento',
  dati: 'Dati',
  anniversario: 'Anniversario',
  retrospettiva: 'Retrospettiva',
  aggiornamento: 'Aggiornamento',
  correzione: 'Correzione',
};

export function journalTypeLabel(type: JournalType): string {
  return JOURNAL_TYPE_LABELS[type] ?? type;
}
