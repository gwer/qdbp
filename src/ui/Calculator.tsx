import { useEffect, useRef, useState } from 'preact/hooks';
import { LANG_META, type ClockMode, type Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { clockValue, formatTyped, nowClock, parseClock, parseTyped, splitSuffix } from '@/lib/clock';
import { isValidDate, resolveDateDefault, todayISO } from '@/lib/date';
import { formatDuration, parseDuration } from '@/lib/duration';
import { formatClock, formatDate, formatDateTime, formatInput, formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import type { CalculatorDef, InputSpec, NumberInput, OutputSpec, ToolProps } from './define';
import { readPref, writePref } from './prefs';

type Raw = Record<string, string>;
type Values = Record<string, number | string>;
/** «Сейчас» в браузере пользователя; на сервере и при гидратации — null. */
type Now = { date: string; time: string } | null;

// Цифровые клавиатуры на iOS (decimal, numeric) не содержат минуса. Если поле допускает
// отрицательные значения (min не задан или меньше нуля), цифровую клавиатуру не включаем.
function inputMode(spec: NumberInput): 'numeric' | 'decimal' | undefined {
  if (spec.min === undefined || spec.min < 0) return undefined;
  return spec.type === 'integer' ? 'numeric' : 'decimal';
}

const entries = (def: CalculatorDef) => Object.entries<InputSpec>(def.inputs);

/** Значения по умолчанию в виде текста полей. Пока «сейчас» неизвестно (сервер), поля «today…»/«now» пустые. */
function defaults(def: CalculatorDef, lang: Lang, now: Now, mode: ClockMode): Raw {
  const raw: Raw = {};
  for (const [name, spec] of entries(def)) {
    if (spec.type === 'select') raw[name] = spec.default;
    else if (spec.type === 'date') raw[name] = resolveDateDefault(spec.default, now?.date ?? null) ?? '';
    else if (spec.type === 'time') {
      const canonical = spec.default === 'now' ? now?.time : spec.default;
      raw[name] = canonical ? formatTyped(parseClock(canonical)!, mode) : '';
    }
    else if (spec.type === 'duration') raw[name] = formatDuration(spec.default);
    else raw[name] = formatInput(lang, spec.default);
  }
  return raw;
}

function parseInputs(def: CalculatorDef, raw: Raw, { lang, t }: ToolProps, mode: ClockMode) {
  const values: Values = {};
  const errors: Record<string, string> = {};
  for (const [name, spec] of entries(def)) {
    const s = raw[name];
    if (spec.type === 'select') {
      values[name] = spec.options.includes(s) ? s : spec.default;
    } else if (spec.type === 'date') {
      if (isValidDate(s)) values[name] = s;
      else errors[name] = t('calc.error.date');
    } else if (spec.type === 'time') {
      const m = parseTyped(s, mode);
      if (m === null) errors[name] = t('calc.error.time');
      else values[name] = m;
    } else if (spec.type === 'duration') {
      const m = parseDuration(s, lang);
      if (m === null) errors[name] = t('calc.error.duration');
      else values[name] = m;
    } else {
      const n = parseNumber(s, lang);
      if (n === null) errors[name] = t('calc.error.number');
      else if (spec.type === 'integer' && !Number.isInteger(n)) errors[name] = t('calc.error.integer');
      else if (spec.min !== undefined && n < spec.min) errors[name] = t('calc.error.min', { min: formatNumber(lang, spec.min) });
      else if (spec.max !== undefined && n > spec.max) errors[name] = t('calc.error.max', { max: formatNumber(lang, spec.max) });
      else values[name] = n;
    }
  }
  return { values, errors };
}

// Состояние в query: в URL пишутся только значения, отличные от умолчаний, в каноничной записи:
// числа с точкой, даты 'YYYY-MM-DD', время 'HH:MM', длительности в минутах.
function readQuery(def: CalculatorDef, lang: Lang, mode: ClockMode): Raw {
  const params = new URLSearchParams(location.search);
  const raw: Raw = {};
  for (const [name, spec] of entries(def)) {
    const v = params.get(name);
    if (v === null || v === '') continue;
    if (spec.type === 'select' || spec.type === 'date') raw[name] = v;
    else if (spec.type === 'time') {
      const m = parseClock(v);
      if (m !== null) raw[name] = formatTyped(m, mode);
    }
    else if (!Number.isFinite(Number(v))) continue;
    else if (spec.type === 'duration') raw[name] = formatDuration(Number(v));
    else raw[name] = formatInput(lang, Number(v));
  }
  return raw;
}

function writeQuery(def: CalculatorDef, values: Values, initial: Values) {
  const params = new URLSearchParams();
  for (const [name, spec] of entries(def)) {
    if (!(name in values) || values[name] === initial[name]) continue;
    params.set(name, spec.type === 'time' ? clockValue(values[name] as number) : String(values[name]));
  }
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function formatOutput(lang: Lang, t: T, mode: ClockMode, value: unknown, spec: OutputSpec = {}): string {
  if (spec.type === 'custom') return spec.format(value, { t, lang });
  if (spec.type === 'date') return typeof value === 'string' ? formatDate(lang, value, spec.style) : '—';
  if (spec.type === 'text') return typeof value === 'string' ? value : '—';
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  if (spec.type === 'duration') return formatDuration(value);
  if (spec.type === 'clock') return formatClock(lang, value, mode);
  if (spec.type === 'datetime') return formatDateTime(lang, value, spec.timeZone, mode);
  return formatNumber(lang, value, spec.type, spec.digits);
}

export function Calculator({ def, lang, t }: ToolProps & { def: CalculatorDef }) {
  // Формат времени: по умолчанию — язык страницы, выбор пользователя запоминается на весь сайт.
  const [mode, setMode] = useState<ClockMode>(LANG_META[lang].clock);
  const [raw, setRaw] = useState(() => defaults(def, lang, null, mode));
  // null — ещё не в браузере: пререндер и первый рендер при гидратации совпадают.
  const [now, setNow] = useState<Now>(null);
  const fromUser = useRef(false);

  const usesClock =
    entries(def).some(([, spec]) => spec.type === 'time') ||
    Object.values<OutputSpec | undefined>(def.outputs).some((o) => o?.type === 'clock' || o?.type === 'datetime');

  useEffect(() => {
    const stored = readPref('clock');
    const m: ClockMode = stored === '12' || stored === '24' ? stored : mode;
    const current = { date: todayISO(), time: nowClock() };
    setMode(m);
    setNow(current);
    setRaw((r) => ({ ...r, ...defaults(def, lang, current, m), ...readQuery(def, lang, m) }));
  }, []);

  const switchMode = (next: ClockMode) => {
    if (next === mode) return;
    setRaw((r) => {
      const converted = { ...r };
      for (const [name, spec] of entries(def)) {
        const m = spec.type === 'time' ? parseTyped(r[name], mode) : null;
        if (m !== null) converted[name] = formatTyped(m, next);
      }
      return converted;
    });
    setMode(next);
    writePref('clock', next);
  };

  const { values, errors } = parseInputs(def, raw, { lang, t }, mode);
  const valid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!fromUser.current || !valid || !now) return;
    writeQuery(def, values, parseInputs(def, defaults(def, lang, now, mode), { lang, t }, mode).values);
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

  return (
    <div class="calc">
      {usesClock && (
        <div class="calc-options" role="group" aria-label={t('calc.clock.label')}>
          <span>{t('calc.clock.label')}</span>
          {(['24', '12'] as const).map((m) => (
            <button type="button" key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}>
              {t(m === '24' ? 'calc.clock.h24' : 'calc.clock.h12')}
            </button>
          ))}
        </div>
      )}
      <form class="calc-inputs" onSubmit={(e) => e.preventDefault()}>
        {entries(def).map(([name, spec]) => {
          const id = `in-${name}`;
          // До гидратации поля «сегодня»/«сейчас» пустые — это не ошибка пользователя.
          const error = now ? errors[name] : undefined;
          const common = {
            id,
            value: raw[name],
            'aria-invalid': error ? ('true' as const) : undefined,
            'aria-describedby': error ? `${id}-err` : undefined,
          };
          return (
            <div class="field" key={name}>
              <label for={id}>{t(`inputs.${name}.label`)}</label>
              {spec.type === 'select' ? (
                <select {...common} onChange={(e) => set(name, e.currentTarget.value)}>
                  {spec.options.map((opt) => (
                    <option value={opt} key={opt}>
                      {t(`inputs.${name}.options.${opt}`)}
                    </option>
                  ))}
                </select>
              ) : spec.type === 'date' ? (
                <input {...common} type="date" onInput={(e) => set(name, e.currentTarget.value)} />
              ) : spec.type === 'time' ? (
                <TimeField common={common} raw={raw[name]} mode={mode} onChange={(v) => set(name, v)} />
              ) : (
                <div class="input-wrap">
                  <input
                    {...common}
                    type="text"
                    inputMode={spec.type === 'duration' ? undefined : inputMode(spec)}
                    placeholder={spec.type === 'duration' ? '1:30' : undefined}
                    autoComplete="off"
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
        {Object.entries<OutputSpec | undefined>(def.outputs).map(([name, spec], i) => (
          <div class={i === 0 ? 'out out-primary' : 'out'} key={name}>
            <span class="out-label">{t(`outputs.${name}.label`)}</span>
            <output class="out-value">{result ? formatOutput(lang, t, mode, result[name], spec) : '—'}</output>
          </div>
        ))}
      </section>

      {def.Extra && result && <def.Extra values={values as any} result={result} lang={lang} t={t} />}
    </div>
  );
}

type Common = { id: string; value: string; 'aria-invalid'?: 'true'; 'aria-describedby'?: string };

/**
 * Поле времени. Своё, а не <input type="time">: у нативного формат 12/24 ч задаёт система, а не пользователь.
 * В режиме 12 ч рядом с полем — переключатель AM/PM, его значение хранится суффиксом в тексте поля.
 */
function TimeField({ common, raw, mode, onChange }: { common: Common; raw: string; mode: ClockMode; onChange: (v: string) => void }) {
  const input = (value: string, onInput: (v: string) => void) => (
    <input
      {...common}
      value={value}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={mode === '24' ? '14:30' : '2:30'}
      onInput={(e) => onInput(e.currentTarget.value)}
    />
  );
  if (mode === '24') return input(raw, onChange);
  const { text, suffix } = splitSuffix(raw);
  return (
    <div class="time-12">
      {input(text, (v) => onChange(`${v} ${suffix}`))}
      <select value={suffix} aria-label="AM/PM" onChange={(e) => onChange(`${text} ${e.currentTarget.value}`)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
