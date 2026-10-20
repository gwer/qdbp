import { describe, expect, it } from 'vitest';
import { convertValue, DIMENSIONS, isValid } from './units';

const close = (a: number, b: number, digits = 9) => expect(a).toBeCloseTo(b, digits);

describe('точные определения', () => {
  it('длина', () => {
    close(convertValue('length', 1, 'in', 'mm'), 25.4);
    close(convertValue('length', 1, 'mi', 'km'), 1.609344);
    close(convertValue('length', 1, 'ft', 'in'), 12);
    close(convertValue('length', 6, 'ft', 'm'), 1.8288);
    close(convertValue('length', 1, 'nmi', 'm'), 1852);
  });

  it('масса', () => {
    close(convertValue('weight', 1, 'lb', 'kg'), 0.45359237);
    close(convertValue('weight', 1, 'lb', 'oz'), 16);
    close(convertValue('weight', 1, 'st', 'lb'), 14);
    close(convertValue('weight', 1, 'shortTon', 'lb'), 2000, 6);
    close(convertValue('weight', 1, 'longTon', 'lb'), 2240, 6);
  });

  it('объём', () => {
    close(convertValue('volume', 1, 'galUs', 'l'), 3.785411784);
    close(convertValue('volume', 1, 'galUk', 'l'), 4.54609);
    close(convertValue('volume', 1, 'galUs', 'flozUs'), 128);
    close(convertValue('volume', 1, 'galUk', 'flozUk'), 160);
    close(convertValue('volume', 1, 'cupUs', 'tbsp'), 16);
    close(convertValue('volume', 1, 'tbsp', 'tsp'), 3);
    close(convertValue('volume', 1, 'ft3', 'in3'), 1728, 6);
  });

  it('площадь', () => {
    close(convertValue('area', 1, 'acre', 'ft2'), 43560, 6);
    close(convertValue('area', 1, 'mi2', 'acre'), 640, 6);
    close(convertValue('area', 1, 'ha', 'are'), 100);
  });

  it('температура', () => {
    close(convertValue('temperature', 100, 'c', 'f'), 212);
    close(convertValue('temperature', -40, 'c', 'f'), -40);
    close(convertValue('temperature', 98.6, 'f', 'c'), 37);
    close(convertValue('temperature', 0, 'k', 'c'), -273.15);
    expect(isValid('temperature', -300, 'c')).toBe(false);
    expect(isValid('temperature', -459.67, 'f')).toBe(true);
  });

  it('скорость, давление, энергия, данные', () => {
    close(convertValue('speed', 100, 'kmh', 'mph'), 62.13711922373339);
    close(convertValue('speed', 1, 'knot', 'kmh'), 1.852);
    close(convertValue('pressure', 1, 'atm', 'mmhg'), 759.9998917256, 8); // мм рт. ст. ≠ торр: 760 торр = 1 атм
    close(convertValue('pressure', 1, 'bar', 'psi'), 14.503773773, 8);
    close(convertValue('pressure', 1, 'at', 'kpa'), 98.0665);
    close(convertValue('energy', 1, 'kwh', 'kj'), 3600);
    close(convertValue('energy', 1, 'kcal', 'kj'), 4.184);
    close(convertValue('energy', 1, 'btu', 'j'), 1055.05585262);
    close(convertValue('data', 1, 'gib', 'b'), 1073741824, 3);
    close(convertValue('data', 1, 'gb', 'gib'), 0.9313225746154785);
    close(convertValue('data', 1, 'b', 'bit'), 8);
  });

  it('расход топлива', () => {
    close(convertValue('fuel', 10, 'l100', 'kml'), 10);
    close(convertValue('fuel', 10, 'l100', 'mpgUs'), 23.521458333, 8);
    close(convertValue('fuel', 10, 'l100', 'mpgUk'), 28.248093633, 8);
    close(convertValue('fuel', 30, 'mpgUs', 'l100'), 7.840486111, 8);
    expect(isValid('fuel', 0, 'l100')).toBe(false);
  });

  it('туда и обратно для всех единиц', () => {
    for (const [dim, units] of Object.entries(DIMENSIONS)) {
      for (const u of units) close(u.fromBase(u.toBase(7.3)), 7.3, 9);
      expect(new Set(units.map((u) => u.id)).size, dim).toBe(units.length);
    }
  });
});
