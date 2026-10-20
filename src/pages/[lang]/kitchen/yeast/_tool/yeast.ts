// Соотношение по массе: свежие : сухие активные : инстантные = 1 : 0,4 : 1/3
// (множители из книги Джеффри Хамелмана «Bread»; часть таблиц даёт для сухих активных 0,5 — это ориентир).
export const YEAST = { fresh: 1, active: 0.4, instant: 1 / 3 } as const;
export type Yeast = keyof typeof YEAST;

export function yeast(grams: number, from: Yeast) {
  const fresh = grams / YEAST[from];
  return { fresh, active: fresh * YEAST.active, instant: fresh * YEAST.instant };
}
