import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { MorseCode } from './MorseCode';

export const def = defineTool({ order: 60, related: ['caesar-cipher', 'base64'], component: MorseCode });

export default island(def);
