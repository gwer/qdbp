import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { DepositInput, deposit } from './deposit';

export function ByYear({ result, lang, t }: ExtraProps<DepositInput, ReturnType<typeof deposit>>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  return (
    <details class="extra">
      <summary>{t('ui.byYear')}</summary>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('ui.year')}</th>
              <th>{t('ui.contributed')}</th>
              <th>{t('ui.interest')}</th>
              <th>{t('ui.balance')}</th>
            </tr>
          </thead>
          <tbody>
            {result.byYear.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{money(row.contributed)}</td>
                <td>{money(row.interest)}</td>
                <td>{money(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
