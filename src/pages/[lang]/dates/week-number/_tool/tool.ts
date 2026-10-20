import { isoWeek, usWeek } from '@/lib/date';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Weeks } from './Weeks';

export const def = defineCalculator({
  order: 60,
  related: ['days-between', 'add-to-date'],
  inputs: {
    date: { type: 'date', default: 'today' },
    system: { type: 'select', options: ['iso', 'us'], default: 'iso' },
  },
  compute: ({ date, system }) => {
    const w = system === 'iso' ? isoWeek(date) : usWeek(date);
    return { week: w.week, year: String(w.year), start: w.start, end: w.end };
  },
  outputs: {
    week: { type: 'integer' },
    year: { type: 'text' },
    start: { type: 'date', style: 'full' },
    end: { type: 'date', style: 'full' },
  },
  Extra: Weeks,
});

export default island(def);
