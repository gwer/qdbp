import { useState } from 'preact/hooks';
import { randomInt } from '@/lib/random';
import type { ToolProps } from '@/ui/define';

const SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DiceRoller({ t }: ToolProps) {
  const [mode, setMode] = useState<'dice' | 'coin'>('dice');
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState<number>(6);
  const [dice, setDice] = useState<number[] | null>(null);
  const [coin, setCoin] = useState<'heads' | 'tails' | null>(null);

  // История за сессию: последние броски и счёт орёл/решка (для игр «до трёх побед» и проверки честности).
  const [history, setHistory] = useState<number[]>([]);
  const [tally, setTally] = useState({ heads: 0, tails: 0 });

  const roll = () => {
    const next = Array.from({ length: count }, () => randomInt(sides) + 1);
    setDice(next);
    setHistory((h) => [next.reduce((a, b) => a + b, 0), ...h].slice(0, 10));
  };
  const flip = () => {
    const side = randomInt(2) ? 'heads' : 'tails';
    setCoin(side);
    setTally((c) => ({ ...c, [side]: c[side] + 1 }));
  };

  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.mode')}>
        {(['dice', 'coin'] as const).map((m) => (
          <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`ui.modes.${m}`)}
          </button>
        ))}
      </div>
      {mode === 'dice' ? (
        <>
          <div class="calc-inputs">
            <div class="field">
              <label for="dr-count">{t('ui.count')}</label>
              <select id="dr-count" value={String(count)} onChange={(e) => (setCount(Number(e.currentTarget.value)), setDice(null))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option value={n} key={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div class="field">
              <label for="dr-sides">{t('ui.sides')}</label>
              <select id="dr-sides" value={String(sides)} onChange={(e) => (setSides(Number(e.currentTarget.value)), setDice(null))}>
                {SIDES.map((s) => (
                  <option value={s} key={s}>
                    {t('ui.dN', { n: s })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn" onClick={roll}>
              {t('ui.roll')}
            </button>
          </div>
          {dice && (
            <div class="dice-result" aria-live="polite">
              <div class="dice">
                {dice.map((d, i) => (
                  <span class="die" key={i} title={String(d)}>
                    {sides === 6 ? FACES[d] : d}
                  </span>
                ))}
              </div>
              <p>
                {t('ui.total')}: <strong>{dice.reduce((a, b) => a + b, 0)}</strong>
              </p>
            </div>
          )}
          {history.length > 1 && (
            <p class="muted">
              {t('ui.history')}: {history.join(', ')}
            </p>
          )}
        </>
      ) : (
        <>
          <div class="actions">
            <button type="button" class="btn" onClick={flip}>
              {t('ui.flip')}
            </button>
          </div>
          {coin && (
            <p class="coin" aria-live="polite">
              {t(`ui.${coin}`)}
            </p>
          )}
          {tally.heads + tally.tails > 1 && (
            <p class="muted">
              {t('ui.tally', { heads: tally.heads, tails: tally.tails })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
