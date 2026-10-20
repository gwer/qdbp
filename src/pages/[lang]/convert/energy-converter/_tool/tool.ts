import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('energy', {
  order: 80,
  related: ['pressure-converter', 'temperature-converter'],
  defaults: { value: 100, from: 'kcal', to: 'kj' },
  byLang: {
    en: { value: 1, from: 'kwh', to: 'btu' },
  },
});

export default island(def);
