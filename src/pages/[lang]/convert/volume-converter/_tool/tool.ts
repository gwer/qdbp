import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('volume', {
  order: 30,
  related: ['weight-converter', 'area-converter'],
  defaults: { value: 1, from: 'galUs', to: 'l' },
  byLang: {
    en: { value: 1, from: 'l', to: 'cupUs' },
  },
});

export default island(def);
