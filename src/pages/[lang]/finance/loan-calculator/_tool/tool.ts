import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { loan } from './loan';
import { Schedule } from './Schedule';

export const def = defineCalculator({
  order: 10,
  related: ['percent-of'],
  inputs: {
    amount: { type: 'number', default: 500000, min: 1 },
    rate: { type: 'percent', default: 12, min: 0, max: 100 },
    months: { type: 'integer', default: 60, min: 1, max: 600 },
    kind: { type: 'select', options: ['annuity', 'differentiated'], default: 'annuity' },
  },
  compute: (v) => loan(v),
  outputs: {
    payment: { type: 'money' },
    overpay: { type: 'money' },
    total: { type: 'money' },
  },
  Extra: Schedule,
});

export default island(def);
