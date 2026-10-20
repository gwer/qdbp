import { describe, expect, it } from 'vitest';
import { sleepTimes } from './tool';

const hm = (h: number, m = 0) => h * 60 + m;

describe('sleepTimes', () => {
  it('подъём в 7:00, засыпание 15 минут', () => {
    expect(sleepTimes('wake', hm(7), 15)).toEqual({ c5: hm(23, 15), c6: hm(21, 45), c4: hm(0, 45), c3: hm(2, 15) });
  });

  it('ложусь в 23:00', () => {
    expect(sleepTimes('bed', hm(23), 15)).toEqual({ c5: hm(6, 45), c6: hm(8, 15), c4: hm(5, 15), c3: hm(3, 45) });
  });
});
