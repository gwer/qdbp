import { describe, expect, it } from 'vitest';
import { formatQuantity, parseLine, scaleLine } from './scale';

const ru = (n: number) => String(n).replace('.', ',');
const en = (n: number) => String(n);

describe('parseLine', () => {
  it.each([
    ['200 г муки', 200, ' г муки'],
    ['1,5 ст. л. сахара', 1.5, ' ст. л. сахара'],
    ['2 eggs', 2, ' eggs'],
    ['1/2 cup milk', 0.5, ' cup milk'],
    ['1 1/2 cups flour', 1.5, ' cups flour'],
    ['1½ tsp salt', 1.5, ' tsp salt'],
    ['½ стакана молока', 0.5, ' стакана молока'],
    ['- 3 яйца', 3, ' яйца'],
    ['0.75 l Wasser', 0.75, ' l Wasser'],
    ['250g Mehl', 250, 'g Mehl'],
  ])('«%s»', (line, qty, rest) => {
    const p = parseLine(line);
    expect(p.qty).toBeCloseTo(qty, 9);
    expect(p.rest).toBe(rest);
  });

  it('диапазон', () => {
    expect(parseLine('2–3 зубчика чеснока')).toMatchObject({ qty: 2, qty2: 3, rest: ' зубчика чеснока' });
  });

  it('строки без количества не трогаются', () => {
    expect(parseLine('Соль по вкусу').qty).toBeNull();
    expect(parseLine('Mehl zum Bestäuben').qty).toBeNull();
    expect(parseLine('').qty).toBeNull();
  });
});

describe('scaleLine', () => {
  it('×1,5 по-русски', () => {
    expect(scaleLine('200 г муки', 1.5, ru, false)).toBe('300 г муки');
    expect(scaleLine('1,5 ст. л. сахара', 1.5, ru, false)).toBe('2,25 ст. л. сахара');
    expect(scaleLine('3 яйца', 0.5, ru, false)).toBe('1,5 яйца');
    expect(scaleLine('2–3 зубчика', 2, ru, false)).toBe('4–6 зубчика');
    expect(scaleLine('Соль по вкусу', 2, ru, false)).toBe('Соль по вкусу');
  });

  it('дроби для американских рецептов', () => {
    expect(scaleLine('3/4 cup sugar', 2, en, true)).toBe('1 ½ cup sugar');
    expect(scaleLine('1 cup flour', 1 / 3, en, true)).toBe('⅓ cup flour');
    expect(formatQuantity(1.27, en, true)).toBe('1 ¼');
    expect(formatQuantity(1.4, en, true)).toBe('1.4');
  });
});

describe('количество после названия', () => {
  const f = (n: number) => String(n).replace('.', ',');
  it.each([
    ['Мука — 500 г', 'Мука — 1000 г'],
    ['Соль: 1 ч. л.', 'Соль: 2 ч. л.'],
    ['Яйца – 2–3 шт.', 'Яйца – 4–6 шт.'],
    ['Сахар\t150 г', 'Сахар\t300 г'],
    ['Harina - 1/2 taza', 'Harina - 1 taza'],
    ['Соль по вкусу', 'Соль по вкусу'],
    ['Тесто: замесить', 'Тесто: замесить'],
  ])('%s → %s', (line, out) => {
    expect(scaleLine(line, 2, f, false)).toBe(out);
  });

  it('количество в начале — как раньше, разделитель после него не мешает', () => {
    expect(scaleLine('2 яйца — крупных', 2, f, false)).toBe('4 яйца — крупных');
  });
});
