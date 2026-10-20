import { formatNumber } from '@/lib/format';
import { convert, unitSymbol } from '@/lib/units';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { BmiScale } from './BmiScale';

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
  const healthyMin = 18.5 * m2;
  const healthyMax = 24.9 * m2;
  const category = bmiCategory(value);
  // Сколько набрать (+) или сбросить (−) до ближайшей границы нормы; 0 — вес в норме (как в категории).
  const toNormal = category === 'normal' ? 0 : weight < healthyMin ? healthyMin - weight : healthyMax - weight;
  return { bmi: value, category, toNormal, healthyMin, healthyMax };
}

/** «+3,2 кг» / «−5,1 lb» / «в норме». */
function formatToNormal(kg: number, { t, lang, units }: FormatContext): string {
  if (Math.abs(kg) < 0.05) return t('ui.inRange');
  const unit = units === 'imperial' ? 'lb' : 'kg';
  const v = convert(kg, 'kg', unit);
  return `${v > 0 ? '+' : '−'}${formatNumber(lang, Math.abs(v), 'number', 1)} ${unitSymbol(lang, unit)}`;
}

export const def = defineCalculator({
  order: 10,
  related: ['calorie-calculator', 'ideal-weight', 'body-fat'],
  inputs: {
    weight: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 70, defaultImperial: 160, min: 1, max: 700 },
    height: { type: 'quantity', unit: 'cm', imperial: 'in', default: 175, defaultImperial: 69, min: 30, max: 300 },
  },
  compute: ({ weight, height }) => bmi(weight, height),
  outputs: {
    bmi: { digits: 1 },
    category: { type: 'custom', format: (c: BmiCategory, { t }) => t(`ui.categories.${c}`) },
    toNormal: { type: 'custom', format: formatToNormal },
    healthyMin: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
    healthyMax: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
  },
  Extra: BmiScale,
});

export default island(def);
