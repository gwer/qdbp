import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Countdown } from './Countdown';
import { localMoment } from './timer';

export const def = defineCalculator({
  order: 25,
  related: ['days-between', 'add-to-date', 'age-calculator'],
  inputs: {
    date: { type: 'date', default: 'next-01-01' },
    time: { type: 'time', default: '00:00' },
  },
  compute: ({ date, time }) => ({ date, when: localMoment(date, time) }),
  outputs: { date: { type: 'date', style: 'full' } },
  Extra: Countdown,
});

export default island(def);
