import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ProtectPdf } from './ProtectPdf';

export const def = defineTool({ order: 110, related: ['unlock-pdf', 'merge-pdf'], component: ProtectPdf });

export default island(def);
