import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { yeast, type Yeast } from './yeast';

// Типичное количество в рецептах рынка: 25 г свежих (ru, es), ½ кубика 21 г (de), 15 г (pt),
// пакетик 7 г сухих (en).
export const def = defineCalculator({
  order: 30,
  related: ['recipe-scaler', 'cups-to-grams'],
  inputs: {
    amount: { type: 'number', default: 25, min: 0, byLang: { en: 7, de: 21, pt: 15 } },
    from: { type: 'select', options: ['fresh', 'active', 'instant'] as Yeast[], default: 'fresh', byLang: { en: 'active' } },
  },
  compute: ({ amount, from }) => yeast(amount, from),
  outputs: {
    fresh: { digits: 1 },
    active: { digits: 1 },
    instant: { digits: 1 },
  },
});

export default island(def);
