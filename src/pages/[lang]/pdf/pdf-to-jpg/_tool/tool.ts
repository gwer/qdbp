import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { PdfToJpg } from './PdfToJpg';

export const def = defineTool({ order: 40, related: ['jpg-to-pdf', 'pdf-to-text', 'split-pdf'], component: PdfToJpg });

export default island(def);
