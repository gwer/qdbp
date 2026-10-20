import { useState } from 'preact/hooks';
import { listItems, shuffle } from '@/lib/random';
import type { ToolProps } from '@/ui/define';

export function RandomPicker({ t }: ToolProps) {
  const [text, setText] = useState('');
  const [count, setCount] = useState(1);
  // Результат появляется только по нажатию: жребий не должен меняться сам при наборе списка.
  const [winners, setWinners] = useState<string[] | null>(null);
  const items = listItems(text);
  const n = Math.min(Math.max(1, count), Math.max(1, items.length));

  return (
    <div>
      <div class="field">
        <label for="rp-list">{t('ui.list')}</label>
        <textarea id="rp-list" rows={7} placeholder={t('ui.placeholder')} value={text} onInput={(e) => (setText(e.currentTarget.value), setWinners(null))} />
      </div>
      <div class="calc-inputs">
        <div class="field">
          <label for="rp-count">{t('ui.count')}</label>
          <input id="rp-count" type="text" inputMode="numeric" value={String(count)} onInput={(e) => setCount(Number(e.currentTarget.value) || 1)} />
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" disabled={items.length < 2} onClick={() => setWinners(shuffle(items).slice(0, n))}>
          {t('ui.pick')}
        </button>
        <span class="muted">{t('ui.items', { count: items.length })}</span>
      </div>
      {winners && (
        <ol class="picked" aria-live="polite">
          {winners.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
