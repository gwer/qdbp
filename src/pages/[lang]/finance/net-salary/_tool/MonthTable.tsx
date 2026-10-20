import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { salaryYear } from './ndfl';

export function MonthTable({ result, lang, t }: ExtraProps<unknown, ReturnType<typeof salaryYear>>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const varies = result.months.some((m) => m.tax !== result.months[0].tax);
  return (
    <>
      {varies && <p class="muted">{t('ui.varies')}</p>}
      <details class="extra" open={varies}>
        <summary>{t('ui.byMonth')}</summary>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('ui.month')}</th>
                <th>{t('ui.gross')}</th>
                <th>{t('ui.tax')}</th>
                <th>{t('ui.net')}</th>
              </tr>
            </thead>
            <tbody>
              {result.months.map((m) => (
                <tr key={m.n}>
                  <td>{m.n}</td>
                  <td>{money(m.gross)}</td>
                  <td>{money(m.tax)}</td>
                  <td>{money(m.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
