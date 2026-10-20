// Разбор JPEG по маркерам и чтение EXIF (TIFF внутри APP1). Без сторонних библиотек.

export interface Segment {
  marker: number;
  /** Смещение маркера (0xFF) в файле. */
  start: number;
  /** Смещение сразу после сегмента. */
  end: number;
  /** Смещение данных сегмента (после маркера и длины). */
  data: number;
}

export const isJpeg = (b: Uint8Array) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8;

const ascii = (b: Uint8Array, at: number, s: string) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));

/** Сегменты от SOI до SOS (после SOS идут сжатые данные изображения — их не трогаем). */
export function segments(b: Uint8Array): { list: Segment[]; sos: number } {
  if (!isJpeg(b)) throw new Error('not a JPEG');
  const list: Segment[] = [];
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) throw new Error('bad marker');
    let m = b[i + 1];
    while (m === 0xff && i + 2 < b.length) m = b[++i + 1]; // заполняющие 0xFF
    if (m === 0xda) return { list, sos: i }; // SOS
    if (m === 0xd9) break; // EOI без данных
    const len = (b[i + 2] << 8) | b[i + 3];
    if (len < 2 || i + 2 + len > b.length) throw new Error('bad length');
    list.push({ marker: m, start: i, end: i + 2 + len, data: i + 4 });
    i += 2 + len;
  }
  throw new Error('no image data');
}

export interface Gps {
  lat: number;
  lon: number;
  alt?: number;
}

export interface Meta {
  make?: string;
  model?: string;
  lens?: string;
  serial?: string;
  software?: string;
  artist?: string;
  copyright?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  orientation?: number;
  exposure?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  gps?: Gps;
  /** Какие ещё блоки метаданных есть в файле. */
  xmp: boolean;
  iptc: boolean;
  comment: boolean;
  icc: boolean;
}

type Value = string | number | number[] | undefined;

/** Читает IFD: tag → значение (строки, числа, массивы чисел; рациональные — как дробь). */
function readIfd(v: DataView, tiff: number, offset: number, le: boolean): Map<number, Value> {
  const out = new Map<number, Value>();
  const at = tiff + offset;
  if (at + 2 > v.byteLength) return out;
  const n = v.getUint16(at, le);
  const SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  for (let k = 0; k < n; k++) {
    const e = at + 2 + k * 12;
    if (e + 12 > v.byteLength) break;
    const tag = v.getUint16(e, le);
    const type = v.getUint16(e + 2, le);
    const count = v.getUint32(e + 4, le);
    const size = (SIZE[type] ?? 0) * count;
    if (!size) continue;
    const p = size <= 4 ? e + 8 : tiff + v.getUint32(e + 8, le);
    if (p + size > v.byteLength) continue;
    if (type === 2) {
      let s = '';
      for (let c = 0; c < count; c++) {
        const ch = v.getUint8(p + c);
        if (!ch) break;
        s += String.fromCharCode(ch);
      }
      out.set(tag, s.trim());
    } else if (type === 5 || type === 10) {
      const nums: number[] = [];
      for (let c = 0; c < count; c++) {
        const num = type === 5 ? v.getUint32(p + c * 8, le) : v.getInt32(p + c * 8, le);
        const den = type === 5 ? v.getUint32(p + c * 8 + 4, le) : v.getInt32(p + c * 8 + 4, le);
        nums.push(den ? num / den : 0);
      }
      out.set(tag, count === 1 ? nums[0] : nums);
      if (tag === 0x829a && count === 1) {
        const num = v.getUint32(p, le);
        const den = v.getUint32(p + 4, le);
        out.set(-tag, num && den > num ? `1/${Math.round(den / num)}` : String(den ? num / den : 0));
      }
    } else if (type === 3 || type === 4 || type === 9 || type === 1) {
      const nums: number[] = [];
      for (let c = 0; c < count; c++) {
        nums.push(
          type === 3 ? v.getUint16(p + c * 2, le) : type === 4 ? v.getUint32(p + c * 4, le) : type === 9 ? v.getInt32(p + c * 4, le) : v.getUint8(p + c),
        );
      }
      out.set(tag, count === 1 ? nums[0] : nums);
    }
  }
  return out;
}

const str = (x: Value) => (typeof x === 'string' && x ? x : undefined);
const num = (x: Value) => (typeof x === 'number' ? x : Array.isArray(x) ? x[0] : undefined);

function dms(x: Value, ref: Value): number | undefined {
  if (!Array.isArray(x) || x.length < 3) return undefined;
  const deg = x[0] + x[1] / 60 + x[2] / 3600;
  return ref === 'S' || ref === 'W' ? -deg : deg;
}

/** Метаданные JPEG. Неизвестное и битое пропускается: читаем, что удаётся. */
export function readMeta(b: Uint8Array): Meta {
  const { list } = segments(b);
  const meta: Meta = { xmp: false, iptc: false, comment: false, icc: false };
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (const s of list) {
    if (s.marker === 0xe1 && ascii(b, s.data, 'Exif\0\0')) {
      const tiff = s.data + 6;
      const le = b[tiff] === 0x49; // 'II' — little endian, 'MM' — big endian
      try {
        const ifd0 = readIfd(v, tiff, v.getUint32(tiff + 4, le), le);
        meta.make = str(ifd0.get(0x010f));
        meta.model = str(ifd0.get(0x0110));
        meta.orientation = num(ifd0.get(0x0112));
        meta.software = str(ifd0.get(0x0131));
        meta.dateTime = str(ifd0.get(0x0132));
        meta.artist = str(ifd0.get(0x013b));
        meta.copyright = str(ifd0.get(0x8298));
        const exifPtr = num(ifd0.get(0x8769));
        if (exifPtr) {
          const ex = readIfd(v, tiff, exifPtr, le);
          meta.dateTimeOriginal = str(ex.get(0x9003));
          meta.exposure = str(ex.get(-0x829a));
          meta.fNumber = num(ex.get(0x829d));
          meta.iso = num(ex.get(0x8827));
          meta.focalLength = num(ex.get(0x920a));
          meta.lens = str(ex.get(0xa434));
          meta.serial = str(ex.get(0xa431));
        }
        const gpsPtr = num(ifd0.get(0x8825));
        if (gpsPtr) {
          const g = readIfd(v, tiff, gpsPtr, le);
          const lat = dms(g.get(2), g.get(1));
          const lon = dms(g.get(4), g.get(3));
          if (lat !== undefined && lon !== undefined && (lat || lon)) {
            const alt = num(g.get(6));
            meta.gps = { lat, lon, alt: alt === undefined ? undefined : g.get(5) === 1 ? -alt : alt };
          }
        }
      } catch {
        // повреждённый EXIF — показываем то, что успели прочитать
      }
    } else if (s.marker === 0xe1 && ascii(b, s.data, 'http://ns.adobe.com/xap/')) meta.xmp = true;
    else if (s.marker === 0xed) meta.iptc = true;
    else if (s.marker === 0xfe) meta.comment = true;
    else if (s.marker === 0xe2 && ascii(b, s.data, 'ICC_PROFILE\0')) meta.icc = true;
  }
  return meta;
}

/** Минимальный EXIF только с ориентацией (big endian TIFF, один тег 0x0112). */
export function orientationApp1(orientation: number): Uint8Array {
  const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0];
  const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = body.length + 2;
  return Uint8Array.from([0xff, 0xe1, len >> 8, len & 0xff, ...body]);
}

export interface StripOptions {
  /** Оставить цветовой профиль ICC — без него цвета широкого охвата могут поблёкнуть. */
  keepIcc: boolean;
  /** Сохранить поворот (тег Orientation), чтобы фото не оказалось лёжа. */
  keepOrientation: boolean;
}

/**
 * Данные изображения от первого SOS до EOI: сканы и таблицы между ними (у прогрессивного JPEG сканов несколько).
 * APPn и комментарии, если они встретились после начала сканов, выбрасываются; всё после EOI — тоже
 * (туда телефоны дописывают превью и карты HDR со своими метаданными).
 */
/**
 * Конец сжатых данных скана: первый настоящий маркер. Внутри скана бывают 0xFF 0x00 (экранированный байт)
 * и RST0–RST7, в том числе с заполняющими 0xFF перед ними (FF FF D0) — это ещё данные скана.
 */
function scanEnd(b: Uint8Array, i: number): number {
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    let k = i + 1;
    while (k < b.length && b[k] === 0xff) k++; // заполняющие 0xFF
    if (k >= b.length) return b.length;
    if (b[k] !== 0 && (b[k] < 0xd0 || b[k] > 0xd7)) return i; // настоящий маркер; заполнение перед ним пропустит imageData
    i = k + 1;
  }
  return b.length;
}

function imageData(b: Uint8Array, at: number): Uint8Array[] {
  const parts: Uint8Array[] = [];
  let i = at;
  while (i + 1 < b.length) {
    if (b[i] !== 0xff) throw new Error('bad marker');
    while (b[i + 1] === 0xff && i + 2 < b.length) i++; // заполняющие 0xFF
    const m = b[i + 1];
    if (m === 0xd9) {
      parts.push(b.subarray(i, i + 2));
      return parts;
    }
    if (i + 4 > b.length) break;
    const len = (b[i + 2] << 8) | b[i + 3];
    let end = i + 2 + len;
    if (len < 2 || end > b.length) throw new Error('bad length');
    if (m === 0xda) {
      end = scanEnd(b, end);
    }
    const isMeta = (m >= 0xe0 && m <= 0xef) || m === 0xfe;
    if (!isMeta) parts.push(b.subarray(i, end));
    i = end;
  }
  parts.push(Uint8Array.of(0xff, 0xd9)); // обрезанный файл без EOI
  return parts;
}

/**
 * Удаляет метаданные без перекодирования: EXIF и XMP (APP1), IPTC (APP13), комментарии, прочие APPn — в том числе после сканов.
 * Остаются JFIF (APP0), Adobe (APP14 — нужен для правильных цветов CMYK), ICC (по желанию) и сами данные изображения.
 */
export function stripJpeg(b: Uint8Array, o: StripOptions): Uint8Array<ArrayBuffer> {
  const { list, sos } = segments(b);
  const orientation = o.keepOrientation ? readMeta(b).orientation : undefined;
  const parts: Uint8Array[] = [b.subarray(0, 2)];
  let inserted = false;
  const insertOrientation = () => {
    if (!inserted && orientation && orientation !== 1) parts.push(orientationApp1(orientation));
    inserted = true;
  };
  for (const s of list) {
    const isApp = s.marker >= 0xe0 && s.marker <= 0xef;
    const keep =
      (!isApp && s.marker !== 0xfe) ||
      s.marker === 0xe0 ||
      s.marker === 0xee ||
      (s.marker === 0xe2 && o.keepIcc && ascii(b, s.data, 'ICC_PROFILE\0'));
    if (s.marker !== 0xe0) insertOrientation(); // ориентация — сразу после JFIF
    if (keep) parts.push(b.subarray(s.start, s.end));
  }
  insertOrientation();
  parts.push(...imageData(b, sos));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
