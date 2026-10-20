import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { CaesarCipher } from './CaesarCipher';

export const def = defineTool({ order: 70, related: ['morse-code', 'password-generator'], component: CaesarCipher });

export default island(def);
