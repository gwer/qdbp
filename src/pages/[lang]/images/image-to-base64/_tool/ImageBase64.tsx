import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { CopyButton } from '@/ui/CopyButton';
import { formatBytes } from '@/ui/files/bytes';
import { downloadBlob } from '@/ui/files/download';
import { DropZone } from '@/ui/files/DropZone';
import { bytesToBase64, formatOutput, parseDataUrl, sniffMime, type Format } from './dataurl';

const FORMATS: Format[] = ['dataUrl', 'base64', 'css', 'html'];
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' };

export function ImageBase64({ lang, t }: ToolProps) {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [file, setFile] = useState<{ name: string; size: number; dataUrl: string } | null>(null);
  const [format, setFormat] = useState<Format>('dataUrl');
  const [pasted, setPasted] = useState('');

  const load = async ([f]: File[]) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const mime = sniffMime(bytes) ?? f.type ?? 'application/octet-stream';
    setFile({ name: f.name, size: f.size, dataUrl: `data:${mime};base64,${bytesToBase64(bytes)}` });
  };

  let decoded: { url: string; mime: string; size: number; blob: Blob } | null = null;
  let error = false;
  if (mode === 'decode' && pasted.trim()) {
    try {
      const { mime, bytes } = parseDataUrl(pasted);
      const blob = new Blob([new Uint8Array(bytes)], { type: mime });
      decoded = { url: `data:${mime};base64,${bytesToBase64(bytes)}`, mime, size: bytes.length, blob };
    } catch {
      error = true;
    }
  }
  const output = file ? formatOutput(file.dataUrl, format, file.name.replace(/\.[^.]+$/, '')) : '';

  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.mode')}>
        {(['encode', 'decode'] as const).map((m) => (
          <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`ui.modes.${m}`)}
          </button>
        ))}
      </div>
      {mode === 'encode' ? (
        <>
          <DropZone t={t} multiple={false} onFiles={load} />
          {file && (
            <>
              <div class="calc-options" role="group" aria-label={t('ui.format')}>
                {FORMATS.map((f) => (
                  <button type="button" key={f} aria-pressed={format === f} onClick={() => setFormat(f)}>
                    {t(`ui.formats.${f}`)}
                  </button>
                ))}
              </div>
              <div class="field">
                <label for="b64-out">
                  {file.name} · {t('ui.sizes', { before: formatBytes(lang, file.size), after: formatBytes(lang, output.length) })}
                </label>
                <textarea id="b64-out" class="mono" rows={8} readOnly value={output} />
              </div>
              <div class="actions">
                <CopyButton text={output} t={t} />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div class="field">
            <label for="b64-in">{t('ui.paste')}</label>
            <textarea
              id="b64-in"
              class="mono"
              rows={6}
              value={pasted}
              placeholder="data:image/png;base64,iVBORw0KGgo…"
              onInput={(e) => setPasted(e.currentTarget.value)}
            />
            {error && <p class="field-error">{t('ui.error')}</p>}
          </div>
          {decoded && (
            <div class="b64-preview">
              <img src={decoded.url} alt={t('ui.preview')} />
              <p class="muted">
                {decoded.mime} · {formatBytes(lang, decoded.size)}
              </p>
              <button
                type="button"
                class="btn btn-small"
                onClick={() => downloadBlob(`image.${EXT[decoded!.mime] ?? decoded!.mime.split('/')[1]}`, decoded!.blob)}
              >
                {t('files.download')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
