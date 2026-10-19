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
