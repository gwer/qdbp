import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { qrMatrix, qrSvg, wifiPayload, type Level } from './qr';

type Kind = 'text' | 'wifi';
type Security = 'WPA' | 'WEP' | 'nopass';

function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadPng(m: boolean[][], fg: string, bg: string, px: number) {
  const n = m.length + 8;
  const scale = Math.max(1, Math.floor(px / n));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = n * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fg;
  m.forEach((row, r) => row.forEach((dark, c) => dark && ctx.fillRect((c + 4) * scale, (r + 4) * scale, scale, scale)));
  canvas.toBlob((b) => b && download('qr-code.png', b), 'image/png');
}

export function QrGenerator({ t }: ToolProps) {
  const [kind, setKind] = useState<Kind>('text');
  const [text, setText] = useState('https://qdbp.net/');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<Security>('WPA');
  const [hidden, setHidden] = useState(false);
  const [level, setLevel] = useState<Level>('M');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');

  const payload = kind === 'text' ? text : ssid ? wifiPayload(ssid, password, security, hidden) : '';
  let matrix: boolean[][] | null = null;
  let tooLong = false;
  if (payload) {
    try {
      matrix = qrMatrix(payload, level);
    } catch {
      tooLong = true;
    }
  }

  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.kind')}>
        {(['text', 'wifi'] as const).map((k) => (
          <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
            {t(`ui.kinds.${k}`)}
          </button>
        ))}
      </div>
      {kind === 'text' ? (
        <div class="field">
          <label for="qr-text">{t('ui.text')}</label>
          <textarea id="qr-text" rows={3} value={text} onInput={(e) => setText(e.currentTarget.value)} />
        </div>
      ) : (
        <div class="calc-inputs">
          <div class="field">
            <label for="qr-ssid">{t('ui.ssid')}</label>
            <input id="qr-ssid" type="text" autoComplete="off" value={ssid} onInput={(e) => setSsid(e.currentTarget.value)} />
          </div>
          <div class="field">
            <label for="qr-pass">{t('ui.password')}</label>
            <input id="qr-pass" type="text" autoComplete="off" value={password} disabled={security === 'nopass'} onInput={(e) => setPassword(e.currentTarget.value)} />
          </div>
          <div class="field">
            <label for="qr-sec">{t('ui.security')}</label>
            <select id="qr-sec" value={security} onChange={(e) => setSecurity(e.currentTarget.value as Security)}>
              {(['WPA', 'WEP', 'nopass'] as const).map((s) => (
                <option value={s} key={s}>
                  {t(`ui.securities.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div class="checks">
            <label>
              <input type="checkbox" checked={hidden} onChange={() => setHidden(!hidden)} />
              {t('ui.hidden')}
            </label>
          </div>
        </div>
      )}
      <div class="calc-inputs qr-options">
        <div class="field">
          <label for="qr-level">{t('ui.level')}</label>
          <select id="qr-level" value={level} onChange={(e) => setLevel(e.currentTarget.value as Level)}>
            {(['L', 'M', 'Q', 'H'] as const).map((l) => (
              <option value={l} key={l}>
                {t(`ui.levels.${l}`)}
              </option>
            ))}
          </select>
        </div>
        <div class="field">
          <label for="qr-fg">{t('ui.fg')}</label>
          <input id="qr-fg" type="color" value={fg} onInput={(e) => setFg(e.currentTarget.value)} />
        </div>
        <div class="field">
          <label for="qr-bg">{t('ui.bg')}</label>
          <input id="qr-bg" type="color" value={bg} onInput={(e) => setBg(e.currentTarget.value)} />
        </div>
      </div>
      <div class="qr-preview" aria-live="polite">
        {matrix ? (
          <div role="img" aria-label={t('ui.preview')} dangerouslySetInnerHTML={{ __html: qrSvg(matrix, fg, bg) }} />
        ) : (
          <p class="muted">{tooLong ? t('ui.tooLong') : t('ui.empty')}</p>
        )}
      </div>
      <div class="actions">
        <button type="button" class="btn btn-small" disabled={!matrix} onClick={() => matrix && downloadPng(matrix, fg, bg, 1024)}>
          {t('ui.downloadPng')}
        </button>
        <button
          type="button"
          class="btn btn-secondary btn-small"
          disabled={!matrix}
          onClick={() => matrix && download('qr-code.svg', new Blob([qrSvg(matrix, fg, bg)], { type: 'image/svg+xml' }))}
        >
          {t('ui.downloadSvg')}
        </button>
      </div>
    </div>
  );
}
