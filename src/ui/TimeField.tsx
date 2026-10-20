import type { ClockMode } from '@/i18n/config';
import { splitSuffix } from '@/lib/clock';

export type Common = { id: string; value: string; 'aria-invalid'?: 'true'; 'aria-describedby'?: string };

/**
 * Поле времени. Своё, а не <input type="time">: у нативного формат 12/24 ч задаёт система, а не пользователь.
 * В режиме 12 ч рядом с полем — переключатель AM/PM, его значение хранится суффиксом в тексте поля.
 */
export function TimeField({ common, raw, mode, onChange }: { common: Common; raw: string; mode: ClockMode; onChange: (v: string) => void }) {
  const input = (value: string, onInput: (v: string) => void) => (
    <input
      {...common}
      value={value}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={mode === '24' ? '14:30' : '2:30'}
      onInput={(e) => onInput(e.currentTarget.value)}
    />
  );
  if (mode === '24') return input(raw, onChange);
  const { text, suffix } = splitSuffix(raw);
  return (
    <div class="time-12">
      {input(text, (v) => onChange(`${v} ${suffix}`))}
      <select value={suffix} aria-label="AM/PM" onChange={(e) => onChange(`${text} ${e.currentTarget.value}`)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
