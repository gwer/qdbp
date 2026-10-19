import { addMonths, daysBetween, diffYMD } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function age(birth: string, on: string) {
  if (on < birth) throw new RangeError('birth date is after the target date');
  const { years, months, days } = diffYMD(birth, on);
  // День рождения 29 февраля в невисокосный год — 28 февраля (так работает addMonths).
  let next = addMonths(birth, 12 * years);
  if (next < on) next = addMonths(birth, 12 * (years + 1));
  return { years, months, days, totalDays: daysBetween(birth, on), nextBirthday: daysBetween(on, next) };
}

export const def = defineCalculator({
  order: 10,
  related: ['days-between', 'add-to-date'],
  inputs: {
    birth: { type: 'date', default: '1990-06-15' },
    on: { type: 'date', default: 'today' },
  },
  compute: ({ birth, on }) => age(birth, on),
  outputs: {
    years: { type: 'integer' },
    months: { type: 'integer' },
    days: { type: 'integer' },
    totalDays: { type: 'integer' },
    nextBirthday: { type: 'integer' },
  },
});

export default island(def);
