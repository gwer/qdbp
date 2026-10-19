import { describe, expect, it } from 'vitest';
import { formatInput, formatNumber } from './format';

const NBSP = ' ';

describe('formatNumber', () => {
  it('группировка и десятичные по языку, пробелы нормализованы', () => {
    expect(formatNumber('ru', 1234567.5)).toBe(`1${NBSP}234${NBSP}567,5`);
    expect(formatNumber('en', 1234567.5)).toBe('1,234,567.5');
    expect(formatNumber('de', 1234567.5)).toBe('1.234.567,5');
    expect(formatNumber('pt', 1234567.5)).toBe('1.234.567,5');
    expect(formatNumber('es', 1234567.5)).toBe('1.234.567,5');
  });

  it('в выводе нет узких и тонких пробелов', () => {
    for (const lang of ['ru', 'en', 'de', 'es', 'pt'] as const) {
      expect(formatNumber(lang, 1234567.891, 'money')).not.toMatch(/[  ]/);
      expect(formatNumber(lang, 12.5, 'percent')).not.toMatch(/[  ]/);
    }
  });

  it('деньги — всегда два знака', () => {
    expect(formatNumber('en', 10, 'money')).toBe('10.00');
    expect(formatNumber('ru', 0.005, 'money')).toBe('0,01');
  });

  it('процент', () => {
    expect(formatNumber('en', 12.5, 'percent')).toBe('12.5%');
    expect(formatNumber('ru', 12.5, 'percent')).toBe(`12,5${NBSP}%`);
  });
});

describe('formatInput', () => {
  it('без группировки, с локальным разделителем', () => {
    expect(formatInput('ru', 1234567.5)).toBe('1234567,5');
    expect(formatInput('en', 1234567.5)).toBe('1234567.5');
  });
});
