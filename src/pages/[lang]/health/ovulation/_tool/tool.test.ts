import { describe, expect, it } from 'vitest';
import { ovulation } from './tool';

describe('ovulation', () => {
  it('цикл 28 дней', () => {
    expect(ovulation('2026-03-01', 28)).toEqual({
      ovulation: '2026-03-15',
      fertileStart: '2026-03-10',
      fertileEnd: '2026-03-16',
      nextPeriod: '2026-03-29',
      due: '2026-12-06',
    });
  });

  it('цикл 32 дня сдвигает всё на 4 дня', () => {
    const r = ovulation('2026-03-01', 32);
    expect(r.ovulation).toBe('2026-03-19');
    expect(r.due).toBe('2026-12-10');
  });
});
