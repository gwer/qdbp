// Подпись JWT общим секретом (HS256/384/512, RFC 7518, 3.2) — общая для декодера и кодировщика JWT.

export const HMAC_ALGS = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' } as const;
export type HmacAlg = keyof typeof HMAC_ALGS;

export const isHmac = (alg: unknown): alg is HmacAlg => typeof alg === 'string' && alg in HMAC_ALGS;

/** Минимальная длина ключа по RFC 7518, 3.2 — не короче выхода хеша, в байтах. */
export const minKeyBytes = (alg: HmacAlg) => Number(alg.slice(2)) / 8;

export function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** HMAC от строки `data` секретом (текст в UTF-8), результат — Base64URL, как третья часть JWT. */
export async function hmacSign(alg: HmacAlg, secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: HMAC_ALGS[alg] }, false, ['sign']);
  return base64UrlEncode(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
}
