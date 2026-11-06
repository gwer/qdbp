import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { PageNumbers } from './PageNumbers';

export const def = defineTool({ order: 100, related: ['organize-pdf', 'merge-pdf'], component: PageNumbers });

export default island(def);
