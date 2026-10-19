// Время на часах — минуты от полуночи (0–1439). Без часовых поясов и летнего времени.

export const DAY_MINUTES = 1440;

import type { ClockMode } from '@/i18n/config';

export type { ClockMode };

const CANONICAL = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Каноничная запись 'HH:MM' (24 ч; так время хранится в URL) → минуты. */
export function parseClock(s: string): number | null {
  const m = CANONICAL.exec(s);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** Минуты → каноничная запись 'HH:MM'. */
export function clockValue(minutes: number): string {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Текущее местное время 'HH:MM'. Только на клиенте. */
export function nowClock(): string {
  const d = new Date();
  return clockValue(d.getHours() * 60 + d.getMinutes());
}

// Ввод пользователя: «22:30», «9:05», «9.30», «9,30», «9». Разделитель — двоеточие, точка или запятая.
const TYPED = /^(\d{1,2})(?:[:.,](\d{2}))?$/;
const SUFFIX = /\s*(am|pm)$/i;

/**
 * Время из поля ввода. В режиме 12 ч к тексту приписан суффикс 'AM'/'PM' (его ставит переключатель),
 * в режиме 24 ч суффикса нет. Возвращает минуты или null.
 */
export function parseTyped(raw: string, mode: ClockMode): number | null {
  const suffix = SUFFIX.exec(raw.trim())?.[1]?.toUpperCase();
  const m = TYPED.exec(raw.trim().replace(SUFFIX, ''));
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] === undefined ? 0 : Number(m[2]);
  if (min > 59) return null;
  if (mode === '24') return suffix || h > 23 ? null : h * 60 + min;
  if (!suffix || h < 1 || h > 12) return null;
  return (h % 12) * 60 + min + (suffix === 'PM' ? 720 : 0);
}

/** Минуты → текст поля ввода в выбранном режиме: '22:30' или '10:30 PM'. */
export function formatTyped(minutes: number, mode: ClockMode): string {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  if (mode === '24') return `${String(h).padStart(2, '0')}:${mm}`;
  return `${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Разделяет текст поля 12-часового режима на время и суффикс. */
export function splitSuffix(raw: string): { text: string; suffix: 'AM' | 'PM' } {
  const s = SUFFIX.exec(raw)?.[1]?.toUpperCase();
  return { text: raw.replace(SUFFIX, ''), suffix: s === 'PM' ? 'PM' : 'AM' };
}
