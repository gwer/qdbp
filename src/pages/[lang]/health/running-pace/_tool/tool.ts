import { formatDurationSeconds } from '@/lib/duration';
import { formatNumber } from '@/lib/format';
import { convert } from '@/lib/units';
import { defineCalculator, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { pace } from './pace';
import { Predictions } from './Predictions';

const perMile = (secPerKm: number) => secPerKm * convert(1, 'mi', 'km');

export const RACE_KM = { '5k': 5, '10k': 10, half: 21.0975, marathon: 42.195 } as const;
type Race = keyof typeof RACE_KM | 'custom';

/**
 * Любое из трёх по двум другим: темп по дистанции и времени, время по дистанции и темпу, дистанция по времени и темпу.
 * distance — км, time — секунды, pace — секунды на км или на милю (paceUnit).
 */
export function solve(find: 'pace' | 'time' | 'distance', race: Race, distance: number, time: number, paceIn: number, paceUnit: 'km' | 'mi') {
  const secPerKm = paceUnit === 'mi' ? paceIn / convert(1, 'mi', 'km') : paceIn;
  let d = race === 'custom' ? distance : RACE_KM[race];
  let t = time;
  if (find === 'time') t = secPerKm * d;
  if (find === 'distance') d = time / secPerKm;
  if (!(t > 0) || !(d > 0)) throw new RangeError('time, pace and distance must be positive');
  return { ...pace(d, t), time: t, distance: d };
}

export const def = defineCalculator({
  order: 30,
  related: ['calorie-calculator', 'bmi'],
  inputs: {
    find: { type: 'select', options: ['pace', 'time', 'distance'], default: 'pace' },
    race: { type: 'select', options: ['custom', '5k', '10k', 'half', 'marathon'], default: 'custom', showIf: { find: ['pace', 'time'] } },
    distance: {
      type: 'quantity',
      unit: 'km',
      imperial: 'mi',
      default: 10,
      defaultImperial: 6.2,
      min: 0.01,
      max: 1000,
      showIf: { find: ['pace', 'time'], race: 'custom' },
    },
    time: { type: 'duration', seconds: true, default: 3000, showIf: { find: ['pace', 'distance'] } },
    pace: { type: 'duration', seconds: true, default: 300, showIf: { find: ['time', 'distance'] } },
    paceUnit: { type: 'select', options: ['km', 'mi'], default: 'km', byLang: { en: 'mi' }, showIf: { find: ['time', 'distance'] } },
  },
  compute: ({ find, race, distance, time, pace, paceUnit }) => solve(find, race, distance, time, pace, paceUnit),
  outputs: {
    time: { type: 'duration', seconds: true, showIf: { find: 'time' } },
    distance: { type: 'quantity', unit: 'km', imperial: 'mi', digits: 2, showIf: { find: 'distance' } },
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
