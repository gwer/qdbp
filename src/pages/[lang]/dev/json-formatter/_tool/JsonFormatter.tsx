import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { errorOffset, formatJson, lineColumn, minifyJson } from './json';

export function JsonFormatter({ t }: ToolProps) {
  return (
    <TextConverter
      t={t}
      placeholder='{"name": "qdbp", "tools": [1, 2, 3]}'
      modes={[
        { id: 'format2', run: (s) => formatJson(s, 2) },
        { id: 'format4', run: (s) => formatJson(s, 4) },
        { id: 'tab', run: (s) => formatJson(s, '\t') },
        { id: 'sorted', run: (s) => formatJson(s, 2, true) },
        { id: 'minify', run: minifyJson },
      ]}
      describeError={(_, input) => {
        const off = errorOffset(input);
        return off === null ? null : t('ui.at', lineColumn(input, off));
      }}
    />
  );
}
