import { useEffect, useRef, useState } from 'preact/hooks';
import { formatInput, formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import type { CalculatorDef, InputSpec, ToolProps } from './define';

type Raw = Record<string, string>;

function defaults(def: CalculatorDef, lang: ToolProps['lang']): Raw {
  const raw: Raw = {};
  for (const [name, spec] of Object.entries(def.inputs)) {
    raw[name] = spec.type === 'select' ? spec.default : formatInput(lang, spec.default);
  }
  return raw;
}

type Parsed = { values: Record<string, number | string>; errors: Record<string, string> };

function parseInputs(def: CalculatorDef, raw: Raw, { lang, t }: ToolProps): Parsed {
  const values: Parsed['values'] = {};
  const errors: Parsed['errors'] = {};
  for (const [name, spec] of Object.entries<InputSpec>(def.inputs)) {
    if (spec.type === 'select') {
      values[name] = spec.options.includes(raw[name]) ? raw[name] : spec.default;
      continue;
    }
    const n = parseNumber(raw[name], lang);
    if (n === null) errors[name] = t('calc.error.number');
    else if (spec.type === 'integer' && !Number.isInteger(n)) errors[name] = t('calc.error.integer');
    else if (spec.min !== undefined && n < spec.min) errors[name] = t('calc.error.min', { min: formatNumber(lang, spec.min) });
    else if (spec.max !== undefined && n > spec.max) errors[name] = t('calc.error.max', { max: formatNumber(lang, spec.max) });
    else values[name] = n;
  }
  return { values, errors };
}

// Состояние в query: в URL пишутся только значения, отличные от умолчаний,
// числа — в каноничной записи (точка как десятичный разделитель).
function readQuery(def: CalculatorDef, lang: ToolProps['lang']): Raw {
  const params = new URLSearchParams(location.search);
  const raw: Raw = {};
  for (const [name, spec] of Object.entries<InputSpec>(def.inputs)) {
    const v = params.get(name);
    if (v === null) continue;
    if (spec.type === 'select') raw[name] = v;
    else if (v !== '' && Number.isFinite(Number(v))) raw[name] = formatInput(lang, Number(v));
  }
  return raw;
}

function writeQuery(def: CalculatorDef, values: Parsed['values']) {
  const params = new URLSearchParams();
  for (const [name, spec] of Object.entries<InputSpec>(def.inputs)) {
    if (name in values && values[name] !== spec.default) params.set(name, String(values[name]));
  }
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

export function Calculator({ def, lang, t }: ToolProps & { def: CalculatorDef }) {
  const [raw, setRaw] = useState(() => defaults(def, lang));
  const fromUser = useRef(false);

  useEffect(() => {
    const fromUrl = readQuery(def, lang);
    if (Object.keys(fromUrl).length) setRaw((r) => ({ ...r, ...fromUrl }));
  }, []);

  const { values, errors } = parseInputs(def, raw, { lang, t });
  const valid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (fromUser.current && valid) writeQuery(def, values);
  }, [raw]);

  let result: Record<string, unknown> | null = null;
  if (valid) {
    try {
      result = def.compute(values) as Record<string, unknown>;
    } catch {
      result = null;
    }
  }

  const set = (name: string, value: string) => {
    fromUser.current = true;
    setRaw((r) => ({ ...r, [name]: value }));
  };

  const outputs = Object.entries(def.outputs);

  return (
    <div class="calc">
      <form class="calc-inputs" onSubmit={(e) => e.preventDefault()}>
        {Object.entries<InputSpec>(def.inputs).map(([name, spec]) => {
          const id = `in-${name}`;
          const error = errors[name];
          return (
            <div class="field" key={name}>
              <label for={id}>{t(`inputs.${name}.label`)}</label>
              {spec.type === 'select' ? (
                <select id={id} value={raw[name]} onChange={(e) => set(name, e.currentTarget.value)}>
                  {spec.options.map((opt) => (
                    <option value={opt} key={opt}>
                      {t(`inputs.${name}.options.${opt}`)}
                    </option>
                  ))}
                </select>
              ) : (
                <div class="input-wrap">
                  <input
                    id={id}
                    type="text"
                    inputMode={spec.type === 'integer' ? 'numeric' : 'decimal'}
                    autoComplete="off"
                    value={raw[name]}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? `${id}-err` : undefined}
                    onInput={(e) => set(name, e.currentTarget.value)}
                  />
                  {spec.type === 'percent' && <span class="suffix">%</span>}
                </div>
              )}
              {error && (
                <p class="field-error" id={`${id}-err`}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </form>

      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        {outputs.map(([name, spec], i) => (
          <div class={i === 0 ? 'out out-primary' : 'out'} key={name}>
            <span class="out-label">{t(`outputs.${name}.label`)}</span>
            <output class="out-value">
              {result && typeof result[name] === 'number'
                ? formatNumber(lang, result[name] as number, spec?.type, spec?.digits)
                : '—'}
            </output>
          </div>
        ))}
      </section>

      {def.Extra && result && <def.Extra values={values as any} result={result} lang={lang} t={t} />}
    </div>
  );
}
