import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Random } from './Random';

export const def = defineTool({
  order: 70,
  related: ['dice-roller', 'random-picker'],
  component: Random,
});

export default island(def);
