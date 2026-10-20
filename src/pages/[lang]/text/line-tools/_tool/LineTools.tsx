import { LANG_META } from '@/i18n/config';
import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { dedupe, dedupeIgnoreCase, removeEmpty, reverse, sort, trimLines } from './lines';

export function LineTools({ lang, t }: ToolProps) {
  const locale = LANG_META[lang].intl;
  return (
    <TextConverter
      t={t}
      note={(input, output) => {
        const count = (s: string) => s.replace(/\r\n?/g, '\n').split('\n').length;
        return t('ui.stats', { from: count(input), to: count(output) });
      }}
      modes={[
        { id: 'dedupe', run: dedupe },
        { id: 'dedupeIgnoreCase', run: (s) => dedupeIgnoreCase(s, locale) },
        { id: 'sortAsc', run: (s) => sort(s, locale) },
        { id: 'sortDesc', run: (s) => sort(s, locale, true) },
        { id: 'removeEmpty', run: removeEmpty },
        { id: 'trim', run: trimLines },
        { id: 'reverse', run: reverse },
      ]}
    />
  );
}
