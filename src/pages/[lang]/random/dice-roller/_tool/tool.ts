import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { DiceRoller } from './DiceRoller';

export const def = defineTool({ order: 30, related: ['random-picker', 'random-number'], component: DiceRoller });

export default island(def);
