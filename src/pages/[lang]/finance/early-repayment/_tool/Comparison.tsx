import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { earlyRepayment, type EarlyInput } from './early';

type Result = ReturnType<typeof earlyRepayment>;

/** Сравнение двух вариантов и график после досрочного погашения. */
export function Comparison({ values, result, lang, t }: ExtraProps<EarlyInput, Result>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const both = (['term', 'payment'] as const).map((mode) => [mode, earlyRepayment({ ...values, mode })] as const);
  return (
    <>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('ui.variant')}</th>
              <th>{t('ui.payment')}</th>
              <th>{t('ui.monthsLeft')}</th>
              <th>{t('ui.saved')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('ui.noPrepayment')}</td>
              <td>{money(result.oldPayment)}</td>
              <td>{result.oldMonths}</td>
              <td>—</td>
            </tr>
            {both.map(([mode, r]) => (
              <tr key={mode}>
                <td>{t(`inputs.mode.options.${mode}`)}</td>
                <td>{money(r.newPayment)}</td>
                <td>{r.newMonths}</td>
                <td>{money(r.savings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.schedule.length > 0 && (
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
                    <td>{values.after + row.n}</td>
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
      )}
    </>
  );
}
