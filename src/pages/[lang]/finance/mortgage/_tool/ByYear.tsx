import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { LoanChart, PrepayEffect } from '../../_shared/LoanParts';
import type { MortgageInput, mortgage } from './mortgage';

export function ByYear({ values, result, lang, t }: ExtraProps<MortgageInput, ReturnType<typeof mortgage>>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const base = result.extraTotal > 0 ? result.base : undefined;
  return (
    <>
      {values.kind === 'differentiated' && (
        <p class="muted">{t('ui.decreasing', { first: money(result.payment), last: money(result.lastPayment) })}</p>
      )}
      {base && (
        <PrepayEffect schedule={result.schedule} base={base.schedule} overpay={result.overpay} baseOverpay={base.overpay} lang={lang} t={t} />
      )}
      <LoanChart schedule={result.schedule} base={base?.schedule} lang={lang} t={t} />
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
                {base && <th>{t('ui.extra')}</th>}
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
                  {base && <td>{row.extra ? money(row.extra) : ''}</td>}
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
