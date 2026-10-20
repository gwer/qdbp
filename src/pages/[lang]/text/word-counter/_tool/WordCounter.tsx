import { useState } from 'preact/hooks';
import { LANG_META } from '@/i18n/config';
import { formatDurationSeconds } from '@/lib/duration';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { countText, readingSeconds, READ_WPM, SPEAK_WPM, topWords, type TextStats } from './count';

const STATS: (keyof TextStats)[] = ['words', 'chars', 'charsNoSpaces', 'sentences', 'paragraphs'];

export function WordCounter({ lang, t }: ToolProps) {
  const [text, setText] = useState('');
  const locale = LANG_META[lang].intl;
  const stats = countText(text, locale);
  const top = topWords(text, locale);

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
        <div class="out">
          <span class="out-label">{t('ui.reading', { wpm: READ_WPM })}</span>
          <output class="out-value">{formatDurationSeconds(readingSeconds(stats.words, READ_WPM))}</output>
        </div>
        <div class="out">
          <span class="out-label">{t('ui.speaking', { wpm: SPEAK_WPM })}</span>
          <output class="out-value">{formatDurationSeconds(readingSeconds(stats.words, SPEAK_WPM))}</output>
        </div>
      </section>
      {top.length > 0 && (
        <details class="extra">
          <summary>{t('ui.top')}</summary>
          <div class="table-wrap">
            <table>
              <tbody>
                {top.map(({ word, count }) => (
                  <tr key={word}>
                    <td>{word}</td>
                    <td>{formatNumber(lang, count, 'integer')}</td>
                    <td>{formatNumber(lang, (count / stats.words) * 100, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
