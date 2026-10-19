import { describe, expect, it } from 'vitest';
import { clockValue, formatTyped, parseClock, parseTyped, splitSuffix } from './clock';

describe('каноничная запись', () => {
  it('parseClock', () => {
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('22:30')).toBe(1350);
    for (const bad of ['24:00', '9:30', '12:60', '', '10:30 PM']) expect(parseClock(bad)).toBeNull();
  });

  it('clockValue заворачивает через сутки', () => {
    expect(clockValue(1440 + 90)).toBe('01:30');
    expect(clockValue(-30)).toBe('23:30');
  });
});

describe('ввод в режиме 24 ч', () => {
  it.each([
    ['22:30', 1350],
    ['9:05', 545],
    ['9.30', 570],
    ['9,30', 570],
    ['9', 540],
    ['0:00', 0],
    [' 23:59 ', 1439],
  ])('«%s» → %d', (raw, expected) => {
    expect(parseTyped(raw, '24')).toBe(expected);
  });

  it.each(['24:00', '12:60', '10:30 PM', 'abc', '', '123'])('«%s» — ошибка', (raw) => {
    expect(parseTyped(raw, '24')).toBeNull();
  });
});

describe('ввод в режиме 12 ч', () => {
  it.each([
    ['10:30 PM', 1350],
    ['12:00 AM', 0],
    ['12:15 PM', 735],
    ['1:00 AM', 60],
    ['9 pm', 1260],
    ['9.30 AM', 570],
  ])('«%s» → %d', (raw, expected) => {
    expect(parseTyped(raw, '12')).toBe(expected);
  });

  it.each(['13:00 PM', '0:30 AM', '10:30'])('«%s» — ошибка', (raw) => {
    expect(parseTyped(raw, '12')).toBeNull();
  });
});

describe('formatTyped и splitSuffix', () => {
  it('туда и обратно', () => {
    for (const m of [0, 59, 60, 719, 720, 735, 1350, 1439]) {
      expect(parseTyped(formatTyped(m, '24'), '24')).toBe(m);
      expect(parseTyped(formatTyped(m, '12'), '12')).toBe(m);
    }
    expect(formatTyped(0, '12')).toBe('12:00 AM');
    expect(formatTyped(1350, '24')).toBe('22:30');
  });

  it('splitSuffix', () => {
    expect(splitSuffix('10:30 PM')).toEqual({ text: '10:30', suffix: 'PM' });
    expect(splitSuffix('10:3')).toEqual({ text: '10:3', suffix: 'AM' });
  });
});
