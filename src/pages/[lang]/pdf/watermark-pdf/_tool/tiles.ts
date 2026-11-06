/**
 * Центры надписей для заполнения страницы width×height повторами. Шаг вдоль строки — ширина надписи
 * плюс два кегля, между строками — три кегля; сетка поворачивается на angle и с запасом перекрывает углы.
 */
export function tiles(width: number, height: number, textWidth: number, size: number, angle: number): [number, number][] {
  const a = (angle * Math.PI) / 180;
  const along = [Math.cos(a), Math.sin(a)];
  const across = [-Math.sin(a), Math.cos(a)];
  const step = textWidth + size * 2;
  const gap = size * 3;
  const reach = Math.hypot(width, height) / 2 + step;
  const cx = width / 2;
  const cy = height / 2;
  const out: [number, number][] = [];
  for (let j = -Math.ceil(reach / gap); j <= Math.ceil(reach / gap); j++) {
    // Соседние строки сдвинуты на полшага — получается «кирпичная кладка».
    const shift = (j & 1) * step * 0.5;
    for (let i = -Math.ceil(reach / step) - 1; i <= Math.ceil(reach / step) + 1; i++) {
      const u = i * step + shift;
      const v = j * gap;
      const x = cx + along[0] * u + across[0] * v;
      const y = cy + along[1] * u + across[1] * v;
      // Надпись хоть краем видна на странице.
      if (x > -step / 2 && x < width + step / 2 && y > -step / 2 && y < height + step / 2) out.push([x, y]);
    }
  }
  return out;
}
