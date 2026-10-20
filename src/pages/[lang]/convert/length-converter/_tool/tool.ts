import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('length', {
  order: 10,
  related: ['area-converter', 'speed-converter'],
  defaults: { value: 1, from: 'in', to: 'cm' },
  byLang: {
    en: { value: 6, from: 'ft', to: 'm' },
  },
});

export default island(def);
