import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { TeamGenerator } from './TeamGenerator';

export const def = defineTool({ order: 20, related: ['random-picker', 'dice-roller'], component: TeamGenerator });

export default island(def);
