// Кухонные меры объёма в миллилитрах.
// Американская чашка — 236,59 мл (customary cup, 8 fl oz); на ней построены весовые таблицы
// King Arthur. Ложки — метрические 15 и 5 мл (американские 14,79 и 4,93 мл отличаются на 1,4%).

export const MEASURES = {
  cupUs: 236.5882365,
  cup240: 240,
  cup250: 250,
  glass200: 200,
  tbsp: 15,
  tsp: 5,
  ml: 1,
  g: 0,
} as const;
export type Measure = keyof typeof MEASURES;
export const MEASURE_IDS = Object.keys(MEASURES) as Measure[];

// Плотность, г/мл. Сыпучие продукты — по весовой таблице King Arthur Baking (граммы на американскую
// чашку при наборе ложкой с выравниванием), жидкости — по физической плотности.
const PER_CUP = (g: number) => g / MEASURES.cupUs;
export const INGREDIENTS = {
  flour: PER_CUP(120),
  flourScooped: 0.64,
  wholeWheatFlour: PER_CUP(113),
  ryeFlour: PER_CUP(106),
  almondFlour: PER_CUP(96),
  semolina: PER_CUP(163),
  cornmeal: PER_CUP(138),
  cornstarch: PER_CUP(112),
  sugar: PER_CUP(198),
  brownSugar: PER_CUP(213),
  powderedSugar: PER_CUP(113),
  honey: 21 / 14.7867648,
  mapleSyrup: PER_CUP(312),
  butter: PER_CUP(227),
  oil: 0.92,
  water: 1,
  milk: 1.03,
  cream: 1,
  yogurt: 1.03,
  sourCream: 1,
  cocoa: PER_CUP(84),
  oats: PER_CUP(113),
  rice: PER_CUP(198),
  buckwheat: PER_CUP(170),
  raisins: PER_CUP(149),
  walnuts: PER_CUP(113),
  chocolateChips: PER_CUP(170),
  peanutButter: PER_CUP(270),
  coconut: PER_CUP(53),
  salt: 18 / 14.7867648,
} as const;
export type Ingredient = keyof typeof INGREDIENTS;
export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as Ingredient[];

/** Количество в выбранной мере → граммы. Для меры «г» — без пересчёта. */
export function toGrams(amount: number, measure: Measure, ingredient: Ingredient): number {
  return measure === 'g' ? amount : amount * MEASURES[measure] * INGREDIENTS[ingredient];
}

/** Граммы → количество в мере. */
export function fromGrams(grams: number, measure: Measure, ingredient: Ingredient): number {
  return measure === 'g' ? grams : grams / (MEASURES[measure] * INGREDIENTS[ingredient]);
}
