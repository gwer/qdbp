import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { QrGenerator } from './QrGenerator';

export const def = defineTool({ order: 10, related: ['image-to-base64', 'convert-image'], component: QrGenerator });

export default island(def);
