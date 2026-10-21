import { describe, expect, it } from 'vitest';
import { compressedType, fitToSize } from './target';

describe('compressedType', () => {
  it('авто', () => {
    expect(compressedType('image/jpeg', 'auto')).toBe('image/jpeg');
    expect(compressedType('image/webp', 'auto')).toBe('image/webp');
    expect(compressedType('image/png', 'auto')).toBe('image/webp');
    expect(compressedType('image/gif', 'auto')).toBe('image/webp');
  });

  it('явный выбор', () => {
    expect(compressedType('image/png', 'image/jpeg')).toBe('image/jpeg');
  });
});

describe('fitToSize', () => {
  // Модель кодека: размер растёт с качеством линейно.
  const enc = async (q: number) => new Blob([new Uint8Array(Math.round(1000 + q * 100_000))]);

  it('самое высокое качество, при котором файл помещается в лимит', async () => {
    const { blob: b, fits } = await fitToSize(enc, 50_000);
    expect(fits).toBe(true);
    expect(b.size).toBeLessThanOrEqual(50_000);
    expect(b.size).toBeGreaterThan(48_000);
  });

  it('не помещается даже минимальное — результат с минимальным качеством', async () => {
    const r = await fitToSize(enc, 1000);
    expect(r.blob.size).toBe(6000);
    expect(r.fits).toBe(false);
  });
});
