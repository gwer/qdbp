import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type BmiCategory = 'under' | 'normal' | 'over' | 'obese1' | 'obese2' | 'obese3';

/** Классификация ВОЗ для взрослых. Категория — по ИМТ, округлённому до десятых, как его видит пользователь. */
export function bmiCategory(bmi: number): BmiCategory {
  const b = Math.round(bmi * 10) / 10;
  if (b < 18.5) return 'under';
  if (b < 25) return 'normal';
  if (b < 30) return 'over';
  if (b < 35) return 'obese1';
  if (b < 40) return 'obese2';
  return 'obese3';
}

/** weight — кг, height — см. */
export function bmi(weight: number, height: number) {
  const m2 = (height / 100) ** 2;
  const value = weight / m2;
  return { bmi: value, category: bmiCategory(value), healthyMin: 18.5 * m2, healthyMax: 24.9 * m2 };
}

export const def = defineCalculator({
  order: 10,
  related: ['calorie-calculator'],
  inputs: {
    weight: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 70, defaultImperial: 160, min: 1, max: 700 },
    height: { type: 'quantity', unit: 'cm', imperial: 'in', default: 175, defaultImperial: 69, min: 30, max: 300 },
  },
  compute: ({ weight, height }) => bmi(weight, height),
  outputs: {
    bmi: { digits: 1 },
    category: { type: 'custom', format: (c: BmiCategory, { t }) => t(`ui.categories.${c}`) },
    healthyMin: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
    healthyMax: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
  },
});

export default island(def);
