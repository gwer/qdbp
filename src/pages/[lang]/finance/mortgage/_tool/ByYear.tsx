import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { MortgageInput, mortgage } from './mortgage';

export function ByYear({ values, result, lang, t }: ExtraProps<MortgageInput, ReturnType<typeof mortgage>>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  return (
    <>
      {values.kind === 'differentiated' && (
        <p class="muted">{t('ui.decreasing', { first: money(result.payment), last: money(result.lastPayment) })}</p>
      )}
      <details class="extra">
        <summary>{t('ui.byYear')}</summary>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('ui.year')}</th>
                <th>{t('ui.paid')}</th>
                <th>{t('ui.principal')}</th>
                <th>{t('ui.interest')}</th>
                <th>{t('ui.balance')}</th>
              </tr>
            </thead>
            <tbody>
              {result.byYear.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{money(row.paid)}</td>
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
