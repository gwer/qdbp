import { LANG_META, type ClockMode, type Lang } from '@/i18n/config';

// Node и браузеры (разные версии CLDR) используют разные пробелы в разделителях
// разрядов и перед единицами. Приводим всё к обычному неразрывному пробелу,
// чтобы пререндер и клиент давали одинаковые строки.
const SPACES = /[   ]/g;
const normalize = (s: string) => s.replace(SPACES, ' ');

const cache = new Map<string, Intl.NumberFormat>();

function nf(lang: Lang, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = lang + JSON.stringify(opts);
  let f = cache.get(key);
  if (!f) cache.set(key, (f = new Intl.NumberFormat(LANG_META[lang].intl, opts)));
  return f;
}

export type NumberKind = 'number' | 'integer' | 'money' | 'percent';

export function formatNumber(lang: Lang, value: number, kind: NumberKind = 'number', digits?: number): string {
  switch (kind) {
    case 'integer':
      return normalize(nf(lang, { maximumFractionDigits: 0 }).format(value));
    case 'money':
      return normalize(nf(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value));
    case 'percent':
      return normalize(nf(lang, { style: 'percent', maximumFractionDigits: digits ?? 2 }).format(value / 100));
    default:
      return normalize(nf(lang, { maximumFractionDigits: digits ?? 6 }).format(value));
  }
}

/** Число для поля ввода: локальный десятичный разделитель, без группировки разрядов. */
export function formatInput(lang: Lang, value: number): string {
  return nf(lang, { useGrouping: false, maximumFractionDigits: 10 }).format(value);
}

const dateCache = new Map<string, Intl.DateTimeFormat>();

function dtf(lang: Lang, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = lang + JSON.stringify(opts);
  let f = dateCache.get(key);
  if (!f) dateCache.set(key, (f = new Intl.DateTimeFormat(LANG_META[lang].intl, opts)));
  return f;
}

/** Календарная дата 'YYYY-MM-DD'. Форматируется в UTC, чтобы часовой пояс не сдвигал день. */
export function formatDate(lang: Lang, iso: string, style: 'long' | 'full' = 'long'): string {
  return normalize(dtf(lang, { dateStyle: style, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`)));
}

// Перед AM/PM движки ставят то обычный, то узкий пробел — всегда делаем неразрывный.
function withNbspBeforeDayPeriod(parts: Intl.DateTimeFormatPart[]): string {
  return parts
    .map((p, i) => (p.type === 'literal' && parts[i + 1]?.type === 'dayPeriod' ? p.value.replace(/\s+$/, '\u00A0') : p.value))
    .join('');
}

/** Момент времени (мс). Без timeZone — в часовом поясе браузера (при сборке — UTC). */
export function formatDateTime(lang: Lang, ms: number, timeZone?: 'UTC', mode: ClockMode = LANG_META[lang].clock): string {
  const f = dtf(lang, { dateStyle: 'long', timeStyle: 'medium', timeZone, hourCycle: mode === '24' ? 'h23' : 'h12' });
  return normalize(withNbspBeforeDayPeriod(f.formatToParts(new Date(ms))));
}

/**
 * Время на часах (минуты от полуночи) в выбранном формате: «01:30» или «1:30 AM».
 * Перед AM/PM браузеры ставят то обычный, то узкий пробел — делаем всегда неразрывный.
 */
export function formatClock(lang: Lang, minutes: number, mode: ClockMode = LANG_META[lang].clock): string {
  const opts: Intl.DateTimeFormatOptions =
    mode === '24'
      ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }
      : { hour: 'numeric', minute: '2-digit', hourCycle: 'h12', timeZone: 'UTC' };
  return dtf(lang, opts).format(new Date(minutes * 60_000)).replace(/\s/g, '\u00A0');
}
