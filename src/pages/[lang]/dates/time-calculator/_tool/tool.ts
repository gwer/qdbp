import { DAY_MINUTES } from '@/lib/clock';
import { dayNumber, fromDayNumber } from '@/lib/date';
import type { T } from '@/i18n/t';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Дата + время ± (дни, часы, минуты). Арифметика по часам, без часовых поясов и летнего времени. */
export function shiftTime(date: string, time: number, sign: 1 | -1, days: number, hours: number, minutes: number) {
  const start = dayNumber(date)! * DAY_MINUTES + time;
  const end = start + sign * (days * DAY_MINUTES + hours * 60 + minutes);
  const endDay = Math.floor(end / DAY_MINUTES);
  return { time: end - endDay * DAY_MINUTES, date: fromDayNumber(endDay), shift: endDay - dayNumber(date)! };
}

export function dayShift(n: number, t: T): string {
  if (n === 0) return t('ui.sameDay');
  if (n === 1) return t('ui.nextDay');
  if (n === -1) return t('ui.prevDay');
  return n > 0 ? t('ui.daysLater', { count: n }) : t('ui.daysEarlier', { count: -n });
}

export const def = defineCalculator({
  order: 40,
  related: ['time-between', 'add-to-date', 'days-between'],
  inputs: {
    date: { type: 'date', default: 'today' },
    time: { type: 'time', default: 'now' },
    op: { type: 'select', options: ['add', 'subtract'], default: 'add' },
    days: { type: 'integer', default: 0, min: 0, max: 36500 },
    hours: { type: 'integer', default: 3, min: 0, max: 876000 },
    minutes: { type: 'integer', default: 0, min: 0, max: 52560000 },
  },
  compute: ({ date, time, op, days, hours, minutes }) => shiftTime(date, time, op === 'add' ? 1 : -1, days, hours, minutes),
  outputs: {
    time: { type: 'clock' },
    date: { type: 'date', style: 'full' },
    shift: { type: 'custom', format: (n: number, { t }) => dayShift(n, t) },
  },
});

export default island(def);
