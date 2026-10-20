import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { Scale } from '@/ui/Scale';
import type { bmi } from './tool';

export function BmiScale({ result, lang, t }: ExtraProps<unknown, ReturnType<typeof bmi>>) {
  const c = (k: string) => t(`ui.categories.${k}`);
  const value = formatNumber(lang, result.bmi, 'number', 1);
  return (
    <Scale
      min={15}
      value={result.bmi}
      label={`${t('outputs.bmi.label')} ${value} — ${c(result.category)}`}
      format={(n) => formatNumber(lang, n, 'number', 1)}
      bands={[
        { to: 18.5, label: c('under'), tone: 'low' },
        { to: 25, label: c('normal'), tone: 'good' },
        { to: 30, label: c('over'), tone: 'warn' },
        { to: 35, label: c('obese1'), tone: 'bad' },
        { to: 40, label: c('obese2'), tone: 'worse' },
        { to: 45, label: c('obese3'), tone: 'worst' },
      ]}
    />
  );
}
