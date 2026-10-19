// Языки, открытые на сайте. Файлы переводов на другие известные языки допустимы,
// но страницы для них не собираются, пока язык не добавлен сюда.
export const SITE_LANGS = ['en', 'ru', 'es', 'de', 'pt'] as const;
export type Lang = (typeof SITE_LANGS)[number];

// Язык, на котором пишется исходный контент.
export const SOURCE_LANG: Lang = 'ru';
// Язык для x-default.
export const DEFAULT_LANG: Lang = 'en';

// Все коды, которые могут встречаться в именах файлов переводов.
// Любой другой код — ошибка сборки (защита от опечаток вроде pt-br.json).
export const KNOWN_LANGS = [
  ...SITE_LANGS,
  'fr', 'it', 'pl', 'ja', 'tr', 'id', 'nl', 'ko', 'vi', 'th', 'uk',
  'cs', 'ro', 'hu', 'sv', 'da', 'no', 'fi', 'ar', 'hi', 'zh',
] as const;

export type UnitSystem = 'metric' | 'imperial';
export type ClockMode = '24' | '12';

interface LangMeta {
  name: string; // самоназвание
  hreflang: string;
  intl: string; // локаль для Intl
  units: UnitSystem;
  /** Формат времени по умолчанию; пользователь может переключить, выбор запоминается. */
  clock: ClockMode;
}

export const LANG_META: Record<Lang, LangMeta> = {
  en: { name: 'English', hreflang: 'en', intl: 'en-US', units: 'imperial', clock: '12' },
  ru: { name: 'Русский', hreflang: 'ru', intl: 'ru-RU', units: 'metric', clock: '24' },
  es: { name: 'Español', hreflang: 'es', intl: 'es-ES', units: 'metric', clock: '24' },
  de: { name: 'Deutsch', hreflang: 'de', intl: 'de-DE', units: 'metric', clock: '24' },
  pt: { name: 'Português', hreflang: 'pt', intl: 'pt-BR', units: 'metric', clock: '24' },
};

export const isSiteLang = (code: string): code is Lang =>
  (SITE_LANGS as readonly string[]).includes(code);

export const isKnownLang = (code: string): boolean =>
  (KNOWN_LANGS as readonly string[]).includes(code);
