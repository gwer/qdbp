export const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const;
export type Flag = (typeof FLAGS)[number];

/** Не больше стольких совпадений показываем: дальше страница всё равно нечитаема. */
export const MATCH_LIMIT = 1000;

export interface Group {
  /** Номер группы с 1. */
  n: number;
  name?: string;
  /** undefined — группа не участвовала в совпадении. */
  value: string | undefined;
}

export interface Match {
  index: number;
  text: string;
  groups: Group[];
}

export interface Job {
  pattern: string;
  flags: string;
  text: string;
  /** null — замена не нужна. */
  replacement: string | null;
}

export type JobResult =
  | { ok: true; matches: Match[]; truncated: boolean; replaced: string | null }
  | { ok: false; error: string };

/**
 * Имена захватывающих групп по порядку номеров (undefined — безымянная).
 * Шаблон уже скомпилирован без ошибок, поэтому достаточно отличать `(`, `(?<имя>`
 * и незахватывающие `(?:`, `(?=`, `(?!`, `(?<=`, `(?<!`, учитывая экранирование и классы `[...]`.
 */
export function groupNames(pattern: string): (string | undefined)[] {
  const names: (string | undefined)[] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\') i++;
    else if (inClass) inClass = c !== ']';
    else if (c === '[') inClass = true;
    else if (c === '(') {
      if (pattern[i + 1] !== '?') names.push(undefined);
      else if (pattern[i + 2] === '<' && pattern[i + 3] !== '=' && pattern[i + 3] !== '!') {
        const end = pattern.indexOf('>', i + 3);
        names.push(pattern.slice(i + 3, end));
      }
    }
  }
  return names;
}

/** Следующая позиция после пустого совпадения: в режиме u/v — на целый символ (суррогатную пару). */
function advance(text: string, i: number, unicode: boolean): number {
  if (!unicode || i + 1 >= text.length) return i + 1;
  const hi = text.charCodeAt(i);
  const lo = text.charCodeAt(i + 1);
  return hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff ? i + 2 : i + 1;
}

/**
 * Совпадения так, как их видит JavaScript: без g и y — только первое (как `exec`, `match`, `replace`),
 * с g — все подряд, с y — только идущие вплотную. Бросает SyntaxError на неверном шаблоне.
 */
export function findMatches(pattern: string, flags: string, text: string, limit = MATCH_LIMIT) {
  const re = new RegExp(pattern, flags);
  const names = groupNames(pattern);
  const matches: Match[] = [];
  const all = re.global;
  let truncated = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (matches.length === limit) {
      truncated = true;
      break;
    }
    matches.push({
      index: m.index,
      text: m[0],
      groups: m.slice(1).map((value, i) => ({ n: i + 1, name: names[i], value })),
    });
    if (!all) break;
    // Пустое совпадение не сдвигает lastIndex — без этого цикл бесконечный.
    if (m[0] === '') re.lastIndex = advance(text, re.lastIndex, re.unicode);
  }
  return { matches, truncated };
}

/** Вся работа для одного состояния формы; ошибки — текстом, чтобы передавать из воркера. */
export function runJob({ pattern, flags, text, replacement }: Job): JobResult {
  try {
    const { matches, truncated } = findMatches(pattern, flags, text);
    const replaced = replacement === null ? null : text.replace(new RegExp(pattern, flags), replacement);
    return { ok: true, matches, truncated, replaced };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
