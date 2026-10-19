import type { Lang } from '@/i18n/config';
import { Calculator } from '@/ui/Calculator';
import { defineTool, type CalculatorDef, type CustomDef, type InputSpec } from '@/ui/define';

// Значение по умолчанию поля: вариант select, строка (дата, время) или число.
type DefaultOf<S> = S extends { type: 'select'; options: readonly (infer O)[] } ? O : S extends { default: string } ? string : number;
type Defaults<I> = Partial<Record<Lang, { [K in keyof I]?: DefaultOf<I[K]> }>>;

/**
 * Калькулятор со значениями по умолчанию, зависящими от языка страницы
 * (ставка НДС, норма чаевых, правдоподобные суммы). Движок пока не умеет задавать
 * default по языку, поэтому оборачиваем стандартный Calculator в свой компонент.
 * Определения на каждый язык создаются один раз — Calculator получает стабильный def.
 */
export function localizedCalculator<I extends Record<string, InputSpec>, R extends object>(
  base: CalculatorDef<I, R>,
  defaults: Defaults<I>,
): CustomDef & { base: CalculatorDef<I, R> } {
  const cache = new Map<Lang, CalculatorDef<I, R>>();
  const forLang = (lang: Lang) => {
    let def = cache.get(lang);
    if (!def) {
      const inputs = { ...base.inputs };
      for (const [name, value] of Object.entries(defaults[lang] ?? {})) {
        inputs[name as keyof I] = { ...inputs[name as keyof I], default: value } as I[keyof I];
      }
      cache.set(lang, (def = { ...base, inputs }));
    }
    return def;
  };
  const tool = defineTool({
    order: base.order,
    related: base.related,
    component: ({ lang, t }) => <Calculator def={forLang(lang) as CalculatorDef} lang={lang} t={t} />,
  });
  return { ...tool, base };
}
