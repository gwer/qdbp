import { formatNumber } from '@/lib/format';
import { Chart } from '@/ui/Chart';
import type { ExtraProps } from '@/ui/define';

type Input = { amount: number; rate: number; years: number };

/** Две линии по годам: сколько понадобится, чтобы купить то же, и сколько будет стоить сегодняшняя сумма. */
export function ByYear({ values, lang, t }: ExtraProps<Input, unknown>) {
  const { amount, rate, years } = values;
  const last = Math.ceil(years);
  if (last < 1) return null;
  const step = Math.max(1, Math.ceil(last / 40));
  const xs: number[] = [];
  for (let y = 0; y < last; y += step) xs.push(y);
  xs.push(years);
  const f = (y: number) => (1 + rate / 100) ** y;
  return (
    <Chart
      kind="lines"
      lang={lang}
      label={t('ui.chart')}
      format={(n) => formatNumber(lang, n, 'money')}
      x={xs.map((y) => t('ui.year', { year: formatNumber(lang, y) }))}
      series={[
        { label: t('ui.future'), values: xs.map((y) => amount * f(y)) },
        { label: t('ui.power'), values: xs.map((y) => amount / f(y)) },
      ]}
    />
  );
}
