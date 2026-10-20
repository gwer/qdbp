import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CompressImage } from './CompressImage';

export const def = defineTool({ order: 40, related: ['resize-image', 'convert-image'], component: CompressImage });

export default island(def);
