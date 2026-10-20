// Шифр Цезаря: сдвиг букв по алфавиту. Латиница (26 букв) и русский алфавит (33 буквы, с Ё).

const ALPHABETS = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'];

export function caesar(text: string, shift: number): string {
  return [...text]
    .map((c) => {
      const upper = c.toUpperCase();
      for (const abc of ALPHABETS) {
        const i = abc.indexOf(upper);
        if (i === -1) continue;
        const n = abc.length;
        const out = abc[(((i + shift) % n) + n) % n];
        return c === upper ? out : out.toLowerCase();
      }
      return c;
    })
    .join('');
}

export const rot13 = (text: string) => caesar(text, 13);
