import type { Lang } from '@/i18n/config';
import { makeT, type Dict } from '@/i18n/t';
import { Calculator } from './Calculator';
import type { ToolDef } from './define';

export interface ToolRootProps {
  def: ToolDef;
  lang: Lang;
  /** Строки инструмента и общие строки интерфейса на языке страницы. */
  strings: { tool: Dict; ui: Dict };
}

// Один и тот же компонент рендерится при сборке (Astro) и гидратируется на клиенте
// (src/scripts/hydrate-tool.ts) — с одинаковыми пропсами.
export function ToolRoot({ def, lang, strings }: ToolRootProps) {
  const t = makeT(lang, strings.tool, strings.ui);
  if (def.kind === 'calculator') return <Calculator def={def} lang={lang} t={t} />;
  const Component = def.component;
  return <Component lang={lang} t={t} />;
}
