import { useState } from 'preact/hooks';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { caesar } from './caesar';

export function CaesarCipher({ t }: ToolProps) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [shift, setShift] = useState(3);
  const [input, setInput] = useState('');
  const output = caesar(input, mode === 'encrypt' ? shift : -shift);
  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('ui.mode')}>
        {(['encrypt', 'decrypt'] as const).map((m) => (
          <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`ui.modes.${m}`)}
          </button>
        ))}
      </div>
      <div class="field">
        <label for="cc-shift">
          {t('ui.shift')}: <strong>{shift}</strong>
          {shift === 13 && ' (ROT13)'}
        </label>
        <input id="cc-shift" type="range" min={1} max={32} value={shift} onInput={(e) => setShift(Number(e.currentTarget.value))} />
      </div>
      <div class="field">
        <label for="cc-in">{t('ui.input')}</label>
        <textarea id="cc-in" rows={5} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
      </div>
      <div class="field">
        <label for="cc-out">{t('ui.output')}</label>
        <textarea id="cc-out" rows={5} readOnly value={output} />
      </div>
      <div class="actions">
        <CopyButton text={output} t={t} />
      </div>
    </div>
  );
}
