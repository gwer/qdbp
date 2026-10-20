import { useEffect, useRef, useState } from 'preact/hooks';
import { LANG_META, type Lang } from '@/i18n/config';
import { formatInput } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import type { ToolProps } from '@/ui/define';
import { convertValue, DIMENSIONS, isValid, unitOf, type Dimension, type Unit } from './units';

export interface ConverterDefaults {
  value: number;
  from: string;
  to: string;
}

const formatters = new Map<string, Intl.NumberFormat>();

/** До 8 значащих цифр: 1 дюйм = 25,4 мм, 1 ГиБ = 1 073 741 824 байт — без хвостов плавающей точки. */
export function formatValue(lang: Lang, n: number): string {
  let f = formatters.get(lang);
  if (!f) formatters.set(lang, (f = new Intl.NumberFormat(LANG_META[lang].intl, { maximumSignificantDigits: 8 })));
  return f.format(n).replace(/[   ]/g, ' ');
}

function readQuery(dim: Dimension) {
  const p = new URLSearchParams(location.search);
  const v = Number(p.get('v'));
  const from = p.get('from');
  const to = p.get('to');
  return {
    value: p.get('v') !== null && Number.isFinite(v) ? v : undefined,
    from: from && unitOf(dim, from) ? from : undefined,
    to: to && unitOf(dim, to) ? to : undefined,
  };
}

export function Converter({ dim, defaults, lang, t }: ToolProps & { dim: Dimension; defaults: ConverterDefaults }) {
  const units = DIMENSIONS[dim] as Unit[];
  const [raw, setRaw] = useState(formatInput(lang, defaults.value));
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const fromUser = useRef(false);

  useEffect(() => {
    const q = readQuery(dim);
    if (q.value !== undefined) setRaw(formatInput(lang, q.value));
    if (q.from) setFrom(q.from);
    if (q.to) setTo(q.to);
  }, []);

  const value = parseNumber(raw, lang);
  const valid = value !== null && isValid(dim, value, from);

  useEffect(() => {
    if (!fromUser.current || !valid) return;
    const p = new URLSearchParams();
    if (value !== defaults.value) p.set('v', String(value));
    if (from !== defaults.from) p.set('from', from);
    if (to !== defaults.to) p.set('to', to);
    const q = p.toString();
    history.replaceState(null, '', q ? `?${q}` : location.pathname);
  }, [raw, from, to]);

  const user = <T,>(fn: (v: T) => void) => (v: T) => {
    fromUser.current = true;
    fn(v);
  };

  const name = (id: string) => t(`ui.units.${id}`);
  const select = (id: string, current: string, onChange: (v: string) => void) => (
    <select id={id} value={current} onChange={(e) => onChange(e.currentTarget.value)}>
      {units.map((u) => (
        <option value={u.id} key={u.id}>
          {name(u.id)}
        </option>
      ))}
    </select>
  );

  return (
    <div class="converter">
      <div class="calc-inputs">
        <div class="field">
          <label for="cv-value">{t('ui.value')}</label>
          <input
            id="cv-value"
            type="text"
            inputMode={dim === 'temperature' ? undefined : 'decimal'}
            autoComplete="off"
            value={raw}
            aria-invalid={valid ? undefined : 'true'}
            onInput={(e) => user(setRaw)(e.currentTarget.value)}
          />
          {!valid && <p class="field-error">{value === null ? t('ui.error') : t('ui.invalid')}</p>}
        </div>
        <div class="field">
          <label for="cv-from">{t('ui.from')}</label>
          {select('cv-from', from, user(setFrom))}
        </div>
        <div class="field">
          <label for="cv-to">{t('ui.to')}</label>
          {select('cv-to', to, user(setTo))}
        </div>
      </div>
      <div class="actions">
        <button
          type="button"
          class="btn btn-secondary btn-small"
          onClick={() => {
            fromUser.current = true;
            setFrom(to);
            setTo(from);
          }}
        >
          ⇅ {t('ui.swap')}
        </button>
      </div>
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        <div class="out out-primary">
          <span class="out-label">{name(to)}</span>
          <output class="out-value">{valid ? formatValue(lang, convertValue(dim, value!, from, to)) : '—'}</output>
        </div>
      </section>
      {valid && (
        <details class="extra" open>
          <summary>{t('ui.table', { value: formatValue(lang, value!), unit: name(from) })}</summary>
          <div class="table-wrap">
            <table class="kv">
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <th scope="row">{u.id === to ? <strong>{name(u.id)}</strong> : name(u.id)}</th>
                    <td class="mono">
                      {u.id === to ? (
                        <strong>{formatValue(lang, convertValue(dim, value!, from, u.id))}</strong>
                      ) : (
                        formatValue(lang, convertValue(dim, value!, from, u.id))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
