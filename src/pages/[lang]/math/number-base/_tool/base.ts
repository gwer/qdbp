const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const PREFIX: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' };

export const isBase = (b: number) => Number.isInteger(b) && b >= 2 && b <= 36;

/**
 * Целое число в системе с основанием base (2–36) → BigInt. Регистр не важен,
 * пробелы и «_» между цифрами игнорируются, допускается знак и префикс 0b/0o/0x своего основания.
 * Возвращает null, если есть недопустимая цифра.
 */
export function parseInBase(input: string, base: number): bigint | null {
  if (!isBase(base)) return null;
  let s = input.trim().toLowerCase().replace(/[\s_]/g, '');
  let negative = false;
  if (s.startsWith('-') || s.startsWith('−')) {
    negative = true;
    s = s.slice(1);
  } else if (s.startsWith('+')) s = s.slice(1);
  if (PREFIX[base] && s.startsWith(PREFIX[base])) s = s.slice(2);
  if (!s) return null;
  const b = BigInt(base);
  let value = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    value = value * b + BigInt(d);
  }
  return negative ? -value : value;
}

/** BigInt → запись в системе base; шестнадцатеричные и выше — заглавными буквами. */
export function toBase(value: bigint, base: number): string {
  const s = value.toString(base);
  return base > 10 ? s.toUpperCase() : s;
}
