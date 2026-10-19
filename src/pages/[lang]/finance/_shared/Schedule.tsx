import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { LoanInput, LoanResult } from './loan';

export function Schedule({ values, result, lang, t }: ExtraProps<LoanInput, LoanResult>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  return (
    <>
      {values.kind === 'differentiated' && (
        <p class="muted">{t('ui.decreasing', { first: money(result.payment), last: money(result.lastPayment) })}</p>
      )}
      <details class="extra">
        <summary>{t('ui.schedule')}</summary>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('ui.month')}</th>
                <th>{t('ui.payment')}</th>
                <th>{t('ui.principal')}</th>
                <th>{t('ui.interest')}</th>
                <th>{t('ui.balance')}</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.n}>
                  <td>{row.n}</td>
                  <td>{money(row.payment)}</td>
                  <td>{money(row.principal)}</td>
                  <td>{money(row.interest)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
