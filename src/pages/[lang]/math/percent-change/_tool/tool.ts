import type { T } from '@/i18n/t';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Изменение от from до to в процентах от from. От нуля процентное изменение не определено. */
export function percentChange(from: number, to: number) {
  if (from === 0) throw new RangeError('from is zero');
  return {
    change: ((to - from) * 100) / Math.abs(from),
    direction: Math.sign(to - from),
    difference: to - from,
    ratio: to / from,
  };
}

export const direction = (sign: number, t: T) => t(sign > 0 ? 'ui.increase' : sign < 0 ? 'ui.decrease' : 'ui.noChange');

export const def = defineCalculator({
  order: 30,
  related: ['what-percent', 'add-percent', 'percent-of'],
  inputs: {
    from: { type: 'number', default: 80, min: 0 },
    to: { type: 'number', default: 100, min: 0 },
  },
  compute: ({ from, to }) => percentChange(from, to),
  outputs: {
    change: { type: 'percent', digits: 2 },
    direction: { type: 'custom', format: (sign: number, { t }) => direction(sign, t) },
    difference: { digits: 6 },
    ratio: { digits: 4 },
  },
});

export default island(def);
