// Base64 для текста в UTF-8 (btoa/atob работают только с Latin-1).

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Понимает и обычный, и URL-safe вариант (- и _), пробелы и переносы, отсутствующее выравнивание «=». */
export function decodeBase64(input: string): string {
  let s = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('not base64');
  s = s.replace(/=+$/, '');
  if (s.length % 4 === 1) throw new Error('bad length');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
