import { convert } from '@/lib/units';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * Ориентир по питьевой воде: 30 мл на кг веса, плюс 350 мл на каждые 30 минут тренировки
 * и 0,5 л в жару. weight — кг, exercise — минуты, результат — литры.
 */
export function waterIntake(weight: number, exercise: number, hot: boolean) {
  return { total: weight * 0.03 + (exercise / 30) * 0.35 + (hot ? 0.5 : 0) };
}

/** Стаканы по 250 мл, в американской системе — чашки по 8 жидких унций. */
const glasses = (liters: number, { t, units }: FormatContext) =>
  units === 'imperial'
    ? t('ui.cups', { count: Math.round(convert(liters, 'l', 'floz') / 8) })
    : t('ui.glasses', { count: Math.round(liters / 0.25) });

export const def = defineCalculator({
  order: 25,
  related: ['calorie-calculator', 'bmi'],
  inputs: {
    weight: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 70, defaultImperial: 160, min: 10, max: 400 },
    exercise: { type: 'duration', default: 30 },
    climate: { type: 'select', options: ['normal', 'hot'], default: 'normal' },
  },
  compute: ({ weight, exercise, climate }) => {
    const { total } = waterIntake(weight, exercise, climate === 'hot');
    return { total, glasses: total };
  },
  outputs: {
    total: { type: 'quantity', unit: 'l', imperial: 'floz', digits: 1 },
    glasses: { type: 'custom', format: glasses },
  },
});

export default island(def);
