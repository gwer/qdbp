import { addDays, daysBetween, weekdaysBetween } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function between(from: string, to: string, includeEnd: boolean) {
  const [a, b] = from <= to ? [from, to] : [to, from];
  const sign = from <= to ? 1 : -1;
  const end = includeEnd ? addDays(b, 1) : b;
  const days = daysBetween(a, end);
  return { days: sign * days, weeks: (sign * days) / 7, weekdays: weekdaysBetween(a, end) };
}

export const def = defineCalculator({
  order: 20,
  related: ['add-to-date', 'age-calculator', 'week-number'],
  inputs: {
    from: { type: 'date', default: 'today' },
    to: { type: 'date', default: 'today+30' },
    includeEnd: { type: 'select', options: ['no', 'yes'], default: 'no' },
  },
  compute: ({ from, to, includeEnd }) => between(from, to, includeEnd === 'yes'),
  outputs: {
    days: { type: 'integer' },
    weeks: { digits: 1 },
    weekdays: { type: 'integer' },
  },
});

export default island(def);
