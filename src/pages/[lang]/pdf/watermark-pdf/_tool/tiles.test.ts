import { expect, test } from 'vitest';
import { tiles } from './tiles';

test('tiles: покрывают страницу, центр — среди точек, лишнего не слишком много', () => {
  const pts = tiles(595, 842, 200, 40, 45);
  expect(pts.some(([x, y]) => Math.abs(x - 297.5) < 1e-9 && Math.abs(y - 421) < 1e-9)).toBe(true);
  // Каждая точка страницы ближе полутора шагов к какой-нибудь надписи.
  for (let x = 0; x <= 595; x += 50) for (let y = 0; y <= 842; y += 50) expect(Math.min(...pts.map(([px, py]) => Math.hypot(px - x, py - y)))).toBeLessThan(280 * 1.5);
  expect(pts.length).toBeLessThan(60);
});
