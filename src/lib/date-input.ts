// Дата в поле ввода — в привычной для языка записи: 19.10.2026, 10/19/2026, 19/10/2026.
// Порядок частей и разделитель берутся из Intl, внутри дата по-прежнему 'YYYY-MM-DD'.

import { LANG_META, type Lang } from '@/i18n/config';
import { isValidDate } from './date';

type Part = 'day' | 'month' | 'year';

const layouts = new Map<Lang, { order: Part[]; sep: string }>();

export function dateLayout(lang: Lang) {
  let layout = layouts.get(lang);
  if (!layout) {
    const parts = new Intl.DateTimeFormat(LANG_META[lang].intl, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(
      new Date(2000, 0, 2),
    );
    layout = {
      order: parts.filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year').map((p) => p.type as Part),
      sep: parts.find((p) => p.type === 'literal')?.value ?? '.',
    };
    layouts.set(lang, layout);
  }
  return layout;
}

/** 'YYYY-MM-DD' → текст поля. */
export function formatDateInput(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split('-');
  const { order, sep } = dateLayout(lang);
  return order.map((p) => ({ day, month, year })[p]).join(sep);
}

/**
 * Текст поля → 'YYYY-MM-DD' или null. Принимает запись языка с любым разделителем (точка, косая черта,
 * дефис, пробел), восемь цифр подряд в том же порядке и ISO-запись. Год — только четырьмя цифрами:
 * двузначный неоднозначен (90 — это 1990 или 2090?).
 */
export function parseDateInput(text: string, lang: Lang): string | null {
  const s = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return isValidDate(s) ? s : null;
  const { order } = dateLayout(lang);
  let pieces = s.split(/\s*[./\-\s]\s*/);
  if (pieces.length === 1 && /^\d{8}$/.test(s)) {
    const widths = order.map((p) => (p === 'year' ? 4 : 2));
    let at = 0;
    pieces = widths.map((w) => s.slice(at, (at += w)));
  }
  if (pieces.length !== 3) return null;
  const v: Partial<Record<Part, string>> = {};
  order.forEach((p, i) => (v[p] = pieces[i]));
  if (!/^\d{4}$/.test(v.year!) || !/^\d{1,2}$/.test(v.month!) || !/^\d{1,2}$/.test(v.day!)) return null;
  const iso = `${v.year}-${v.month!.padStart(2, '0')}-${v.day!.padStart(2, '0')}`;
  return isValidDate(iso) ? iso : null;
}
