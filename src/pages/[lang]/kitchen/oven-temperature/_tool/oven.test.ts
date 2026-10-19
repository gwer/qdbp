import { describe, expect, it } from 'vitest';
import { fToGas, gasToF, oven } from './oven';

describe('oven', () => {
  it('°C → °F и газовая отметка', () => {
    const r = oven(180, 'c');
    expect(r.f).toBeCloseTo(356, 6);
    expect(r.gas).toBe(4);
    expect(r.fanC).toBe(160);
  });

  it('°F → °C', () => {
    const r = oven(350, 'f');
    expect(r.c).toBeCloseTo(176.6667, 3);
    expect(r.gas).toBe(4);
    expect(r.fanF).toBe(325);
  });

  it('газовые отметки ¼–9', () => {
    expect(gasToF(0.25)).toBe(225);
    expect(gasToF(0.5)).toBe(250);
    expect(gasToF(1)).toBe(275);
    expect(gasToF(9)).toBe(475);
    expect(gasToF(10)).toBeNull();
    expect(oven(6, 'gas').c).toBeCloseTo(204.4444, 3);
  });

  it('вне таблицы газовых отметок — нет отметки', () => {
    expect(fToGas(100)).toBeNull();
    expect(fToGas(520)).toBeNull();
    expect(fToGas(260)).toBe(0.5);
  });
});
