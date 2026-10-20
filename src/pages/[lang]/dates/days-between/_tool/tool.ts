import { addDays, daysBetween, diffYMD, weekdaysBetween } from '@/lib/date';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function between(from: string, to: string, includeEnd: boolean) {
  const [a, b] = from <= to ? [from, to] : [to, from];
  const sign = from <= to ? 1 : -1;
  const end = includeEnd ? addDays(b, 1) : b;
  const days = daysBetween(a, end);
  return { days: sign * days, ymd: diffYMD(a, end), weeks: (sign * days) / 7, weekdays: weekdaysBetween(a, end) };
}

type YMD = { years: number; months: number; days: number };

/** «1 год 2 месяца 3 дня»; нулевые части пропускаются. */
const formatYMD = ({ years, months, days }: YMD, { t }: FormatContext) =>
  [
    years && t('ui.years', { count: years }),
    months && t('ui.months', { count: months }),
    (days || (!years && !months)) && t('ui.days', { count: days }),
  ]
    .filter(Boolean)
    .join(' ');

/** «4 недели 2 дня» вместо «4,3». */
const formatWeeks = (weeks: number, { t }: FormatContext) => {
  const total = Math.round(Math.abs(weeks) * 7);
  const w = Math.floor(total / 7);
  const d = total % 7;
  const text = [w && t('ui.weeks', { count: w }), (d || !w) && t('ui.days', { count: d })].filter(Boolean).join(' ');
  return weeks < 0 ? `−${text}` : text;
};

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
    ymd: { type: 'custom', format: formatYMD },
    weeks: { type: 'custom', format: formatWeeks },
    weekdays: { type: 'integer' },
  },
});

export default island(def);
