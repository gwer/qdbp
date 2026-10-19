import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function discount(price: number, percent: number) {
  const saving = (price * percent) / 100;
  return { final: price - saving, saving };
}

export const def = defineCalculator({
  order: 40,
  related: ['markup', 'margin', 'vat'],
  inputs: {
    price: { type: 'number', default: 2490, min: 0 },
    percent: { type: 'percent', default: 15, min: 0, max: 100 },
  },
  compute: ({ price, percent }) => discount(price, percent),
  outputs: {
    final: { type: 'money' },
    saving: { type: 'money' },
  },
});

export default island(def);
