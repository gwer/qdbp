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

  it('слово через дефис — одно слово', () => {
    expect(countText('из-за кто-то', 'ru-RU').words).toBe(2);
    expect(countText('a well-known E-Mail', 'en-US').words).toBe(3);
    expect(countText('franco-alemán guarda-chuva', 'es-ES').words).toBe(2);
    expect(countText('слово - слово', 'ru-RU').words).toBe(2);
    expect(countText('2020-2026', 'ru-RU').words).toBe(1);
  });
});

describe('время чтения и частые слова', () => {
  it('460 слов — 2 минуты чтения и 3:17 вслух', async () => {
    const { readingSeconds } = await import('./count');
    expect(readingSeconds(460, 230)).toBe(120);
    expect(readingSeconds(460, 140)).toBe(197);
  });

  it('частые слова без учёта регистра, короткие пропускаются', async () => {
    const { topWords } = await import('./count');
    expect(topWords('Кот и кот. И КОТ спит, кот не спит. Он и мы.', 'ru')).toEqual([
      { word: 'кот', count: 4 },
      { word: 'спит', count: 2 },
    ]);
  });
});
