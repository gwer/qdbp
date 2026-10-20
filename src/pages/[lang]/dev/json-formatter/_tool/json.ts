export type Indent = 2 | 4 | '\t';

export function formatJson(input: string, indent: Indent, sortKeys = false): string {
  const value = JSON.parse(input);
  return JSON.stringify(sortKeys ? sortDeep(value) : value, null, indent);
}

export const minifyJson = (input: string) => JSON.stringify(JSON.parse(input));

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, sortDeep((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

/**
 * Место первой синтаксической ошибки (смещение в строке) — своим сканером грамматики JSON:
 * сообщения JSON.parse в разных браузерах разные и не всегда содержат позицию.
 * Возвращает null, если ошибки нет.
 */
export function errorOffset(input: string): number | null {
  let i = 0;
  const fail = (): never => {
    throw i;
  };
  const ws = () => {
    while (i < input.length && ' \t\n\r'.includes(input[i])) i++;
  };
  const expect = (ch: string) => (input[i] === ch ? i++ : fail());
  const literal = (word: string) => (input.startsWith(word, i) ? (i += word.length) : fail());
  const string = () => {
    expect('"');
    while (i < input.length && input[i] !== '"') {
      const c = input.charCodeAt(i);
      if (c < 0x20) fail();
      if (input[i] === '\\') {
        i++;
        if (input[i] === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(input.slice(i + 1, i + 5))) fail();
          i += 5;
        } else if ('"\\/bfnrt'.includes(input[i] ?? '#')) i++;
        else fail();
      } else i++;
    }
    expect('"');
  };
  const number = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(input.slice(i));
    if (!m) fail();
    i += m![0].length;
  };
  const value = (): void => {
    ws();
    const c = input[i];
    if (c === '{') {
      i++;
      ws();
      if (input[i] === '}') return void i++;
      for (;;) {
        ws();
        string();
        ws();
        expect(':');
        value();
        ws();
        if (input[i] === ',') i++;
        else return void expect('}');
      }
    }
    if (c === '[') {
      i++;
      ws();
      if (input[i] === ']') return void i++;
      for (;;) {
        value();
        ws();
        if (input[i] === ',') i++;
        else return void expect(']');
      }
    }
    if (c === '"') return string();
    if (c === 't') return void literal('true');
    if (c === 'f') return void literal('false');
    if (c === 'n') return void literal('null');
    return number();
  };
  try {
    value();
    ws();
    return i < input.length ? i : null;
  } catch (pos) {
    return pos as number;
  }
}

/** Строка и столбец (с 1) по смещению. */
export function lineColumn(input: string, offset: number) {
  const lines = input.slice(0, offset).split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

const PY: Record<string, string> = { True: 'true', False: 'false', None: 'null' };

/**
 * Чинит частые поломки «почти JSON» (конфиги, JS-объекты, вывод Python): комментарии (строчные и блочные),
 * висячие запятые, строки в одинарных кавычках, ключи без кавычек, True/False/None.
 * Результат — строгий JSON; если починить не удалось, JSON.parse бросит ошибку как обычно.
 */
export function repairJson(input: string): string {
  let out = '';
  let i = 0;
  const n = input.length;
  const dropTrailingComma = () => {
    const trimmed = out.trimEnd();
    if (trimmed.endsWith(',')) out = trimmed.slice(0, -1) + out.slice(trimmed.length);
  };
  while (i < n) {
    const c = input[i];
    if (c === '/' && input[i + 1] === '/') {
      while (i < n && input[i] !== '\n') i++;
    } else if (c === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
    } else if (c === '"' || c === "'") {
      // Строка: в одинарных кавычках — перекодировать в двойные.
      let s = '';
      i++;
      while (i < n && input[i] !== c) {
        if (input[i] === '\\') {
          const next = input[i + 1];
          s += c === "'" && next === "'" ? "'" : `\\${next}`;
          i += 2;
        } else {
          s += c === "'" && input[i] === '"' ? '\\"' : input[i];
          i++;
        }
      }
      i++;
      out += `"${s}"`;
    } else if (c === ']' || c === '}') {
      dropTrailingComma();
      out += c;
      i++;
    } else if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(input[j])) j++;
      const word = input.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(input[k])) k++;
      out += input[k] === ':' ? `"${word}"` : (PY[word] ?? word);
      i = j;
    } else {
      out += c;
      i++;
    }
  }
  dropTrailingComma();
  return out;
}
