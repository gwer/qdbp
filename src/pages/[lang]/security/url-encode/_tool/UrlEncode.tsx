import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { decodeUrl, encodeUrl } from './url';

export const UrlEncode = ({ t }: ToolProps) => (
  <TextConverter
    t={t}
    modes={[
      { id: 'encode', run: encodeUrl },
      { id: 'decode', run: decodeUrl },
    ]}
  />
);
