import { defineCalculator } from '@/ui/define';

// Сначала умножение, потом деление: 7 * 33 / 100 = 2.31 без хвоста плавающей точки.
export const percentOf = (percent: number, value: number) => (percent * value) / 100;

export default defineCalculator({
  inputs: {
    percent: { type: 'percent', default: 20 },
    value: { type: 'number', default: 150 },
  },
  compute: ({ percent, value }) => ({ result: percentOf(percent, value) }),
  outputs: { result: {} },
});
