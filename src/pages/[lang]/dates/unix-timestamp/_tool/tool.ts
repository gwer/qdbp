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

/**
 * Дата и время → timestamp. date — 'YYYY-MM-DD', time — минуты от полуночи.
 * Местное время — в часовом поясе браузера (при сборке — UTC, но этот режим при сборке не показывается).
 */
export function toTimestamp(date: string, time: number, zone: 'local' | 'utc') {
  const [y, m, d] = date.split('-').map(Number);
  const h = Math.floor(time / 60);
  const min = time % 60;
  const ms = zone === 'utc' ? Date.UTC(y, m - 1, d, h, min) : new Date(y, m - 1, d, h, min).getTime();
  return { seconds: String(ms / 1000), ms: String(ms), local: ms, utc: ms, iso: new Date(ms).toISOString() };
}

export const def = defineCalculator({
  order: 70,
  related: ['days-between', 'add-to-date'],
  inputs: {
    direction: { type: 'select', options: ['toDate', 'toTs'], default: 'toDate' },
    ts: { type: 'integer', default: 1767225600, defaultBy: { unit: { s: 1767225600, ms: 1767225600000 } }, showIf: { direction: 'toDate' } },
    unit: { type: 'select', options: ['s', 'ms'], default: 's', showIf: { direction: 'toDate' } },
    date: { type: 'date', default: '2026-01-01', showIf: { direction: 'toTs' } },
    time: { type: 'time', default: '00:00', showIf: { direction: 'toTs' } },
    zone: { type: 'select', options: ['local', 'utc'], default: 'local', showIf: { direction: 'toTs' } },
  },
  compute: ({ direction, ts, unit, date, time, zone }) =>
    direction === 'toTs' ? toTimestamp(date, time, zone) : { seconds: '', ms: '', ...fromTimestamp(ts, unit) },
  outputs: {
    seconds: { type: 'text', showIf: { direction: 'toTs' } },
    ms: { type: 'text', showIf: { direction: 'toTs' } },
    local: { type: 'datetime' },
    utc: { type: 'datetime', timeZone: 'UTC' },
    iso: { type: 'text' },
  },
  Extra: Now,
});

export default island(def);
