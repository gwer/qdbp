// Распознавание HEIC/HEIF по содержимому (расширение и MIME-тип бывают неверными или пустыми).

/** Бренды HEIF с кодеком HEVC (HEIC). */
const HEVC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);
/** Общие бренды HEIF — бывают и у HEIC, и у AVIF. */
const GENERIC_BRANDS = new Set(['mif1', 'msf1', 'mif2', 'miaf']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

const fourcc = (b: Uint8Array, at: number) => String.fromCharCode(b[at], b[at + 1], b[at + 2], b[at + 3]);

/**
 * Бренды из коробки ftyp в начале файла (major и совместимые) или null, если это не ISO BMFF.
 * Хватает первых ~64 байт файла.
 */
export function ftypBrands(b: Uint8Array): string[] | null {
  if (b.length < 16 || fourcc(b, 4) !== 'ftyp') return null;
  const size = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  const end = Math.min(size, b.length);
  const brands = [fourcc(b, 8)];
  for (let i = 16; i + 4 <= end; i += 4) brands.push(fourcc(b, i));
  return brands;
}

/** HEIC/HEIF, который можно отдать libheif. AVIF (тоже HEIF-контейнер, но AV1) — нет: его браузеры открывают сами. */
export function isHeif(b: Uint8Array): boolean {
  const brands = ftypBrands(b);
  if (!brands) return false;
  if (brands.some((x) => HEVC_BRANDS.has(x))) return true;
  if (brands.some((x) => AVIF_BRANDS.has(x))) return false;
  return brands.some((x) => GENERIC_BRANDS.has(x));
}
