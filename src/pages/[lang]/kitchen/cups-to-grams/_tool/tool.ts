import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { INGREDIENT_IDS, MEASURE_IDS, toGrams } from '../../_shared/measures';
import { MeasureTable } from './MeasureTable';

// Мука по умолчанию: в США рецепты рассчитаны на рыхлую (насыпать ложкой и срезать), в остальных
// рынках её черпают стаканом из пакета.
// Привычная мера по рынку: американская чашка (en), гранёный стакан 200 мл (ru),
// taza/xícara 240 мл (es, pt), Tasse 250 мл (de).
export const def = defineCalculator({
  order: 40,
  related: ['recipe-scaler', 'yeast'],
  inputs: {
    ingredient: { type: 'select', options: INGREDIENT_IDS, default: 'flourScooped', byLang: { en: 'flour' } },
    amount: { type: 'number', default: 1, min: 0 },
    measure: {
      type: 'select',
      options: MEASURE_IDS,
      default: 'cupUs',
      byLang: { ru: 'glass200', es: 'cup240', pt: 'cup240', de: 'cup250' },
    },
  },
  compute: ({ ingredient, amount, measure }) => ({ grams: toGrams(amount, measure, ingredient), ingredient }),
  outputs: {
    grams: { digits: 1 },
  },
  Extra: MeasureTable,
});

export default island(def);
