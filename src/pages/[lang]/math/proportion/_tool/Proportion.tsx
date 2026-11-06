import { useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import type { ToolProps } from '@/ui/define';
import { formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import { solve, type Kind } from './proportion';

const NAMES = ['A', 'B', 'C', 'D'];

/** Пустое поле — неизвестное (null); undefined — не число. */
function parseCell(s: string, lang: ToolProps['lang']): number | null | undefined {
  if (s.trim() === '') return null;
  return parseNumber(s, lang) ?? undefined;
}

export function Proportion({ lang, t }: ToolProps) {
  const [kind, setKind] = useState<Kind>('direct');
  const [cells, setCells] = useState(['3', '12', '5', '']);
  const n = (v: number) => formatNumber(lang, v, 'number', 6);

  const parsed = cells.map((s) => parseCell(s, lang));
  const invalid = parsed.some((v) => v === undefined);
  const sol = invalid ? null : solve(parsed as (number | null)[], kind);

  const cell = (i: number) => {
    const isX = sol?.ok && sol.index === i;
    return (
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={NAMES[i]}
        class={isX ? 'prop-x' : undefined}
        placeholder={isX ? n(sol.value) : NAMES[i]}
        value={cells[i]}
        aria-invalid={parsed[i] === undefined ? 'true' : undefined}
        onInput={(e) => {
          const next = [...cells];
          next[i] = e.currentTarget.value;
          setCells(next);
        }}
      />
    );
  };
  const op = kind === 'direct' ? <span class="prop-bar" aria-hidden="true" /> : <span class="prop-op">×</span>;

  return (
    <div>
      <Toggle
        label={t('ui.kind')}
        value={kind}
        options={[
          ['direct', t('ui.direct')],
          ['inverse', t('ui.inverse')],
        ]}
        onChange={setKind}
      />
      <div class={`prop prop-${kind}`}>
        <div class="prop-pair">
          {cell(0)}
          {op}
          {cell(1)}
        </div>
        <span class="prop-eq">=</span>
        <div class="prop-pair">
          {cell(2)}
          {op}
          {cell(3)}
        </div>
      </div>
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        {invalid ? (
          <p class="calc-error">{t('calc.error.number')}</p>
        ) : !sol?.ok ? (
          <p class="calc-error">{t(sol?.reason === 'zero' ? 'ui.zero' : 'ui.needOne')}</p>
        ) : (
          <>
            <div class="out out-primary">
              <span class="out-label">{t('ui.result')}</span>
              <output class="out-value">{n(sol.value)}</output>
            </div>
            <p class="muted">
              {NAMES[sol.index]} = {n(sol.p)} × {n(sol.q)} / {n(sol.r)} = <strong>{n(sol.value)}</strong>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
