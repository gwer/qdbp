import { describe, expect, it } from 'vitest';
import { SITE_LANGS } from '@/i18n/config';
import { DIMENSIONS, unitOf, type Dimension } from './units';

const DIMS: Record<string, Dimension> = {
  'length-converter': 'length',
  'weight-converter': 'weight',
  'volume-converter': 'volume',
  'area-converter': 'area',
  'temperature-converter': 'temperature',
  'speed-converter': 'speed',
  'pressure-converter': 'pressure',
  'energy-converter': 'energy',
  'data-size-converter': 'data',
  'fuel-consumption': 'fuel',
};

const i18n = import.meta.glob<{ ui: { units: Record<string, string> } }>('../*/_tool/i18n/*.json', { eager: true, import: 'default' });
const tools = import.meta.glob<{ def: { component: unknown } }>('../*/_tool/tool.ts', { eager: true });

describe('конвертеры', () => {
  it.each(Object.entries(DIMS))('%s: названия всех единиц на всех языках', (tool, dim) => {
    for (const lang of SITE_LANGS) {
      const names = i18n[`../${tool}/_tool/i18n/${lang}.json`]?.ui.units;
      expect(names, `${tool}/${lang}`).toBeDefined();
      expect(Object.keys(names).sort()).toEqual(DIMENSIONS[dim].map((u) => u.id).sort());
    }
  });

  it('у каждого инструмента есть определение', () => {
    for (const tool of Object.keys(DIMS)) expect(tools[`../${tool}/_tool/tool.ts`]?.def).toBeDefined();
  });

  it('единицы по умолчанию существуют', async () => {
    for (const [tool, dim] of Object.entries(DIMS)) {
      const src = (await import(`../${tool}/_tool/tool.ts?raw`)).default as string;
      for (const [, id] of src.matchAll(/(?:from|to): '(\w+)'/g)) expect(unitOf(dim, id), `${tool}: ${id}`).toBeDefined();
    }
  });
});
