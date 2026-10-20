import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Find = 'final' | 'original' | 'percent';

/** Цена со скидкой по цене и скидке в процентах. */
export function discount(price: number, percent: number) {
  const saving = (price * percent) / 100;
  return { final: price - saving, saving };
}

/** Цена до скидки по цене со скидкой: final / (1 − p/100). */
export function originalPrice(sale: number, percent: number) {
  if (percent >= 100) throw new InputError('fullDiscount');
  const original = sale / (1 - percent / 100);
  return { original, saving: original - sale };
}

/** Скидка в процентах по двум ценам. */
export function discountPercent(price: number, sale: number) {
  if (sale > price) throw new InputError('saleAbovePrice');
  if (!(price > 0)) throw new RangeError('price must be positive');
  return { percent: ((price - sale) / price) * 100, saving: price - sale };
}

export const def = defineCalculator({
  order: 40,
  related: ['markup', 'margin', 'vat'],
  inputs: {
    find: { type: 'select', options: ['final', 'original', 'percent'], default: 'final' },
    price: { type: 'number', default: 2490, min: 0, showIf: { find: ['final', 'percent'] } },
    sale: { type: 'number', default: 2116.5, min: 0, showIf: { find: ['original', 'percent'] } },
    percent: { type: 'percent', default: 15, min: 0, max: 100, showIf: { find: ['final', 'original'] } },
  },
  errors: ['fullDiscount', 'saleAbovePrice'],
  compute: ({ find, price, sale, percent }) =>
    find === 'original' ? originalPrice(sale, percent) : find === 'percent' ? discountPercent(price, sale) : discount(price, percent),
  outputs: {
    final: { type: 'money', showIf: { find: 'final' } },
    original: { type: 'money', showIf: { find: 'original' } },
    percent: { type: 'percent', digits: 2, showIf: { find: 'percent' } },
    saving: { type: 'money' },
  },
});

export default island(def);
