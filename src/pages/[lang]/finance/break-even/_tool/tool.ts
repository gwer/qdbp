import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Cvp } from './Cvp';

/**
 * Точка безубыточности: сколько единиц продать, чтобы маржинальный доход покрыл постоянные затраты
 * (и желаемую прибыль, если она задана). Количество округляется вверх до целой единицы.
 */
export function breakEven(fixed: number, price: number, variable: number, profit = 0) {
  const contribution = price - variable;
  if (!(contribution > 0)) throw new InputError('priceBelowCost');
  if (fixed < 0 || profit < 0) throw new RangeError('negative costs or profit');
  const units = Math.ceil((fixed + profit) / contribution - 1e-9);
  return { units, revenue: units * price, contribution, ratio: (contribution / price) * 100 };
}

export const def = defineCalculator({
  order: 110,
  related: ['margin', 'markup', 'roi'],
  inputs: {
    fixed: { type: 'number', default: 10000, min: 0, byLang: { ru: 300000 } },
    price: { type: 'number', default: 50, min: 0.01, byLang: { ru: 1500 } },
    variable: { type: 'number', default: 30, min: 0, byLang: { ru: 900 } },
    profit: { type: 'number', default: 0, min: 0 },
  },
  errors: ['priceBelowCost'],
  compute: ({ fixed, price, variable, profit }) => breakEven(fixed, price, variable, profit),
  outputs: {
    units: { type: 'integer' },
    revenue: { type: 'money' },
    contribution: { type: 'money' },
    ratio: { type: 'percent' },
  },
  Extra: Cvp,
});

export default island(def);
