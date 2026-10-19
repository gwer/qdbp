import { describe, expect, it } from 'vitest';
import { gost, passport, slug } from './translit';

describe('ICAO (загранпаспорт)', () => {
  it.each([
    ['Щукин Юрий', 'Shchukin Iurii'],
    ['Ёлкина Наталья', 'Elkina Natalia'],
    ['Хабаров Цезарь', 'Khabarov Tsezar'],
    ['Подъячев Андрей', 'Podieiachev Andrei'],
    ['ЩУКИН', 'SHCHUKIN'],
    ['Мария-Луиза', 'Mariia-Luiza'],
  ])('%s → %s', (src, expected) => {
    expect(passport(src)).toBe(expected);
  });
});

describe('ГОСТ 7.79-2000, система Б', () => {
  it.each([
    ['Цирк', 'Cirk'],
    ['Цапля', 'Czaplya'],
    ['Щука', 'Shhuka'],
    ['Юрий', 'Yurij'],
    ['объём', 'ob``yom'],
    ['Мэр', 'Me`r'],
    ['рыба', 'ry`ba'],
  ])('%s → %s', (src, expected) => {
    expect(gost(src)).toBe(expected);
  });
});

describe('для ссылок', () => {
  it.each([
    ['Привет, мир! 2026', 'privet-mir-2026'],
    ['Кредитный калькулятор', 'kreditnyy-kalkulyator'],
    ['  Съешь же ещё  ', 'sesh-zhe-eshche'],
    ['Café crème', 'cafe-creme'],
  ])('%s → %s', (src, expected) => {
    expect(slug(src)).toBe(expected);
  });
});
