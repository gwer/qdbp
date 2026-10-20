import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** Маржа — прибыль в процентах от цены продажи, наценка — в процентах от себестоимости. */
export function margin(cost: number, price: number) {
  if (!(price > 0)) throw new RangeError('price must be positive');
  const profit = price - cost;
  return { margin: (profit / price) * 100, profit, markup: cost > 0 ? (profit / cost) * 100 : NaN };
}

/** Цена, при которой маржа равна target %: P = C / (1 − m). */
export function priceForMargin(cost: number, target: number) {
  if (target >= 100) throw new InputError('marginTooHigh');
  const price = cost / (1 - target / 100);
  return { price, profit: price - cost, markup: cost > 0 ? ((price - cost) / cost) * 100 : NaN };
}

export const def = defineCalculator({
  order: 60,
  related: ['markup', 'break-even', 'discount', 'vat'],
  inputs: {
    find: { type: 'select', options: ['margin', 'price'], default: 'margin' },
    cost: { type: 'number', default: 800, min: 0 },
    price: { type: 'number', default: 1000, min: 0, showIf: { find: 'margin' } },
    target: { type: 'percent', default: 30, min: 0, showIf: { find: 'price' } },
  },
  errors: ['marginTooHigh'],
  compute: ({ find, cost, price, target }) => (find === 'price' ? priceForMargin(cost, target) : margin(cost, price)),
  outputs: {
    margin: { type: 'percent', digits: 2, showIf: { find: 'margin' } },
    price: { type: 'money', showIf: { find: 'price' } },
    profit: { type: 'money' },
    markup: { type: 'percent', digits: 2 },
  },
});

export default island(def);
