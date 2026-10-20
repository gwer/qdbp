import { LANG_META } from '@/i18n/config';
import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { camel, constant, dot, kebab, lower, pascal, sentence, snake, title, upper } from './case';

const FNS = { upper, lower, sentence, title, camel, pascal, snake, kebab, constant, dot };

export function CaseConverter({ lang, t }: ToolProps) {
  const locale = LANG_META[lang].intl;
  return <TextConverter t={t} modes={Object.entries(FNS).map(([id, fn]) => ({ id, run: (s: string) => fn(s, locale) }))} />;
}
