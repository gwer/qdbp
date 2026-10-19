import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { NumberBase } from './NumberBase';

export const def = defineTool({
  order: 80,
  related: ['roman-numerals', 'random-number'],
  component: NumberBase,
});

export default island(def);
