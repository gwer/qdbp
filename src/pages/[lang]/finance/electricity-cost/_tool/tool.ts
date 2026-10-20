import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

/** power — ватты, hours — часов работы в день, tariff — цена кВт·ч. Месяц — 30 дней. */
export function electricityCost(power: number, hours: number, tariff: number) {
  if (hours > 24) throw new RangeError('more than 24 hours a day');
  const kwhDay = (power * hours) / 1000;
  const costDay = kwhDay * tariff;
  return { costMonth: costDay * 30, costDay, costYear: costDay * 365, kwhDay, kwhMonth: kwhDay * 30 };
}

// Тарифы по умолчанию — порядок цен для бытовых потребителей в стране языка.
export const def = defineCalculator({
  order: 160,
  related: ['fuel-cost', 'energy-converter'],
  inputs: {
    power: { type: 'number', default: 2000, min: 0 },
    hours: { type: 'number', default: 3, min: 0, max: 24 },
    tariff: { type: 'number', default: 0.3, min: 0, byLang: { ru: 7, en: 0.17, es: 0.15, de: 0.38, pt: 0.85 } },
  },
  compute: ({ power, hours, tariff }) => electricityCost(power, hours, tariff),
  outputs: {
    costMonth: { type: 'money' },
    costDay: { type: 'money' },
    costYear: { type: 'money' },
    kwhDay: { digits: 2 },
    kwhMonth: { digits: 1 },
  },
});

export default island(def);
