import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Наценка считается от себестоимости, маржа — от цены продажи. */
export function markup(cost: number, percent: number) {
  const profit = (cost * percent) / 100;
  const price = cost + profit;
  return { price, profit, margin: price > 0 ? (profit / price) * 100 : 0 };
}

/** Себестоимость по цене продажи и наценке: C = P / (1 + k). */
export function costFromPrice(price: number, percent: number) {
  const cost = price / (1 + percent / 100);
  return { cost, profit: price - cost, margin: price > 0 ? ((price - cost) / price) * 100 : 0 };
}

export const def = defineCalculator({
  order: 50,
  related: ['margin', 'break-even', 'discount', 'vat'],
  inputs: {
    find: { type: 'select', options: ['price', 'cost'], default: 'price' },
    cost: { type: 'number', default: 800, min: 0, showIf: { find: 'price' } },
    price: { type: 'number', default: 1000, min: 0, showIf: { find: 'cost' } },
    percent: { type: 'percent', default: 25, min: 0 },
  },
  compute: ({ find, cost, price, percent }) => (find === 'cost' ? costFromPrice(price, percent) : markup(cost, percent)),
  outputs: {
    price: { type: 'money', showIf: { find: 'price' } },
    cost: { type: 'money', showIf: { find: 'cost' } },
    profit: { type: 'money' },
    margin: { type: 'percent', digits: 2 },
  },
});

export default island(def);
