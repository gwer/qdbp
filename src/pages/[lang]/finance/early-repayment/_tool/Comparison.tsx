import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { formatTerm, LoanChart, ScheduleTable } from '../../_shared/LoanParts';
import { earlyRepayment, type EarlyInput } from './early';

type Result = ReturnType<typeof earlyRepayment>;

/** Сравнение: без досрочных, все — в сокращение срока, все — в уменьшение платежа; график остатка и таблица платежей. */
export function Comparison({ values, result, lang, t }: ExtraProps<EarlyInput, Result>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const variants = (['term', 'payment'] as const).map((m) => [m, earlyRepayment(values, m)] as const);
  const rows: [string, number, number, number, number | null][] = [
    [t('ui.noPrepayment'), result.baseLastRegular, result.base.length, result.interestBefore, null],
    ...variants.map(([m, r]) => [t(`ui.allTo.${m}`), r.lastRegular, r.newTerm, r.interestAfter, r.savings] as [string, number, number, number, number]),
  ];
  return (
    <>
      <div class="table-wrap">
        <table class="wrap">
          <thead>
            <tr>
              <th>{t('ui.variant')}</th>
              <th>{t('ui.saved')}</th>
              <th>{t('ui.term')}</th>
              <th>{t('ui.payment')}</th>
              <th class="hide-narrow">{t('ui.interest')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, payment, months, interest, saved]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{saved === null ? '—' : money(saved)}</td>
                <td>{formatTerm(t, months)}</td>
                <td>{money(payment)}</td>
                <td class="hide-narrow">{money(interest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="muted">{t('ui.paymentNote')}</p>
      <LoanChart schedule={result.schedule} base={result.base} lang={lang} t={t} />
      <ScheduleTable schedule={result.schedule} initialExtra={result.initialExtra} lang={lang} t={t} />
    </>
  );
}
