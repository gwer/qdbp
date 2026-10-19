import { describe, expect, it } from 'vitest';
import { dedupe, dedupeIgnoreCase, removeEmpty, reverse, sort, trimLines } from './lines';

describe('строки', () => {
  it('удалить дубли', () => {
    expect(dedupe('a\nb\na\r\nc\nb')).toBe('a\nb\nc');
    expect(dedupeIgnoreCase('Яблоко\nяблоко \nГруша', 'ru-RU')).toBe('Яблоко\nГруша');
  });

  it('сортировка по языку и числам', () => {
    expect(sort('ёж\nе\nа\nя', 'ru-RU')).toBe('а\nе\nёж\nя');
    expect(sort('item 10\nitem 2\nitem 1', 'en-US')).toBe('item 1\nitem 2\nitem 10');
    expect(sort('b\na\nc', 'en-US', true)).toBe('c\nb\na');
  });

  it('пустые, пробелы, порядок', () => {
    expect(removeEmpty('a\n\n  \nb')).toBe('a\nb');
    expect(trimLines('  a \n\tb')).toBe('a\nb');
    expect(reverse('1\n2\n3')).toBe('3\n2\n1');
  });
});
