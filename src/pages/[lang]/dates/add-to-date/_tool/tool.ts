import { addDays, addMonths, daysBetween, weekday } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Unit = 'days' | 'workdays' | 'weeks' | 'months' | 'years';

/**
 * Рабочие дни (пн–пт, без праздников): n-й рабочий день после даты (до неё — при n < 0).
 * Каждые полные 5 рабочих дней — ровно неделя, остаток добирается по дню.
 */
export function addWorkdays(date: string, n: number): string {
  if (n === 0) return date;
  const sign = n < 0 ? -1 : 1;
  let left = Math.abs(n);
  // С выходного считать так же, как с соседнего рабочего дня позади: вперёд — от пятницы, назад — от понедельника.
  // Иначе прыжок «5 рабочих = 7 дней» от субботы попадает снова на субботу.
  const wd = weekday(date);
  let d = wd < 5 ? date : addDays(date, sign > 0 ? 4 - wd : 7 - wd);
  d = addDays(d, sign * 7 * Math.floor(left / 5));
  left %= 5;
  while (left > 0) {
    d = addDays(d, sign);
    if (weekday(d) < 5) left--;
  }
  return d;
}

export function shift(date: string, n: number, unit: Unit) {
  const result =
    unit === 'days'
      ? addDays(date, n)
      : unit === 'workdays'
        ? addWorkdays(date, n)
        : unit === 'weeks'
          ? addDays(date, 7 * n)
          : addMonths(date, unit === 'months' ? n : 12 * n);
  return { result, days: daysBetween(date, result) };
}

export const def = defineCalculator({
  order: 30,
  related: ['days-between', 'week-number'],
  inputs: {
    date: { type: 'date', default: 'today' },
    op: { type: 'select', options: ['add', 'subtract'], default: 'add' },
    amount: { type: 'integer', default: 30, min: 0, max: 100000 },
    unit: { type: 'select', options: ['days', 'workdays', 'weeks', 'months', 'years'], default: 'days' },
  },
  compute: ({ date, op, amount, unit }) => shift(date, op === 'add' ? amount : -amount, unit),
  outputs: {
    result: { type: 'date', style: 'full' },
    days: { type: 'integer' },
  },
});

export default island(def);
