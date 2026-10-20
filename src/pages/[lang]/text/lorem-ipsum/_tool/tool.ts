import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { LoremIpsum } from './LoremIpsum';

export const def = defineTool({ order: 50, related: ['word-counter', 'case-converter'], component: LoremIpsum });

export default island(def);
