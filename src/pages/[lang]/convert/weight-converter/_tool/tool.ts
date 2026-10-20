import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('weight', {
  order: 20,
  related: ['volume-converter', 'length-converter'],
  defaults: { value: 1, from: 'lb', to: 'kg' },
  byLang: {
    en: { value: 150, from: 'lb', to: 'kg' },
  },
});

export default island(def);
