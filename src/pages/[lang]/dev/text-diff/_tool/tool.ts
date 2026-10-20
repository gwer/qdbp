import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { TextDiff } from './TextDiff';

export const def = defineTool({ order: 60, related: ['regex-tester', 'line-tools', 'word-counter', 'json-formatter'], component: TextDiff });

export default island(def);
