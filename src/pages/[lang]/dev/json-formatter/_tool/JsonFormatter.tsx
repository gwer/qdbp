import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { TextConverter } from '@/ui/TextConverter';
import { errorOffset, formatJson, lineColumn, repairJson, type Indent } from './json';

const MODES: [string, Indent][] = [
  ['format2', 2],
  ['format4', 4],
  ['tab', '\t'],
  ['minify', 0],
];

export function JsonFormatter({ t }: ToolProps) {
  const [sort, setSort] = useState(false);
  const [repair, setRepair] = useState(false);
  return (
    <TextConverter
      t={t}
      placeholder='{"name": "tooloot", "tools": [1, 2, 3]}'
      modes={MODES.map(([id, indent]) => ({ id, run: (s) => formatJson(repair ? repairJson(s) : s, indent, sort) }))}
      options={
        <div class="checks">
          <label>
            <input type="checkbox" checked={sort} onChange={(e) => setSort(e.currentTarget.checked)} /> {t('ui.sort')}
          </label>
          <label>
            <input type="checkbox" checked={repair} onChange={(e) => setRepair(e.currentTarget.checked)} /> {t('ui.repair')}
          </label>
        </div>
      }
      describeError={(_, input) => {
        // С починкой ошибка — в уже исправленном тексте, её позиция в исходнике не совпадёт: без подробностей.
        if (repair) return null;
        const off = errorOffset(input);
        return off === null ? null : t('ui.at', lineColumn(input, off));
      }}
    />
  );
}
