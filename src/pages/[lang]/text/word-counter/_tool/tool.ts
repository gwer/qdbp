import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { WordCounter } from './WordCounter';

export const def = defineTool({ order: 10, component: WordCounter });

export default island(def);
