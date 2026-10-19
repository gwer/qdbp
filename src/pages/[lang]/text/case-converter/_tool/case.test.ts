import { describe, expect, it } from 'vitest';
import { camel, kebab, lower, pascal, sentence, snake, title, upper } from './case';

const L = 'ru-RU';

describe('регистр', () => {
  it('верхний и нижний', () => {
    expect(upper('Привет, мир', L)).toBe('ПРИВЕТ, МИР');
    expect(lower('ПРИВЕТ, Мир', L)).toBe('привет, мир');
  });

  it('каждое слово с заглавной', () => {
    expect(title('съешь ещё этих мягких БУЛОК', L)).toBe('Съешь Ещё Этих Мягких Булок');
    expect(title("don't stop", 'en-US')).toBe("Don't Stop");
  });

  it('как в предложении', () => {
    expect(sentence('ПРИВЕТ. КАК ДЕЛА? ВСЁ ХОРОШО!', L)).toBe('Привет. Как дела? Всё хорошо!');
  });

  it('стили для кода', () => {
    expect(camel('Hello big World', 'en-US')).toBe('helloBigWorld');
    expect(pascal('hello big world', 'en-US')).toBe('HelloBigWorld');
    expect(snake('Hello, big World!', 'en-US')).toBe('hello_big_world');
    expect(kebab('Hello big World', 'en-US')).toBe('hello-big-world');
  });
});
