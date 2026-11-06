import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { MergePdf } from './MergePdf';

export const def = defineTool({ order: 10, related: ['split-pdf', 'organize-pdf', 'jpg-to-pdf', 'compress-pdf'], component: MergePdf });

export default island(def);
