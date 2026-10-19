import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Transliteration } from './Transliteration';

export const def = defineTool({ order: 40, related: ['case-converter', 'word-counter'], component: Transliteration });

export default island(def);
