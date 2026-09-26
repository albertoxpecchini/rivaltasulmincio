/*
 * Date: i dataset salvano timestamp ISO 8601; l'interfaccia mostra il formato
 * italiano (JOURNAL.md), sempre nel fuso di Rivalta.
 */
const TIME_ZONE = 'Europe/Rome';
const LOCALE = 'it-IT';

export const DATE_UNAVAILABLE = 'Data non disponibile';

export function parseIso(iso: string | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** «20 settembre 2026» oppure, con `time`, «20 settembre 2026, 18:40». */
export function formatDate(iso: string | undefined, options: { time?: boolean } = {}): string {
  const date = parseIso(iso);
  if (!date) return DATE_UNAVAILABLE;
  const day = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return options.time ? `${day}, ${formatTime(iso)}` : day;
}

/** «20.09.2026»: data compatta per etichette tecniche in mono (STYLE.md «MONOSPACE»). */
export function formatDateShort(iso: string | undefined): string {
  const date = parseIso(iso);
  if (!date) return DATE_UNAVAILABLE;
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replaceAll('/', '.');
}

/** «18:40». */
export function formatTime(iso: string | undefined): string {
  const date = parseIso(iso);
  if (!date) return DATE_UNAVAILABLE;
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Anno e mese (a due cifre) nel fuso locale: servono per gli URL del giornale. */
export function yearMonth(iso: string): { year: string; month: string } {
  const date = parseIso(iso);
  if (!date) return { year: '0000', month: '00' };
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { year: part('year'), month: part('month') };
}

/** «2026-10-27»: il giorno nel fuso locale, per il `datetime` di una data senza ora. */
export function isoDay(iso: string): string {
  const date = parseIso(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isBefore(iso: string | undefined, now: Date): boolean {
  const date = parseIso(iso);
  return date ? date.getTime() < now.getTime() : false;
}

export function isAfter(iso: string | undefined, now: Date): boolean {
  const date = parseIso(iso);
  return date ? date.getTime() > now.getTime() : false;
}

export function daysSince(iso: string | undefined, now: Date): number {
  const date = parseIso(iso);
  if (!date) return Number.POSITIVE_INFINITY;
  return (now.getTime() - date.getTime()) / 86_400_000;
}
