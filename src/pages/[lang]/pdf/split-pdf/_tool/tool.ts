import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { SplitPdf } from './SplitPdf';

export const def = defineTool({ order: 50, related: ['merge-pdf', 'organize-pdf', 'pdf-to-jpg'], component: SplitPdf });

export default island(def);
