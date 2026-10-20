import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/**
 * power — ватты, hours — часов работы в день, tariff — цена кВт·ч, days — дней работы в неделю.
 * Месяц — двенадцатая часть года (365 / 12 ≈ 30,4 дня), чтобы «в месяц × 12» равнялось «в год».
 */
export function electricityCost(power: number, hours: number, tariff: number, days = 7) {
  if (hours > 24) throw new RangeError('more than 24 hours a day');
  if (days > 7) throw new RangeError('more than 7 days a week');
  const kwhDay = (power * hours) / 1000;
  const costDay = kwhDay * tariff;
  const share = days / 7;
  const costYear = costDay * 365 * share;
  return { costMonth: costYear / 12, costDay, costYear, kwhDay, kwhMonth: (kwhDay * 365 * share) / 12 };
}

// Тарифы по умолчанию — порядок цен для бытовых потребителей в стране языка.
export const def = defineCalculator({
  order: 160,
  related: ['fuel-cost', 'energy-converter'],
  inputs: {
    power: { type: 'number', default: 2000, min: 0 },
    hours: { type: 'number', default: 3, min: 0, max: 24 },
    tariff: { type: 'number', default: 0.3, min: 0, byLang: { ru: 7, en: 0.17, es: 0.15, de: 0.38, pt: 0.85 } },
    days: { type: 'integer', default: 7, min: 1, max: 7 },
  },
  compute: ({ power, hours, tariff, days }) => electricityCost(power, hours, tariff, days),
  outputs: {
    costMonth: { type: 'money' },
    costDay: { type: 'money' },
    costYear: { type: 'money' },
    kwhDay: { digits: 2 },
    kwhMonth: { digits: 1 },
  },
});

export default island(def);
