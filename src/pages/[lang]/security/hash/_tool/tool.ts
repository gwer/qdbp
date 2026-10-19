import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { HashGenerator } from './HashGenerator';

export const def = defineTool({ order: 30, related: ['base64', 'password-generator'], component: HashGenerator });

export default island(def);
