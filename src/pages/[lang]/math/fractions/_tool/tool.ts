import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Fractions } from './Fractions';

export const def = defineTool({
  order: 90,
  related: ['proportion', 'what-percent'],
  component: Fractions,
});

export default island(def);
