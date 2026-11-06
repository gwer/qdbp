import { base64UrlEncode, hmacSign, type HmacAlg } from '../../_shared/hmac';

export class PayloadError extends Error {
  constructor(public code: 'json' | 'object') {
    super(code);
  }
}

/** Payload — только JSON-объект: так требует RFC 7519, 7.2. */
export function parsePayload(text: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new PayloadError('json');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PayloadError('object');
  return value as Record<string, unknown>;
}

const part = (v: unknown) => base64UrlEncode(new TextEncoder().encode(JSON.stringify(v)));

/** Токен `заголовок.payload.подпись`: JSON без пробелов в Base64URL, подпись HMAC секретом в UTF-8. */
export async function encodeJwt(alg: HmacAlg, payload: Record<string, unknown>, secret: string): Promise<string> {
  const data = `${part({ alg, typ: 'JWT' })}.${part(payload)}`;
  return `${data}.${await hmacSign(alg, secret, data)}`;
}
