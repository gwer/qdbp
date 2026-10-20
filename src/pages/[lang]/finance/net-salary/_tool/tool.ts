import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { MonthTable } from './MonthTable';
import { grossFromNet, salaryYear } from './ndfl';

// Только для России: шкала НДФЛ своя у каждой страны.
export const def = defineCalculator({
  order: 170,
  related: ['vat', 'loan-calculator', 'mortgage'],
  inputs: {
    mode: { type: 'select', options: ['gross', 'net'], default: 'gross' },
    amount: { type: 'number', default: 100_000, min: 0 },
  },
  compute: ({ mode, amount }) => {
    const gross = mode === 'gross' ? amount : grossFromNet(amount);
    return { gross, ...salaryYear(gross) };
  },
  outputs: {
    net: { type: 'money' },
    gross: { type: 'money' },
    tax: { type: 'money' },
    yearNet: { type: 'money' },
    yearTax: { type: 'money' },
    rate: { type: 'percent', digits: 2 },
  },
  Extra: MonthTable,
});

export default island(def);
