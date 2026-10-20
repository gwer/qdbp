import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Наценка считается от себестоимости, маржа — от цены продажи. */
export function markup(cost: number, percent: number) {
  const profit = (cost * percent) / 100;
  const price = cost + profit;
  return { price, profit, margin: price > 0 ? (profit / price) * 100 : 0 };
}

export const def = defineCalculator({
  order: 50,
  related: ['margin', 'break-even', 'discount', 'vat'],
  inputs: {
    cost: { type: 'number', default: 800, min: 0 },
    percent: { type: 'percent', default: 25, min: 0 },
  },
  compute: ({ cost, percent }) => markup(cost, percent),
  outputs: {
    price: { type: 'money' },
    profit: { type: 'money' },
    margin: { type: 'percent', digits: 2 },
  },
});

export default island(def);
