import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { parseList, stats } from './stats';

export const SAMPLE = '12 15 11 15 18 20 15';
const MODE_LIMIT = 5;

export function Average({ lang, t }: ToolProps) {
  const [text, setText] = useState(SAMPLE);
  const { numbers, invalid } = parseList(text, lang);
  const s = stats(numbers);
  const n = (v: number) => formatNumber(lang, v, 'number', 6);
  const mode = !s ? '—' : s.mode.length === 0 ? t('ui.noMode') : s.mode.slice(0, MODE_LIMIT).map(n).join('; ') + (s.mode.length > MODE_LIMIT ? ' …' : '');

  const rows: [string, string][] = [
    ['median', s ? n(s.median) : '—'],
    ['mode', mode],
    ['count', s ? formatNumber(lang, s.count, 'integer') : '—'],
    ['sum', s ? n(s.sum) : '—'],
    ['min', s ? n(s.min) : '—'],
    ['max', s ? n(s.max) : '—'],
    ['range', s ? n(s.range) : '—'],
  ];

  return (
    <div>
      <div class="field">
        <label for="avg-text">{t('ui.label')}</label>
        <textarea id="avg-text" rows={5} placeholder={t('ui.placeholder')} value={text} onInput={(e) => setText(e.currentTarget.value)} />
        {invalid.length > 0 && <p class="field-error">{t('ui.invalid', { list: invalid.slice(0, 5).join(' ') })}</p>}
      </div>
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        <div class="out out-primary">
          <span class="out-label">{t('ui.mean')}</span>
          <output class="out-value">{s ? n(s.mean) : '—'}</output>
        </div>
        {rows.map(([key, value]) => (
          <div class="out" key={key}>
            <span class="out-label">{t(`ui.${key}`)}</span>
            <output class="out-value">{value}</output>
          </div>
        ))}
      </section>
    </div>
  );
}
