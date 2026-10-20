// Азбука Морзе: международная (латиница, цифры, знаки, буквы с диакритикой) и русская.

const LATIN: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  À: '.--.-', Á: '.--.-', Ä: '.-.-', Ç: '-.-..', É: '..-..', È: '.-..-', Ñ: '--.--', Ö: '---.', Ü: '..--',
};
const DIGITS: Record<string, string> = {
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '"': '.-..-.', '@': '.--.-.',
};
const CYRILLIC: Record<string, string> = {
  А: '.-', Б: '-...', В: '.--', Г: '--.', Д: '-..', Е: '.', Ё: '.', Ж: '...-', З: '--..', И: '..', Й: '.---', К: '-.-',
  Л: '.-..', М: '--', Н: '-.', О: '---', П: '.--.', Р: '.-.', С: '...', Т: '-', У: '..-', Ф: '..-.', Х: '....', Ц: '-.-.',
  Ч: '---.', Ш: '----', Щ: '--.-', Ъ: '--.--', Ы: '-.--', Ь: '-..-', Э: '..-..', Ю: '..--', Я: '.-.-',
};

/** Текст → Морзе: буквы через пробел, слова через « / ». Неизвестные символы — ошибка. */
export function encodeMorse(text: string): string {
  const table = { ...LATIN, ...CYRILLIC, ...DIGITS };
  return text
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word]
        .map((c) => {
          const code = table[c];
          if (!code) throw new Error(`unknown: ${c}`);
          return code;
        })
        .join(' '),
    )
    .join(' / ');
}

/** Морзе → текст выбранным алфавитом. Точки и тире можно писать как . - · — _ ; слова — через / или |. */
export function decodeMorse(morse: string, alphabet: 'latin' | 'cyrillic'): string {
  const letters = alphabet === 'latin' ? LATIN : CYRILLIC;
  const reverse = new Map<string, string>();
  for (const [ch, code] of Object.entries({ ...DIGITS, ...letters })) if (!reverse.has(code)) reverse.set(code, ch);
  const norm = morse.replace(/[·•]/g, '.').replace(/[—–_−]/g, '-').trim();
  if (!norm) return '';
  return norm
    .split(/\s*[/|]\s*|\s{3,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => {
          const ch = reverse.get(code);
          if (!ch) throw new Error(`unknown: ${code}`);
          return ch;
        })
        .join(''),
    )
    .join(' ');
}

/**
 * Расписание звука для записи Морзе: [начало, длительность] в единицах (точка = 1).
 * Тире — 3, пауза внутри знака — 1, между знаками — 3, между словами («/») — 7.
 */
export function morseTimeline(morse: string): [number, number][] {
  const out: [number, number][] = [];
  let t = 0;
  for (const word of morse.trim().split(/\s*\/\s*/)) {
    for (const letter of word.split(/\s+/).filter(Boolean)) {
      for (const sym of letter) {
        const len = sym === '-' ? 3 : 1;
        out.push([t, len]);
        t += len + 1;
      }
      t += 2; // до 3 между знаками
    }
    t += 4; // до 7 между словами
  }
  return out;
}

export const isMorse = (s: string) => /^[.\-/\s]+$/.test(s) && /[.-]/.test(s);
