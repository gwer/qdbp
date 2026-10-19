import { describe, expect, it } from 'vitest';
import { formatDuration, formatDurationSeconds, parseDuration, parseDurationSeconds } from './duration';

describe('parseDuration', () => {
  it.each([
    ['1:30', 90],
    ['0:05', 5],
    ['12:00', 720],
    ['2', 120],
    ['1,5', 90],
    ['1.25', 75],
    [' 3:15 ', 195],
  ])('«%s» → %d мин', (input, expected) => {
    expect(parseDuration(input, 'ru')).toBe(expected);
  });

  it.each(['', '1:60', '1:5', 'a:30', '-1', '1:30:00', '::'])('«%s» — не длительность', (input) => {
    expect(parseDuration(input, 'ru')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('ч:мм и знак', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(1500)).toBe('25:00');
    expect(formatDuration(-75)).toBe('−1:15');
  });
});

describe('длительности с секундами', () => {
  it.each([
    ['1:45:30', 6330],
    ['45:30', 2730],
    ['5:09', 309],
    ['50', 3000],
    ['3:59:59', 14399],
  ])('«%s» → %d с', (input, expected) => {
    expect(parseDurationSeconds(input, 'ru')).toBe(expected);
  });

  it.each(['1:60', '1:5', '1:00:60', 'abc', '-3'])('«%s» — ошибка', (input) => {
    expect(parseDurationSeconds(input, 'ru')).toBeNull();
  });

  it('формат', () => {
    expect(formatDurationSeconds(309)).toBe('5:09');
    expect(formatDurationSeconds(6330)).toBe('1:45:30');
    expect(formatDurationSeconds(59.6)).toBe('1:00');
  });
});
