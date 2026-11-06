// Раскладка картинки на странице PDF. Единицы — пункты PDF (1/72 дюйма).

export type PageSize = 'fit' | 'a4' | 'letter';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type Margin = 'none' | 'small' | 'large';

/** Размеры в пунктах (портрет). */
export const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const;
/** Поля: 0, 10 мм, 20 мм. */
export const MARGINS: Record<Margin, number> = { none: 0, small: 28.35, large: 56.69 };
/** «По размеру фото»: пиксели переводятся в пункты как 96 dpi — размер, в котором картинку показывает экран. */
const PX = 72 / 96;

export interface Placement {
  /** Размер страницы до поворота (так он записывается в MediaBox). */
  pageW: number;
  pageH: number;
  /** Картинка без поворота, вписанная по центру. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Поворот страницы по часовой (свойство /Rotate): так фото показывается повёрнутым без пересжатия. */
  rotate: 0 | 90 | 180 | 270;
}

/**
 * w, h — размер картинки как она записана в файле; rotate — на сколько её нужно повернуть по часовой
 * при показе (EXIF-ориентация + поворот пользователя).
 */
export function place(w: number, h: number, rotate: number, o: { size: PageSize; orientation: Orientation; margin: Margin }): Placement {
  const r = ((((Math.round(rotate / 90) * 90) % 360) + 360) % 360) as Placement['rotate'];
  const turned = r % 180 !== 0;
  // Как картинка выглядит на экране.
  const shownW = turned ? h : w;
  const shownH = turned ? w : h;
  const m = MARGINS[o.margin];
  let pageShownW: number;
  let pageShownH: number;
  if (o.size === 'fit') {
    pageShownW = shownW * PX + 2 * m;
    pageShownH = shownH * PX + 2 * m;
  } else {
    const [a, b] = SIZES[o.size];
    const landscape = o.orientation === 'landscape' || (o.orientation === 'auto' && shownW > shownH);
    pageShownW = landscape ? b : a;
    pageShownH = landscape ? a : b;
  }
  // В координатах страницы до поворота.
  const pageW = turned ? pageShownH : pageShownW;
  const pageH = turned ? pageShownW : pageShownH;
  const scale = Math.min((pageW - 2 * m) / w, (pageH - 2 * m) / h);
  const width = w * scale;
  const height = h * scale;
  return { pageW, pageH, x: (pageW - width) / 2, y: (pageH - height) / 2, width, height, rotate: r };
}

/** EXIF-ориентация → поворот по часовой. Отражения (2, 4, 5, 7) — null: такие фото пересохраняются через canvas. */
export function exifRotation(orientation: number | undefined): number | null {
  if (!orientation || orientation === 1) return 0;
  return orientation === 3 ? 180 : orientation === 6 ? 90 : orientation === 8 ? 270 : null;
}
