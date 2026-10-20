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
