import { describe, expect, it } from 'vitest';
import { fromTimestamp } from './tool';

describe('fromTimestamp', () => {
  it('секунды и миллисекунды', () => {
    expect(fromTimestamp(1767225600, 's').iso).toBe('2026-01-01T00:00:00.000Z');
    expect(fromTimestamp(1767225600123, 'ms').iso).toBe('2026-01-01T00:00:00.123Z');
    expect(fromTimestamp(0, 's').iso).toBe('1970-01-01T00:00:00.000Z');
    expect(fromTimestamp(-86400, 's').iso).toBe('1969-12-31T00:00:00.000Z');
  });

  it('вне диапазона Date — ошибка', () => {
    expect(() => fromTimestamp(1e16, 's')).toThrow();
  });
});

describe('toTimestamp', () => {
  it('1 января 2026, 00:00 UTC — 1767225600', async () => {
    const { toTimestamp } = await import('./tool');
    expect(toTimestamp('2026-01-01', 0, 'utc')).toMatchObject({ seconds: '1767225600', ms: '1767225600000', iso: '2026-01-01T00:00:00.000Z' });
    expect(toTimestamp('1970-01-01', 90, 'utc').seconds).toBe('5400');
  });
});
