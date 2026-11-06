export type Position = 'tl' | 'tc' | 'tr' | 'bl' | 'bc' | 'br';
export type NumFormat = 'n' | 'nOfTotal' | 'dash' | 'page' | 'pageOf';

/** Текст номера. Форматы со словами («Страница 3 из 10») подставляет перевод. */
export function numberText(format: NumFormat, n: number, total: number, words: (key: 'page' | 'pageOf', n: number, total: number) => string): string {
  switch (format) {
    case 'nOfTotal':
      return `${n} / ${total}`;
    case 'dash':
      return `– ${n} –`;
    case 'page':
    case 'pageOf':
      return words(format, n, total);
    default:
      return String(n);
  }
}

/**
 * Точка привязки номера на видимой странице width×height (пункты): отступ margin от края,
 * сверху — базовая линия на высоту заглавных (0,72 кегля) ниже отступа.
 */
export function anchor(pos: Position, width: number, height: number, margin: number, size: number) {
  const h = pos[1] === 'l' ? 'left' : pos[1] === 'c' ? 'center' : 'right';
  const x = h === 'left' ? margin : h === 'center' ? width / 2 : width - margin;
  const y = pos[0] === 't' ? height - margin - size * 0.72 : margin;
  return { x, y, align: h } as const;
}
