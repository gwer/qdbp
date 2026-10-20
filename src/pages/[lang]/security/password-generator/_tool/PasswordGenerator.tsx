import { useEffect, useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { IntField } from '@/ui/files/fields';
import { entropyBits, generate, SETS, strength, type SetName } from './password';

const SET_NAMES = Object.keys(SETS) as SetName[];

export function PasswordGenerator({ lang, t }: ToolProps) {
  const [length, setLength] = useState(16);
  const [sets, setSets] = useState<SetName[]>(SET_NAMES);
  const [noSimilar, setNoSimilar] = useState(false);
  // Пароль создаётся только в браузере: при сборке случайности нет.
  const [passwords, setPasswords] = useState<string[]>([]);
  // Несколько паролей разом — например, для нескольких учётных записей или чтобы выбрать понравившийся.
  const [count, setCount] = useState(1);
  const opts = { length, sets, noSimilar };
  const valid = sets.length > 0 && length >= sets.length;
  const regenerate = () => setPasswords(valid ? Array.from({ length: count }, () => generate(opts)) : []);
  const password = passwords.join('\n');

  useEffect(regenerate, [length, sets.join(), noSimilar, count]);

  const toggle = (s: SetName) => setSets((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : SET_NAMES.filter((x) => x === s || cur.includes(x))));
  const bits = valid ? entropyBits(opts) : 0;

  return (
    <div>
      <div class="field">
        <label for="pw-length">
          {t('ui.length')}: <strong>{length}</strong>
        </label>
        <input id="pw-length" type="range" min={4} max={64} value={length} onInput={(e) => setLength(Number(e.currentTarget.value))} />
      </div>
      <div class="checks">
        {SET_NAMES.map((s) => (
          <label key={s}>
            <input type="checkbox" checked={sets.includes(s)} onChange={() => toggle(s)} />
            {t(`ui.sets.${s}`)}
          </label>
        ))}
        <label>
          <input type="checkbox" checked={noSimilar} onChange={() => setNoSimilar(!noSimilar)} />
          {t('ui.noSimilar')}
        </label>
      </div>
      <div class="calc-inputs">
        <IntField id="pw-count" label={t('ui.count')} value={count} min={1} max={100} onChange={setCount} />
      </div>
      <p class="mono-out pw-list" aria-live="polite">
        {password || '—'}
      </p>
      <div class="actions">
        <CopyButton text={password} t={t} />
        <button type="button" class="btn btn-secondary btn-small" onClick={regenerate} disabled={!valid}>
          {t('common.regenerate')}
        </button>
      </div>
      <p class="muted">
        {valid
          ? t('ui.strength', { level: t(`ui.levels.${strength(bits)}`), bits: formatNumber(lang, Math.round(bits), 'integer') })
          : t('ui.pickSet')}
      </p>
    </div>
  );
}
