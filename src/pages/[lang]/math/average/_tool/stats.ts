import type { Lang } from '@/i18n/config';
import { parseNumber } from '@/lib/parse';

/**
 * Разбирает список чисел из произвольного текста.
 * Разделители: пробелы, переносы строк, точка с запятой. Запятая:
 * - в en — разделитель тысяч («1,234») или списка («1,2,3», «1, 2, 3»);
 * - в остальных языках — десятичный разделитель («1,5»), а если запятых в токене
 *   несколько («1,2,3») или запятая в конце («1, 2, 3») — разделитель списка.
 */
export function parseList(text: string, lang: Lang): { numbers: number[]; invalid: string[] } {
  const numbers: number[] = [];
  const invalid: string[] = [];
  const commaIsDecimal = lang !== 'en';
  for (let token of text.split(/[\s;]+/)) {
    token = token.replace(/,+$/, '');
    if (!token) continue;
    let pieces = [token];
    if (token.includes(',')) {
      const commas = token.split(',').length - 1;
      if (commaIsDecimal ? commas > 1 : !/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(token)) pieces = token.split(',');
    }
    for (const piece of pieces) {
      if (!piece) continue;
      const n = parseNumber(piece, lang);
      if (n === null) invalid.push(piece);
      else numbers.push(n);
    }
  }
  return { numbers, invalid };
}

export interface Stats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  /** Самые частые значения; пусто, если все значения встречаются по одному разу. */
  mode: number[];
  min: number;
  max: number;
  range: number;
  /** Выборочное стандартное отклонение (делитель n − 1); null при одном значении. */
  sd: number | null;
  /** Генеральное (делитель n). */
  sdPop: number;
  /** Выборочная дисперсия. */
  variance: number | null;
}

export function stats(numbers: number[]): Stats | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;
  // Сумма с компенсацией Кэхэна: меньше ошибок округления на длинных списках дробных чисел.
  let sum = 0;
  let c = 0;
  for (const x of sorted) {
    const y = x - c;
    const t = sum + y;
    c = t - sum - y;
    sum = t;
  }
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const freq = new Map<number, number>();
  for (const x of sorted) freq.set(x, (freq.get(x) ?? 0) + 1);
  let top = 0; // не Math.max(...): на сотнях тысяч значений спред переполняет стек
  for (const f of freq.values()) if (f > top) top = f;
  const mode = top > 1 ? [...freq].filter(([, f]) => f === top).map(([x]) => x) : [];
  const mean = sum / n;
  // Сумма квадратов отклонений — от среднего, а не через Σx² − n·mean²: так нет потери точности на больших числах.
  let ss = 0;
  for (const x of sorted) ss += (x - mean) ** 2;
  const variance = n > 1 ? ss / (n - 1) : null;
  return {
    count: n,
    sum,
    mean,
    median,
    mode,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    sd: variance === null ? null : Math.sqrt(variance),
    sdPop: Math.sqrt(ss / n),
    variance,
  };
}
