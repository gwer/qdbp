import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ShoeTable } from './ShoeTable';
import { findShoe, SYSTEMS } from './shoes';

export const def = defineCalculator({
  order: 110,
  related: ['length-converter', 'weight-converter'],
  inputs: {
    size: { type: 'number', default: 41, defaultBy: { system: { eu: 41, uk: 8, usM: 10, usW: 8, cm: 26 } } },
    system: { type: 'select', options: SYSTEMS, default: 'eu', byLang: { en: 'usM' } },
  },
  compute: ({ size, system }) => {
    const r = findShoe(size, system);
    return { eu: r.eu, uk: r.uk, usM: r.usM, usW: r.usW, cm: r.mm / 10 };
  },
  outputs: {
    eu: { type: 'number' },
    uk: { type: 'number' },
    usM: { type: 'number' },
    usW: { type: 'number' },
    cm: { type: 'number' },
  },
  Extra: ShoeTable,
});

export default island(def);
