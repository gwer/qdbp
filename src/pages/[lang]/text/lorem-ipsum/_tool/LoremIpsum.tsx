import { useEffect, useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { lorem, type Unit } from './lorem';

const UNITS: Unit[] = ['paragraphs', 'sentences', 'words'];
const MAX: Record<Unit, number> = { paragraphs: 100, sentences: 500, words: 5000 };

export function LoremIpsum({ t }: ToolProps) {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [classic, setClassic] = useState(true);
  const [html, setHtml] = useState(false);
  // Текст случайный, поэтому создаётся только в браузере.
  const [parts, setParts] = useState<string[]>([]);
  const n = Math.min(Math.max(0, Math.floor(count) || 0), MAX[unit]);
  const regenerate = () => setParts(lorem(n, unit, classic));

  useEffect(regenerate, [n, unit, classic]);

  const text = html ? parts.map((p) => `<p>${p}</p>`).join('\n') : parts.join('\n\n');

  return (
    <div>
      <div class="calc-inputs">
        <div class="field">
          <label for="li-count">{t('ui.count')}</label>
          <input id="li-count" type="number" inputMode="numeric" min={1} max={MAX[unit]} value={count} onInput={(e) => setCount(Number(e.currentTarget.value))} />
        </div>
        <div class="field">
          <label for="li-unit">{t('ui.unit')}</label>
          <select id="li-unit" value={unit} onChange={(e) => setUnit(e.currentTarget.value as Unit)}>
            {UNITS.map((u) => (
              <option value={u} key={u}>
                {t(`ui.units.${u}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div class="checks">
        <label>
          <input type="checkbox" checked={classic} onChange={() => setClassic(!classic)} />
          {t('ui.classic')}
        </label>
        <label>
          <input type="checkbox" checked={html} onChange={() => setHtml(!html)} />
          {t('ui.html')}
        </label>
      </div>
      <div class="field">
        <label for="li-out">{t('ui.result')}</label>
        <textarea id="li-out" rows={12} readOnly value={text} />
      </div>
      <div class="actions">
        <CopyButton text={text} t={t} />
        <button type="button" class="btn btn-secondary btn-small" onClick={regenerate}>
          {t('common.regenerate')}
        </button>
      </div>
    </div>
  );
}
