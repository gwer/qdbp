import { addDays, daysBetween } from '@/lib/date';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Предполагаемая дата родов по правилу Негеле: первый день последней менструации + 280 дней,
 * с поправкой на длину цикла (отличие от 28 дней). Срок — акушерский, от той же даты с той же поправкой.
 */
export function dueDate(lmp: string, cycle: number, on: string) {
  const shift = cycle - 28;
  const due = addDays(lmp, 280 + shift);
  const age = daysBetween(lmp, on) - shift;
  if (age < 0) throw new RangeError('date is before the start of pregnancy');
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
  related: ['bmi', 'calorie-calculator'],
  inputs: {
    lmp: { type: 'date', default: 'today-70' },
    cycle: { type: 'integer', default: 28, min: 21, max: 45 },
    on: { type: 'date', default: 'today' },
  },
  compute: ({ lmp, cycle, on }) => dueDate(lmp, cycle, on),
  outputs: {
    due: { type: 'date', style: 'full' },
    age: { type: 'custom', format: weeksDays },
    trimester: { type: 'custom', format: (n: number, { t }: FormatContext) => t(`ui.trimester${n}`) },
    left: { type: 'integer' },
    conception: { type: 'date' },
  },
});

export default island(def);
