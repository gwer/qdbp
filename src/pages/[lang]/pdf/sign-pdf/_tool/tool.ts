import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { SignPdf } from './SignPdf';

export const def = defineTool({ order: 80, related: ['pdf-page-numbers', 'protect-pdf', 'merge-pdf'], component: SignPdf });

export default island(def);
