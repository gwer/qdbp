import { LANG_META, type Lang } from '@/i18n/config';

/** Размер файла в привычной записи: «850 kB», «2,4 MB». Десятичные единицы (1 kB = 1000 байт), как в macOS и браузерах. */
export function formatBytes(lang: Lang, bytes: number): string {
  const [unit, value] =
    bytes >= 1e6 ? (['megabyte', bytes / 1e6] as const) : bytes >= 1e3 ? (['kilobyte', bytes / 1e3] as const) : (['byte', bytes] as const);
  return new Intl.NumberFormat(LANG_META[lang].intl, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: unit === 'byte' ? 0 : 1,
  })
    .format(value)
    .replace(/[  ]/g, ' ');
}

/** Изменение размера в процентах: −35 — файл стал меньше на 35 %. */
export const sizeChange = (before: number, after: number) => (before ? ((after - before) / before) * 100 : 0);
