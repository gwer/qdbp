import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ExifTool } from './ExifTool';

export const def = defineTool({ order: 50, related: ['compress-image', 'image-to-base64'], component: ExifTool });

export default island(def);
