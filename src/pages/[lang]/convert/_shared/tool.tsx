import type { Lang } from '@/i18n/config';
import { defineTool } from '@/ui/define';
import { Converter, type ConverterDefaults } from './Converter';
import type { Dimension } from './units';

/** Инструмент-конвертер величины; значения по умолчанию — по рынку языка. */
export function converterTool(
  dim: Dimension,
  opts: { order: number; related: string[]; defaults: ConverterDefaults; byLang?: Partial<Record<Lang, ConverterDefaults>> },
) {
  return defineTool({
    order: opts.order,
    related: opts.related,
    component: ({ lang, t }) => <Converter dim={dim} defaults={opts.byLang?.[lang] ?? opts.defaults} lang={lang} t={t} />,
  });
}
