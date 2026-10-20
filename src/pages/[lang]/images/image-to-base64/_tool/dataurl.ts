// Картинка ↔ Base64 / data URL.

/** Формат по первым байтам файла (сигнатуре). */
export function sniffMime(b: Uint8Array): string | undefined {
  const at = (i: number, ...xs: number[]) => xs.every((x, k) => b[i + k] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  if (at(4, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66)) return 'image/avif';
  if (at(0, 0x42, 0x4d)) return 'image/bmp';
  if (at(0, 0x3c, 0x73, 0x76, 0x67) || at(0, 0x3c, 0x3f, 0x78, 0x6d, 0x6c)) return 'image/svg+xml';
  return undefined;
}

export function bytesToBase64(b: Uint8Array): string {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < b.length; i += CHUNK) bin += String.fromCharCode(...b.subarray(i, i + CHUNK));
  return btoa(bin);
}

/** data URL или «голый» Base64 → байты и формат. Пробелы и переносы строк допускаются. */
export function parseDataUrl(input: string): { mime: string; bytes: Uint8Array } {
  const s = input.trim();
  const m = /^data:([\w.+-]+\/[\w.+-]+)?(?:;[\w-]+=[\w.-]+)*;base64,([\s\S]*)$/i.exec(s);
  const b64 = (m ? m[2] : s).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!b64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error('not base64');
  const body = b64.replace(/=+$/, '');
  if (body.length % 4 === 1) throw new Error('bad length');
  const bytes = Uint8Array.from(atob(body + '='.repeat((4 - (body.length % 4)) % 4)), (c) => c.charCodeAt(0));
  const mime = sniffMime(bytes) ?? m?.[1];
  if (!mime || !mime.startsWith('image/')) throw new Error('not an image');
  return { mime, bytes };
}

export type Format = 'dataUrl' | 'base64' | 'css' | 'html';

export function formatOutput(dataUrl: string, format: Format, name = 'image'): string {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  switch (format) {
    case 'base64':
      return b64;
    case 'css':
      return `background-image: url("${dataUrl}");`;
    case 'html':
      return `<img src="${dataUrl}" alt="${name.replace(/"/g, '&quot;')}">`;
    default:
      return dataUrl;
  }
}
