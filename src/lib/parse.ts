import { LANG_META, type Lang } from '@/i18n/config';

const groupSeparators = new Map<Lang, string>();

function groupSeparator(lang: Lang): string {
  let sep = groupSeparators.get(lang);
  if (sep === undefined) {
    const part = new Intl.NumberFormat(LANG_META[lang].intl).formatToParts(1000000).find((p) => p.type === 'group');
    groupSeparators.set(lang, (sep = part?.value ?? ''));
  }
  return sep;
}

/**
 * Разбирает число, введённое пользователем в любой привычной ему записи:
 * «1 234,5», «1,234.5», «1.234,5», «1234.5», «-0,5».
 * - разделитель встречается несколько раз — это группировка разрядов (группы строго по три цифры);
 * - есть и точка, и запятая — десятичный тот, что правее, группы слева от него — тоже по три цифры;
 * - один разделитель — десятичный, кроме случая, когда это разделитель групп
 *   языка страницы и за ним ровно три цифры («1,234» в en, «1.500» в de).
 * Возвращает null, если строка не число. Ошибочную запись («1.2.3») не угадываем, а отклоняем.
 */
/** «1.234.567», «-12,345»: целая часть, разбитая на группы по три цифры. */
const isGrouped = (int: string, sep: string) => new RegExp(`^-?\\d{1,3}(\\${sep}\\d{3})+$`).test(int);

export function parseNumber(input: string, lang: Lang): number | null {
  let s = input.trim().replace(/[\s   '’_]/g, '').replace(/^−/, '-');
  if (s === '' || s === '-') return null;

  const dots = s.split('.').length - 1;
  const commas = s.split(',').length - 1;

  if (dots && commas) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    if (s.split(decimal).length > 2) return null;
    if (!isGrouped(s.slice(0, s.indexOf(decimal)), group)) return null;
    s = s.split(group).join('').replace(decimal, '.');
  } else if (dots > 1 || commas > 1) {
    if (!isGrouped(s, dots ? '.' : ',')) return null;
    s = s.replace(/[.,]/g, '');
  } else if (dots || commas) {
    const sep = dots ? '.' : ',';
    const isGroup = sep === groupSeparator(lang) && /^-?\d{1,3}[.,]\d{3}$/.test(s);
    s = isGroup ? s.replace(sep, '') : s.replace(sep, '.');
  }

  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
