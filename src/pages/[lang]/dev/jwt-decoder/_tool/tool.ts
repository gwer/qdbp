import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { JwtDecoder } from './JwtDecoder';

export const def = defineTool({ order: 40, related: ['base64', 'unix-timestamp', 'json-formatter', 'hash'], component: JwtDecoder });

export default island(def);
