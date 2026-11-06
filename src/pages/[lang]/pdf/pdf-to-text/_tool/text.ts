/** Фрагмент текста pdf.js: строка и признак конца строки. */
export interface Piece {
  str: string;
  hasEOL: boolean;
}

/**
 * Текст страницы из фрагментов pdf.js: конец строки — перенос, пробелы в конце строк убираются,
 * больше двух пустых строк подряд не бывает.
 */
export function pageText(items: Piece[]): string {
  let s = '';
  for (const it of items) s += it.str + (it.hasEOL ? '\n' : '');
  return s
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
