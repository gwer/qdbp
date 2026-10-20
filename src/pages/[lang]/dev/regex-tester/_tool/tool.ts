import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { RegexTester } from './RegexTester';

export const def = defineTool({ order: 50, related: ['text-diff', 'line-tools', 'json-formatter'], component: RegexTester });

export default island(def);
