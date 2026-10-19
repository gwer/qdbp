import { LANG_META, type Lang } from './config';

export type Dict = { [key: string]: string | Dict };
export type Params = Record<string, string | number>;
export type T = (key: string, params?: Params) => string;

const PLURAL_FORMS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const pluralRules = new Map<string, Intl.PluralRules>();

function lookup(dicts: Dict[], key: string): string | Dict | undefined {
  for (const dict of dicts) {
    let node: string | Dict | undefined = dict;
    for (const part of key.split('.')) {
      node = typeof node === 'object' ? node[part] : undefined;
    }
    if (node !== undefined) return node;
  }
  return undefined;
}

/** Объект форм множественного числа: { one, few, many, other }. Набор форм зависит от языка. */
export const isPlural = (node: Dict) => 'other' in node && Object.keys(node).every((k) => PLURAL_FORMS.has(k));

/**
 * Создаёт функцию перевода. Словари просматриваются по порядку.
 * Плюрализация: значение-объект с ключами one/few/many/other + параметр count.
 * Отсутствующий ключ — исключение: на сборке это сразу видно.
 */
export function makeT(lang: Lang, ...dicts: Dict[]): T {
  const locale = LANG_META[lang].intl;
  return (key, params = {}) => {
    let node = lookup(dicts, key);
    if (node && typeof node === 'object' && isPlural(node) && typeof params.count === 'number') {
      let rules = pluralRules.get(locale);
      if (!rules) pluralRules.set(locale, (rules = new Intl.PluralRules(locale)));
      node = node[rules.select(params.count)] ?? node.other;
    }
    if (typeof node !== 'string') throw new Error(`i18n: no string for "${key}" (${lang})`);
    return node.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
  };
}
