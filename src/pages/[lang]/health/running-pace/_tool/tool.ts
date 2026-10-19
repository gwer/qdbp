import { formatDurationSeconds } from '@/lib/duration';
import { formatNumber } from '@/lib/format';
import { convert } from '@/lib/units';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { pace } from './pace';
import { Predictions } from './Predictions';

const perMile = (secPerKm: number) => secPerKm * convert(1, 'mi', 'km');

export const def = defineCalculator({
  order: 30,
  related: ['calorie-calculator', 'bmi'],
  inputs: {
    distance: { type: 'quantity', unit: 'km', imperial: 'mi', default: 10, defaultImperial: 6.2, min: 0.01, max: 1000 },
    time: { type: 'duration', seconds: true, default: 3000 },
  },
  compute: ({ distance, time }) => {
    if (!(time > 0)) throw new RangeError('time must be positive');
    return pace(distance, time);
  },
  outputs: {
    pace: {
      type: 'custom',
      format: (s: number, { t, units }: FormatContext) =>
        units === 'imperial' ? `${formatDurationSeconds(perMile(s))} ${t('ui.perMi')}` : `${formatDurationSeconds(s)} ${t('ui.perKm')}`,
    },
    speed: {
      type: 'custom',
      format: (kmh: number, { t, lang, units }: FormatContext) =>
        units === 'imperial'
          ? `${formatNumber(lang, convert(kmh, 'km', 'mi'), 'number', 1)} ${t('ui.mph')}`
          : `${formatNumber(lang, kmh, 'number', 1)} ${t('ui.kmh')}`,
    },
  },
  Extra: Predictions,
});

export default island(def);
