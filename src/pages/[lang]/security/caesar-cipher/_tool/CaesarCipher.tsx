import { useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { caesar } from './caesar';

export function CaesarCipher({ t }: ToolProps) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt' | 'brute'>('encrypt');
  const [shift, setShift] = useState(3);
  const [input, setInput] = useState('');
  const output = caesar(input, mode === 'encrypt' ? shift : -shift);
  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.mode')}>
        {(['encrypt', 'decrypt', 'brute'] as const).map((m) => (
          <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`ui.modes.${m}`)}
          </button>
        ))}
      </div>
      {mode !== 'brute' && (
      <div class="field">
        <label for="cc-shift">
          {t('ui.shift')}: <strong>{shift}</strong>
          {shift === 13 && ' (ROT13)'}
        </label>
        <input id="cc-shift" type="range" min={1} max={32} value={shift} onInput={(e) => setShift(Number(e.currentTarget.value))} />
      </div>
      )}
      <div class="field">
        <label for="cc-in">{t('ui.input')}</label>
        <textarea id="cc-in" rows={5} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
      </div>
      {mode === 'brute' ? (
        // Расшифровка без ключа: все сдвиги подряд, нужный находится глазами. Клик — открыть вариант целиком.
        <div class="table-wrap">
          <table class="caesar-brute">
            <tbody>
              {Array.from({ length: 32 }, (_, k) => k + 1).map((k) => (
                <tr key={k}>
                  <td>
                    <button type="button" class="btn btn-secondary btn-small" aria-label={`${t('ui.shift')} ${k}`} onClick={() => (setShift(k), setMode('decrypt'))}>
                      {k}
                    </button>
                  </td>
                  <td>{caesar(input.slice(0, 120), -k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p class="muted">{t('ui.bruteNote')}</p>
        </div>
      ) : (
        <>
          <div class="field">
            <label for="cc-out">{t('ui.output')}</label>
            <textarea id="cc-out" rows={5} readOnly value={output} />
          </div>
          <div class="actions">
            <CopyButton text={output} t={t} />
          </div>
        </>
      )}
    </div>
  );
}
