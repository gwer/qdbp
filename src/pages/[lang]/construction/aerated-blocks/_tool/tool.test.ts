import { describe, expect, it } from 'vitest';
import { blocks } from './tool';

describe('aerated blocks', () => {
  it('стена 6 × 2,7 − 2 м², блок 600 × 250 × 300, +5 %', () => {
    const r = blocks({ glueRate: 20, glueBag: 25,  length: 6, height: 2.7, openings: 2, blockLength: 600, blockHeight: 250, blockThickness: 300, reserve: 5 });
    expect(r.area).toBeCloseTo(14.2, 10);
    expect(r.blocks).toBe(100);
    expect(r.volume).toBeCloseTo(4.5, 10);
  });

  it('ровно целое число блоков — без лишнего', () => {
    expect(blocks({ glueRate: 20, glueBag: 25,  length: 3, height: 1, openings: 0, blockLength: 600, blockHeight: 250, blockThickness: 200, reserve: 0 }).blocks).toBe(20);
  });
});

describe('клей', () => {
  it('стена 6 × 2,7 − 2 м² в 300 мм: 4,26 м³ кладки × 20 кг = 85,2 кг, 4 мешка по 25 кг', () => {
    const r = blocks({ length: 6, height: 2.7, openings: 2, blockLength: 600, blockHeight: 250, blockThickness: 300, reserve: 5, glueRate: 20, glueBag: 25 });
    expect(r.glue).toBeCloseTo(85.2, 9);
    expect(r.glueBags).toBe(4);
  });
});
