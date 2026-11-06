// Надписи и картинки поверх страниц PDF (номера страниц, водяной знак, подпись).
// Координаты задаются так, как страница видна на экране: с учётом её поворота (/Rotate) и видимой области (CropBox).
import type { PDFDocument, PDFFont, PDFPage } from '@cantoo/pdf-lib';
import { loadPdfLib } from './pdflib';

/** Видимая область страницы: начало, ширина, высота до поворота и поворот по часовой. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
}

export function pageBox(page: PDFPage): Box {
  const c = page.getCropBox();
  const rotate = ((((Math.round(page.getRotation().angle / 90) * 90) % 360) + 360) % 360) as number;
  return { x: c.x, y: c.y, w: c.width, h: c.height, rotate };
}

/** Размер страницы, как она видна. */
export const shownSize = (b: Box) => (b.rotate % 180 ? { width: b.h, height: b.w } : { width: b.w, height: b.h });

/** Точка из видимых координат (начало — левый нижний угол видимой страницы) в координаты страницы. */
export function toUser(b: Box, X: number, Y: number): [number, number] {
  switch (b.rotate) {
    case 90:
      return [b.x + b.w - Y, b.y + X];
    case 180:
      return [b.x + b.w - X, b.y + b.h - Y];
    case 270:
      return [b.x + Y, b.y + b.h - X];
    default:
      return [b.x + X, b.y + Y];
  }
}

export interface Label {
  text: string;
  /** Кегль в пунктах. */
  size: number;
  /** Цвет 0–1. */
  color: [number, number, number];
  opacity?: number;
  /** Наклон в градусах против часовой стрелки, как видно на экране. */
  angle?: number;
  /** Точка привязки в видимых координатах. */
  x: number;
  y: number;
  /** Привязка по горизонтали — к началу, середине или концу строки; по вертикали — к базовой линии или середине букв. */
  align: 'left' | 'center' | 'right';
  valign: 'baseline' | 'middle';
}

/** Шрифт Helvetica документа и картинки надписей, которые им не набрать, — свои у каждого документа. */
interface StampCache {
  font?: PDFFont;
  images: Map<string, { image: Awaited<ReturnType<PDFDocument['embedPng']>>; width: number; ascent: number; descent: number }>;
}
const caches = new WeakMap<PDFDocument, StampCache>();
function cacheOf(doc: PDFDocument): StampCache {
  let c = caches.get(doc);
  if (!c) caches.set(doc, (c = { images: new Map() }));
  return c;
}

/** Символы кодировки WinAnsi сверх ASCII и Latin-1: только их умеют стандартные шрифты PDF. */
const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';

/** Можно ли набрать текст стандартным шрифтом (Helvetica). pdf-lib не сообщает об ошибке, а молча ставит «?». */
export function isWinAnsi(text: string): boolean {
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (!((c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || WIN_ANSI_EXTRA.includes(ch))) return false;
  }
  return true;
}

/** Масштаб растровой надписи: пикселей на пункт. 6 — это 432 dpi, при печати не отличить от вектора. */
const RASTER = 6;

/** Надпись системным шрифтом через canvas: для кириллицы и прочих символов, которых нет в Helvetica (WinAnsi). */
async function rasterLabel(doc: PDFDocument, cache: StampCache, l: Label) {
  const key = `${l.text}|${l.size}|${l.color.join()}`;
  let hit = cache.images.get(key);
  if (!hit) {
    const face = "Helvetica, Arial, 'Liberation Sans', sans-serif";
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = `${l.size}px ${face}`;
    // Canvas шире ~16 тыс. точек браузеры не создают: длинную крупную надпись рисуем с меньшим запасом.
    const scale = Math.min(RASTER, 16000 / Math.max(1, probe.measureText(l.text).width));
    const px = l.size * scale;
    const font = `${px}px ${face}`;
    probe.font = font;
    const m = probe.measureText(l.text);
    const ascent = Math.ceil(m.fontBoundingBoxAscent ?? px * 0.9);
    const descent = Math.ceil(m.fontBoundingBoxDescent ?? px * 0.25);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(m.width));
    canvas.height = ascent + descent;
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    ctx.fillStyle = `rgb(${l.color.map((c) => Math.round(c * 255)).join(',')})`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(l.text, 0, ascent);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('label');
    const image = await doc.embedPng(new Uint8Array(await blob.arrayBuffer()));
    hit = { image, width: canvas.width / scale, ascent: ascent / scale, descent: descent / scale };
    cache.images.set(key, hit);
  }
  return hit;
}

/** Ширина надписи в пунктах (для раскладки до рисования). */
export async function labelWidth(doc: PDFDocument, l: Pick<Label, 'text' | 'size' | 'color'>): Promise<number> {
  const { StandardFonts } = await loadPdfLib();
  const cache = cacheOf(doc);
  if (!isWinAnsi(l.text)) return (await rasterLabel(doc, cache, l as Label)).width;
  cache.font ??= await doc.embedFont(StandardFonts.Helvetica);
  return cache.font.widthOfTextAtSize(l.text, l.size);
}

/** Рисует надпись на странице. Возвращает её ширину в пунктах. */
export async function drawLabel(doc: PDFDocument, page: PDFPage, l: Label): Promise<number> {
  const { StandardFonts, degrees, rgb } = await loadPdfLib();
  const cache = cacheOf(doc);
  const box = pageBox(page);
  const a = ((l.angle ?? 0) * Math.PI) / 180;
  const d = [Math.cos(a), Math.sin(a)];
  const n = [-Math.sin(a), Math.cos(a)];
  const vector = isWinAnsi(l.text);
  if (vector) cache.font ??= await doc.embedFont(StandardFonts.Helvetica);
  const width = vector ? cache.font!.widthOfTextAtSize(l.text, l.size) : (await rasterLabel(doc, cache, l)).width;
  const along = l.align === 'center' ? width / 2 : l.align === 'right' ? width : 0;
  // Середина заглавных букв Helvetica — 0,36 кегля над базовой линией.
  const up = l.valign === 'middle' ? l.size * 0.36 : 0;
  const bx = l.x - d[0] * along - n[0] * up;
  const by = l.y - d[1] * along - n[1] * up;
  const rotate = degrees((l.angle ?? 0) + box.rotate);
  const opacity = l.opacity ?? 1;
  if (vector) {
    const [x, y] = toUser(box, bx, by);
    page.drawText(l.text, { x, y, size: l.size, font: cache.font!, color: rgb(...l.color), opacity, rotate });
  } else {
    const r = await rasterLabel(doc, cache, l);
    // Низ картинки — на descent ниже базовой линии.
    const [x, y] = toUser(box, bx - n[0] * r.descent, by - n[1] * r.descent);
    page.drawImage(r.image, { x, y, width: r.width, height: r.ascent + r.descent, opacity, rotate });
  }
  return width;
}

/** Картинка (подпись, логотип) в видимых координатах: x, y — левый нижний угол, как видно на экране. */
export async function drawPicture(page: PDFPage, image: Awaited<ReturnType<PDFDocument['embedPng']>>, x: number, y: number, width: number, height: number, opacity = 1) {
  const { degrees } = await loadPdfLib();
  const box = pageBox(page);
  const [ux, uy] = toUser(box, x, y);
  page.drawImage(image, { x: ux, y: uy, width, height, opacity, rotate: degrees(box.rotate) });
}
