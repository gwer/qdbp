import { describe, expect, it } from 'vitest';
import { formatDateInput, parseDateInput } from './date-input';

describe('поле даты', () => {
  it.each([
    ['ru', '09.10.2026'],
    ['de', '09.10.2026'],
    ['en', '10/09/2026'],
    ['es', '09/10/2026'],
    ['pt', '09/10/2026'],
  ] as const)('%s: запись %s', (lang, text) => {
    expect(formatDateInput('2026-10-09', lang)).toBe(text);
    expect(parseDateInput(text, lang)).toBe('2026-10-09');
  });

  it('разные разделители, без нулей, восемь цифр, ISO', () => {
    expect(parseDateInput('9.10.2026', 'ru')).toBe('2026-10-09');
    expect(parseDateInput('9/10/2026', 'ru')).toBe('2026-10-09');
    expect(parseDateInput(' 9 10 2026 ', 'ru')).toBe('2026-10-09');
    expect(parseDateInput('09102026', 'ru')).toBe('2026-10-09');
    expect(parseDateInput('10092026', 'en')).toBe('2026-10-09');
    expect(parseDateInput('10-9-2026', 'en')).toBe('2026-10-09');
    expect(parseDateInput('2026-10-09', 'en')).toBe('2026-10-09');
  });

  it('ошибки', () => {
    expect(parseDateInput('', 'ru')).toBeNull();
    expect(parseDateInput('31.02.2026', 'ru')).toBeNull();
    expect(parseDateInput('13/13/2026', 'en')).toBeNull();
    expect(parseDateInput('09.10.26', 'ru')).toBeNull();
    expect(parseDateInput('09.10', 'ru')).toBeNull();
    expect(parseDateInput('abc', 'ru')).toBeNull();
  });
});
