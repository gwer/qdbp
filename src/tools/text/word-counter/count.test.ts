import { describe, expect, it } from 'vitest';
import { countText } from './count';

describe('countText', () => {
  it('пустой текст', () => {
    expect(countText('', 'ru-RU')).toEqual({ chars: 0, charsNoSpaces: 0, words: 0, sentences: 0, paragraphs: 0 });
  });

  it('русский текст', () => {
    const s = countText('Привет, мир! Как дела?\n\nВторой абзац.', 'ru-RU');
    expect(s.words).toBe(6);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
  });

  it('символы считаются графемами', () => {
    expect(countText('👍🏽 é', 'en-US').chars).toBe(3);
    expect(countText('a b', 'en-US').charsNoSpaces).toBe(2);
  });

  it('слова с апострофом и числа', () => {
    expect(countText("don't stop 2026", 'en-US').words).toBe(3);
  });
});
