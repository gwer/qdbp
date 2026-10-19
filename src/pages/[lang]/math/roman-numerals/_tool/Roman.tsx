import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { convert, MAX, MIN } from './roman';

export function Roman({ t }: ToolProps) {
  const [input, setInput] = useState('2026');
  const r = convert(input);
  const label = r?.kind === 'fromRoman' ? t('ui.arabic') : t('ui.roman');
  const value = !r ? '—' : r.kind === 'error' ? '—' : String(r.value);
  const error =
    r?.kind === 'error' ? (r.reason === 'range' ? t('ui.errorRange', { min: MIN, max: MAX }) : t('ui.errorRoman')) : null;

  return (
    <div>
      <div class="field">
        <label for="rn-input">{t('ui.input')}</label>
        <input
          id="rn-input"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellcheck={false}
          value={input}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'rn-err' : undefined}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {error && (
          <p class="field-error" id="rn-err">
            {error}
          </p>
        )}
      </div>
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        <div class="out out-primary">
          <span class="out-label">{label}</span>
          <output class="out-value">{value}</output>
        </div>
      </section>
    </div>
  );
}
