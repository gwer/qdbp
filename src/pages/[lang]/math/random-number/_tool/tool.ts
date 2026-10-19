import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Random } from './Random';

export const def = defineTool({
  order: 70,
  related: ['average', 'number-base'],
  component: Random,
});

export default island(def);
