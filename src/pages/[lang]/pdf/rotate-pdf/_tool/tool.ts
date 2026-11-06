import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { RotatePdf } from './RotatePdf';

export const def = defineTool({ order: 70, related: ['organize-pdf', 'merge-pdf', 'compress-pdf'], component: RotatePdf });

export default island(def);
