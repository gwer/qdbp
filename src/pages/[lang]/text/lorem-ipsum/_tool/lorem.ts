import { cryptoRandom, randomInt, type Random } from '@/lib/random';

/** Классическое начало и словарь — из того же искажённого отрывка Цицерона «О пределах добра и зла». */
const START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna ' +
  'aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute ' +
  'irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
  'proident sunt culpa qui officia deserunt mollit anim id est laborum perspiciatis unde omnis iste natus error ' +
  'voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis quasi ' +
  'architecto beatae vitae dicta explicabo nemo ipsam quia voluptas aspernatur aut odit fugit consequuntur magni ' +
  'dolores eos ratione sequi nesciunt neque porro quisquam dolorem adipisci numquam eius modi tempora incidunt magnam ' +
  'quaerat'
).split(' ');

export type Unit = 'paragraphs' | 'sentences' | 'words';

const between = (min: number, max: number, random: Random) => min + randomInt(max - min + 1, random);
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

function words(n: number, random: Random): string[] {
  return Array.from({ length: n }, () => WORDS[randomInt(WORDS.length, random)]);
}

/** Предложение из 6–14 слов, иногда с запятой посередине. */
function sentence(random: Random): string {
  const w = words(between(6, 14, random), random);
  if (w.length > 8 && randomInt(2, random)) w[between(2, w.length - 4, random)] += ',';
  return capitalize(w.join(' ')) + '.';
}

function sentences(n: number, random: Random, classic: boolean): string[] {
  const out = Array.from({ length: n }, () => sentence(random));
  if (classic && n > 0) out[0] = START + '.';
  return out;
}

/** Абзацы — по 4–7 предложений. */
export function lorem(count: number, unit: Unit, classic: boolean, random: Random = cryptoRandom): string[] {
  if (unit === 'words') {
    const w = words(count, random);
    if (classic) START.replace(',', '').toLowerCase().split(' ').slice(0, count).forEach((s, i) => (w[i] = s));
    return w.length ? [capitalize(w.join(' ')) + '.'] : [];
  }
  if (unit === 'sentences') return count > 0 ? [sentences(count, random, classic).join(' ')] : [];
  return Array.from({ length: count }, (_, i) => sentences(between(4, 7, random), random, classic && i === 0).join(' '));
}
