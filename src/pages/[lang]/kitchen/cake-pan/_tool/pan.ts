export type Shape = 'round' | 'square' | 'rect';

/** Площадь дна формы. a — диаметр (круглая) или сторона/длина; b — ширина прямоугольной. */
export function panArea(shape: Shape, a: number, b: number): number {
  if (shape === 'round') return (Math.PI * a * a) / 4;
  if (shape === 'square') return a * a;
  return a * b;
}

/** Во сколько раз изменить количество ингредиентов при той же высоте теста. */
export function panFactor(from: { shape: Shape; a: number; b: number }, to: { shape: Shape; a: number; b: number }) {
  const s1 = panArea(from.shape, from.a, from.b);
  const s2 = panArea(to.shape, to.a, to.b);
  if (!(s1 > 0) || !(s2 > 0)) throw new RangeError('empty pan');
  return s2 / s1;
}
