import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { UnlockPdf } from './UnlockPdf';

export const def = defineTool({ order: 120, related: ['protect-pdf', 'compress-pdf'], component: UnlockPdf });

export default island(def);
