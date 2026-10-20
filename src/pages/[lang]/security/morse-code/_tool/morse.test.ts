import { describe, expect, it } from 'vitest';
import { decodeMorse, encodeMorse } from './morse';

describe('морзе', () => {
  it('SOS и слова', () => {
    expect(encodeMorse('SOS')).toBe('... --- ...');
    expect(encodeMorse('hello world')).toBe('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
    expect(decodeMorse('.... . .-.. .-.. --- / .-- --- .-. .-.. -..', 'latin')).toBe('HELLO WORLD');
  });

  it('кириллица', () => {
    expect(encodeMorse('Привет')).toBe('.--. .-. .. .-- . -');
    expect(decodeMorse('.--. .-. .. .-- . -', 'cyrillic')).toBe('ПРИВЕТ');
    expect(decodeMorse('---. . .-.. --- .-- . -.-', 'cyrillic')).toBe('ЧЕЛОВЕК');
  });

  it('цифры, знаки и разные символы точек и тире', () => {
    expect(encodeMorse('2026!')).toBe('..--- ----- ..--- -.... -.-.--');
    expect(decodeMorse('··· ——— ···', 'latin')).toBe('SOS');
  });

  it('неизвестные символы — ошибка', () => {
    expect(() => encodeMorse('a#b')).toThrow();
    expect(() => decodeMorse('......', 'latin')).toThrow();
  });
});

describe('звук', () => {
  it('SOS: точки 1, тире 3, паузы 1 / 3 / 7', async () => {
    const { morseTimeline } = await import('./morse');
    expect(morseTimeline('... --- ...')).toEqual([[0, 1], [2, 1], [4, 1], [8, 3], [12, 3], [16, 3], [22, 1], [24, 1], [26, 1]]);
    expect(morseTimeline('. / .')).toEqual([[0, 1], [8, 1]]);
  });
});
