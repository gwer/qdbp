// Цвет в sRGB: r, g, b — 0…255, alpha — 0…1.
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const num = (s: string, scale: number) => (s.endsWith('%') ? (parseFloat(s) / 100) * scale : parseFloat(s));
const hue = (s: string) => {
  const v = parseFloat(s);
  if (s.endsWith('rad')) return (v * 180) / Math.PI;
  if (s.endsWith('turn')) return v * 360;
  return v;
};

/** Понимает HEX (#rgb, #rgba, #rrggbb, #rrggbbaa, без #), rgb()/rgba(), hsl()/hsla(), oklch(). */
export function parseColor(input: string): Rgba | null {
  const s = input.trim().toLowerCase();
  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = /^(rgba?|hsla?|oklch)\(\s*([^)]*)\)$/.exec(s);
  if (!fn) return null;
  const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const alpha = parts[3] === undefined ? 1 : clamp(num(parts[3], 1), 0, 1);
  if (parts.slice(0, 3).some((p) => Number.isNaN(parseFloat(p)))) return null;
  if (fn[1].startsWith('rgb')) {
    const [r, g, b] = parts.slice(0, 3).map((p) => clamp(Math.round(num(p, 255)), 0, 255));
    return { r, g, b, a: alpha };
  }
  if (fn[1].startsWith('hsl')) {
    return { ...hslToRgb(hue(parts[0]), num(parts[1], 100), num(parts[2], 100)), a: alpha };
  }
  const L = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
  const C = parts[1].endsWith('%') ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
  return { ...oklchToRgb(L, C, hue(parts[2])), a: alpha };
}

export function hslToRgb(h: number, s: number, l: number) {
  const S = clamp(s, 0, 100) / 100;
  const L = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + ((h % 360) + 360) % 360 / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

export function rgbToHsl({ r, g, b }: Rgba) {
  const [R, G, B] = [r, g, b].map((x) => x / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}

export function rgbToHsv({ r, g, b }: Rgba) {
  const [R, G, B] = [r, g, b].map((x) => x / 255);
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  const h = !d ? 0 : max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? (d / max) * 100 : 0, v: max * 100 };
}

/** Простой перевод в CMYK без цветового профиля — ориентир, а не данные для типографии. */
export function rgbToCmyk({ r, g, b }: Rgba) {
  const [R, G, B] = [r, g, b].map((x) => x / 255);
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return { c: ((1 - R - k) / (1 - k)) * 100, m: ((1 - G - k) / (1 - k)) * 100, y: ((1 - B - k) / (1 - k)) * 100, k: k * 100 };
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** OKLCH по Б. Оттоссону (матрицы из CSS Color 4). L — 0…1, C — 0…~0,4, H — градусы. */
export function rgbToOklch({ r, g, b }: Rgba) {
  const [R, G, B] = [r, g, b].map((x) => toLinear(x / 255));
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, Bb);
  return { l: L, c: C, h: C < 1e-4 ? 0 : ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360 };
}

export function oklchToRgb(L: number, C: number, H: number) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  // Цвета вне sRGB — простое обрезание по границе.
  const to = (x: number) => clamp(Math.round(fromLinear(clamp(x, 0, 1)) * 255), 0, 255);
  return { r: to(R), g: to(G), b: to(B) };
}

/** Относительная яркость и контраст по WCAG 2.x. */
export function luminance({ r, g, b }: Rgba) {
  const [R, G, B] = [r, g, b].map((x) => toLinear(x / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export const contrast = (x: Rgba, y: Rgba) => {
  const [a, b] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (a + 0.05) / (b + 0.05);
};

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');
export const toHex = (c: Rgba) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a * 255) : ''}`;
