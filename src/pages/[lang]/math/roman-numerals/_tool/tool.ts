import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Roman } from './Roman';

export const def = defineTool({
  order: 100,
  related: ['number-base', 'fractions'],
  component: Roman,
});

export default island(def);
