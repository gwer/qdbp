import { DAY_MINUTES } from '@/lib/clock';
import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Длительность от start до end (минуты от полуночи) за вычетом перерыва (минуты).
 * Если end раньше start — конец на следующий день.
 */
export function between(start: number, end: number, pause = 0) {
  const overnight = end < start;
  const minutes = (overnight ? end + DAY_MINUTES - start : end - start) - pause;
  if (minutes < 0) throw new InputError('pauseTooLong');
  return { duration: minutes, minutes, hours: minutes / 60, overnight };
}

export const def = defineCalculator({
  order: 50,
  related: ['time-calculator', 'days-between'],
  inputs: {
    start: { type: 'time', default: '09:00' },
    end: { type: 'time', default: '18:00' },
    pause: { type: 'duration', default: 0 },
  },
  errors: ['pauseTooLong'],
  compute: ({ start, end, pause }) => between(start, end, pause),
  outputs: {
    duration: { type: 'duration' },
    minutes: { type: 'integer' },
    hours: { digits: 2 },
    overnight: { type: 'custom', format: (v: boolean, { t }) => t(v ? 'ui.nextDay' : 'ui.sameDay') },
  },
});

export default island(def);
