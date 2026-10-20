import { addDays, daysBetween } from '@/lib/date';
import { defineCalculator, InputError, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { KeyDates } from './KeyDates';

export type Method = 'lmp' | 'conception' | 'ivf3' | 'ivf5';

/**
 * Начало акушерского срока (условный первый день цикла в 28 дней) по выбранному способу:
 * по менструации — с поправкой на длину цикла; по зачатию — за 14 дней до него;
 * по переносу эмбриона 3 или 5 суток — за 17 или 19 дней до переноса (дата родов = перенос + 263 или 261 день).
 */
export function pregnancyStart(method: Method, lmp: string, cycle: number, conception: string, transfer: string): string {
  if (method === 'conception') return addDays(conception, -14);
  if (method === 'ivf3') return addDays(transfer, -17);
  if (method === 'ivf5') return addDays(transfer, -19);
  return addDays(lmp, cycle - 28);
}

/**
 * Предполагаемая дата родов по правилу Негеле: первый день последней менструации + 280 дней,
 * с поправкой на длину цикла (отличие от 28 дней). Срок — акушерский, от той же даты с той же поправкой.
 */
export function dueDate(lmp: string, cycle: number, on: string) {
  const shift = cycle - 28;
  const due = addDays(lmp, 280 + shift);
  const age = daysBetween(lmp, on) - shift;
  if (age < 0) throw new InputError('beforeStart');
  return {
    due,
    age,
    trimester: age < 14 * 7 ? 1 : age < 28 * 7 ? 2 : 3,
    left: daysBetween(on, due),
    conception: addDays(lmp, 14 + shift),
  };
}

const weeksDays = (days: number, { t }: FormatContext) => {
  const w = Math.floor(days / 7);
  const d = days % 7;
  return d ? `${t('ui.weeks', { count: w })} ${t('ui.days', { count: d })}` : t('ui.weeks', { count: w });
};

export const def = defineCalculator({
  order: 40,
  related: ['ovulation', 'bmi'],
  inputs: {
    method: { type: 'select', options: ['lmp', 'conception', 'ivf3', 'ivf5'], default: 'lmp' },
    lmp: { type: 'date', default: 'today-70', showIf: { method: 'lmp' } },
    cycle: { type: 'integer', default: 28, min: 21, max: 45, showIf: { method: 'lmp' } },
    conception: { type: 'date', default: 'today-56', showIf: { method: 'conception' } },
    transfer: { type: 'date', default: 'today-50', showIf: { method: ['ivf3', 'ivf5'] } },
    on: { type: 'date', default: 'today' },
  },
  errors: ['beforeStart'],
  compute: ({ method, lmp, cycle, conception, transfer, on }) => {
    const start = pregnancyStart(method, lmp, cycle, conception, transfer);
    return { ...dueDate(start, 28, on), start };
  },
  outputs: {
    due: { type: 'date', style: 'full' },
    age: { type: 'custom', format: weeksDays },
    trimester: { type: 'custom', format: (n: number, { t }: FormatContext) => t(`ui.trimester${n}`) },
    left: { type: 'integer' },
    conception: { type: 'date', showIf: { method: ['lmp', 'ivf3', 'ivf5'] } },
  },
  Extra: KeyDates,
});

export default island(def);
