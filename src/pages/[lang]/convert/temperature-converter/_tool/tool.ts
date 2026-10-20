import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('temperature', {
  order: 50,
  related: ['speed-converter', 'pressure-converter'],
  defaults: { value: 100, from: 'f', to: 'c' },
  byLang: {
    en: { value: 20, from: 'c', to: 'f' },
  },
});

export default island(def);
