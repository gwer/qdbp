import { defineCalculator, InputError } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { FatScale } from './FatScale';

type Sex = 'male' | 'female';
export type FatCategory = 'essential' | 'athletes' | 'fitness' | 'average' | 'obese';

/** Границы категорий Американского совета по физическим упражнениям (ACE), % жира: начало «спортсменов», «фитнеса», «среднего», «ожирения». */
export const ACE = { male: [6, 14, 18, 25], female: [14, 21, 25, 32] } as const;

export function fatCategory(sex: Sex, percent: number): FatCategory {
  const [a, f, avg, o] = ACE[sex];
  const p = Math.round(percent * 10) / 10;
  if (p < a) return 'essential';
  if (p < f) return 'athletes';
  if (p < avg) return 'fitness';
  if (p < o) return 'average';
  return 'obese';
}

/**
 * Метод ВМС США (Hodgdon, Beckett, 1984), формулы для сантиметров.
 * Обхват бёдер учитывается только у женщин.
 */
export function bodyFat(sex: Sex, weight: number, height: number, neck: number, waist: number, hip: number) {
  const girth = sex === 'male' ? waist - neck : waist + hip - neck;
  if (girth <= 0) throw new InputError(sex === 'male' ? 'waistNeck' : 'girthNeck');
  const density =
    sex === 'male'
      ? 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(height)
      : 1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(height);
  const percent = 495 / density - 450;
  if (percent <= 0 || percent >= 75) throw new InputError('outOfRange');
  const fat = (weight * percent) / 100;
  return { percent, category: fatCategory(sex, percent), fat, lean: weight - fat };
}

const cm = (d: number, di: number) => ({ type: 'quantity', unit: 'cm', imperial: 'in', default: d, defaultImperial: di, min: 10, max: 250 }) as const;

export const def = defineCalculator({
  order: 15,
  related: ['bmi', 'ideal-weight', 'calorie-calculator'],
  inputs: {
    sex: { type: 'select', options: ['male', 'female'], default: 'male' },
    weight: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 80, defaultImperial: 180, min: 20, max: 400 },
    height: { type: 'quantity', unit: 'cm', imperial: 'in', default: 178, defaultImperial: 70, min: 100, max: 250 },
    neck: cm(38, 15),
    waist: cm(86, 34),
    hip: { ...cm(98, 38.5), showIf: { sex: 'female' } },
  },
  errors: ['waistNeck', 'girthNeck', 'outOfRange'],
  compute: ({ sex, weight, height, neck, waist, hip }) => bodyFat(sex, weight, height, neck, waist, hip),
  outputs: {
    percent: { type: 'percent', digits: 1 },
    category: { type: 'custom', format: (c: FatCategory, { t }) => t(`ui.categories.${c}`) },
    fat: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
    lean: { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 },
  },
  Extra: FatScale,
});

export default island(def);
