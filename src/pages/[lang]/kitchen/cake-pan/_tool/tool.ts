import { formatNumber } from '@/lib/format';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { panFactor } from './pan';

const SHAPES = ['round', 'square', 'rect'] as const;

export const def = defineCalculator({
  order: 20,
  related: ['oven-temperature', 'recipe-scaler'],
  inputs: {
    fromShape: { type: 'select', options: SHAPES, default: 'round' },
    fromA: { type: 'quantity', unit: 'cm', imperial: 'in', default: 24, defaultImperial: 9, min: 1, max: 200 },
    fromB: { type: 'quantity', unit: 'cm', imperial: 'in', default: 18, defaultImperial: 9, min: 0, max: 200 },
    toShape: { type: 'select', options: SHAPES, default: 'round' },
    toA: { type: 'quantity', unit: 'cm', imperial: 'in', default: 26, defaultImperial: 10, min: 1, max: 200 },
    toB: { type: 'quantity', unit: 'cm', imperial: 'in', default: 18, defaultImperial: 9, min: 0, max: 200 },
  },
  compute: (v) => {
    const factor = panFactor({ shape: v.fromShape, a: v.fromA, b: v.fromB }, { shape: v.toShape, a: v.toA, b: v.toB });
    return { factor, change: factor };
  },
  outputs: {
    factor: { type: 'custom', format: (f: number, { lang }) => `×${formatNumber(lang, f, 'number', 2)}` },
    change: {
      type: 'custom',
      format: (f: number, { lang, t }) => {
        const p = Math.round((f - 1) * 100);
        if (p === 0) return t('ui.same');
        return t(p > 0 ? 'ui.more' : 'ui.less', { p: formatNumber(lang, Math.abs(p), 'integer') });
      },
    },
  },
});

export default island(def);
