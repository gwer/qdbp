import { formatNumber } from '@/lib/format';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { GasTable } from './GasTable';
import { gasLabel, oven } from './oven';

const deg = (unit: string) => (v: number, { lang }: { lang: Parameters<typeof formatNumber>[0] }) =>
  `${formatNumber(lang, Math.round(v), 'integer')} ${unit}`;

export const def = defineCalculator({
  order: 10,
  related: ['cake-pan', 'cups-to-grams'],
  inputs: {
    value: { type: 'number', default: 180, defaultBy: { scale: { c: 180, f: 350, gas: 4 } } },
    scale: { type: 'select', options: ['c', 'f', 'gas'], default: 'c', byLang: { en: 'f' } },
  },
  compute: ({ value, scale }) => oven(value, scale),
  outputs: {
    c: { type: 'custom', format: deg('°C') },
    f: { type: 'custom', format: deg('°F') },
    gas: { type: 'custom', format: (m: number | null) => gasLabel(m) },
    fanC: { type: 'custom', format: deg('°C') },
    fanF: { type: 'custom', format: deg('°F') },
  },
  Extra: GasTable,
});

export default island(def);
