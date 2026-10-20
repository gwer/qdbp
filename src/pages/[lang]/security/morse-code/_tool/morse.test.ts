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
