import { formatNumber } from '@/lib/format';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { panArea, panFactor } from './pan';

const SHAPES = ['round', 'square', 'rect'] as const;

/** Площадь дна формы: см² или квадратные дюймы — по выбранной системе. */
const area = (cm2: number, { lang, units, t }: FormatContext) =>
  units === 'imperial'
    ? `${formatNumber(lang, cm2 / 6.4516, 'number', 0)} ${t('ui.in2')}`
    : `${formatNumber(lang, cm2, 'number', 0)} ${t('ui.cm2')}`;

export const def = defineCalculator({
  order: 20,
  related: ['oven-temperature', 'recipe-scaler'],
  inputs: {
    fromShape: { type: 'select', options: SHAPES, default: 'round' },
    fromA: { type: 'quantity', unit: 'cm', imperial: 'in', default: 24, defaultImperial: 9, min: 1, max: 200 },
    fromB: { type: 'quantity', unit: 'cm', imperial: 'in', default: 18, defaultImperial: 9, min: 0, max: 200, showIf: { fromShape: 'rect' } },
    toShape: { type: 'select', options: SHAPES, default: 'round' },
    toA: { type: 'quantity', unit: 'cm', imperial: 'in', default: 26, defaultImperial: 10, min: 1, max: 200 },
    toB: { type: 'quantity', unit: 'cm', imperial: 'in', default: 18, defaultImperial: 9, min: 0, max: 200, showIf: { toShape: 'rect' } },
  },
  compute: (v) => {
    const factor = panFactor({ shape: v.fromShape, a: v.fromA, b: v.fromB }, { shape: v.toShape, a: v.toA, b: v.toB });
    return { factor, change: factor, fromArea: panArea(v.fromShape, v.fromA, v.fromB), toArea: panArea(v.toShape, v.toA, v.toB) };
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
    fromArea: { type: 'custom', format: area },
    toArea: { type: 'custom', format: area },
  },
});

export default island(def);
