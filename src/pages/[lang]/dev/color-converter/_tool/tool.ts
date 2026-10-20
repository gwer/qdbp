import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { ColorConverter } from './ColorConverter';

export const def = defineTool({ order: 20, related: ['json-formatter'], component: ColorConverter });

export default island(def);
