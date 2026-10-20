import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ConvertImage } from './ConvertImage';

export const def = defineTool({ order: 30, related: ['resize-image', 'compress-image'], component: ConvertImage });

export default island(def);
