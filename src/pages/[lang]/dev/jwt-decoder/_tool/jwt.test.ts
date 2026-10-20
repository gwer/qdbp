import { describe, expect, it } from 'vitest';
import { decodeJwt, JwtError, jwtStatus, timeClaims } from './jwt';

// Пример из RFC 7519, раздел 3.1.
const RFC = 'eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
// Пример с jwt.io.
const JWT_IO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const b64url = (s: string) => Buffer.from(s).toString('base64url');
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof JwtError ? [e.code, e.part ?? null, e.count ?? null] : String(e);
  }
  return 'no error';
};

describe('decodeJwt', () => {
  it('RFC 7519 example', () => {
    const d = decodeJwt(RFC)!;
    expect(d.header).toEqual({ typ: 'JWT', alg: 'HS256' });
    expect(d.payload).toEqual({ iss: 'joe', exp: 1300819380, 'http://example.com/is_root': true });
    expect(d.signature).toBe('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  });

  it('jwt.io example, with Bearer prefix and line breaks', () => {
    const d = decodeJwt(`  Bearer ${JWT_IO.slice(0, 40)}\n${JWT_IO.slice(40)}\n`)!;
    expect(d.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(d.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('unsecured JWT (RFC 7519, 6.1) has an empty signature', () => {
    const d = decodeJwt('eyJhbGciOiJub25lIn0.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.')!;
    expect(d.header).toEqual({ alg: 'none' });
    expect(d.signature).toBe('');
  });

  it('UTF-8 in payload', () => {
    const d = decodeJwt(`${b64url('{"alg":"none"}')}.${b64url('{"name":"Иван 🙂"}')}.`)!;
    expect(d.payload.name).toBe('Иван 🙂');
  });

  it('empty input', () => {
    expect(decodeJwt('  \n')).toBeNull();
  });

  it('errors', () => {
    expect(code(() => decodeJwt('abc'))).toEqual(['parts', null, 1]);
    expect(code(() => decodeJwt('a.b'))).toEqual(['parts', null, 2]);
    expect(code(() => decodeJwt('a.b.c.d.e'))).toEqual(['jwe', null, null]);
    expect(code(() => decodeJwt('a!b.c.d'))).toEqual(['base64', 'header', null]);
    expect(code(() => decodeJwt(`${b64url('{"alg":"none"}')}.${b64url('not json')}.`))).toEqual(['json', 'payload', null]);
    expect(code(() => decodeJwt(`${b64url('[1]')}.${b64url('{}')}.`))).toEqual(['object', 'header', null]);
    // Не UTF-8: байт 0xFF.
    expect(code(() => decodeJwt(`${b64url('{}')}._w.`))).toEqual(['json', 'payload', null]);
  });
});

describe('time claims', () => {
  const exp = 1300819380 * 1000;
  it('extracts numeric claims only', () => {
    expect(timeClaims({ iat: 1, exp: 1300819380, nbf: '5' })).toEqual([
      { name: 'iat', ms: 1000 },
      { name: 'exp', ms: exp },
    ]);
  });

  it('status by exp and nbf', () => {
    expect(jwtStatus({ exp: 1300819380 }, exp - 1)).toBe('valid');
    expect(jwtStatus({ exp: 1300819380 }, exp)).toBe('expired');
    expect(jwtStatus({ nbf: 100, exp: 1300819380 }, 99_999)).toBe('notYet');
    expect(jwtStatus({ nbf: 100, exp: 1300819380 }, 100_000)).toBe('valid');
    expect(jwtStatus({ iat: 100 }, 0)).toBe('noExp');
  });
});

describe('проверка подписи HS256', () => {
  // Известный пример с jwt.io: секрет your-256-bit-secret.
  const T = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  it('верный секрет — true, неверный — false, Bearer и переносы не мешают', async () => {
    const { verifyHmac } = await import('./jwt');
    expect(await verifyHmac(T, 'your-256-bit-secret')).toBe(true);
    expect(await verifyHmac(T, 'wrong')).toBe(false);
    expect(await verifyHmac(`Bearer ${T.slice(0, 40)}\n${T.slice(40)}`, 'your-256-bit-secret')).toBe(true);
  });
});
