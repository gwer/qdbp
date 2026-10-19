import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { gost, passport, slug } from './translit';

export const Transliteration = ({ t }: ToolProps) => (
  <TextConverter
    t={t}
    modes={[
      { id: 'passport', run: passport },
      { id: 'gost', run: gost },
      { id: 'slug', run: slug },
    ]}
  />
);
