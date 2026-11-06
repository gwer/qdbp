// Из одного проекта собираются два сайта (docs/03-tech.md, 10.1): калькуляторы и утилиты.
// Какой собирать — переменная окружения SITE при сборке (по умолчанию calc). Только для кода сборки, не для островов.
import SITES from './sites.json';

export type SiteId = keyof typeof SITES;

const id = process.env.SITE ?? 'calc';
if (!(id in SITES)) throw new Error(`SITE=${id}: ожидается ${Object.keys(SITES).join(' или ')}`);

export const SITE = id as SiteId;
export const SITE_NAME = SITES[SITE].name;
export { SITES };
