// Преобразования регистра. Регистр букв — с учётом языка (toLocaleUpperCase), чтобы, например,
// турецкая i работала правильно, когда язык появится.

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const words = (s: string) => s.match(WORD) ?? [];
const cap = (w: string, locale: string) => w.charAt(0).toLocaleUpperCase(locale) + w.slice(1).toLocaleLowerCase(locale);

export const upper = (s: string, locale: string) => s.toLocaleUpperCase(locale);
export const lower = (s: string, locale: string) => s.toLocaleLowerCase(locale);

/** Каждое слово с заглавной буквы; остальной текст (пробелы, знаки) не трогаем. */
export const title = (s: string, locale: string) => s.replace(WORD, (w) => cap(w, locale));

/** Как в предложении: заглавная в начале текста и после . ! ? …, остальное строчными. */
export function sentence(s: string, locale: string): string {
  return s
    .toLocaleLowerCase(locale)
    .replace(/(^\s*|[.!?…]\s+)(\p{L})/gu, (_, before: string, letter: string) => before + letter.toLocaleUpperCase(locale));
}

export const camel = (s: string, locale: string) =>
  words(s)
    .map((w, i) => (i === 0 ? w.toLocaleLowerCase(locale) : cap(w, locale)))
    .join('');
export const pascal = (s: string, locale: string) => words(s).map((w) => cap(w, locale)).join('');
export const snake = (s: string, locale: string) => words(s).map((w) => w.toLocaleLowerCase(locale)).join('_');
export const kebab = (s: string, locale: string) => words(s).map((w) => w.toLocaleLowerCase(locale)).join('-');
