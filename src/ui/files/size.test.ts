import { describe, expect, it } from 'vitest';
import { coverCrop, targetSize } from './size';

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

describe('coverCrop', () => {
  it('4000×3000 в квадрат 1080 — центральный квадрат 3000×3000', () => {
    expect(coverCrop(4000, 3000, 1080, 1080)).toEqual({ crop: { x: 500, y: 0, width: 3000, height: 3000 }, size: { width: 1080, height: 1080 } });
  });

  it('портрет 1000×2000 в 16:9 1920×1080 — полоса по центру', () => {
    const r = coverCrop(1000, 2000, 1920, 1080);
    expect(r.crop).toEqual({ x: 0, y: 718, width: 1000, height: 563 }); // (2000 − 563) / 2 = 718,5 → 718
  });

  it('маленький исходник без увеличения — размер области обрезки', () => {
    expect(coverCrop(800, 600, 1080, 1080, true).size).toEqual({ width: 600, height: 600 });
  });
});
