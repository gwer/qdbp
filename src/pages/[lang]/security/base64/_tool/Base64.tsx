import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { decodeBase64, encodeBase64, encodeBase64Url } from './base64';

export const Base64 = ({ t }: ToolProps) => (
  <TextConverter
    t={t}
    modes={[
      { id: 'encode', run: encodeBase64, inverse: 'decode' },
      { id: 'encodeUrlSafe', run: encodeBase64Url, inverse: 'decode' },
      { id: 'decode', run: decodeBase64, inverse: 'encode' },
    ]}
  />
);
