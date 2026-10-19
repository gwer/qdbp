import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CaseConverter } from './CaseConverter';

export const def = defineTool({ order: 20, related: ['word-counter', 'line-tools'], component: CaseConverter });

export default island(def);
