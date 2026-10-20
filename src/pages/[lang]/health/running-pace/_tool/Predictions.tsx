import { formatDurationSeconds } from '@/lib/duration';
import { formatNumber } from '@/lib/format';
import { convert } from '@/lib/units';
import type { ExtraProps } from '@/ui/define';
import { riegel } from './pace';

const RACES = [
  ['5k', 5],
  ['10k', 10],
  ['half', 21.0975],
  ['marathon', 42.195],
] as const;

type Result = { distance: number; time: number; pace: number };

export function Predictions({ result, lang, t, units }: ExtraProps<unknown, Result>) {
  // Раскладка при ровном темпе: время на отметке каждого километра (мили), последняя строка — финиш.
  const step = units === 'imperial' ? convert(1, 'mi', 'km') : 1;
  const marks: number[] = [];
  for (let k = step; k < result.distance - 1e-9 && marks.length < 100; k += step) marks.push(k);
  marks.push(result.distance);
  const at = (km: number) => (units === 'imperial' ? convert(km, 'km', 'mi') : km);
  return (
    <>
    <details class="extra" open>
      <summary>{t('ui.predictions')}</summary>
      <div class="table-wrap">
        <table>
          <tbody>
            {RACES.map(([id, km]) => (
              <tr key={id}>
                <td>{t(`ui.races.${id}`)}</td>
                <td>{formatDurationSeconds(riegel(result.time, result.distance, km))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="muted">{t('ui.predictionsNote')}</p>
    </details>
    <details class="extra">
      <summary>{t('ui.splits')}</summary>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t(units === 'imperial' ? 'ui.mile' : 'ui.km')}</th>
              <th>{t('ui.elapsed')}</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((km) => (
              <tr key={km}>
                <td>{formatNumber(lang, at(km), 'number', 2)}</td>
                <td>{formatDurationSeconds(result.pace * km)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
    </>
  );
}
