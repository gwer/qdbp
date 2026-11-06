import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Proportion } from './Proportion';

export const def = defineTool({
  order: 50,
  related: ['what-percent', 'percent-of', 'average'],
  component: Proportion,
});

export default island(def);
