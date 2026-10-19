import { useState } from 'preact/hooks';
import { LANG_META } from '@/i18n/config';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { countText, type TextStats } from './count';

const STATS: (keyof TextStats)[] = ['words', 'chars', 'charsNoSpaces', 'sentences', 'paragraphs'];

export function WordCounter({ lang, t }: ToolProps) {
  const [text, setText] = useState('');
  const stats = countText(text, LANG_META[lang].intl);

  return (
    <div class="field">
      <label for="wc-text">{t('ui.label')}</label>
      <textarea
        id="wc-text"
        rows={10}
        placeholder={t('ui.placeholder')}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
      />
      <section class="calc-result" aria-live="polite" aria-label={t('calc.result')}>
        {STATS.map((key) => (
          <div class="out" key={key}>
            <span class="out-label">{t(`ui.${key}`)}</span>
            <output class="out-value">{formatNumber(lang, stats[key], 'integer')}</output>
          </div>
        ))}
      </section>
    </div>
  );
}
