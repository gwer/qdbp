import { describe, expect, it } from 'vitest';
import { pace, riegel } from './pace';

describe('pace', () => {
  it('10 км за 50:00 — 5:00 на км, 12 км/ч', () => {
    expect(pace(10, 3000)).toEqual({ pace: 300, speed: 12 });
  });

  it('прогноз Ригеля', () => {
    expect(riegel(3000, 10, 5)).toBeCloseTo(1438.896, 2);
    expect(riegel(3000, 10, 21.0975)).toBeCloseTo(6619.209, 2);
    expect(riegel(3000, 10, 42.195)).toBeCloseTo(13800.598, 2);
  });
});

describe('solve: любое из трёх', () => {
  it('время на марафон при темпе 5:00/км — 3:30:58,5', async () => {
    const { solve } = await import('./tool');
    expect(solve('time', 'marathon', 0, 0, 300, 'km').time).toBeCloseTo(12658.5, 6);
  });

  it('дистанция за час при темпе 8:00 на милю — 7,5 мили', async () => {
    const { solve } = await import('./tool');
    expect(solve('distance', 'custom', 0, 3600, 480, 'mi').distance).toBeCloseTo(7.5 * 1.609344, 9);
  });

  it('темп по своей дистанции, как раньше', async () => {
    const { solve } = await import('./tool');
    expect(solve('pace', 'custom', 10, 3000, 0, 'km')).toMatchObject({ pace: 300, speed: 12 });
  });
});
