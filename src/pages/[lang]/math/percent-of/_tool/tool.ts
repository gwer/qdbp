import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

// Сначала умножение, потом деление: 7 * 33 / 100 = 2.31 без хвоста плавающей точки.
export const percentOf = (percent: number, value: number) => (percent * value) / 100;

export const def = defineCalculator({
  order: 10,
  inputs: {
    // Отрицательные значения в «X% от числа» почти не встречаются, а min: 0 даёт цифровую клавиатуру на телефоне.
    percent: { type: 'percent', default: 20, min: 0 },
    value: { type: 'number', default: 150, min: 0 },
  },
  compute: ({ percent, value }) => ({ result: percentOf(percent, value) }),
  outputs: { result: {} },
});

export default island(def);
