import { DAY_MINUTES } from '@/lib/clock';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Длительность одного цикла сна, минуты. */
export const CYCLE = 90;

const wrap = (m: number) => ((m % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;

/**
 * mode 'wake' — время подъёма известно, считаем, когда лечь; 'bed' — наоборот.
 * time — минуты от полуночи, fallAsleep — сколько минут обычно засыпаете.
 */
export function sleepTimes(mode: 'wake' | 'bed', time: number, fallAsleep: number) {
  const at = (cycles: number) =>
    wrap(mode === 'wake' ? time - cycles * CYCLE - fallAsleep : time + fallAsleep + cycles * CYCLE);
  return { c5: at(5), c6: at(6), c4: at(4), c3: at(3) };
}

export const def = defineCalculator({
  order: 35,
  related: ['calorie-calculator', 'water-intake'],
  inputs: {
    mode: { type: 'select', options: ['wake', 'bed'], default: 'wake' },
    time: { type: 'time', default: '07:00', defaultBy: { mode: { wake: '07:00', bed: '23:00' } } },
    fallAsleep: { type: 'integer', default: 15, min: 0, max: 120 },
  },
  compute: ({ mode, time, fallAsleep }) => sleepTimes(mode, time, fallAsleep),
  outputs: { c5: { type: 'clock' }, c6: { type: 'clock' }, c4: { type: 'clock' }, c3: { type: 'clock' } },
});

export default island(def);
