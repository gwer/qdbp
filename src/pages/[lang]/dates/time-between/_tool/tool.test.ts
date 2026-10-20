import { describe, expect, it } from 'vitest';
import { between } from './tool';

describe('between', () => {
  it('в пределах дня', () => {
    expect(between(9 * 60 + 15, 18 * 60 + 40)).toEqual({ duration: 565, minutes: 565, hours: 565 / 60, overnight: false });
  });

  it('через полночь', () => {
    expect(between(22 * 60, 6 * 60 + 30)).toMatchObject({ duration: 510, overnight: true });
  });

  it('одинаковое время — 0', () => {
    expect(between(600, 600)).toMatchObject({ duration: 0, overnight: false });
  });
});

describe('перерыв', () => {
  it('9:00–18:00 с обедом 1:00 — 8 часов', () => {
    expect(between(540, 1080, 60)).toMatchObject({ minutes: 480, hours: 8 });
  });

  it('перерыв длиннее интервала — ошибка', () => {
    expect(() => between(540, 600, 90)).toThrow('pauseTooLong');
  });
});
