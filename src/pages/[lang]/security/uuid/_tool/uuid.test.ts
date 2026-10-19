import { describe, expect, it } from 'vitest';
import { formatUuid, uuidV4, uuidV7, v7Time } from './uuid';

const zeros = new Uint8Array(16);
const ff = new Uint8Array(16).fill(0xff);

describe('uuid', () => {
  it('v4: версия и вариант', () => {
    expect(formatUuid(uuidV4(zeros))).toBe('00000000-0000-4000-8000-000000000000');
    expect(formatUuid(uuidV4(ff))).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('v7: время в первых 48 битах', () => {
    const ms = Date.UTC(2026, 0, 1);
    const u = formatUuid(uuidV7(ms, zeros));
    expect(u).toBe('019b76da-a800-7000-8000-000000000000');
    expect(v7Time(u)).toBe(ms);
  });

  it('регистр и дефисы', () => {
    expect(formatUuid(uuidV4(ff), true, false)).toBe('FFFFFFFFFFFF4FFFBFFFFFFFFFFFFFFF');
  });
});
