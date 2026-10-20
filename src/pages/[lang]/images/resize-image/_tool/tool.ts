import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ResizeImage } from './ResizeImage';

export const def = defineTool({ order: 20, related: ['convert-image', 'compress-image'], component: ResizeImage });

export default island(def);
