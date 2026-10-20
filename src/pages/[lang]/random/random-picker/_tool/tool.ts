import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { RandomPicker } from './RandomPicker';

export const def = defineTool({ order: 10, related: ['team-generator', 'dice-roller'], component: RandomPicker });

export default island(def);
