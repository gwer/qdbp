import { addDays, addMonths, daysBetween } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Unit = 'days' | 'weeks' | 'months' | 'years';

export function shift(date: string, n: number, unit: Unit) {
  const result =
    unit === 'days' ? addDays(date, n) : unit === 'weeks' ? addDays(date, 7 * n) : addMonths(date, unit === 'months' ? n : 12 * n);
  return { result, days: daysBetween(date, result) };
}

export const def = defineCalculator({
  order: 30,
  related: ['days-between', 'week-number'],
  inputs: {
    date: { type: 'date', default: 'today' },
    op: { type: 'select', options: ['add', 'subtract'], default: 'add' },
    amount: { type: 'integer', default: 30, min: 0, max: 100000 },
    unit: { type: 'select', options: ['days', 'weeks', 'months', 'years'], default: 'days' },
  },
  compute: ({ date, op, amount, unit }) => shift(date, op === 'add' ? amount : -amount, unit),
  outputs: {
    result: { type: 'date', style: 'full' },
    days: { type: 'integer' },
  },
});

export default island(def);
