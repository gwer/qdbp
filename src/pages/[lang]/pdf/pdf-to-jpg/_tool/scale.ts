/**
 * Предел картинки в пикселях: столько canvas допускает iOS Safari (4096 × 4096).
 * A4 при 300 dpi — 8,7 Мп, проходит; плакат A1 при 300 dpi — нет, его разрешение снижается.
 */
export const MAX_PIXELS = 16_777_216;

/** Масштаб отрисовки страницы w×h (в пунктах) с учётом предела; reduced — пришлось уменьшить. */
export function fitScale(w: number, h: number, scale: number, max = MAX_PIXELS): { scale: number; reduced: boolean } {
  const px = w * scale * h * scale;
  if (px <= max) return { scale, reduced: false };
  // Чуть меньше точного корня: после округления сторон площадь не должна выйти за предел.
  return { scale: Math.sqrt(max / (w * h)) * 0.999, reduced: true };
}
