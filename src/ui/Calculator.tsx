import { useEffect, useRef, useState } from 'preact/hooks';
import { LANG_META, type ClockMode, type Lang, type UnitSystem } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { clockValue, formatTyped, nowClock, parseClock, parseTyped } from '@/lib/clock';
import { isValidDate, resolveDateDefault, todayISO } from '@/lib/date';
import { formatDateInput, parseDateInput } from '@/lib/date-input';
import { formatDuration, formatDurationSeconds, parseDuration, parseDurationSeconds } from '@/lib/duration';
import { formatClock, formatDate, formatDateTime, formatInput, formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import { convert, displayUnit, forField, parseFeetInches, tidy, unitSymbol } from '@/lib/units';
import { InputError, type CalculatorDef, type InputSpec, type NumberInput, type OutputSpec, type QuantityInput, type ToolProps } from './define';
import { readPref, writePref } from './prefs';
import { DateField } from './DateField';
import { TimeField } from './TimeField';

type Raw = Record<string, string>;
type Values = Record<string, number | string>;
/** «Сейчас» в браузере пользователя; на сервере и при гидратации — null. */
type Now = { date: string; time: string } | null;
/** Всё, от чего зависит разбор и показ значений: язык и настройки пользователя. */
type Env = { lang: Lang; t: T; clock: ClockMode; units: UnitSystem };

// Цифровые клавиатуры на iOS (decimal, numeric) не содержат минуса. Если поле допускает
// отрицательные значения (min не задан или меньше нуля), цифровую клавиатуру не включаем.
function inputMode(spec: NumberInput | QuantityInput): 'numeric' | 'decimal' | undefined {
  if (spec.min === undefined || spec.min < 0) return undefined;
  return spec.type === 'integer' ? 'numeric' : 'decimal';
}

const entries = (def: CalculatorDef) => Object.entries<InputSpec>(def.inputs);
const outputs = (def: CalculatorDef) => Object.entries<OutputSpec | undefined>(def.outputs);

/**
 * Точные значения величин, показанных в полях с округлением (после конвертации единиц).
 * Пока пользователь не правил поле, расчёт берёт точное значение, а не разбирает «19,69 ft»
 * обратно в 6,0015 м: иначе переключение систем единиц накапливало бы погрешность.
 */
type Exact = Record<string, { text: string; value: number }>;

/** Значение величины (в unit поля) → текст поля в единице выбранной системы. */
function quantityText(spec: QuantityInput, value: number, env: Env, exact?: Exact, name?: string): string {
  const text = formatInput(env.lang, forField(convert(value, spec.unit, displayUnit(spec, env.units))));
  if (exact && name) exact[name] = { text, value };
  return text;
}

/** Видно ли поле при текущем выборе в select'ах (showIf). */
function visible(spec: InputSpec, selected: Record<string, unknown>): boolean {
  return Object.entries(spec.showIf ?? {}).every(([field, want]) =>
    typeof want === 'string' ? selected[field] === want : want.includes(selected[field] as string),
  );
}

/** Выбор в select'ах: из chosen (текущие поля или URL), если там допустимое значение, иначе по умолчанию. */
function selection(def: CalculatorDef, lang: Lang, chosen: Raw): Raw {
  const out: Raw = {};
  for (const [name, spec] of entries(def)) {
    if (spec.type !== 'select') continue;
    out[name] = spec.options.includes(chosen[name]) ? chosen[name] : (spec.byLang?.[lang] ?? spec.default);
  }
  return out;
}

/**
 * Значения по умолчанию в виде текста полей. Пока «сейчас» неизвестно (сервер), поля «today…»/«now» пустые.
 * chosen — текущий выбор в select'ах: от него зависят значения по умолчанию с defaultBy.
 */
function defaults(def: CalculatorDef, env: Env, now: Now, exact?: Exact, chosen: Raw = {}): Raw {
  const selected = selection(def, env.lang, chosen);
  const raw: Raw = {};
  for (const [name, input] of entries(def)) {
    // Значение по умолчанию: по выбору в select (defaultBy), для языка страницы (byLang) или общее.
    const byMode =
      'defaultBy' in input && input.defaultBy
        ? Object.entries(input.defaultBy).map(([field, map]) => map[selected[field]]).find((v) => v !== undefined)
        : undefined;
    const byLang = 'byLang' in input ? input.byLang?.[env.lang] : undefined;
    const spec = (byMode ?? byLang) !== undefined ? ({ ...input, default: byMode ?? byLang } as InputSpec) : input;
    if (spec.type === 'select') raw[name] = selected[name];
    else if (spec.type === 'date') {
      const iso = resolveDateDefault(spec.default, now?.date ?? null);
      raw[name] = iso ? formatDateInput(iso, env.lang) : '';
    }
    else if (spec.type === 'time') {
      const canonical = spec.default === 'now' ? now?.time : spec.default;
      raw[name] = canonical ? formatTyped(parseClock(canonical)!, env.clock) : '';
    } else if (spec.type === 'duration') raw[name] = spec.seconds ? formatDurationSeconds(spec.default) : formatDuration(spec.default);
    else if (spec.type === 'quantity') {
      raw[name] =
        env.units === 'imperial' && spec.imperial && spec.defaultImperial !== undefined
          ? formatInput(env.lang, spec.defaultImperial)
          : quantityText(spec, spec.default, env, exact, name);
    } else raw[name] = formatInput(env.lang, spec.default);
  }
  return raw;
}

function parseInputs(def: CalculatorDef, raw: Raw, env: Env, now: Now, exact?: Exact) {
  const { lang, t } = env;
  const values: Values = {};
  const errors: Record<string, string> = {};
  // Скрытые поля (showIf) не проверяются: в расчёт уходит их значение по умолчанию.
  let fallback: Raw | null = null;
  for (const [name, spec] of entries(def)) {
    const shown = visible(spec, raw);
    const s = shown ? raw[name] : (fallback ??= defaults(def, env, now, undefined, raw))[name];
    if (spec.type === 'select') {
      values[name] = spec.options.includes(s) ? s : spec.default;
    } else if (spec.type === 'date') {
      const iso = parseDateInput(s, lang);
      if (iso) values[name] = iso;
      else errors[name] = t('calc.error.date');
    } else if (spec.type === 'time') {
      const m = parseTyped(s, env.clock);
      if (m === null) errors[name] = t('calc.error.time');
      else values[name] = m;
    } else if (spec.type === 'duration') {
      const m = spec.seconds ? parseDurationSeconds(s, lang) : parseDuration(s, lang);
      if (m === null) errors[name] = t(spec.seconds ? 'calc.error.durationSeconds' : 'calc.error.duration');
      else values[name] = m;
    } else {
      const unit = spec.type === 'quantity' ? displayUnit(spec, env.units) : null;
      const shown = parseNumber(s, lang) ?? (unit === 'in' ? parseFeetInches(s) : null);
      // Величины проверяются и передаются в расчёт в единице инструмента.
      const kept = spec.type === 'quantity' && exact?.[name]?.text === s ? exact[name].value : null;
      const n = kept ?? (shown !== null && spec.type === 'quantity' ? convert(shown, displayUnit(spec, env.units), spec.unit) : shown);
      const bound = (b: number) =>
        formatNumber(lang, spec.type === 'quantity' ? tidy(convert(b, spec.unit, displayUnit(spec, env.units))) : b);
      if (n === null) errors[name] = t('calc.error.number');
      else if (spec.type === 'integer' && !Number.isInteger(n)) errors[name] = t('calc.error.integer');
      else if (spec.min !== undefined && n < spec.min) errors[name] = t('calc.error.min', { min: bound(spec.min) });
      else if (spec.max !== undefined && n > spec.max) errors[name] = t('calc.error.max', { max: bound(spec.max) });
      else values[name] = n;
    }
  }
  return { values, errors };
}

// Состояние в query: в URL пишутся только значения, отличные от умолчаний, в каноничной записи,
// не зависящей от настроек пользователя: числа с точкой, даты 'YYYY-MM-DD', время 'HH:MM' (24 ч),
// длительности в минутах, величины — в единице инструмента (метрической).
function readQuery(def: CalculatorDef, env: Env, exact?: Exact): Raw {
  const params = new URLSearchParams(location.search);
  const raw: Raw = {};
  for (const [name, spec] of entries(def)) {
    const v = params.get(name);
    if (v === null || v === '') continue;
    if (spec.type === 'select') raw[name] = v;
    else if (spec.type === 'date') {
      if (isValidDate(v)) raw[name] = formatDateInput(v, env.lang);
    }
    else if (spec.type === 'time') {
      const m = parseClock(v);
      if (m !== null) raw[name] = formatTyped(m, env.clock);
    } else if (!Number.isFinite(Number(v))) continue;
    else if (spec.type === 'duration') raw[name] = spec.seconds ? formatDurationSeconds(Number(v)) : formatDuration(Number(v));
    else if (spec.type === 'quantity') raw[name] = quantityText(spec, Number(v), env, exact, name);
    else raw[name] = formatInput(env.lang, Number(v));
  }
  return raw;
}

function writeQuery(def: CalculatorDef, values: Values, initial: Values) {
  const params = new URLSearchParams();
  for (const [name, spec] of entries(def)) {
    if (!(name in values) || values[name] === initial[name] || !visible(spec, values)) continue;
    const v = values[name];
    params.set(name, spec.type === 'time' ? clockValue(v as number) : spec.type === 'quantity' ? String(tidy(v as number)) : String(v));
  }
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function formatOutput(env: Env, value: unknown, spec: OutputSpec = {}): string {
  const { lang, t } = env;
  if (spec.type === 'custom') return spec.format(value, env);
  if (spec.type === 'date') return typeof value === 'string' ? formatDate(lang, value, spec.style) : '—';
  if (spec.type === 'text') return typeof value === 'string' ? value : '—';
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  if (spec.type === 'duration') return spec.seconds ? formatDurationSeconds(value) : formatDuration(value);
  if (spec.type === 'clock') return formatClock(lang, value, env.clock);
  if (spec.type === 'datetime') return formatDateTime(lang, value, spec.timeZone, env.clock);
  if (spec.type === 'quantity') {
    const unit = displayUnit(spec, env.units);
    return `${formatNumber(lang, convert(value, spec.unit, unit), 'number', spec.digits ?? 2)} ${unitSymbol(lang, unit)}`;
  }
  return formatNumber(lang, value, spec.type, spec.digits);
}

/**
 * Переносит текст полей при смене настройки: разбирает в старом окружении, показывает в новом.
 * Поле, где осталось значение по умолчанию, получает «круглое» значение по умолчанию новой системы.
 */
function reformat(def: CalculatorDef, raw: Raw, from: Env, to: Env, now: Now, exact: Exact): Raw {
  const out = { ...raw };
  const { values } = parseInputs(def, raw, from, now, exact);
  const oldDefaults = defaults(def, from, now, undefined, raw);
  for (const [name, spec] of entries(def)) {
    if (!(name in values)) continue;
    if (spec.type === 'time') out[name] = formatTyped(values[name] as number, to.clock);
    if (spec.type === 'quantity' && from.units !== to.units) {
      out[name] =
        raw[name] === oldDefaults[name]
          ? defaults(def, to, now, exact, raw)[name]
          : quantityText(spec, values[name] as number, to, exact, name);
    }
  }
  return out;
}

export function Calculator({ def, lang, t }: ToolProps & { def: CalculatorDef }) {
  // Настройки: по умолчанию — по языку страницы, выбор пользователя запоминается на весь сайт.
  const [clock, setClock] = useState<ClockMode>(LANG_META[lang].clock);
  const [units, setUnits] = useState<UnitSystem>(LANG_META[lang].units);
  const env: Env = { lang, t, clock, units };
  const exact = useRef<Exact>({}).current;
  const [raw, setRaw] = useState(() => defaults(def, env, null, exact));
  // null — ещё не в браузере: пререндер и первый рендер при гидратации совпадают.
  const [now, setNow] = useState<Now>(null);
  const fromUser = useRef(false);

  const usesClock =
    entries(def).some(([, spec]) => spec.type === 'time') ||
    outputs(def).some(([, o]) => o?.type === 'clock' || o?.type === 'datetime');
  const usesUnits =
    entries(def).some(([, spec]) => spec.type === 'quantity' && spec.imperial) ||
    outputs(def).some(([, o]) => o?.type === 'quantity' && o.imperial);

  useEffect(() => {
    const storedClock = readPref('clock');
    const storedUnits = readPref('units');
    const e: Env = {
      ...env,
      clock: storedClock === '12' || storedClock === '24' ? storedClock : clock,
      units: storedUnits === 'metric' || storedUnits === 'imperial' ? storedUnits : units,
    };
    const current = { date: todayISO(), time: nowClock() };
    setClock(e.clock);
    setUnits(e.units);
    setNow(current);
    const query = readQuery(def, e, exact);
    setRaw((r) => ({ ...r, ...defaults(def, e, current, exact, query), ...query }));
  }, []);

  // Сохраняется только изменённая настройка: остальные остаются «по языку страницы».
  const switchSetting = (key: 'clock' | 'units', value: string) => {
    const next = { ...env, [key]: value } as Env;
    setRaw((r) => reformat(def, r, env, next, now, exact));
    setClock(next.clock);
    setUnits(next.units);
    writePref(key, value);
  };

  const { values, errors } = parseInputs(def, raw, env, now, exact);
  const valid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!fromUser.current || !valid || !now) return;
    const initialExact: Exact = {};
    // Выбор в select'ах сравнивается с обычным умолчанием, остальные поля — с умолчанием для текущего выбора.
    const initial = { ...defaults(def, env, now, initialExact, raw), ...selection(def, lang, {}) };
    writeQuery(def, values, parseInputs(def, initial, env, now, initialExact).values);
  }, [raw]);

  let result: Record<string, unknown> | null = null;
  let computeError: string | null = null;
  if (valid) {
    try {
      result = def.compute(values) as Record<string, unknown>;
    } catch (e) {
      // Поля по отдельности верны, но вместе расчёт невозможен: объясняем, а не показываем прочерки.
      computeError = e instanceof InputError && def.errors?.includes(e.key) ? t(`errors.${e.key}`) : t('calc.error.compute');
    }
  }

  const set = (name: string, value: string) => {
    fromUser.current = true;
    setRaw((r) => {
      const next = { ...r, [name]: value };
      // Смена выбора в select: поля, где стояло прежнее значение по умолчанию (defaultBy), получают новое.
      if (def.inputs[name]?.type === 'select') {
        const before = defaults(def, env, now, undefined, r);
        const after = defaults(def, env, now, undefined, next);
        for (const [field] of entries(def)) {
          if (field !== name && before[field] !== after[field] && r[field] === before[field]) next[field] = after[field];
        }
      }
      return next;
    });
  };

  return (
    <div class="calc">
      {(usesUnits || usesClock) && (
        <div class="calc-settings">
          {usesUnits && (
            <Toggle
              label={t('calc.units.label')}
              value={units}
              options={[
                ['metric', t('calc.units.metric')],
                ['imperial', t('calc.units.imperial')],
              ]}
              onChange={(u) => switchSetting('units', u)}
            />
          )}
          {usesClock && (
            <Toggle
              label={t('calc.clock.label')}
              value={clock}
              options={[
                ['24', t('calc.clock.h24')],
                ['12', t('calc.clock.h12')],
              ]}
              onChange={(c) => switchSetting('clock', c)}
            />
          )}
        </div>
      )}
      <form class="calc-inputs" onSubmit={(e) => e.preventDefault()}>
        {entries(def).map(([name, spec]) => {
          if (!visible(spec, raw)) return null;
          const id = `in-${name}`;
          // До гидратации поля «сегодня»/«сейчас» пустые — это не ошибка пользователя.
          const error = now ? errors[name] : undefined;
          const common = {
            id,
            value: raw[name],
            'aria-invalid': error ? ('true' as const) : undefined,
            'aria-describedby': error ? `${id}-err` : undefined,
          };
          const suffix =
            spec.type === 'percent' ? '%' : spec.type === 'quantity' ? unitSymbol(lang, displayUnit(spec, units)) : null;
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
                <DateField common={common} raw={raw[name]} lang={lang} t={t} onChange={(v) => set(name, v)} />
              ) : spec.type === 'time' ? (
                <TimeField common={common} raw={raw[name]} mode={clock} onChange={(v) => set(name, v)} />
              ) : (
                <div class="input-wrap">
                  <input
                    {...common}
                    style={suffix ? { paddingRight: `${1.4 + 0.6 * suffix.length}em` } : undefined}
                    type="text"
                    inputMode={spec.type === 'duration' ? undefined : inputMode(spec)}
                    placeholder={spec.type === 'duration' ? (spec.seconds ? '45:30' : '1:30') : undefined}
                    autoComplete="off"
                    onInput={(e) => set(name, e.currentTarget.value)}
                  />
                  {suffix && <span class="suffix">{suffix}</span>}
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
        {computeError ? (
          <p class="calc-error">{computeError}</p>
        ) : (
          outputs(def).map(([name, spec], i) => (
            <div class={i === 0 ? 'out out-primary' : 'out'} key={name}>
              <span class="out-label">{t(`outputs.${name}.label`)}</span>
              <output class="out-value">{result ? formatOutput(env, result[name], spec) : '—'}</output>
            </div>
          ))
        )}
      </section>

      {def.Extra && result && <def.Extra values={values as any} result={result} lang={lang} t={t} />}
    </div>
  );
}

export function Toggle<V extends string>(props: { label: string; value: V; options: [V, string][]; onChange: (v: V) => void }) {
  return (
    <div class="calc-options" role="group" aria-label={props.label}>
      <span>{props.label}</span>
      {props.options.map(([v, text]) => (
        <button type="button" key={v} aria-pressed={props.value === v} onClick={() => v !== props.value && props.onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
