import { expand, formatPages, parseRanges, type RangesResult } from '@/ui/pdf/ranges';

export type Mode = 'every' | 'ranges' | 'select';

/** Файл результата: страницы (с 1) по порядку. */
export type Group = number[];

/** Каждые n страниц — отдельный файл; последний может быть короче. */
export function everyN(total: number, n: number): Group[] {
  const groups: Group[] = [];
  for (let start = 1; start <= total; start += n) {
    groups.push(Array.from({ length: Math.min(n, total - start + 1) }, (_, i) => start + i));
  }
  return groups;
}

/** Каждая часть записи «1-3, 4-6» — отдельный файл. */
export function byRanges(text: string, total: number): { ok: true; groups: Group[] } | Exclude<RangesResult, { ok: true }> {
  const r = parseRanges(text, total);
  return r.ok ? { ok: true, groups: r.ranges.map(expand) } : r;
}

/** Имя файла части: «report_1-3.pdf», «report_5.pdf», «report_1-3, 7.pdf» → «report_1-3_7.pdf». */
export function partName(base: string, pages: Group): string {
  const sorted = pages.every((p, i) => i === 0 || p > pages[i - 1]);
  const label = sorted ? formatPages(pages).replace(/, /g, '_') : `${pages[0]}-${pages[pages.length - 1]}`;
  return `${base}_${label}.pdf`;
}
