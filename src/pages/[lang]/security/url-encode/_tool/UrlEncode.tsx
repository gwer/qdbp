import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { decodeUrl, encodeFullUrl, encodeUrl } from './url';

export const UrlEncode = ({ t }: ToolProps) => (
  <TextConverter
    t={t}
    modes={[
      { id: 'encode', run: encodeUrl, inverse: 'decode' },
      { id: 'encodeFull', run: encodeFullUrl, inverse: 'decode' },
      { id: 'decode', run: decodeUrl, inverse: 'encode' },
    ]}
  />
);
