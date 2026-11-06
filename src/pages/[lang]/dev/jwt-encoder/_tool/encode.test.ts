import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { encodeJwt, parsePayload, PayloadError } from './encode';
import { decodeJwt, verifyHmac } from '../../jwt-decoder/_tool/jwt';

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof PayloadError ? e.code : String(e);
  }
  return 'no error';
};

describe('encodeJwt', () => {
  it('jwt.io example (HS256, secret your-256-bit-secret)', async () => {
    const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 };
    expect(await encodeJwt('HS256', payload, 'your-256-bit-secret')).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    );
  });

  it.each(['HS256', 'HS384', 'HS512'] as const)('%s matches node:crypto and the decoder', async (alg) => {
    const payload = { sub: 'ёжик 👍', admin: true, exp: 1798761600 };
    const token = await encodeJwt(alg, payload, 'секрет');
    const [h, p, sig] = token.split('.');
    expect(sig).toBe(createHmac(`sha${alg.slice(2)}`, 'секрет').update(`${h}.${p}`).digest('base64url'));
    expect(decodeJwt(token)).toEqual({ header: { alg, typ: 'JWT' }, payload, signature: sig });
    expect(await verifyHmac(token, 'секрет')).toBe(true);
    expect(await verifyHmac(token, 'секрет ')).toBe(false);
  });
});

describe('parsePayload', () => {
  it('accepts objects only', () => {
    expect(parsePayload(' {"a": 1} ')).toEqual({ a: 1 });
    expect(code(() => parsePayload('{a: 1}'))).toBe('json');
    expect(code(() => parsePayload(''))).toBe('json');
    expect(code(() => parsePayload('[1]'))).toBe('object');
    expect(code(() => parsePayload('null'))).toBe('object');
    expect(code(() => parsePayload('"x"'))).toBe('object');
  });
});
