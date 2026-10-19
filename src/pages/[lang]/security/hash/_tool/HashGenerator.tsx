import { useEffect, useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { ALGORITHMS, digest, type Algorithm } from './md5';

export function HashGenerator({ t }: ToolProps) {
  const [input, setInput] = useState('');
  const [upper, setUpper] = useState(false);
  const [hashes, setHashes] = useState<Partial<Record<Algorithm, string>>>({});

  useEffect(() => {
    let cancelled = false;
    const data = new TextEncoder().encode(input);
    Promise.all(ALGORITHMS.map(async (a) => [a, await digest(a, data)] as const)).then((pairs) => {
      if (!cancelled) setHashes(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const show = (h?: string) => (h ? (upper ? h.toUpperCase() : h) : '—');
  return (
    <div>
      <div class="field">
        <label for="hash-in">{t('ui.input')}</label>
        <textarea id="hash-in" class="mono" rows={5} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
      </div>
      <div class="checks">
        <label>
          <input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} />
          {t('ui.upper')}
        </label>
      </div>
      {ALGORITHMS.map((a) => (
        <div class="hash-row" key={a}>
          <div class="hash-head">
            <strong>{a}</strong>
            <CopyButton text={hashes[a] ? show(hashes[a]) : ''} t={t} />
          </div>
          <p class="mono-out">{show(hashes[a])}</p>
        </div>
      ))}
    </div>
  );
}
