import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { JsonFormatter } from './JsonFormatter';

export const def = defineTool({ order: 10, related: ['color-converter', 'cidr'], component: JsonFormatter });

export default island(def);
