import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { OrganizePdf } from './OrganizePdf';

export const def = defineTool({ order: 60, related: ['rotate-pdf', 'split-pdf', 'merge-pdf'], component: OrganizePdf });

export default island(def);
