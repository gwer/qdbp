import { addDays } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Календарный метод: овуляция за 14 дней до следующей менструации,
 * фертильное окно — 5 дней до овуляции и день после неё.
 */
export function ovulation(lmp: string, cycle: number) {
  const day = addDays(lmp, cycle - 14);
  return {
    ovulation: day,
    fertileStart: addDays(day, -5),
    fertileEnd: addDays(day, 1),
    nextPeriod: addDays(lmp, cycle),
    due: addDays(lmp, 280 + cycle - 28),
  };
}

export const def = defineCalculator({
  order: 45,
  related: ['due-date'],
  inputs: {
    lmp: { type: 'date', default: 'today-7' },
    cycle: { type: 'integer', default: 28, min: 21, max: 45 },
  },
  compute: ({ lmp, cycle }) => ovulation(lmp, cycle),
  outputs: {
    ovulation: { type: 'date', style: 'full' },
    fertileStart: { type: 'date' },
    fertileEnd: { type: 'date' },
    nextPeriod: { type: 'date' },
    due: { type: 'date' },
  },
});

export default island(def);
