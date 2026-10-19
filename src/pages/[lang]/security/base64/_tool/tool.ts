import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { Base64 } from './Base64';

export const def = defineTool({ order: 40, related: ['url-encode', 'hash'], component: Base64 });

export default island(def);
