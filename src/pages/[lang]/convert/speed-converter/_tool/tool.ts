import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('speed', {
  order: 60,
  related: ['length-converter', 'fuel-consumption'],
  defaults: { value: 100, from: 'kmh', to: 'mph' },
  byLang: {
    en: { value: 60, from: 'mph', to: 'kmh' },
  },
});

export default island(def);
