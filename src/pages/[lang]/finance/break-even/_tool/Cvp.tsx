import { formatCompact, formatNumber } from '@/lib/format';
import { Chart } from '@/ui/Chart';
import type { ExtraProps } from '@/ui/define';
import type { breakEven } from './tool';

type Input = { fixed: number; price: number; variable: number; profit: number };

/** График «выручка — затраты»: линии пересекаются в точке безубыточности, справа от неё — прибыль. */
export function Cvp({ values, result, lang, t }: ExtraProps<Input, ReturnType<typeof breakEven>>) {
  const { fixed, price, variable } = values;
  const zero = Math.ceil(fixed / (price - variable) - 1e-9);
  const top = Math.max(10, 2 * Math.max(zero, result.units));
  const q = Array.from({ length: 11 }, (_, i) => Math.round((top * i) / 10));
  return (
    <Chart
      kind="lines"
      lang={lang}
      label={t('ui.chart')}
      format={(n) => formatNumber(lang, n, 'money')}
      x={q.map((n) => `${formatCompact(lang, n)} ${t('ui.units')}`)}
      series={[
        { label: t('ui.revenue'), values: q.map((n) => n * price) },
        { label: t('ui.costs'), values: q.map((n) => fixed + n * variable) },
      ]}
    />
  );
}
