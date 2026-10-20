import { describe, expect, it } from 'vitest';
import { shift } from './tool';

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
