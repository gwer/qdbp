import { describe, expect, it } from 'vitest';
import { def } from './tool';

describe('старые ссылки', () => {
  it('ingredient=flourScooped → плотная мука', () => {
    expect(def.legacy?.(new URLSearchParams('ingredient=flourScooped'))).toEqual({ packing: 'scooped' });
    expect(def.legacy?.(new URLSearchParams('ingredient=flour'))).toEqual({});
  });
});
