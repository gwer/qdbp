import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Точка безубыточности: сколько единиц продать, чтобы маржинальный доход покрыл постоянные затраты.
 * Количество округляется вверх до целой единицы.
 */
export function breakEven(fixed: number, price: number, variable: number) {
  const contribution = price - variable;
  if (!(contribution > 0) || fixed < 0) throw new RangeError('price must exceed variable cost');
  const units = Math.ceil(fixed / contribution - 1e-9);
  return { units, revenue: units * price, contribution, ratio: (contribution / price) * 100 };
}

export const def = defineCalculator({
  order: 110,
  related: ['margin', 'markup', 'roi'],
  inputs: {
    fixed: { type: 'number', default: 10000, min: 0, byLang: { ru: 300000 } },
    price: { type: 'number', default: 50, min: 0.01, byLang: { ru: 1500 } },
    variable: { type: 'number', default: 30, min: 0, byLang: { ru: 900 } },
  },
  compute: ({ fixed, price, variable }) => breakEven(fixed, price, variable),
  outputs: {
    units: { type: 'integer' },
    revenue: { type: 'money' },
    contribution: { type: 'money' },
    ratio: { type: 'percent' },
  },
});

export default island(def);
