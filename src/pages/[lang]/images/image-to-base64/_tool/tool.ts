import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ImageBase64 } from './ImageBase64';

export const def = defineTool({ order: 60, related: ['qr-generator', 'convert-image'], component: ImageBase64 });

export default island(def);
