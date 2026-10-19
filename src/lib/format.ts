import { LANG_META, type Lang } from '@/i18n/config';

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
