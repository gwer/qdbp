import { DAY_MINUTES } from '@/lib/clock';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Длительность от start до end (минуты от полуночи). Если end раньше start — конец на следующий день. */
export function between(start: number, end: number) {
  const overnight = end < start;
  const minutes = overnight ? end + DAY_MINUTES - start : end - start;
  return { duration: minutes, minutes, hours: minutes / 60, overnight };
}

export const def = defineCalculator({
  order: 50,
  related: ['time-calculator', 'days-between'],
  inputs: {
    start: { type: 'time', default: '09:00' },
    end: { type: 'time', default: '18:00' },
  },
  compute: ({ start, end }) => between(start, end),
  outputs: {
    duration: { type: 'duration' },
    minutes: { type: 'integer' },
    hours: { digits: 2 },
    overnight: { type: 'custom', format: (v: boolean, { t }) => t(v ? 'ui.nextDay' : 'ui.sameDay') },
  },
});

export default island(def);
