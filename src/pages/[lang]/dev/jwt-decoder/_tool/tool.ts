import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { JwtDecoder } from './JwtDecoder';

export const def = defineTool({ order: 40, related: ['jwt-encoder', 'base64', 'unix-timestamp', 'json-formatter'], component: JwtDecoder });

export default island(def);
