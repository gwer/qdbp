import { describe, expect, it } from 'vitest';
import { targetSize } from './size';

describe('targetSize', () => {
  it('проценты', () => {
    expect(targetSize(4000, 3000, { mode: 'percent', percent: 50 })).toEqual({ width: 2000, height: 1500 });
    expect(targetSize(1001, 667, { mode: 'percent', percent: 33 })).toEqual({ width: 330, height: 220 });
  });

  it('по ширине и высоте с сохранением пропорций', () => {
    expect(targetSize(4032, 3024, { mode: 'width', width: 1280 })).toEqual({ width: 1280, height: 960 });
    expect(targetSize(3024, 4032, { mode: 'height', height: 1080 })).toEqual({ width: 810, height: 1080 });
  });

  it('вписать в рамку', () => {
    expect(targetSize(4000, 2000, { mode: 'fit', width: 1000, height: 1000 })).toEqual({ width: 1000, height: 500 });
    expect(targetSize(2000, 4000, { mode: 'fit', width: 1000, height: 1000 })).toEqual({ width: 500, height: 1000 });
  });

  it('без увеличения и минимум 1 пиксель', () => {
    expect(targetSize(800, 600, { mode: 'width', width: 1920, noUpscale: true })).toEqual({ width: 800, height: 600 });
    expect(targetSize(800, 600, { mode: 'width', width: 1920 })).toEqual({ width: 1920, height: 1440 });
    expect(targetSize(100, 1, { mode: 'percent', percent: 10 })).toEqual({ width: 10, height: 1 });
  });
});
