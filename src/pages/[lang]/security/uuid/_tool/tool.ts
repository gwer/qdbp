import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { UuidGenerator } from './UuidGenerator';

export const def = defineTool({ order: 20, related: ['password-generator', 'hash'], component: UuidGenerator });

export default island(def);
