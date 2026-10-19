import { describe, expect, it } from 'vitest';
import { parseInBase, toBase } from './base';

describe('parseInBase', () => {
  it.each([
    ['255', 10, 255n],
    ['ff', 16, 255n],
    ['FF', 16, 255n],
    ['0xFF', 16, 255n],
    ['11111111', 2, 255n],
    ['0b1111_1111', 2, 255n],
    ['377', 8, 255n],
    ['zz', 36, 1295n],
    ['-1010', 2, -10n],
    ['1 000 000', 10, 1000000n],
  ] as const)('«%s» (%d) → %s', (input, base, expected) => {
    expect(parseInBase(input, base)).toBe(expected);
  });

  it('большие числа без потери точности', () => {
    // Python: int('ffffffffffffffffffff', 16) == 1208925819614629174706175
    expect(parseInBase('ffffffffffffffffffff', 16)).toBe(1208925819614629174706175n);
  });

  it.each([
    ['2', 2],
    ['9', 8],
    ['g', 16],
    ['', 10],
    ['1.5', 10],
    ['0x', 16],
  ] as const)('«%s» в системе %d — ошибка', (input, base) => {
    expect(parseInBase(input, base)).toBeNull();
  });

  it('недопустимое основание', () => {
    expect(parseInBase('10', 1)).toBeNull();
    expect(parseInBase('10', 37)).toBeNull();
  });
});

describe('toBase', () => {
  it('эталоны (Python: bin/oct/hex, numpy.base_repr)', () => {
    expect(toBase(255n, 2)).toBe('11111111');
    expect(toBase(255n, 8)).toBe('377');
    expect(toBase(255n, 16)).toBe('FF');
    expect(toBase(1295n, 36)).toBe('ZZ');
    expect(toBase(-10n, 2)).toBe('-1010');
    expect(toBase(2026n, 16)).toBe('7EA');
  });
});
