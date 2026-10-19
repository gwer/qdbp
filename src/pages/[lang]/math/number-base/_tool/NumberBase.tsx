import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { isBase, parseInBase, toBase } from './base';

const COMMON = [2, 8, 10, 16] as const;

export function NumberBase({ t }: ToolProps) {
  const [input, setInput] = useState('255');
  const [from, setFrom] = useState('10');
  const [custom, setCustom] = useState('36');

  const base = Number(from);
  const target = Number(custom);
  const value = parseInBase(input, base);
  const error = !input.trim() ? null : value === null ? t('ui.errorDigit', { base }) : null;
  const targetOk = isBase(target);

  const rows: [string, number][] = COMMON.map((b) => [`ui.base${b}`, b]);

  return (
    <div>
      <form class="calc-inputs" onSubmit={(e) => e.preventDefault()}>
        <div class="field">
          <label for="nb-input">{t('ui.number')}</label>
          <input
            id="nb-input"
            type="text"
            autoComplete="off"
            spellcheck={false}
            value={input}
            aria-invalid={error ? 'true' : undefined}
            onInput={(e) => setInput(e.currentTarget.value)}
          />
        </div>
        <div class="field">
          <label for="nb-from">{t('ui.from')}</label>
          <select id="nb-from" value={from} onChange={(e) => setFrom(e.currentTarget.value)}>
            {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
              <option value={String(b)} key={b}>
                {COMMON.includes(b as (typeof COMMON)[number]) ? t(`ui.base${b}`) : t('ui.baseN', { base: b })}
              </option>
            ))}
          </select>
        </div>
      </form>
      {error && <p class="field-error">{error}</p>}
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        {rows.map(([key, b]) => (
          <div class="out" style={{ flexBasis: '100%' }} key={b}>
            <span class="out-label">{t(key)}</span>
            <output class="out-value" style={MONO}>
              {value === null ? '—' : toBase(value, b)}
            </output>
          </div>
        ))}
        <div class="out" style={{ flexBasis: '100%' }}>
          <label class="out-label" for="nb-target">
            {t('ui.custom')}{' '}
            <input
              id="nb-target"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={custom}
              style={{ width: '4.5em', padding: '2px 6px', marginLeft: '4px' }}
              aria-invalid={targetOk ? undefined : 'true'}
              onInput={(e) => setCustom(e.currentTarget.value)}
            />
          </label>
          <output class="out-value" style={MONO}>
            {!targetOk || value === null ? '—' : toBase(value, target)}
          </output>
          {!targetOk && <p class="field-error">{t('ui.errorBase')}</p>}
        </div>
      </section>
    </div>
  );
}

const MONO = { fontFamily: 'var(--mono)', wordBreak: 'break-all' } as const;
