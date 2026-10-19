import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';
import { qrMatrix, wifiPayload, type Level } from './qr';

/** Рисует матрицу в RGBA (4 пикселя на модуль, поле 4 модуля) и распознаёт её независимым декодером. */
function decode(m: boolean[][]): string | null {
  const scale = 4;
  const size = (m.length + 8) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  m.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (!dark) return;
      for (let y = 0; y < scale; y++)
        for (let x = 0; x < scale; x++) {
          const i = (((r + 4) * scale + y) * size + (c + 4) * scale + x) * 4;
          data[i] = data[i + 1] = data[i + 2] = 0;
        }
    }),
  );
  return jsQR(data, size, size)?.data ?? null;
}

describe('qr', () => {
  it.each([
    ['https://qdbp.net/ru/', 'M'],
    ['Привет, мир! Ёжик', 'L'],
    ['café 👍 日本', 'H'],
    ['1234567890'.repeat(20), 'Q'],
  ] as [string, Level][])('«%s» (%s) распознаётся обратно', (text, level) => {
    expect(decode(qrMatrix(text, level))).toBe(text);
  });

  it('уровень коррекции увеличивает размер', () => {
    expect(qrMatrix('hello world', 'H').length).toBeGreaterThan(qrMatrix('hello world', 'L').length);
  });

  it('Wi-Fi: формат и экранирование', () => {
    expect(wifiPayload('Home;Net', 'p:a"ss', 'WPA', false)).toBe(String.raw`WIFI:T:WPA;S:Home\;Net;P:p\:a\"ss;;`);
    expect(wifiPayload('Cafe', '', 'nopass', true)).toBe('WIFI:T:nopass;S:Cafe;H:true;;');
  });
});
