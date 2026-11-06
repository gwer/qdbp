import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { PdfToText } from './PdfToText';

export const def = defineTool({ order: 130, related: ['pdf-to-jpg', 'split-pdf'], component: PdfToText });

export default island(def);
