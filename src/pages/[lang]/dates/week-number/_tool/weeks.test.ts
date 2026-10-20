import { describe, expect, it } from 'vitest';
import { weeksOfYear } from './Weeks';

describe('weeksOfYear', () => {
  it('ISO: в 2026 году 53 недели, первая — 29.12.2025–04.01.2026', () => {
    const w = weeksOfYear(2026, 'iso');
    expect(w).toHaveLength(53);
    expect(w[0]).toEqual({ week: 1, start: '2025-12-29', end: '2026-01-04' });
    expect(w.at(-1)).toEqual({ week: 53, start: '2026-12-28', end: '2027-01-03' });
  });

  it('ISO: в 2025 году 52 недели', () => {
    expect(weeksOfYear(2025, 'iso')).toHaveLength(52);
  });

  it('США: неделя 1 содержит 1 января и начинается в воскресенье', () => {
    const w = weeksOfYear(2026, 'us');
    expect(w[0]).toMatchObject({ week: 1, start: '2025-12-28', end: '2026-01-03' });
  });
});
