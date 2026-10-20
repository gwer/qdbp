import { describe, expect, it } from 'vitest';
import { compressedType } from './target';

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
