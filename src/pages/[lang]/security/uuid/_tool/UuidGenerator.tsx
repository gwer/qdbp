import { useEffect, useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { formatUuid, uuidV4, uuidV7 } from './uuid';

const random16 = () => crypto.getRandomValues(new Uint8Array(16));

export function UuidGenerator({ t }: ToolProps) {
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [count, setCount] = useState(1);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  // Только в браузере: при сборке случайности и «сейчас» нет.
  const [list, setList] = useState<string[]>([]);

  const generate = () => {
    const now = Date.now();
    setList(
      Array.from({ length: count }, () => formatUuid(version === 'v4' ? uuidV4(random16()) : uuidV7(now, random16()), upper, hyphens)),
    );
  };
  useEffect(generate, [version, count, upper, hyphens]);

  const text = list.join('\n');
  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.version')}>
        <span>{t('ui.version')}</span>
        {(['v4', 'v7'] as const).map((v) => (
          <button type="button" key={v} aria-pressed={version === v} onClick={() => setVersion(v)}>
            {t(`ui.versions.${v}`)}
          </button>
        ))}
      </div>
      <div class="field">
        <label for="uuid-count">
          {t('ui.count')}: <strong>{count}</strong>
        </label>
        <input id="uuid-count" type="range" min={1} max={50} value={count} onInput={(e) => setCount(Number(e.currentTarget.value))} />
      </div>
      <div class="checks">
        <label>
          <input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} />
          {t('ui.upper')}
        </label>
        <label>
          <input type="checkbox" checked={!hyphens} onChange={() => setHyphens(!hyphens)} />
          {t('ui.noHyphens')}
        </label>
      </div>
      <textarea class="mono" rows={Math.min(Math.max(count, 2), 10)} readOnly value={text} aria-label={t('ui.result')} />
      <div class="actions">
        <CopyButton text={text} t={t} />
        <button type="button" class="btn btn-secondary btn-small" onClick={generate}>
          {t('common.regenerate')}
        </button>
      </div>
    </div>
  );
}
