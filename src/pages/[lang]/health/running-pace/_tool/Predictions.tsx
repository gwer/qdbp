import { formatDurationSeconds } from '@/lib/duration';
import type { ExtraProps } from '@/ui/define';
import { riegel } from './pace';

const RACES = [
  ['5k', 5],
  ['10k', 10],
  ['half', 21.0975],
  ['marathon', 42.195],
] as const;

export function Predictions({ values, t }: ExtraProps<{ distance: number; time: number }, unknown>) {
  return (
    <details class="extra" open>
      <summary>{t('ui.predictions')}</summary>
      <div class="table-wrap">
        <table>
          <tbody>
            {RACES.map(([id, km]) => (
              <tr key={id}>
                <td>{t(`ui.races.${id}`)}</td>
                <td>{formatDurationSeconds(riegel(values.time, values.distance, km))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="muted">{t('ui.predictionsNote')}</p>
    </details>
  );
}
