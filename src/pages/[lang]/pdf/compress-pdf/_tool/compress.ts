// Сжатие PDF в браузере: пересохранение картинок (основной выигрыш), сжатие несжатых потоков, удаление мусора.
import type { PDFDocument, PDFRawStream, PDFRef } from '@cantoo/pdf-lib';
import { unzlibSync, zlibSync } from 'fflate';
import { segments } from '@/ui/files/jpeg';
import { loadPdfLib } from '@/ui/pdf/pdflib';
export { dropUnreachable } from '@/ui/pdf/prune';

type Lib = Awaited<ReturnType<typeof loadPdfLib>>;

/** Отменяет PNG-предикторы (Predictor ≥ 10): у каждой строки свой фильтр в первом байте. */
export function unpredictPng(data: Uint8Array, colors: number, columns: number): Uint8Array {
  const bpp = colors;
  const row = colors * columns;
  const rows = Math.floor(data.length / (row + 1));
  const out = new Uint8Array(rows * row);
  for (let y = 0; y < rows; y++) {
    const type = data[y * (row + 1)];
    const src = y * (row + 1) + 1;
    const dst = y * row;
    for (let x = 0; x < row; x++) {
      const raw = data[src + x];
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[dst - row + x] : 0;
      const c = x >= bpp && y > 0 ? out[dst - row + x - bpp] : 0;
      let v: number;
      if (type === 0) v = raw;
      else if (type === 1) v = raw + a;
      else if (type === 2) v = raw + b;
      else if (type === 3) v = raw + ((a + b) >> 1);
      else if (type === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else throw new Error(`PNG filter ${type}`);
      out[dst + x] = v & 0xff;
    }
  }
  return out;
}

/** Байты потока после расшифровки, но до фильтров. */
function rawBytes(lib: Lib, s: PDFRawStream): Uint8Array {
  if (!s.transform) return s.contents;
  return lib.decodePDFRawStream({ dict: lib.PDFDict.withContext(s.dict.context), contents: s.contents, transform: s.transform } as PDFRawStream).decode();
}

/** Сжимает несжатые потоки (страницы старых программ, шрифты) — без потерь. */
export function deflatePlain(lib: Lib, doc: PDFDocument): number {
  const { PDFRawStream, PDFName } = lib;
  let n = 0;
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream) || obj.dict.has(PDFName.of('Filter'))) continue;
    const type = obj.dict.get(PDFName.of('Type'));
    if (type === PDFName.of('XRef') || type === PDFName.of('ObjStm') || type === PDFName.of('Metadata')) continue;
    const data = rawBytes(lib, obj);
    if (data.length < 256) continue;
    const packed = zlibSync(data, { level: 9 });
    if (packed.length >= data.length * 0.9) continue;
    const dict = obj.dict.clone(doc.context);
    dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    dict.delete(PDFName.of('DecodeParms'));
    doc.context.assign(ref, PDFRawStream.of(dict, packed));
    n++;
  }
  return n;
}

export interface ImageOptions {
  /** Предел длинной стороны картинки в пикселях. */
  maxSide: number;
  /** Качество JPEG 0–1. */
  quality: number;
}

/** Картинка, которую умеем пересохранить: JPEG или Flate с 8 битами RGB/серый. */
interface Candidate {
  ref: PDFRef;
  stream: PDFRawStream;
  width: number;
  height: number;
  kind: 'jpeg' | 'rgb' | 'gray';
  predictor: number;
}

function candidates(lib: Lib, doc: PDFDocument): Candidate[] {
  const { PDFRawStream, PDFName, PDFArray, PDFNumber, PDFDict, PDFBool } = lib;
  const num = (o: unknown) => (o instanceof PDFNumber ? o.asNumber() : undefined);
  const out: Candidate[] = [];
  const objects = doc.context.enumerateIndirectObjects();
  // Маски прозрачности (/SMask) должны остаться серыми картинками — их не трогаем.
  const masks = new Set<unknown>();
  for (const [, obj] of objects) {
    if (obj instanceof PDFRawStream) masks.add(obj.dict.get(PDFName.of('SMask')));
  }
  for (const [ref, obj] of objects) {
    if (!(obj instanceof PDFRawStream) || masks.has(ref)) continue;
    const d = obj.dict;
    if (d.get(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;
    if (d.lookup(PDFName.of('ImageMask')) === PDFBool.True) continue;
    // Маска цветом (/Mask [..]) после сжатия с потерями перестанет совпадать — такие не трогаем.
    if (d.lookup(PDFName.of('Mask')) instanceof PDFArray || d.has(PDFName.of('Decode')) || d.has(PDFName.of('SMaskInData'))) continue;
    const width = num(d.lookup(PDFName.of('Width'))) ?? 0;
    const height = num(d.lookup(PDFName.of('Height'))) ?? 0;
    if (width < 16 || height < 16 || obj.contents.length < 10_000) continue;
    const filter = d.lookup(PDFName.of('Filter'));
    const filters = filter instanceof PDFArray ? filter.asArray() : filter ? [filter] : [];
    const names = filters.map((f) => (f instanceof PDFName ? f.asString() : ''));
    const cs = d.lookup(PDFName.of('ColorSpace'));
    let colors = 0;
    if (cs === PDFName.of('DeviceRGB')) colors = 3;
    else if (cs === PDFName.of('DeviceGray')) colors = 1;
    else if (cs instanceof PDFArray && cs.lookup(0) === PDFName.of('ICCBased')) {
      const n = (cs.lookup(1) as PDFRawStream | undefined)?.dict?.lookup(PDFName.of('N'));
      colors = n instanceof PDFNumber ? n.asNumber() : 0;
    }
    if (colors !== 1 && colors !== 3) continue;
    if (names.length === 1 && names[0] === '/DCTDecode') {
      out.push({ ref, stream: obj, width, height, kind: 'jpeg', predictor: 1 });
      continue;
    }
    const bpc = num(d.lookup(PDFName.of('BitsPerComponent')));
    if (names.length !== 1 || names[0] !== '/FlateDecode' || bpc !== 8) continue;
    const parms = d.lookup(PDFName.of('DecodeParms'));
    let predictor = 1;
    if (parms instanceof PDFDict) {
      predictor = num(parms.lookup(PDFName.of('Predictor'))) ?? 1;
      const pc = num(parms.lookup(PDFName.of('Colors'))) ?? 1;
      const cols = num(parms.lookup(PDFName.of('Columns'))) ?? 1;
      if (predictor >= 10 && (pc !== colors || cols !== width)) continue;
      if (predictor !== 1 && predictor < 10) continue;
    }
    out.push({ ref, stream: obj, width, height, kind: colors === 3 ? 'rgb' : 'gray', predictor });
  }
  return out;
}

/**
 * Портит метку EXIF в копии JPEG. Программы PDF ориентацию из EXIF не применяют, а браузер применил бы
 * и повернул картинку внутри её прямоугольника (так делает и pdf.js).
 */
export function hideExif(jpeg: Uint8Array): Uint8Array {
  const out = jpeg.slice();
  try {
    for (const s of segments(out).list) if (s.marker === 0xe1 && out[s.data] === 0x45 && out[s.data + 1] === 0x78) out[s.data] = 0x58; // Exif → Xxif
  } catch {
    // не разобрали заголовки — отдаём как есть, браузер решит сам
  }
  return out;
}

async function toBitmap(lib: Lib, c: Candidate): Promise<ImageBitmap> {
  const bytes = rawBytes(lib, c.stream);
  if (c.kind === 'jpeg') return createImageBitmap(new Blob([hideExif(bytes) as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }), { imageOrientation: 'none' });
  if (!bytes.length) throw new Error('empty image');
  const colors = c.kind === 'rgb' ? 3 : 1;
  let px: Uint8Array = unzlibSync(bytes);
  if (c.predictor >= 10) px = unpredictPng(px, colors, c.width);
  if (px.length < c.width * c.height * colors) throw new Error('short image data');
  const rgba = new Uint8ClampedArray(c.width * c.height * 4);
  for (let i = 0, j = 0; i < c.width * c.height; i++, j += colors) {
    rgba[i * 4] = px[j];
    rgba[i * 4 + 1] = px[colors === 3 ? j + 1 : j];
    rgba[i * 4 + 2] = px[colors === 3 ? j + 2 : j];
    rgba[i * 4 + 3] = 255;
  }
  return createImageBitmap(new ImageData(rgba as Uint8ClampedArray<ArrayBuffer>, c.width, c.height));
}

/**
 * Пересохраняет картинки в JPEG с уменьшением до maxSide. Картинка заменяется, только если стала
 * хотя бы на 10 % легче. Неподдерживаемые (CMYK, JPEG 2000, JBIG2, палитра) остаются как есть.
 */
export async function recompressImages(lib: Lib, doc: PDFDocument, o: ImageOptions, onProgress: (done: number, total: number) => void): Promise<{ total: number; changed: number }> {
  const { PDFRawStream, PDFName, PDFNumber } = lib;
  const list = candidates(lib, doc);
  let changed = 0;
  for (let i = 0; i < list.length; i++) {
    onProgress(i, list.length);
    const c = list[i];
    let bitmap: ImageBitmap;
    try {
      bitmap = await toBitmap(lib, c);
    } catch {
      continue;
    }
    try {
      const k = Math.min(1, o.maxSide / Math.max(c.width, c.height));
      const w = Math.max(1, Math.round(c.width * k));
      const h = Math.max(1, Math.round(c.height * k));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', o.quality));
      canvas.width = canvas.height = 0;
      if (!blob || blob.size > c.stream.contents.length * 0.9) continue;
      const dict = c.stream.dict.clone(doc.context);
      for (const key of ['Filter', 'DecodeParms', 'Length', 'Interpolate']) dict.delete(PDFName.of(key));
      dict.set(PDFName.of('Width'), PDFNumber.of(w));
      dict.set(PDFName.of('Height'), PDFNumber.of(h));
      dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
      // Серое после canvas становится RGB: JPEG из браузера всегда цветной.
      dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
      dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
      doc.context.assign(c.ref, PDFRawStream.of(dict, new Uint8Array(await blob.arrayBuffer())));
      changed++;
    } finally {
      bitmap.close();
    }
  }
  onProgress(list.length, list.length);
  return { total: list.length, changed };
}

/** Самая длинная сторона страниц документа в дюймах — от неё считается предел для картинок. */
export function maxPageInches(doc: PDFDocument): number {
  return Math.max(1, ...doc.getPages().map((p) => Math.max(p.getWidth(), p.getHeight()) / 72));
}
