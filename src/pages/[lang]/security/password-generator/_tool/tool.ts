import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { PasswordGenerator } from './PasswordGenerator';

export const def = defineTool({ order: 10, component: PasswordGenerator });

export default island(def);
