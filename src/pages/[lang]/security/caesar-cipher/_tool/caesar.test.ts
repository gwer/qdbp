import { describe, expect, it } from 'vitest';
import { caesar, rot13 } from './caesar';

describe('шифр Цезаря', () => {
  it('латиница', () => {
    expect(caesar('Hello, World!', 3)).toBe('Khoor, Zruog!');
    expect(caesar('Khoor, Zruog!', -3)).toBe('Hello, World!');
    expect(caesar('xyz', 3)).toBe('abc');
  });

  it('русский алфавит с Ё', () => {
    expect(caesar('Привет', 3)).toBe('Тулезх'); // е → ё → ж → з: в алфавите 33 буквы
    expect(caesar('Тулезх', -3)).toBe('Привет');
    expect(caesar('ЭЮЯ', 3)).toBe('АБВ');
    expect(caesar('е', 1)).toBe('ё');
  });

  it('ROT13 обратим', () => {
    expect(rot13('Hello')).toBe('Uryyb');
    expect(rot13(rot13('Hello'))).toBe('Hello');
  });
});
