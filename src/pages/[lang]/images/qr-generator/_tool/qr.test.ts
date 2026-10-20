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

describe('форматы содержимого', () => {
  it('письмо, звонок, SMS', async () => {
    const { emailPayload, telPayload, smsPayload } = await import('./qr');
    expect(emailPayload('a@b.ru', 'Привет', 'Текст & ещё')).toBe('mailto:a@b.ru?subject=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82&body=%D0%A2%D0%B5%D0%BA%D1%81%D1%82%20%26%20%D0%B5%D1%89%D1%91');
    expect(emailPayload('a@b.ru', '', '')).toBe('mailto:a@b.ru');
    expect(telPayload('+7 (999) 123-45-67')).toBe('tel:+79991234567');
    expect(smsPayload('+7 999 1234567', 'Жду')).toBe('SMSTO:+79991234567:Жду');
  });

  it('vCard 3.0 с экранированием', async () => {
    const { vcardPayload } = await import('./qr');
    expect(vcardPayload({ first: 'Иван', last: 'Петров', phone: '+7 999 1234567', email: 'i@p.ru', org: 'ООО «Ромашка», филиал', url: '' })).toBe(
      'BEGIN:VCARD\nVERSION:3.0\nN:Петров;Иван;;;\nFN:Иван Петров\nORG:ООО «Ромашка»\\, филиал\nTEL;TYPE=CELL:+79991234567\nEMAIL:i@p.ru\nEND:VCARD',
    );
  });

  it('цвета: инверсия и низкий контраст', async () => {
    const { colorProblem } = await import('./qr');
    expect(colorProblem('#000000', '#ffffff')).toBeNull();
    expect(colorProblem('#ffffff', '#000000')).toBe('inverted');
    expect(colorProblem('#999999', '#ffffff')).toBe('low');
  });
});
