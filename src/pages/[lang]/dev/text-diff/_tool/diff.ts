/** Шаг сценария правки: e — элемент общий, d — удалён из a, i — вставлен из b. */
export type Op = 'e' | 'd' | 'i';

/**
 * Кратчайший сценарий правки a → b (алгоритм Майерса, вариант с линейной памятью:
 * «средняя змейка» и рекурсия по половинам). Элементы сравниваются через ===.
 */
export function diff<T>(a: readonly T[], b: readonly T[]): Op[] {
  // Сравнивать числа быстрее, чем строки: заменяем элементы номерами.
  const ids = new Map<T, number>();
  const id = (v: T) => {
    let n = ids.get(v);
    if (n === undefined) ids.set(v, (n = ids.size));
    return n;
  };
  const A = Int32Array.from(a, id);
  const B = Int32Array.from(b, id);
  const ops: Op[] = [];
  compare(A, B, 0, A.length, 0, B.length, ops);
  return ops;
}

function compare(A: Int32Array, B: Int32Array, a0: number, a1: number, b0: number, b1: number, ops: Op[]) {
  while (a0 < a1 && b0 < b1 && A[a0] === B[b0]) {
    ops.push('e');
    a0++;
    b0++;
  }
  let suffix = 0;
  while (a0 < a1 && b0 < b1 && A[a1 - 1] === B[b1 - 1]) {
    a1--;
    b1--;
    suffix++;
  }
  if (a0 === a1) for (let j = b0; j < b1; j++) ops.push('i');
  else if (b0 === b1) for (let i = a0; i < a1; i++) ops.push('d');
  else {
    const split = middleSnake(A, B, a0, a1, b0, b1);
    if (split) {
      compare(A, B, a0, split[0], b0, split[1], ops);
      compare(A, B, split[0], a1, split[1], b1, ops);
    } else {
      for (let i = a0; i < a1; i++) ops.push('d');
      for (let j = b0; j < b1; j++) ops.push('i');
    }
  }
  for (let k = 0; k < suffix; k++) ops.push('e');
}

/**
 * Точка, через которую проходит один из кратчайших путей правки (Myers 1986, раздел 4b):
 * поиск идёт одновременно с начала и с конца, пока пути не встретятся.
 * null — общих элементов нет.
 */
function middleSnake(A: Int32Array, B: Int32Array, a0: number, a1: number, b0: number, b1: number): [number, number] | null {
  const N = a1 - a0;
  const M = b1 - b0;
  const maxD = Math.ceil((N + M) / 2);
  const off = maxD;
  const size = 2 * maxD + 2;
  const v1 = new Int32Array(size).fill(-1);
  const v2 = new Int32Array(size).fill(-1);
  v1[off + 1] = 0;
  v2[off + 1] = 0;
  const delta = N - M;
  // При нечётной разнице длин пути встречаются на прямом проходе, при чётной — на обратном.
  const front = delta % 2 !== 0;
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;
  for (let d = 0; d < maxD; d++) {
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const i1 = off + k1;
      let x1 = k1 === -d || (k1 !== d && v1[i1 - 1] < v1[i1 + 1]) ? v1[i1 + 1] : v1[i1 - 1] + 1;
      let y1 = x1 - k1;
      while (x1 < N && y1 < M && A[a0 + x1] === B[b0 + y1]) {
        x1++;
        y1++;
      }
      v1[i1] = x1;
      if (x1 > N) k1end += 2;
      else if (y1 > M) k1start += 2;
      else if (front) {
        const i2 = off + delta - k1;
        if (i2 >= 0 && i2 < size && v2[i2] !== -1 && x1 >= N - v2[i2]) return [a0 + x1, b0 + y1];
      }
    }
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const i2 = off + k2;
      let x2 = k2 === -d || (k2 !== d && v2[i2 - 1] < v2[i2 + 1]) ? v2[i2 + 1] : v2[i2 - 1] + 1;
      let y2 = x2 - k2;
      while (x2 < N && y2 < M && A[a1 - x2 - 1] === B[b1 - y2 - 1]) {
        x2++;
        y2++;
      }
      v2[i2] = x2;
      if (x2 > N) k2end += 2;
      else if (y2 > M) k2start += 2;
      else if (!front) {
        const i1 = off + delta - k2;
        if (i1 >= 0 && i1 < size && v1[i1] !== -1) {
          const x1 = v1[i1];
          const y1 = x1 - (i1 - off);
          if (x1 >= N - x2) return [a0 + x1, b0 + y1];
        }
      }
    }
  }
  return null;
}

/** Кусок строки; changed — отличается от парной строки на другой стороне. */
export interface Part {
  text: string;
  changed: boolean;
}

export interface Line {
  /** Номер строки с 1. */
  no: number;
  text: string;
  /** Подсветка изменённых слов; нет — строка без пары или совсем другая. */
  parts?: Part[];
}

/** equal: a и b одинаковой длины. change: удалённые строки a и вставленные b (одна из сторон может быть пустой). */
export interface Block {
  kind: 'equal' | 'change';
  a: Line[];
  b: Line[];
}

export const splitLines = (s: string) => s.split(/\r\n|\r|\n/);

/** Слова, пробелы и отдельные знаки — единицы сравнения внутри строки. */
const tokenize = (s: string) => s.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu) ?? [];

function pushPart(parts: Part[], text: string, changed: boolean) {
  const last = parts[parts.length - 1];
  if (last && last.changed === changed) last.text += text;
  else parts.push({ text, changed });
}

/** Подсветка слов в паре изменённых строк. Без общих слов (не пробелов и не знаков) — null. */
export function diffWords(a: string, b: string): [Part[], Part[]] | null {
  const ta = tokenize(a);
  const tb = tokenize(b);
  const pa: Part[] = [];
  const pb: Part[] = [];
  let i = 0;
  let j = 0;
  let shared = false;
  for (const op of diff(ta, tb)) {
    if (op === 'e') {
      if (/[\p{L}\p{N}]/u.test(ta[i])) shared = true;
      pushPart(pa, ta[i++], false);
      pushPart(pb, tb[j++], false);
    } else if (op === 'd') pushPart(pa, ta[i++], true);
    else pushPart(pb, tb[j++], true);
  }
  return shared ? [pa, pb] : null;
}

export interface DiffOptions {
  /** Строки, отличающиеся только пробелами (количество, в начале и в конце), считаются одинаковыми. */
  ignoreSpace?: boolean;
  ignoreCase?: boolean;
}

/** Построчное сравнение двух текстов с подсветкой слов в парах изменённых строк. */
export function diffTexts(a: string, b: string, opts: DiffOptions = {}) {
  const la = splitLines(a);
  const lb = splitLines(b);
  // Сравниваются ключи строк, а показывается исходный текст.
  const key = (s: string) => {
    if (opts.ignoreSpace) s = s.replace(/\s+/g, ' ').trim();
    return opts.ignoreCase ? s.toLowerCase() : s;
  };
  const blocks: Block[] = [];
  let i = 0;
  let j = 0;
  let added = 0;
  let removed = 0;
  const block = (kind: Block['kind']) => {
    const last = blocks[blocks.length - 1];
    if (last?.kind === kind) return last;
    const created: Block = { kind, a: [], b: [] };
    blocks.push(created);
    return created;
  };
  for (const op of diff(la.map(key), lb.map(key))) {
    if (op === 'e') {
      const bl = block('equal');
      bl.a.push({ no: i + 1, text: la[i++] });
      bl.b.push({ no: j + 1, text: lb[j++] });
    } else if (op === 'd') {
      block('change').a.push({ no: i + 1, text: la[i++] });
      removed++;
    } else {
      block('change').b.push({ no: j + 1, text: lb[j++] });
      added++;
    }
  }
  for (const bl of blocks) {
    if (bl.kind !== 'change') continue;
    for (let k = 0; k < Math.min(bl.a.length, bl.b.length); k++) {
      const words = diffWords(bl.a[k].text, bl.b[k].text);
      if (words) [bl.a[k].parts, bl.b[k].parts] = words;
    }
  }
  return { blocks, added, removed };
}
