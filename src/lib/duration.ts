import type { Lang } from '@/i18n/config';
import { parseNumber } from './parse';

/**
 * Длительность в минутах из записи «ч:мм» («1:30», «12:05», «0:45») или из числа часов
 * в любой привычной записи («1,5» = 1:30). Минуты в «ч:мм» — от 0 до 59.
 */
export function parseDuration(input: string, lang: Lang): number | null {
  const s = input.trim();
  const m = /^(\d+):([0-5]\d)$/.exec(s);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  if (s.includes(':')) return null;
  const hours = parseNumber(s, lang);
  return hours === null || hours < 0 ? null : Math.round(hours * 60);
}

/** Минуты → «ч:мм», со знаком минус для отрицательных. */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? '−' : '';
  const abs = Math.abs(Math.round(minutes));
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}
