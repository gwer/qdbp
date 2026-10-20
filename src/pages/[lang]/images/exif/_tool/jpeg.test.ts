import { describe, expect, it } from 'vitest';
import { orientationApp1, readMeta, segments, stripJpeg } from './jpeg';

// --- Сборщик синтетических JPEG и TIFF для тестов ---

type Entry = [tag: number, type: 2 | 3 | 4 | 5, value: string | number | number[]];

/** TIFF с IFD0 и (по желанию) вложенными Exif и GPS IFD. Рациональные значения задаются как [num, den, num, den…]. */
function tiff(le: boolean, ifd0: Entry[], exif: Entry[] = [], gps: Entry[] = []): number[] {
  const bytes: number[] = [];
  const u16 = (n: number) => (le ? [n & 0xff, n >> 8] : [n >> 8, n & 0xff]);
  const u32 = (n: number) => (le ? [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24] : [n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
  const set = (at: number, arr: number[]) => arr.forEach((x, i) => (bytes[at + i] = x));
  bytes.push(...(le ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(8));

  const writeIfd = (entries: Entry[]): number => {
    const start = bytes.length;
    bytes.push(...u16(entries.length));
    const fixups: [number, number[]][] = [];
    for (const [tag, type, value] of entries) {
      const data: number[] =
        type === 2
          ? [...String(value)].map((c) => c.charCodeAt(0)).concat(0)
          : type === 3
            ? [value as number].flat().flatMap(u16)
            : type === 4
              ? [value as number].flat().flatMap(u32)
              : (value as number[]).flatMap(u32);
      const count = type === 2 ? data.length : type === 5 ? (value as number[]).length / 2 : [value].flat().length;
      bytes.push(...u16(tag), ...u16(type), ...u32(count));
      const at = bytes.length;
      if (data.length <= 4) bytes.push(...data, ...new Array(4 - data.length).fill(0));
      else {
        bytes.push(0, 0, 0, 0);
        fixups.push([at, data]);
      }
    }
    bytes.push(...u32(0));
    for (const [at, data] of fixups) {
      set(at, u32(bytes.length));
      bytes.push(...data);
    }
    return start;
  };

  writeIfd(ifd0Entries(ifd0, exif.length > 0, gps.length > 0));
  const patch = (tag: number, off: number) => {
    // найти значение указателя в IFD0 и записать смещение
    const n = le ? bytes[8] | (bytes[9] << 8) : (bytes[8] << 8) | bytes[9];
    for (let k = 0; k < n; k++) {
      const e = 10 + k * 12;
      const t = le ? bytes[e] | (bytes[e + 1] << 8) : (bytes[e] << 8) | bytes[e + 1];
      if (t === tag) set(e + 8, u32(off));
    }
  };
  if (exif.length) patch(0x8769, writeIfd(exif));
  if (gps.length) patch(0x8825, writeIfd(gps));
  return bytes;
}

function ifd0Entries(entries: Entry[], exif: boolean, gps: boolean): Entry[] {
  return [...entries, ...(exif ? [[0x8769, 4, 0] as Entry] : []), ...(gps ? [[0x8825, 4, 0] as Entry] : [])];
}

const seg = (marker: number, body: number[]) => [0xff, marker, (body.length + 2) >> 8, (body.length + 2) & 0xff, ...body];
const text = (s: string) => [...s].map((c) => c.charCodeAt(0));
const JFIF = seg(0xe0, [...text('JFIF\0'), 1, 1, 0, 0, 1, 0, 1, 0, 0]);
const DQT = seg(0xdb, new Array(65).fill(1));
const SOS_AND_DATA = [...seg(0xda, [1, 1, 0, 0, 0x3f, 0]), 0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd9];

function jpeg(...segs: number[][]): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, ...segs.flat(), ...SOS_AND_DATA]);
}

const exifSeg = (t: number[]) => seg(0xe1, [...text('Exif\0\0'), ...t]);

function photo(le: boolean) {
  return jpeg(
    JFIF,
    exifSeg(
      tiff(
        le,
        [
          [0x010f, 2, 'Apple'],
          [0x0110, 2, 'iPhone 15 Pro'],
          [0x0112, 3, 6],
          [0x0132, 2, '2026:07:14 18:30:05'],
        ],
        [
          [0x9003, 2, '2026:07:14 18:30:04'],
          [0x829a, 5, [1, 120]],
          [0x829d, 5, [178, 100]],
          [0x8827, 3, 80],
          [0x920a, 5, [6860, 1000]],
          [0xa434, 2, 'iPhone 15 Pro back camera'],
        ],
        [
          [1, 2, 'N'],
          [2, 5, [55, 1, 45, 1, 2112, 100]],
          [3, 2, 'E'],
          [4, 5, [37, 1, 37, 1, 1080, 100]],
          [6, 5, [15600, 100]],
        ],
      ),
    ),
    seg(0xe1, text('http://ns.adobe.com/xap/1.0/\0<x:xmpmeta/>')),
    seg(0xe2, [...text('ICC_PROFILE\0'), 1, 1, 0, 0, 0, 0]),
    seg(0xed, text('Photoshop 3.0\0IPTC')),
    seg(0xee, text('Adobe\0data')),
    seg(0xfe, text('comment')),
    DQT,
  );
}

describe('segments', () => {
  it('находит сегменты до SOS', () => {
    const { list } = segments(photo(true));
    expect(list.map((s) => s.marker.toString(16))).toEqual(['e0', 'e1', 'e1', 'e2', 'ed', 'ee', 'fe', 'db']);
  });

  it('не JPEG — ошибка', () => {
    expect(() => segments(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toThrow();
  });
});

describe('readMeta', () => {
  it.each([true, false])('little endian = %s', (le) => {
    const m = readMeta(photo(le));
    expect(m).toMatchObject({
      make: 'Apple',
      model: 'iPhone 15 Pro',
      orientation: 6,
      dateTime: '2026:07:14 18:30:05',
      dateTimeOriginal: '2026:07:14 18:30:04',
      exposure: '1/120',
      fNumber: 1.78,
      iso: 80,
      focalLength: 6.86,
      lens: 'iPhone 15 Pro back camera',
      xmp: true,
      iptc: true,
      comment: true,
      icc: true,
    });
    expect(m.gps!.lat).toBeCloseTo(55 + 45 / 60 + 21.12 / 3600, 9);
    expect(m.gps!.lon).toBeCloseTo(37 + 37 / 60 + 10.8 / 3600, 9);
    expect(m.gps!.alt).toBeCloseTo(156, 9);
  });

  it('южная и западная широта — отрицательные', () => {
    const b = jpeg(exifSeg(tiff(true, [], [], [[1, 2, 'S'], [2, 5, [33, 1, 52, 1, 0, 1]], [3, 2, 'W'], [4, 5, [70, 1, 30, 1, 0, 1]]])));
    expect(readMeta(b).gps).toMatchObject({ lat: -(33 + 52 / 60), lon: -70.5 });
  });

  it('без метаданных', () => {
    expect(readMeta(jpeg(JFIF, DQT))).toEqual({ xmp: false, iptc: false, comment: false, icc: false });
  });
});

describe('stripJpeg', () => {
  it('убирает EXIF, XMP, IPTC и комментарий, оставляет JFIF, Adobe, ICC, данные', () => {
    const src = photo(true);
    const out = stripJpeg(src, { keepIcc: true, keepOrientation: false });
    expect(segments(out).list.map((s) => s.marker.toString(16))).toEqual(['e0', 'e2', 'ee', 'db']);
    expect([...out.slice(-8)]).toEqual(SOS_AND_DATA.slice(-8));
    const m = readMeta(out);
    expect(m.make).toBeUndefined();
    expect(m.gps).toBeUndefined();
    expect(m).toMatchObject({ xmp: false, iptc: false, comment: false, icc: true });
  });

  it('без ICC по желанию', () => {
    const out = stripJpeg(photo(false), { keepIcc: false, keepOrientation: false });
    expect(readMeta(out).icc).toBe(false);
  });

  it('сохраняет только ориентацию — сразу после JFIF', () => {
    const out = stripJpeg(photo(true), { keepIcc: false, keepOrientation: true });
    expect(segments(out).list.map((s) => s.marker.toString(16))).toEqual(['e0', 'e1', 'ee', 'db']);
    const m = readMeta(out);
    expect(m.orientation).toBe(6);
    expect(m.make).toBeUndefined();
    expect(m.gps).toBeUndefined();
  });

  it('ориентация 1 не добавляет EXIF', () => {
    const b = jpeg(JFIF, exifSeg(tiff(true, [[0x0112, 3, 1], [0x010f, 2, 'Canon']])), DQT);
    expect(segments(stripJpeg(b, { keepIcc: true, keepOrientation: true })).list.map((s) => s.marker)).toEqual([0xe0, 0xdb]);
  });

  it('минимальный EXIF ориентации читается', () => {
    expect(readMeta(jpeg([...orientationApp1(8)], DQT)).orientation).toBe(8);
  });
});
