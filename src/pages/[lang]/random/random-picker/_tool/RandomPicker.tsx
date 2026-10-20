import { useEffect, useRef, useState } from 'preact/hooks';
import { listItems, randomInt, shuffle } from '@/lib/random';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { IntField } from '@/ui/files/fields';
import { SPIN_MS, spinTo, Wheel, WHEEL_MAX } from './Wheel';

export function RandomPicker({ t }: ToolProps) {
  const [text, setText] = useState('');
  const [count, setCount] = useState(1);
  // Результат появляется только по нажатию: жребий не должен меняться сам при наборе списка.
  const [winners, setWinners] = useState<string[] | null>(null);
  const items = listItems(text);
  const n = Math.min(Math.max(1, count), Math.max(1, items.length));
  // Колесо — когда выбирают одного и вариантов не слишком много. Пока список пуст, колесо показывает пример.
  const sample = listItems(t('ui.placeholder'));
  const wheelItems = items.length >= 2 ? items : sample;
  const wheel = n === 1 && wheelItems.length <= WHEEL_MAX;
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = () => {
    if (!wheel) return setWinners(shuffle(items).slice(0, n));
    const w = randomInt(items.length);
    setWinners(null);
    setAngle((a) => spinTo(a, w, items.length));
    // Без анимации, если в системе включено «уменьшение движения».
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSpinning(!reduce);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (setSpinning(false), setWinners([items[w]])), reduce ? 0 : SPIN_MS);
  };

  return (
    <div>
      <div class="field">
        <label for="rp-list">{t('ui.list')}</label>
        <textarea id="rp-list" rows={7} placeholder={t('ui.placeholder')} value={text} onInput={(e) => (setText(e.currentTarget.value), setWinners(null), setAngle(0))} />
      </div>
      <div class="calc-inputs">
        <IntField id="rp-count" label={t('ui.count')} value={count} min={1} max={10000} onChange={setCount} />
      </div>
      {wheel && <Wheel items={wheelItems} angle={angle} spinning={spinning} preview={items.length < 2} label={t('ui.wheel')} />}
      <div class="actions">
        <button type="button" class="btn" disabled={items.length < 2 || spinning} onClick={pick}>
          {t('ui.pick')}
        </button>
        <span class="muted">{t('ui.items', { count: items.length })}</span>
      </div>
      {winners && (
        <>
          <ol class="picked" aria-live="polite">
            {winners.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ol>
          <div class="actions">
            <CopyButton text={winners.join('\n')} t={t} />
            {/* Для розыгрыша в несколько туров: выбранные больше не участвуют. */}
            <button
              type="button"
              class="btn btn-secondary"
              onClick={() => {
                const left = [...items];
                for (const w of winners) left.splice(left.indexOf(w), 1);
                setText(left.join('\n'));
                setWinners(null);
              }}
            >
              {t('ui.remove')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
