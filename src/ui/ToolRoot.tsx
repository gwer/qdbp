import type { Lang } from '@/i18n/config';
import { makeT, type Dict } from '@/i18n/t';
import { Calculator } from './Calculator';
import type { ToolDef } from './define';

/** Сериализуемые пропсы острова: всё, что зависит от языка страницы. */
export interface IslandProps {
  lang: Lang;
  /** Строки инструмента и общие строки интерфейса на языке страницы. */
  strings: { tool: Dict; ui: Dict };
}

export function ToolRoot({ def, lang, strings }: IslandProps & { def: ToolDef }) {
  const t = makeT(lang, strings.tool, strings.ui);
  if (def.kind === 'calculator') return <Calculator def={def} lang={lang} t={t} />;
  const Component = def.component;
  return <Component lang={lang} t={t} />;
}

/**
 * Компонент-остров инструмента: `export default island(def)` в _tool/tool.ts.
 * Определение (с функциями) живёт внутри модуля, в остров передаются только сериализуемые пропсы.
 */
export const island = (def: ToolDef) =>
  function ToolIsland(props: IslandProps) {
    return <ToolRoot def={def} {...props} />;
  };
