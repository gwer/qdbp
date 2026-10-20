// Пересчёт строк рецепта: в начале строки ищется количество — целое, десятичное («1,5», «0.75»),
// дробь («1/2»), смешанное число («1 1/2», «1½»), символ дроби («½») или диапазон («2–3»).
// Всё остальное в строке (единица, продукт) остаётся как есть.

const UNICODE: Record<string, number> = { '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };
const NUM = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:[.,]\d+)?)`;
const LINE = new RegExp(String.raw`^(\s*(?:[-•*]\s*)?)(${NUM})(?:\s*[-–]\s*(${NUM}))?(?=\s|[^\d\/.,]|$)(.*)$`);

export function parseQuantity(s: string): number {
  const t = s.trim();
  let m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = /^(\d+)\/(\d+)$/.exec(t);
  if (m) return Number(m[1]) / Number(m[2]);
  m = /^(\d*)\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/.exec(t);
  if (m) return (m[1] ? Number(m[1]) : 0) + UNICODE[m[2]];
  return Number(t.replace(',', '.'));
}

export interface Line {
  prefix: string;
  qty: number | null;
  qty2: number | null;
  rest: string;
}

export function parseLine(line: string): Line {
  const m = LINE.exec(line);
  if (!m) return { prefix: '', qty: null, qty2: null, rest: line };
  const qty = parseQuantity(m[2]);
  const qty2 = m[3] ? parseQuantity(m[3]) : null;
  if (!(qty > 0) || (m[2].includes('/') && !Number.isFinite(qty))) return { prefix: '', qty: null, qty2: null, rest: line };
  return { prefix: m[1], qty, qty2, rest: m[4] };
}

const FRACTIONS: [number, string][] = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

/**
 * Количество для показа. useFractions — для американских рецептов: 1.5 → «1 ½», если дробная часть
 * близка (±0,03) к привычной кухонной дроби. Иначе — десятичная запись языка, до двух знаков.
 */
export function formatQuantity(n: number, format: (n: number) => string, useFractions: boolean): string {
  if (useFractions) {
    const whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    if (frac < 0.03) return String(whole);
    if (frac > 0.97) return String(whole + 1);
    const hit = FRACTIONS.find(([v]) => Math.abs(v - frac) <= 0.03);
    if (hit) return whole ? `${whole} ${hit[1]}` : hit[1];
  }
  return format(Math.round(n * 100) / 100);
}

export function scaleLine(line: string, factor: number, format: (n: number) => string, useFractions: boolean): string {
  const p = parseLine(line);
  if (p.qty === null) return line;
  const a = formatQuantity(p.qty * factor, format, useFractions);
  const b = p.qty2 === null ? '' : `–${formatQuantity(p.qty2 * factor, format, useFractions)}`;
  return `${p.prefix}${a}${b}${p.rest}`;
}
