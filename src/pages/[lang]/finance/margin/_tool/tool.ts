import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Маржа — прибыль в процентах от цены продажи, наценка — в процентах от себестоимости. */
export function margin(cost: number, price: number) {
  if (!(price > 0)) throw new RangeError('price must be positive');
  const profit = price - cost;
  return { margin: (profit / price) * 100, profit, markup: cost > 0 ? (profit / cost) * 100 : NaN };
}

export const def = defineCalculator({
  order: 60,
  related: ['markup', 'break-even', 'discount', 'vat'],
  inputs: {
    cost: { type: 'number', default: 800, min: 0 },
    price: { type: 'number', default: 1000, min: 0 },
  },
  compute: ({ cost, price }) => margin(cost, price),
  outputs: {
    margin: { type: 'percent', digits: 2 },
    profit: { type: 'money' },
    markup: { type: 'percent', digits: 2 },
  },
});

export default island(def);
