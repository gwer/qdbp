import { describe, expect, it } from 'vitest';
import { formatClock, formatDateTime, formatInput, formatNumber } from './format';

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

  it('округлённый до нуля минус не показывается', () => {
    expect(formatNumber('en', -1e-9)).toBe('0');
    expect(formatNumber('ru', -0.001, 'money')).toBe('0,00');
    expect(formatNumber('de', -0.0001, 'percent')).toBe(`0${NBSP}%`);
    expect(formatNumber('en', -0.5)).toBe('-0.5');
  });
});

describe('formatInput', () => {
  it('без группировки, с локальным разделителем', () => {
    expect(formatInput('ru', 1234567.5)).toBe('1234567,5');
    expect(formatInput('en', 1234567.5)).toBe('1234567.5');
  });
});

describe('formatClock', () => {
  it('формат по языку по умолчанию', () => {
    expect(formatClock('ru', 90)).toBe('01:30');
    expect(formatClock('de', 1350)).toBe('22:30');
    expect(formatClock('en', 90)).toBe(`1:30${NBSP}AM`);
    expect(formatClock('en', 1350)).toBe(`10:30${NBSP}PM`);
  });

  it('формат можно выбрать независимо от языка', () => {
    expect(formatClock('en', 1350, '24')).toBe('22:30');
    expect(formatClock('ru', 1350, '12')).toMatch(/^10:30\u00A0(PM|ПП)$/);
    expect(formatClock('de', 0, '12')).toMatch(/^12:00\u00A0/);
  });
});

describe('formatDateTime', () => {
  it('формат часов', () => {
    expect(formatDateTime('en', 0, 'UTC', '24')).toContain('00:00:00');
    expect(formatDateTime('en', 0, 'UTC', '12')).toMatch(/12:00:00\u00A0AM/);
  });
});
