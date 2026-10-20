import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { Scale } from '@/ui/Scale';
import { ACE, type bodyFat } from './tool';

export function FatScale({ values, result, lang, t }: ExtraProps<{ sex: 'male' | 'female' }, ReturnType<typeof bodyFat>>) {
  const [a, f, avg, o] = ACE[values.sex];
  const c = (k: string) => t(`ui.categories.${k}`);
  return (
    <Scale
      min={values.sex === 'male' ? 2 : 10}
      value={result.percent}
      label={`${t('outputs.percent.label')} ${formatNumber(lang, result.percent, 'percent', 1)} — ${c(result.category)}`}
      format={(n) => formatNumber(lang, n, 'percent', 0)}
      bands={[
        { to: a, label: c('essential'), tone: 'low' },
        { to: f, label: c('athletes'), tone: 'good' },
        { to: avg, label: c('fitness'), tone: 'good' },
        { to: o, label: c('average'), tone: 'warn' },
        { to: o + 15, label: c('obese'), tone: 'bad' },
      ]}
    />
  );
}
