// Декодирование и кодирование изображений средствами браузера (canvas). Файлы никуда не отправляются.

export type OutputType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export const EXT: Record<OutputType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** Форматы с параметром качества. */
export const LOSSY = new Set<OutputType>(['image/jpeg', 'image/webp', 'image/avif']);

export const isImage = (file: File) => file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);

/** Имя результата: «photo.png» → «photo-small.jpg». */
export function outputName(name: string, type: OutputType, suffix = ''): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  return `${base}${suffix}.${EXT[type]}`;
}

/** Тип результата «как у исходника», если браузер умеет его кодировать; иначе PNG. */
export function sameType(file: File): OutputType {
  const t = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  return t === 'image/jpeg' || t === 'image/webp' || t === 'image/png' ? t : 'image/png';
}

export function decode(file: Blob): Promise<ImageBitmap> {
  // from-image — учитывать EXIF-ориентацию, чтобы фото с телефона не оказались повёрнутыми.
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;

function makeCanvas(w: number, h: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(c: AnyCanvas, type: OutputType, quality?: number): Promise<Blob> {
  if ('convertToBlob' in c) return c.convertToBlob({ type, quality });
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), type, quality));
}

export interface EncodeOptions {
  width: number;
  height: number;
  type: OutputType;
  /** 0–1, только для JPEG/WebP/AVIF. */
  quality?: number;
  /** Фон под прозрачностью — нужен для JPEG, у которого нет альфа-канала. */
  background?: string;
}

/**
 * Рисует картинку в нужном размере и кодирует. При сильном уменьшении масштабирует в несколько шагов
 * по половине — так у браузерного сглаживания заметно меньше «лесенки» и муара.
 */
export async function encode(bitmap: ImageBitmap, o: EncodeOptions): Promise<Blob> {
  let source: CanvasImageSource = bitmap;
  let sw = bitmap.width;
  let sh = bitmap.height;
  while (sw / 2 >= o.width && sh / 2 >= o.height) {
    const step = makeCanvas(Math.round(sw / 2), Math.round(sh / 2));
    const sctx = step.getContext('2d') as CanvasRenderingContext2D;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(source, 0, 0, step.width, step.height);
    source = step as CanvasImageSource;
    sw = step.width;
    sh = step.height;
  }
  const out = makeCanvas(o.width, o.height);
  const ctx = out.getContext('2d') as CanvasRenderingContext2D;
  if (o.background || o.type === 'image/jpeg') {
    ctx.fillStyle = o.background ?? '#ffffff';
    ctx.fillRect(0, 0, o.width, o.height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, o.width, o.height);
  const blob = await toBlob(out, o.type, LOSSY.has(o.type) ? o.quality : undefined);
  // Браузер, не умеющий формат, молча отдаёт PNG — для нас это ошибка, а не результат.
  if (blob.type !== o.type) throw new Error(`unsupported output type ${o.type}`);
  return blob;
}

const support = new Map<OutputType, Promise<boolean>>();

/** Умеет ли браузер кодировать формат (AVIF пока умеют немногие). */
export function canEncode(type: OutputType): Promise<boolean> {
  let p = support.get(type);
  if (!p) {
    p = toBlob(makeCanvas(2, 2), type, 0.8)
      .then((b) => b.type === type)
      .catch(() => false);
    support.set(type, p);
  }
  return p;
}
