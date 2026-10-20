import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Now } from './Now';

// Максимум, который может представить Date: ±8.64e15 мс.
const MAX_MS = 8.64e15;

export function fromTimestamp(ts: number, unit: 's' | 'ms') {
  const ms = unit === 's' ? ts * 1000 : ts;
  if (Math.abs(ms) > MAX_MS) throw new RangeError('timestamp out of range');
  return { local: ms, utc: ms, iso: new Date(ms).toISOString() };
}

export const def = defineCalculator({
  order: 70,
  related: ['days-between', 'add-to-date'],
  inputs: {
    ts: { type: 'integer', default: 1767225600, defaultBy: { unit: { s: 1767225600, ms: 1767225600000 } } },
    unit: { type: 'select', options: ['s', 'ms'], default: 's' },
  },
  compute: ({ ts, unit }) => fromTimestamp(ts, unit),
  outputs: {
    local: { type: 'datetime' },
    utc: { type: 'datetime', timeZone: 'UTC' },
    iso: { type: 'text' },
  },
  Extra: Now,
});

export default island(def);
