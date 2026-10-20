import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { HeicToJpg } from './HeicToJpg';

export const def = defineTool({ order: 35, related: ['convert-image', 'compress-image', 'exif'], component: HeicToJpg });

export default island(def);
