import { useRef } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatDateInput, parseDateInput } from '@/lib/date-input';
import type { Common } from './TimeField';

/**
 * Поле даты. Своё текстовое, а не <input type="date">: у нативного формат задаёт система, а не язык страницы
 * (на русской странице с английской Windows — 10/19/2026). Календарь пока нативный: скрытый
 * <input type="date">, который открывает кнопка. Всё, что касается календаря, — только здесь,
 * чтобы его можно было заменить своим, не трогая инструменты.
 */
export function DateField({ common, raw, lang, t, onChange }: { common: Common; raw: string; lang: Lang; t: T; onChange: (v: string) => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const open = () => {
    const el = picker.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      // Браузеры без showPicker (или запрет вне жеста пользователя) — хотя бы фокус на поле.
      el.focus();
      el.click();
    }
  };
  return (
    <div class="date-field">
      <input {...common} type="text" inputMode="numeric" autoComplete="off" placeholder={t('calc.date.placeholder')} onInput={(e) => onChange(e.currentTarget.value)} />
      <button type="button" class="date-pick" aria-label={t('calc.date.pick')} title={t('calc.date.pick')} onClick={open}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
      <input
        ref={picker}
        class="date-native"
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={parseDateInput(raw, lang) ?? ''}
        onChange={(e) => e.currentTarget.value && onChange(formatDateInput(e.currentTarget.value, lang))}
      />
    </div>
  );
}
