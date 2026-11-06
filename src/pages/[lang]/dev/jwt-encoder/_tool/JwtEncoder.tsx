import { useEffect, useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { HMAC_ALGS, minKeyBytes, type HmacAlg } from '../../_shared/hmac';
import { encodeJwt, parsePayload, type PayloadError } from './encode';

// Тот же токен, что открыт по умолчанию в декодере JWT: payload и секрет совпадают.
const SAMPLE_PAYLOAD = `{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1767225600,
  "nbf": 1767225600,
  "exp": 1798761600
}`;
const SAMPLE_SECRET = 'not-a-real-secret-only-for-testing';
const ALGS = Object.keys(HMAC_ALGS) as HmacAlg[];

export function JwtEncoder({ t }: ToolProps) {
  const [alg, setAlg] = useState<HmacAlg>('HS256');
  const [text, setText] = useState(SAMPLE_PAYLOAD);
  const [secret, setSecret] = useState(SAMPLE_SECRET);
  // null — токена нет: идёт подпись, нет секрета или payload с ошибкой.
  const [token, setToken] = useState<string | null>(null);

  let payload: Record<string, unknown> | null = null;
  let error = '';
  try {
    payload = parsePayload(text);
  } catch (e) {
    error = t(`ui.errors.${(e as PayloadError).code}`);
  }
  // Подписываем по нормализованному JSON: правка пробелов не перезапускает подпись.
  const compact = payload && JSON.stringify(payload);

  useEffect(() => {
    let cancelled = false;
    setToken(null);
    if (compact && secret)
      encodeJwt(alg, JSON.parse(compact), secret).then(
        (tk) => !cancelled && setToken(tk),
        () => !cancelled && setToken(null),
      );
    return () => {
      cancelled = true;
    };
  }, [alg, compact, secret]);

  const keyBytes = new TextEncoder().encode(secret).length;
  const min = minKeyBytes(alg);

  return (
    <div>
      <Toggle label={t('ui.alg')} value={alg} options={ALGS.map((a) => [a, a])} onChange={setAlg} />
      <div class="field">
        <label for="jwte-payload">{t('ui.payload')}</label>
        <textarea
          id="jwte-payload"
          class="mono"
          rows={9}
          spellcheck={false}
          autoComplete="off"
          value={text}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'jwte-err' : undefined}
          onInput={(e) => setText(e.currentTarget.value)}
        />
        {error && (
          <p class="field-error" id="jwte-err">
            {error}
          </p>
        )}
      </div>
      <div class="field">
        <label for="jwte-secret">{t('ui.secret')}</label>
        <input
          id="jwte-secret"
          type="text"
          class="mono"
          autoComplete="off"
          spellcheck={false}
          value={secret}
          onInput={(e) => setSecret(e.currentTarget.value)}
        />
        <p class="muted jwt-note">
          {!secret ? t('ui.noSecret') : keyBytes < min ? t('ui.shortKey', { bytes: keyBytes, min, alg }) : t('ui.secretNote')}
        </p>
      </div>
      <div class="hash-row">
        <div class="hash-head">
          <strong>{t('ui.token')}</strong>
          <CopyButton text={token ?? ''} t={t} />
        </div>
        <pre class="mono-out jwt-json">{token ?? ' '}</pre>
      </div>
    </div>
  );
}
