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

/**
 * Длительность в секундах: «1:45:30» (ч:мм:сс), «45:30» и «5:30» (мм:сс), просто число — минуты.
 * Для забегов, темпа, таймеров.
 */
export function parseDurationSeconds(input: string, lang: Lang): number | null {
  const s = input.trim();
  let m = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(s);
  if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  m = /^(\d+):([0-5]\d)$/.exec(s);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  if (s.includes(':')) return null;
  const minutes = parseNumber(s, lang);
  return minutes === null || minutes < 0 ? null : Math.round(minutes * 60);
}

/** Секунды → «1:05:09» или «5:09» (без часов, если их нет). */
export function formatDurationSeconds(seconds: number): string {
  const sign = seconds < 0 ? '−' : '';
  const total = Math.round(Math.abs(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${sign}${h}:${String(m).padStart(2, '0')}:${s}` : `${sign}${m}:${s}`;
}
