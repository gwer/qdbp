import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatNumber } from '@/lib/format';
import { Chart } from '@/ui/Chart';
import { byYear, type LoanRow } from './loan';

// Общие блоки кредитных калькуляторов. Строки — ui.* в i18n каждого инструмента (см. loan-calculator).

/** «12 лет 3 месяца»; меньше года — только месяцы. */
export function formatTerm(t: T, months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return t('ui.months', { count: m });
  return m ? `${t('ui.years', { count: y })} ${t('ui.months', { count: m })}` : t('ui.years', { count: y });
}

/** Точки графика: помесячно для коротких кредитов, иначе по годам. */
function points(schedule: readonly LoanRow[], monthly: boolean) {
  if (monthly) {
    return schedule.map((r) => ({ x: String(r.n), principal: r.principal, interest: r.interest, extra: r.extra ?? 0, balance: r.balance }));
  }
  return byYear(schedule).map((y) => ({ x: String(y.year), principal: y.principal, interest: y.interest, extra: y.extra, balance: y.balance }));
}

/**
 * Без досрочных погашений — столбцы «основной долг + проценты» по годам: видно, как доля процентов падает.
 * С досрочными (base — тот же кредит без них) — две линии остатка долга.
 */
export function LoanChart({ schedule, base, lang, t }: { schedule: readonly LoanRow[]; base?: readonly LoanRow[]; lang: Lang; t: T }) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const monthly = (base ?? schedule).length <= 36;
  const pts = points(schedule, monthly);
  const xTitle = monthly ? t('ui.month') : t('ui.year');
  if (base) {
    const b = points(base, monthly);
    return (
      <Chart
        kind="lines"
        lang={lang}
        label={t('ui.chartBalance')}
        format={money}
        x={b.map((p) => `${xTitle} ${p.x}`)}
        series={[
          { label: t('ui.withoutPrepay'), values: b.map((p) => p.balance) },
          { label: t('ui.withPrepay'), values: b.map((_, i) => pts[i]?.balance ?? 0) },
        ]}
      />
    );
  }
  return (
    <Chart
      kind="bars"
      lang={lang}
      label={t('ui.chartPayments')}
      format={money}
      x={pts.map((p) => `${xTitle} ${p.x}`)}
      series={[
        { label: t('ui.principal'), values: pts.map((p) => p.principal) },
        { label: t('ui.interest'), values: pts.map((p) => p.interest) },
      ]}
    />
  );
}

/** Помесячный график платежей; offset — сколько платежей было до первой строки. */
export function ScheduleTable({ schedule, lang, t, offset = 0 }: { schedule: readonly LoanRow[]; lang: Lang; t: T; offset?: number }) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const hasExtra = schedule.some((r) => r.extra);
  return (
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
              {hasExtra && <th>{t('ui.extra')}</th>}
              <th>{t('ui.balance')}</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.n}>
                <td>{offset + row.n}</td>
                <td>{money(row.payment)}</td>
                <td>{money(row.principal)}</td>
                <td>{money(row.interest)}</td>
                {hasExtra && <td>{row.extra ? money(row.extra) : ''}</td>}
                <td>{money(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Сводка эффекта досрочных погашений: экономия и насколько раньше закроется кредит. */
export function PrepayEffect({ schedule, base, overpay, baseOverpay, lang, t }: {
  schedule: readonly LoanRow[];
  base: readonly LoanRow[];
  overpay: number;
  baseOverpay: number;
  lang: Lang;
  t: T;
}) {
  const saved = Math.round((baseOverpay - overpay) * 100) / 100;
  const shorter = base.length - schedule.length;
  return (
    <p class="calc-note">
      {t('ui.effect', { savings: formatNumber(lang, saved, 'money') })}{' '}
      {shorter > 0 ? t('ui.effectTerm', { term: formatTerm(t, shorter) }) : t('ui.effectSameTerm')}
    </p>
  );
}
