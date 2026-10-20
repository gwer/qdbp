// Расчёт итогового размера изображения — без браузерных API, чтобы покрыть тестами.

export type ResizeMode = 'percent' | 'width' | 'height' | 'fit';

export interface ResizeOptions {
  mode: ResizeMode;
  percent?: number;
  width?: number;
  height?: number;
  /** Не увеличивать картинку, если она меньше заданного размера. */
  noUpscale?: boolean;
}

/** Новый размер с сохранением пропорций; минимум 1×1, целые пиксели. */
export function targetSize(w: number, h: number, o: ResizeOptions): { width: number; height: number } {
  let scale: number;
  if (o.mode === 'percent') scale = (o.percent ?? 100) / 100;
  else if (o.mode === 'width') scale = (o.width ?? w) / w;
  else if (o.mode === 'height') scale = (o.height ?? h) / h;
  else scale = Math.min((o.width ?? w) / w, (o.height ?? h) / h);
  if (o.noUpscale) scale = Math.min(scale, 1);
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}
