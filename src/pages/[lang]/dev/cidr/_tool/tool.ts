import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CidrCalculator } from './CidrCalculator';

export const def = defineTool({ order: 30, related: ['json-formatter'], component: CidrCalculator });

export default island(def);
