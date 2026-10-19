import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { LineTools } from './LineTools';

export const def = defineTool({ order: 30, related: ['case-converter', 'word-counter'], component: LineTools });

export default island(def);
