import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { decodeBase64, encodeBase64 } from './base64';

export const Base64 = ({ t }: ToolProps) => (
  <TextConverter
    t={t}
    modes={[
      { id: 'encode', run: encodeBase64 },
      { id: 'decode', run: decodeBase64 },
    ]}
  />
);
