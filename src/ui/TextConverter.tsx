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
export function TextConverter({
  t,
  modes,
  placeholder,
  describeError,
}: {
  t: T;
  modes: Mode[];
  placeholder?: string;
  /** Подробности ошибки для пользователя (например, «строка 3, столбец 5»). */
  describeError?: (error: unknown, input: string) => string | null;
}) {
  const [mode, setMode] = useState(modes[0].id);
  const [input, setInput] = useState('');
  let output = '';
  let error = false;
  let detail: string | null = null;
  // Пустое поле — не ошибка: пользователь ещё ничего не ввёл. Пробелы — уже данные (их кодируют Base64 и URL).
  if (input !== '') {
    try {
      output = modes.find((m) => m.id === mode)!.run(input);
    } catch (e) {
      error = true;
      detail = describeError?.(e, input) ?? null;
    }
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
        <textarea
          id="tc-in"
          class="mono"
          rows={6}
          value={input}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'tc-err' : undefined}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </div>
      <div class="field">
        <label for="tc-out">{t('ui.output')}</label>
        <textarea id="tc-out" class="mono" rows={6} readOnly value={error ? '' : output} />
        {error && (
          <p class="field-error" id="tc-err">
            {t('ui.error')}
            {detail && `: ${detail}`}
          </p>
        )}
      </div>
      <div class="actions">
        <CopyButton text={error ? '' : output} t={t} />
      </div>
    </div>
  );
}
