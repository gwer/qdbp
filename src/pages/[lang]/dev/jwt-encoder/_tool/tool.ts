import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { JwtEncoder } from './JwtEncoder';

export const def = defineTool({ order: 45, related: ['jwt-decoder', 'unix-timestamp', 'json-formatter', 'hash'], component: JwtEncoder });

export default island(def);
