import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { InputError } from '@/ui/define';
import { formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import { fractions, type Op } from './fractions';

const OPS: [Op, string][] = [
  ['add', '+'],
  ['subtract', '−'],
  ['multiply', '×'],
  ['divide', '÷'],
];
type Name = 'w1' | 'n1' | 'd1' | 'w2' | 'n2' | 'd2';

/** Дробь в две строки: числитель над чертой; целое число — без черты; mixed — с выделением целой части. */
function Frac({ p, q, mixed }: { p: bigint; q: bigint; mixed?: boolean }) {
  const sign = p < 0n ? '−' : '';
  const a = p < 0n ? -p : p;
  if (q === 1n) return <>{sign + a}</>;
  const whole = mixed ? a / q : 0n;
  const rest = mixed ? a % q : a;
  return (
    <>
      {sign}
      {whole > 0n && `${whole} `}
      <span class="frac">
        <span>{String(rest)}</span>
        <span>{String(q)}</span>
      </span>
    </>
  );
}

export function Fractions({ lang, t }: ToolProps) {
  const [op, setOp] = useState<Op>('add');
  const [f, setF] = useState<Record<Name, string>>({ w1: '', n1: '1', d1: '2', w2: '', n2: '1', d2: '3' });

  // Целая часть может быть пустой (0), числитель и знаменатель — обязательны, знаменатель ≥ 1.
  const errors: Partial<Record<Name, string>> = {};
  const v = {} as Record<Name, number>;
  for (const name of Object.keys(f) as Name[]) {
    const s = f[name];
    const n = name[0] === 'w' && s.trim() === '' ? 0 : parseNumber(s, lang);
    if (n === null) errors[name] = t('calc.error.number');
    else if (!Number.isInteger(n)) errors[name] = t('calc.error.integer');
    else if (name[0] === 'd' && n < 1) errors[name] = t('calc.error.min', { min: 1 });
    else v[name] = n;
  }
  const firstError = Object.values(errors)[0];

  let result: ReturnType<typeof fractions> | null = null;
  let computeError = '';
  if (!firstError) {
    try {
      result = fractions(v.n1, v.d1, op, v.n2, v.d2, v.w1, v.w2);
    } catch (e) {
      computeError = e instanceof InputError ? t(`errors.${e.key}`) : t('calc.error.compute');
    }
  }

  const input = (name: Name, cls?: string) => (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      class={cls}
      aria-label={t(`ui.${name}`)}
      placeholder={name[0] === 'w' ? '0' : undefined}
      value={f[name]}
      aria-invalid={errors[name] ? 'true' : undefined}
      onInput={(e) => setF({ ...f, [name]: e.currentTarget.value })}
    />
  );
  const operand = (i: 1 | 2) => (
    <div class="frac-operand">
      {input(`w${i}`, 'frac-whole')}
      <div class="prop-pair">
        {input(`n${i}`)}
        <span class="prop-bar" aria-hidden="true" />
        {input(`d${i}`)}
      </div>
    </div>
  );

  const [p, q] = result?.value ?? [0n, 1n];
  const hasMixed = result && q !== 1n && (p < 0n ? -p : p) > q;

  return (
    <div>
      <div class="prop frac-calc">
        {operand(1)}
        <select class="frac-op" aria-label={t('ui.op')} value={op} onChange={(e) => setOp(e.currentTarget.value as Op)}>
          {OPS.map(([o, sign]) => (
            <option key={o} value={o}>
              {sign}
            </option>
          ))}
        </select>
        {operand(2)}
      </div>
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        {firstError || computeError ? (
          <p class="calc-error">{firstError || computeError}</p>
        ) : (
          result && (
            <>
              <div class="out out-primary">
                <span class="out-label">{t('ui.fraction')}</span>
                <output class="out-value">
                  <Frac p={p} q={q} />
                </output>
              </div>
              {hasMixed && (
                <div class="out">
                  <span class="out-label">{t('ui.mixed')}</span>
                  <output class="out-value">
                    <Frac p={p} q={q} mixed />
                  </output>
                </div>
              )}
              <div class="out">
                <span class="out-label">{t('ui.decimal')}</span>
                <output class="out-value">{formatNumber(lang, result.decimal, 'number', 6)}</output>
              </div>
            </>
          )
        )}
      </section>
      {result && (
        <details class="extra" open>
          <summary>{t('ui.solution')}</summary>
          <ol class="steps">
            {result.steps.map((s, i) => (
              <li key={i}>{t(`ui.steps.${s.key}`, s.params)}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
