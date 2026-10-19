// Транслитерация русского текста латиницей.

type Table = Record<string, string>;

/** ICAO Doc 9303 — загранпаспорта РФ (приказ МИД № 2113 от 2017 года). */
const ICAO: Table = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: 'ie', ы: 'y', ь: '', э: 'e', ю: 'iu', я: 'ia',
};

/** ГОСТ 7.79-2000, система Б (ц — c перед е, и, ы, й; иначе cz). */
const GOST: Table = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'cz', ч: 'ch', ш: 'sh', щ: 'shh',
  ъ: '``', ы: "y`", ь: '`', э: "e`", ю: 'yu', я: 'ya',
};

/** Для адресов страниц: только латиница, цифры и дефисы. */
const SLUG: Table = {
  ...ICAO, ё: 'e', й: 'y', ъ: '', ь: '', ю: 'yu', я: 'ya',
};

const isUpper = (c: string | undefined) => !!c && c !== c.toLowerCase() && c === c.toUpperCase();

function convert(text: string, table: Table, special?: (lower: string, next: string | undefined) => string | undefined) {
  const chars = [...text];
  return chars
    .map((c, i) => {
      const lower = c.toLowerCase();
      const next = chars[i + 1]?.toLowerCase();
      const out = special?.(lower, next) ?? table[lower];
      if (out === undefined) return c;
      if (!isUpper(c) || !out) return out;
      // Заглавная: всё слово заглавными (ЩУКА → SHCHUKA) или только первая буква (Щука → Shchuka).
      const wordUpper = isUpper(chars[i + 1]) || (isUpper(chars[i - 1]) && !/\p{L}/u.test(chars[i + 1] ?? ''));
      return wordUpper ? out.toUpperCase() : out[0].toUpperCase() + out.slice(1);
    })
    .join('');
}

export const passport = (text: string) => convert(text, ICAO);

export const gost = (text: string) =>
  convert(text, GOST, (lower, next) => (lower === 'ц' && next !== undefined && 'еиыйeiyj'.includes(next) ? 'c' : undefined));

export function slug(text: string): string {
  return convert(text.toLowerCase(), SLUG)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
