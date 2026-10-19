import { useState } from 'preact/hooks';
import type { T } from '@/i18n/t';
import { CopyButton } from './CopyButton';

export interface Mode {
  id: string;
  /** Бросает исключение, если вход некорректен для этого режима. */
  run: (input: string) => string;
}

/**
 * Текст → преобразование → текст. Строки инструмента: ui.input, ui.output, ui.error, ui.modes.<id>.
 * Режимы — переключатель над полем (кодировать/декодировать, регистр и т. п.).
 */
export function TextConverter({ t, modes, placeholder }: { t: T; modes: Mode[]; placeholder?: string }) {
  const [mode, setMode] = useState(modes[0].id);
  const [input, setInput] = useState('');
  let output = '';
  let error = false;
  try {
    output = modes.find((m) => m.id === mode)!.run(input);
  } catch {
    error = true;
  }
  return (
    <div>
      {modes.length > 1 && (
        <div class="calc-options" role="group" aria-label={t('ui.mode')}>
          {modes.map((m) => (
            <button type="button" key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
              {t(`ui.modes.${m.id}`)}
            </button>
          ))}
        </div>
      )}
      <div class="field">
        <label for="tc-in">{t('ui.input')}</label>
        <textarea id="tc-in" class="mono" rows={6} value={input} placeholder={placeholder} onInput={(e) => setInput(e.currentTarget.value)} />
      </div>
      <div class="field">
        <label for="tc-out">{t('ui.output')}</label>
        <textarea id="tc-out" class="mono" rows={6} readOnly value={error ? '' : output} aria-invalid={error ? 'true' : undefined} />
        {error && <p class="field-error">{t('ui.error')}</p>}
      </div>
      <div class="actions">
        <CopyButton text={error ? '' : output} t={t} />
      </div>
    </div>
  );
}
