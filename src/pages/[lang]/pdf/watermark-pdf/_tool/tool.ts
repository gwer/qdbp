import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { WatermarkPdf } from './WatermarkPdf';

export const def = defineTool({ order: 90, related: ['pdf-page-numbers', 'protect-pdf'], component: WatermarkPdf });

export default island(def);
