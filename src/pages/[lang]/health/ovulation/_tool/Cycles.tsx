import { addDays } from '@/lib/date';
import { formatDayMonth } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { ovulation } from './tool';

/** Следующие шесть циклов той же длины: менструация, фертильное окно, овуляция. */
export function Cycles({ values, lang, t }: ExtraProps<{ lmp: string; cycle: number }, unknown>) {
  const d = (iso: string) => formatDayMonth(lang, iso);
  const rows = Array.from({ length: 6 }, (_, k) => ovulation(addDays(values.lmp, k * values.cycle), values.cycle));
  return (
    <details class="extra" open>
      <summary>{t('ui.cycles')}</summary>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('ui.period')}</th>
              <th>{t('ui.window')}</th>
              <th>{t('ui.ovulation')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <tr key={k}>
                <td>{d(addDays(values.lmp, k * values.cycle))}</td>
                <td>
                  {d(r.fertileStart)} – {d(r.fertileEnd)}
                </td>
                <td>{d(r.ovulation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
