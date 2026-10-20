import { formatNumber } from '@/lib/format';
import { convert, unitSymbol } from '@/lib/units';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

type Sex = 'male' | 'female';

/** [основа для роста 5 футов, кг на каждый дюйм сверх] — мужчины, женщины. */
const FORMULAS = {
  devine: [[50, 2.3], [45.5, 2.3]],
  robinson: [[52, 1.9], [49, 1.7]],
  miller: [[56.2, 1.41], [53.1, 1.36]],
  hamwi: [[48, 2.7], [45.5, 2.2]],
} as const;

/** height — см, результат — кг. */
export function idealWeight(sex: Sex, height: number) {
  const over = height / 2.54 - 60;
  const i = sex === 'male' ? 0 : 1;
  const by = (f: keyof typeof FORMULAS) => FORMULAS[f][i][0] + FORMULAS[f][i][1] * over;
  const m2 = (height / 100) ** 2;
  const formulas = (Object.keys(FORMULAS) as (keyof typeof FORMULAS)[]).map(by);
  return {
    // Формулы дают разные ответы — главный результат диапазон между ними.
    range: [Math.min(...formulas), Math.max(...formulas)] as [number, number],
    devine: by('devine'),
    robinson: by('robinson'),
    miller: by('miller'),
    hamwi: by('hamwi'),
    bmiMin: 18.5 * m2,
    bmiMax: 24.9 * m2,
  };
}

const kg = { type: 'quantity', unit: 'kg', imperial: 'lb', digits: 1 } as const;

/** «64,2–72,6 кг» в единицах выбранной системы. */
const formatRange = ([lo, hi]: [number, number], { lang, units }: FormatContext) => {
  const u = units === 'imperial' ? 'lb' : 'kg';
  const f = (x: number) => formatNumber(lang, convert(x, 'kg', u), 'number', 1);
  return `${f(lo)}–${f(hi)} ${unitSymbol(lang, u)}`;
};

export const def = defineCalculator({
  order: 12,
  related: ['bmi', 'body-fat', 'calorie-calculator'],
  inputs: {
    sex: { type: 'select', options: ['male', 'female'], default: 'male' },
    height: { type: 'quantity', unit: 'cm', imperial: 'in', default: 178, defaultImperial: 70, min: 140, max: 230 },
  },
  compute: ({ sex, height }) => idealWeight(sex, height),
  outputs: { range: { type: 'custom', format: formatRange }, devine: kg, robinson: kg, miller: kg, hamwi: kg, bmiMin: kg, bmiMax: kg },
});

export default island(def);
