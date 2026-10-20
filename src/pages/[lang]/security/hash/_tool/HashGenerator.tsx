import { useEffect, useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { ALGORITHMS, digest, type Algorithm } from './md5';

// Файл читается в память целиком (WebCrypto не умеет считать хеш потоком), поэтому размер ограничен.
const MAX_FILE = 1024 ** 3;

export function HashGenerator({ lang, t }: ToolProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [upper, setUpper] = useState(false);
  const [expected, setExpected] = useState('');
  const [hashes, setHashes] = useState<Partial<Record<Algorithm, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(!!file);
    const bytes = file ? file.arrayBuffer().then((b) => new Uint8Array(b)) : Promise.resolve(new TextEncoder().encode(input));
    bytes
      .then((data) => Promise.all(ALGORITHMS.map(async (a) => [a, await digest(a, data)] as const)))
      .then((pairs) => {
        if (!cancelled) setHashes(Object.fromEntries(pairs));
      })
      .catch(() => !cancelled && setFileError(t('ui.readError')))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [input, file]);

  const pick = (f: File | undefined) => {
    setFileError('');
    if (!f) return;
    if (f.size > MAX_FILE) {
      setFileError(t('ui.tooLarge'));
      return;
    }
    setHashes({});
    setFile(f);
  };

  const show = (h?: string) => (busy ? '…' : h ? (upper ? h.toUpperCase() : h) : '—');
  // Сравнение с ожидаемым хешем (например, контрольной суммой с сайта программы): регистр и пробелы не важны.
  const want = expected.replace(/\s+/g, '').toLowerCase();
  const match = want && !busy ? ALGORITHMS.find((a) => hashes[a] === want) : undefined;
  const size = (n: number) => new Intl.NumberFormat(lang, { style: 'unit', unit: n >= 1024 ** 2 ? 'megabyte' : 'kilobyte', maximumFractionDigits: 1 }).format(n / (n >= 1024 ** 2 ? 1024 ** 2 : 1024));

  return (
    <div>
      {file ? (
        <div class="field">
          <span class="field-label">{t('ui.file')}</span>
          <p>
            <strong>{file.name}</strong> <span class="muted">({size(file.size)})</span>{' '}
            <button type="button" class="btn btn-secondary btn-small" onClick={() => (setFile(null), setHashes({}))}>
              {t('ui.backToText')}
            </button>
          </p>
        </div>
      ) : (
        <div class="field">
          <label for="hash-in">{t('ui.input')}</label>
          <textarea id="hash-in" class="mono" rows={5} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
        </div>
      )}
      <div class="actions">
        <label class="btn btn-secondary btn-small">
          {t('ui.chooseFile')}
          <input type="file" class="visually-hidden" onChange={(e) => (pick(e.currentTarget.files?.[0]), (e.currentTarget.value = ''))} />
        </label>
      </div>
      {fileError && <p class="field-error">{fileError}</p>}
      <div class="checks">
        <label>
          <input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} />
          {t('ui.upper')}
        </label>
      </div>
      {ALGORITHMS.map((a) => (
        <div class={match === a ? 'hash-row hash-match' : 'hash-row'} key={a}>
          <div class="hash-head">
            <strong>{a}</strong>
            {match === a && <span class="hash-ok">✓ {t('ui.matches')}</span>}
            <CopyButton text={hashes[a] && !busy ? show(hashes[a]) : ''} t={t} />
          </div>
          <p class="mono-out">{show(hashes[a])}</p>
        </div>
      ))}
      <div class="field">
        <label for="hash-expected">{t('ui.expected')}</label>
        <input id="hash-expected" type="text" class="mono" autoComplete="off" spellcheck={false} value={expected} onInput={(e) => setExpected(e.currentTarget.value)} />
        {want && !busy && <p class={match ? 'hash-ok' : 'field-error'}>{match ? t('ui.matchOk', { alg: match }) : t('ui.matchNone')}</p>}
      </div>
    </div>
  );
}
