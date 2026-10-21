import { describe, expect, it } from 'vitest';
import { addWorkdays, shift } from './tool';

describe('shift', () => {
  it('дни и недели', () => {
    expect(shift('2026-10-19', 30, 'days')).toEqual({ result: '2026-11-18', days: 30 });
    expect(shift('2026-10-19', -2, 'weeks')).toEqual({ result: '2026-10-05', days: -14 });
  });

  it('месяцы с прижатием к концу месяца', () => {
    expect(shift('2026-01-31', 1, 'months')).toEqual({ result: '2026-02-28', days: 28 });
    expect(shift('2026-10-19', 3, 'months').result).toBe('2027-01-19');
  });

  it('годы, 29 февраля', () => {
    expect(shift('2024-02-29', 1, 'years').result).toBe('2025-02-28');
    expect(shift('2024-02-29', 4, 'years').result).toBe('2028-02-29');
  });
});

describe('рабочие дни', () => {
  it('пн 19.10.2026 + 10 рабочих = пн 02.11; пт + 1 = пн; сб + 1 = пн', () => {
    expect(shift('2026-10-19', 10, 'workdays').result).toBe('2026-11-02');
    expect(shift('2026-10-23', 1, 'workdays').result).toBe('2026-10-26');
    expect(shift('2026-10-24', 1, 'workdays').result).toBe('2026-10-26');
  });

  it('вычитание: пн − 1 рабочий = пт', () => {
    expect(shift('2026-10-26', -1, 'workdays').result).toBe('2026-10-23');
  });
});

describe('рабочие дни: сверка с пошаговым счётом', () => {
  // Независимая модель: шагаем по дню и считаем только пн–пт.
  const stepwise = (date: string, n: number) => {
    let d = new Date(`${date}T00:00:00Z`);
    for (let left = Math.abs(n); left > 0; ) {
      d = new Date(d.getTime() + Math.sign(n) * 86400000);
      if (d.getUTCDay() % 6 !== 0) left--;
    }
    return d.toISOString().slice(0, 10);
  };

  it('сб 17.10.2026 ± 5: пт 23.10 и пн 12.10', () => {
    expect(addWorkdays('2026-10-17', 5)).toBe('2026-10-23');
    expect(addWorkdays('2026-10-17', -5)).toBe('2026-10-12');
  });

  it('старт в каждый день недели, смещения −25…25', () => {
    for (let day = 12; day <= 18; day++) {
      const start = `2026-10-${day}`;
      for (let n = -25; n <= 25; n++) expect(addWorkdays(start, n), `${start} ${n}`).toBe(n === 0 ? start : stepwise(start, n));
    }
  });
});
