import { useEffect, useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import type { ToolProps } from '@/ui/define';
import { MAX_ABS, draw } from './random';

const MAX_COUNT = 1000;

// Общих стилей для чекбоксов и основной кнопки в движке пока нет — локально, на токенах темы.
const CHECKS = { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' } as const;
const CHECK = { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, margin: 0 } as const;
const BUTTON = {
  width: '100%',
  font: 'inherit',
  fontWeight: 600,
  padding: '9px 14px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--accent)',
  color: 'var(--accent-text)',
  cursor: 'pointer',
} as const;

export function Random({ lang, t }: ToolProps) {
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('100');
  const [count, setCount] = useState('1');
  const [unique, setUnique] = useState(true);
  const [sorted, setSorted] = useState(false);
  // Результат появляется только в браузере: при сборке случайных чисел нет.
  const [result, setResult] = useState<number[] | null>(null);

  const int = (s: string) => {
    const n = parseNumber(s, lang);
    return n !== null && Number.isInteger(n) && Math.abs(n) <= MAX_ABS ? n : null;
  };
  const min = int(from);
  const max = int(to);
  const n = int(count);
  let error: string | null = null;
  if (min === null || max === null) error = t('calc.error.integer');
  else if (min > max) error = t('ui.errorRange');
  else if (n === null || n < 1 || n > MAX_COUNT) error = t('ui.errorCount', { max: MAX_COUNT });
  else if (unique && n > max - min + 1) error = t('ui.errorUnique', { max: formatNumber(lang, max - min + 1, 'integer') });

  const generate = () => {
    if (error) return;
    const xs = draw({ min: min!, max: max!, count: n!, unique });
    setResult(sorted ? xs.sort((a, b) => a - b) : xs);
  };

  useEffect(generate, []);

  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <div class="field">
      <label for={id}>{label}</label>
      <input id={id} type="text" autoComplete="off" value={value} onInput={(e) => set(e.currentTarget.value)} />
    </div>
  );

  return (
    <div>
      <form
        class="calc-inputs"
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
      >
        {field('rnd-from', t('ui.from'), from, setFrom)}
        {field('rnd-to', t('ui.to'), to, setTo)}
        {field('rnd-count', t('ui.count'), count, setCount)}
        <div class="field" style={CHECKS}>
          <label style={CHECK}>
            <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.currentTarget.checked)} /> {t('ui.unique')}
          </label>
          <label style={CHECK}>
            <input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.currentTarget.checked)} /> {t('ui.sort')}
          </label>
        </div>
        <div class="field" style={{ alignSelf: 'end' }}>
          <button type="submit" style={BUTTON} disabled={!!error}>
            {t('ui.generate')}
          </button>
        </div>
      </form>
      {error && <p class="field-error">{error}</p>}
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        <div class="out out-primary">
          <span class="out-label">{t('ui.result')}</span>
          <output class="out-value random-values">
            {result ? result.map((x) => formatNumber(lang, x, 'integer')).join(', ') : '—'}
          </output>
        </div>
      </section>
    </div>
  );
}
