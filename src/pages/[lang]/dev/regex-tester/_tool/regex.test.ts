import { describe, expect, it } from 'vitest';
import { findMatches, groupNames, runJob } from './regex';

const texts = (p: string, f: string, s: string) => findMatches(p, f, s).matches.map((m) => m.text);

describe('groupNames', () => {
  it('numbers capturing groups and skips non-capturing ones', () => {
    expect(groupNames('(a)(?:b)(?<year>\\d+)(?=x)(?<!y)(?<=z)(c)')).toEqual([undefined, 'year', undefined]);
  });
  it('ignores escaped parens and parens in classes', () => {
    expect(groupNames('\\((x)[(\\]]+(?<n>y)')).toEqual([undefined, 'n']);
  });
});

describe('findMatches', () => {
  it('without g returns only the first match, like String.prototype.match', () => {
    expect(texts('\\d+', '', 'a1 b22 c333')).toEqual(['1']);
  });

  it('with g returns all matches, same as matchAll', () => {
    const s = 'a1 b22 c333';
    expect(texts('\\d+', 'g', s)).toEqual([...s.matchAll(/\d+/g)].map((m) => m[0]));
  });

  it('empty matches advance like matchAll and do not loop forever', () => {
    const s = 'ab';
    const ref = [...s.matchAll(/x*/g)].map((m) => m.index);
    expect(findMatches('x*', 'g', s).matches.map((m) => m.index)).toEqual(ref); // [0, 1, 2]
  });

  it('with u, an empty match steps over a surrogate pair', () => {
    const s = '😀a';
    const ref = [...s.matchAll(/(?:)/gu)].map((m) => m.index);
    expect(findMatches('', 'gu', s).matches.map((m) => m.index)).toEqual(ref); // [0, 2, 3]
    expect(findMatches('', 'g', s).matches.map((m) => m.index)).toEqual([0, 1, 2, 3]);
  });

  it('sticky flag matches only consecutive occurrences', () => {
    expect(texts('a', 'gy', 'aab a')).toEqual(['a', 'a']);
    expect(texts('b', 'y', 'ab')).toEqual([]);
  });

  it('flags i, m and s', () => {
    expect(texts('^b.', 'gim', 'a\nB\nbc')).toEqual(['bc']);
    expect(texts('^b$', 'gim', 'a\nB\nb')).toEqual(['B', 'b']);
    expect(texts('a.b', 's', 'a\nb')).toEqual(['a\nb']);
    expect(texts('a.b', '', 'a\nb')).toEqual([]);
  });

  it('groups: numbered, named and non-participating', () => {
    const [m] = findMatches('(?<year>\\d{4})-(\\d{2})(x)?', '', 'on 2026-10').matches;
    expect(m.index).toBe(3);
    expect(m.groups).toEqual([
      { n: 1, name: 'year', value: '2026' },
      { n: 2, name: undefined, value: '10' },
      { n: 3, name: undefined, value: undefined },
    ]);
  });

  it('limits the number of matches', () => {
    const r = findMatches('a', 'g', 'a'.repeat(1500));
    expect(r.matches.length).toBe(1000);
    expect(r.truncated).toBe(true);
    expect(findMatches('a', 'g', 'a'.repeat(1000)).truncated).toBe(false);
  });

  it('throws on invalid pattern', () => {
    expect(() => findMatches('(', 'g', 'x')).toThrow(SyntaxError);
  });
});

describe('runJob', () => {
  it('replaces with named and numbered references, like String.prototype.replace', () => {
    const r = runJob({
      pattern: '(?<y>\\d{4})-(\\d{2})-(\\d{2})',
      flags: 'g',
      text: '2026-03-15 and 2026-04-02',
      replacement: '$3.$2.$<y>',
    });
    expect(r).toMatchObject({ ok: true, replaced: '15.03.2026 and 02.04.2026' });
  });

  it('reports syntax errors as text', () => {
    const r = runJob({ pattern: '[a-', flags: '', text: 'x', replacement: null });
    expect(r.ok).toBe(false);
  });

  it('rejects unknown flags', () => {
    expect(runJob({ pattern: 'a', flags: 'gg', text: 'a', replacement: null }).ok).toBe(false);
  });
});
