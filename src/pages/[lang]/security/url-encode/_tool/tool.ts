import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { UrlEncode } from './UrlEncode';

export const def = defineTool({ order: 50, related: ['base64', 'hash'], component: UrlEncode });

export default island(def);
