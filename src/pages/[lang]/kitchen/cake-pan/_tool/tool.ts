import { formatNumber } from '@/lib/format';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { panArea, panFactor, type Shape } from './pan';

const SHAPES = ['round', 'square', 'rect'] as const;
const size = { type: 'quantity', unit: 'cm', imperial: 'in', min: 1, max: 200 } as const;

/** Размеры выбранной формы: диаметр, сторона или длина × ширина. */
const pan = (shape: Shape, d: number, s: number, l: number, w: number) =>
  shape === 'round' ? { shape, a: d, b: 0 } : shape === 'square' ? { shape, a: s, b: 0 } : { shape, a: l, b: w };

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
    fromD: { ...size, default: 24, defaultImperial: 9, showIf: { fromShape: 'round' } },
    fromS: { ...size, default: 20, defaultImperial: 8, showIf: { fromShape: 'square' } },
    fromL: { ...size, default: 30, defaultImperial: 11, showIf: { fromShape: 'rect' } },
    fromW: { ...size, default: 20, defaultImperial: 7, showIf: { fromShape: 'rect' } },
    toShape: { type: 'select', options: SHAPES, default: 'round' },
    toD: { ...size, default: 26, defaultImperial: 10, showIf: { toShape: 'round' } },
    toS: { ...size, default: 22, defaultImperial: 9, showIf: { toShape: 'square' } },
    toL: { ...size, default: 33, defaultImperial: 13, showIf: { toShape: 'rect' } },
    toW: { ...size, default: 23, defaultImperial: 9, showIf: { toShape: 'rect' } },
  },
  compute: (v) => {
    const from = pan(v.fromShape, v.fromD, v.fromS, v.fromL, v.fromW);
    const to = pan(v.toShape, v.toD, v.toS, v.toL, v.toW);
    const factor = panFactor(from, to);
    return { factor, change: factor, fromArea: panArea(from.shape, from.a, from.b), toArea: panArea(to.shape, to.a, to.b) };
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
