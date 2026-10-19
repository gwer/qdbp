import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Average } from './Average';

export const def = defineTool({
  order: 60,
  related: ['proportion', 'what-percent', 'random-number'],
  component: Average,
});

export default island(def);
