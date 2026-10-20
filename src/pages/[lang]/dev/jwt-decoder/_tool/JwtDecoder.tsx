import { useEffect, useState } from 'preact/hooks';
import { LANG_META, type ClockMode, type Lang } from '@/i18n/config';
import { formatDateTime } from '@/lib/format';
import { Toggle } from '@/ui/Calculator';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { readPref, writePref } from '@/ui/prefs';
import { decodeJwt, JwtError, jwtStatus, timeClaims, type DecodedJwt } from './jwt';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY3MjI1NjAwLCJuYmYiOjE3NjcyMjU2MDAsImV4cCI6MTc5ODc2MTYwMH0.RDvudNA1pyyGaAIcSdO7DgEmU2_VncMo0ojXM6gg53U';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86400],
  ['month', 30 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/** «через 3 дня», «2 часа назад» — в самой крупной подходящей единице. */
function relative(lang: Lang, diffMs: number): string {
  const s = diffMs / 1000;
  const [unit, size] = UNITS.find(([, size]) => Math.abs(s) >= size) ?? UNITS[UNITS.length - 1];
  return new Intl.RelativeTimeFormat(LANG_META[lang].intl, { numeric: 'auto' }).format(Math.trunc(s / size), unit);
}

const json = (v: unknown) => JSON.stringify(v, null, 2);

export function JwtDecoder({ lang, t }: ToolProps) {
  const [input, setInput] = useState(SAMPLE);
  const [clock, setClock] = useState<ClockMode>(LANG_META[lang].clock);
  // null — пререндер: «сейчас» и часовой пояс известны только в браузере.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const stored = readPref('clock');
    if (stored === '12' || stored === '24') setClock(stored);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let jwt: DecodedJwt | null = null;
  let error = '';
  try {
    jwt = decodeJwt(input);
  } catch (e) {
    const err = e as JwtError;
    error = t(`ui.errors.${err.code}`, { part: err.part ? t(`ui.parts.${err.part}`) : '', count: err.count ?? 0 });
  }
  const claims = jwt ? timeClaims(jwt.payload) : [];
  const status = jwt && now !== null ? jwtStatus(jwt.payload, now) : null;

  return (
    <div>
      <div class="field">
        <label for="jwt-in">{t('ui.input')}</label>
        <textarea
          id="jwt-in"
          class="mono"
          rows={5}
          spellcheck={false}
          autoComplete="off"
          value={input}
          placeholder="eyJhbGciOi…"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby="jwt-note"
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {error && <p class="field-error">{error}</p>}
        <p id="jwt-note" class="muted jwt-note">
          {t('ui.noVerify')}
        </p>
      </div>

      {jwt && (
        <>
          {status && (
            <p class={`jwt-status ${status === 'valid' ? 'good' : status === 'noExp' ? '' : 'bad'}`}>{t(`ui.status.${status}`)}</p>
          )}
          {claims.length > 0 && now !== null && (
            <>
              <Toggle
                label={t('calc.clock.label')}
                value={clock}
                options={[
                  ['24', t('calc.clock.h24')],
                  ['12', t('calc.clock.h12')],
                ]}
                onChange={(c) => {
                  setClock(c);
                  writePref('clock', c);
                }}
              />
              <div class="table-wrap">
                <table class="kv jwt-times">
                  <tbody>
                    {claims.map((c) => (
                      <tr key={c.name}>
                        <th scope="row">
                          <code>{c.name}</code> {t(`ui.claims.${c.name}`)}
                        </th>
                        <td>
                          {formatDateTime(lang, c.ms, undefined, clock)}
                          <br />
                          <span class="muted">{relative(lang, c.ms - now)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Block title={t('ui.header')} text={json(jwt.header)} t={t} />
          <Block title={t('ui.payload')} text={json(jwt.payload)} t={t} />
          <Block title={t('ui.signature')} text={jwt.signature} empty={t('ui.noSignature')} t={t} />
        </>
      )}
    </div>
  );
}

function Block({ title, text, empty, t }: { title: string; text: string; empty?: string; t: ToolProps['t'] }) {
  return (
    <div class="hash-row">
      <div class="hash-head">
        <strong>{title}</strong>
        <CopyButton text={text} t={t} />
      </div>
      <pre class="mono-out jwt-json">{text || <span class="muted">{empty}</span>}</pre>
    </div>
  );
}
