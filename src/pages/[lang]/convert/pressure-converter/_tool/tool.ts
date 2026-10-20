import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('pressure', {
  order: 70,
  related: ['temperature-converter', 'energy-converter'],
  defaults: { value: 2.2, from: 'bar', to: 'psi' },
  byLang: {
    ru: { value: 2.2, from: 'bar', to: 'at' },
    en: { value: 32, from: 'psi', to: 'bar' },
  },
});

export default island(def);
