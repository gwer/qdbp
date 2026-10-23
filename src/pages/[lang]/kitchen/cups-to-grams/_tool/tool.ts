import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CUP_IDS, INGREDIENT_IDS, MEASURE_IDS, PACKED_IDS, PACKINGS, toGrams } from '../../_shared/measures';
import { MeasureTable } from './MeasureTable';

// Как наполнить стакан — только для порошков, которые уплотняются: американские рецепты рассчитаны
// на рыхлую муку (насыпать ложкой и срезать), на остальных рынках стакан зачерпывают из пакета.
// Привычная мера по рынку: американская чашка (en), гранёный стакан 200 мл (ru),
// taza/xícara 240 мл (es, pt), Tasse 250 мл (de).
export const def = defineCalculator({
  order: 40,
  related: ['recipe-scaler', 'yeast'],
  inputs: {
    ingredient: { type: 'select', options: INGREDIENT_IDS, default: 'flour' },
    amount: { type: 'number', default: 1, min: 0 },
    measure: {
      type: 'select',
      options: MEASURE_IDS,
      default: 'cupUs',
      byLang: { ru: 'glass200', es: 'cup240', pt: 'cup240', de: 'cup250' },
    },
    packing: {
      type: 'select',
      options: PACKINGS,
      default: 'scooped',
      byLang: { en: 'spooned' },
      showIf: { ingredient: PACKED_IDS, measure: CUP_IDS },
    },
  },
  compute: ({ ingredient, amount, measure, packing }) => ({ grams: toGrams(amount, measure, ingredient, packing), ingredient }),
  outputs: {
    grams: { digits: 1 },
  },
  Extra: MeasureTable,
  // Раньше плотная мука была отдельным продуктом: ingredient=flourScooped (неизвестный продукт даёт муку по умолчанию).
  legacy: (params) => (params.get('ingredient') === 'flourScooped' ? { packing: 'scooped' } : {}),
});

export default island(def);
