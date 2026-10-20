import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('data', {
  order: 90,
  related: ['length-converter'],
  defaults: { value: 1, from: 'gb', to: 'mb' },
});

export default island(def);
