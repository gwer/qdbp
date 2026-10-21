import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { LoanKind, LoanResult } from './loan';
import { LoanChart, PrepayEffect, ScheduleTable } from './LoanParts';

/** Блок под результатом кредита: график, эффект досрочных погашений (base — тот же кредит без них), таблица. */
export function Schedule({ values, result, lang, t }: ExtraProps<{ kind: LoanKind }, LoanResult & { base?: LoanResult }>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const base = result.base && result.extraTotal > 0 ? result.base : undefined;
  return (
    <>
      {values.kind === 'differentiated' && (
        <p class="muted">{t('ui.decreasing', { first: money(result.payment), last: money(result.lastPayment) })}</p>
      )}
      {base && (
        <PrepayEffect schedule={result.schedule} base={base.schedule} overpay={result.overpay} baseOverpay={base.overpay} lang={lang} t={t} />
      )}
      <LoanChart schedule={result.schedule} base={base?.schedule} lang={lang} t={t} />
      <ScheduleTable schedule={result.schedule} initialExtra={result.initialExtra} lang={lang} t={t} />
    </>
  );
}
