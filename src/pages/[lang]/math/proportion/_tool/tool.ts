import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Formula } from './Formula';

export type Kind = 'direct' | 'inverse';

/**
 * Пропорция (правило трёх): «A соответствует B, C соответствует X».
 * Прямая: X = B·C / A. Обратная (чем больше C, тем меньше X): X = A·B / C.
 */
export function proportion(a: number, b: number, c: number, kind: Kind) {
  const divisor = kind === 'direct' ? a : c;
  if (divisor === 0) throw new RangeError('division by zero');
  return { x: kind === 'direct' ? (b * c) / a : (a * b) / c };
}

export const def = defineCalculator({
  order: 50,
  related: ['what-percent', 'percent-of', 'average'],
  inputs: {
    a: { type: 'number', default: 3, min: 0 },
    b: { type: 'number', default: 12, min: 0 },
    c: { type: 'number', default: 5, min: 0 },
    kind: { type: 'select', options: ['direct', 'inverse'], default: 'direct' },
  },
  compute: ({ a, b, c, kind }) => proportion(a, b, c, kind),
  outputs: { x: { digits: 6 } },
  Extra: Formula,
});

export default island(def);
