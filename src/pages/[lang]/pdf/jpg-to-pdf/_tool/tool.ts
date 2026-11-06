import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { JpgToPdf } from './JpgToPdf';

export const def = defineTool({ order: 30, related: ['pdf-to-jpg', 'merge-pdf', 'compress-pdf'], component: JpgToPdf });

export default island(def);
