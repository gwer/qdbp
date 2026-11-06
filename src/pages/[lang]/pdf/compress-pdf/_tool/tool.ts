import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CompressPdf } from './CompressPdf';

export const def = defineTool({ order: 20, related: ['merge-pdf', 'split-pdf', 'jpg-to-pdf'], component: CompressPdf });

export default island(def);
