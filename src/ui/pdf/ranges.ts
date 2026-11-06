/** Диапазон страниц, номера с 1, включительно. from > to — страницы в обратном порядке. */
export type Range = [from: number, to: number];

export type RangesResult = { ok: true; ranges: Range[] } | { ok: false; error: 'empty' | 'syntax' | 'outOfRange'; token?: string };

/**
 * Разбирает запись вида «1-3, 5, 8-» при total страницах.
 * Части разделяются запятыми или точками с запятой. «8-» — с 8-й до последней, «-3» — с первой по 3-ю.
 * Тире любое: -, –, —, −.
 */
export function parseRanges(text: string, total: number): RangesResult {
  const tokens = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!tokens.length) return { ok: false, error: 'empty' };
  const ranges: Range[] = [];
  for (const token of tokens) {
    const m = token.match(/^(\d+)?\s*(?:([-–—−])\s*(\d+)?)?$/);
    if (!m || (!m[1] && !m[3])) return { ok: false, error: 'syntax', token };
    const from = m[1] ? Number(m[1]) : 1;
    const to = m[2] ? (m[3] ? Number(m[3]) : total) : from;
    if (from < 1 || to < 1 || from > total || to > total) return { ok: false, error: 'outOfRange', token };
    ranges.push([from, to]);
  }
  return { ok: true, ranges };
}

/** Номера страниц диапазона по порядку (с 1). */
export function expand([from, to]: Range): number[] {
  const step = from <= to ? 1 : -1;
  const out: number[] = [];
  for (let p = from; p !== to + step; p += step) out.push(p);
  return out;
}

/** Номера страниц в каноничной записи: [1,2,3,5,7,8] → «1-3, 5, 7-8». */
export function formatPages(pages: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < pages.length; ) {
    let j = i;
    while (j + 1 < pages.length && pages[j + 1] === pages[j] + 1) j++;
    parts.push(j > i ? `${pages[i]}-${pages[j]}` : String(pages[i]));
    i = j + 1;
  }
  return parts.join(', ');
}
