export type JwtPart = 'header' | 'payload';

export class JwtError extends Error {
  constructor(
    public code: 'parts' | 'jwe' | 'base64' | 'json' | 'object',
    public part?: JwtPart,
    public count?: number,
  ) {
    super(code);
  }
}

/** Base64URL без выравнивания (как в JWT); стандартный Base64 с `+/=` тоже принимаем. */
export function base64UrlDecode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, '');
  if (!/^[A-Za-z0-9_\-+/]*$/.test(clean) || clean.length % 4 === 1) throw new Error('base64');
  const b64 = clean.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodePart(s: string, part: JwtPart): Record<string, unknown> {
  let bytes: Uint8Array;
  try {
    bytes = base64UrlDecode(s);
  } catch {
    throw new JwtError('base64', part);
  }
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new JwtError('json', part);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new JwtError('object', part);
  return value as Record<string, unknown>;
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Третья часть как есть (Base64URL); пустая у токенов с alg: none. */
  signature: string;
}

/**
 * Разбирает JWS-токен (три части через точку). Подпись не проверяется.
 * Пробелы и переносы строк внутри и префикс «Bearer » игнорируются — так токен обычно копируют.
 * Пустой ввод — null.
 */
const cleanToken = (input: string) => input.trim().replace(/^Bearer\s+/i, '').replace(/\s+/g, '');

export function decodeJwt(input: string): DecodedJwt | null {
  const token = cleanToken(input);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length === 5) throw new JwtError('jwe');
  if (parts.length !== 3) throw new JwtError('parts', undefined, parts.length);
  return { header: decodePart(parts[0], 'header'), payload: decodePart(parts[1], 'payload'), signature: parts[2] };
}

export const TIME_CLAIMS = ['iat', 'nbf', 'exp'] as const;
export type TimeClaim = (typeof TIME_CLAIMS)[number];

/** Поля времени (секунды Unix) → мс. Нечисловые и вне диапазона Date пропускаются. */
export function timeClaims(payload: Record<string, unknown>): { name: TimeClaim; ms: number }[] {
  return TIME_CLAIMS.flatMap((name) => {
    const v = payload[name];
    return typeof v === 'number' && Math.abs(v * 1000) <= 8.64e15 ? [{ name, ms: v * 1000 }] : [];
  });
}

export type JwtStatus = 'expired' | 'notYet' | 'valid' | 'noExp';

/**
 * Состояние по exp и nbf (RFC 7519, 4.1.4–4.1.5): токен истёк, если сейчас ≥ exp,
 * и ещё не действует, если сейчас < nbf.
 */
export function jwtStatus(payload: Record<string, unknown>, nowMs: number): JwtStatus {
  const t = Object.fromEntries(timeClaims(payload).map((c) => [c.name, c.ms]));
  if (t.exp !== undefined && nowMs >= t.exp) return 'expired';
  if (t.nbf !== undefined && nowMs < t.nbf) return 'notYet';
  return t.exp !== undefined ? 'valid' : 'noExp';
}

const HMAC: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };

/** Алгоритм токена подписывается общим секретом (HS256/384/512) — такую подпись можно проверить в браузере. */
export const isHmac = (alg: unknown) => typeof alg === 'string' && alg in HMAC;

/**
 * Проверка подписи HS256/384/512 секретом (строка в UTF-8) через WebCrypto.
 * Подпись — HMAC от «заголовок.payload» в исходной записи токена, в Base64URL.
 */
export async function verifyHmac(input: string, secret: string): Promise<boolean> {
  const token = cleanToken(input);
  const [h, p, sig] = token.split('.');
  const alg = decodePart(h, 'header').alg as string;
  if (!isHmac(alg)) throw new Error('not an HMAC token');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: HMAC[alg] }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`)));
  let bin = '';
  for (const b of mac) bin += String.fromCharCode(b);
  const expected = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return expected === sig.replace(/=+$/, '');
}
