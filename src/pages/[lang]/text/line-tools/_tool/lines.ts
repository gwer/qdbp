// Операции со списком строк. Перевод строки на выходе — \n; \r\n на входе понимается.

const split = (s: string) => s.replace(/\r\n?/g, '\n').split('\n');

export const dedupe = (s: string) => [...new Set(split(s))].join('\n');
export const dedupeIgnoreCase = (s: string, locale: string) => {
  const seen = new Set<string>();
  return split(s)
    .filter((l) => {
      const k = l.trim().toLocaleLowerCase(locale);
      return seen.has(k) ? false : (seen.add(k), true);
    })
    .join('\n');
};
export const removeEmpty = (s: string) => split(s).filter((l) => l.trim()).join('\n');
export const trimLines = (s: string) => split(s).map((l) => l.trim()).join('\n');
export const reverse = (s: string) => split(s).reverse().join('\n');

/** Сортировка по правилам языка (ё рядом с е, числа — по значению: 2 < 10). */
export function sort(s: string, locale: string, desc = false): string {
  const c = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  const sorted = split(s).sort(c.compare);
  return (desc ? sorted.reverse() : sorted).join('\n');
}
