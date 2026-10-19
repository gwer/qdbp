import type { Lang } from './config';
import { makeT, type Dict } from './t';
import de from './ui/de.json';
import en from './ui/en.json';
import es from './ui/es.json';
import pt from './ui/pt.json';
import ru from './ui/ru.json';

export const UI: Record<Lang, Dict> = { en, ru, es, de, pt };

export const uiT = (lang: Lang) => makeT(lang, UI[lang]);
