import { h, hydrate } from 'preact';
import { ToolRoot, type ToolRootProps } from '@/ui/ToolRoot';
import type { ToolDef } from '@/ui/define';

// Ленивая карта: у каждого инструмента свой чанк, грузится только нужный.
const loaders = import.meta.glob<{ default: ToolDef }>('/src/tools/*/*/tool.ts');

const root = document.querySelector<HTMLElement>('[data-tool-root]');
const propsEl = document.getElementById('tool-props');

if (root && propsEl) {
  const { path, ...props } = JSON.parse(propsEl.textContent!) as Omit<ToolRootProps, 'def'> & { path: string };
  const load = loaders[`/src/tools/${path}/tool.ts`];
  load?.().then((mod) => hydrate(h(ToolRoot, { def: mod.default, ...props }), root));
}
