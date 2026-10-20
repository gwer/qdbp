import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('area', {
  order: 40,
  related: ['length-converter', 'volume-converter'],
  defaults: { value: 1, from: 'ha', to: 'm2' },
  byLang: {
    ru: { value: 1, from: 'ha', to: 'are' },
    en: { value: 1000, from: 'ft2', to: 'm2' },
  },
});

export default island(def);
