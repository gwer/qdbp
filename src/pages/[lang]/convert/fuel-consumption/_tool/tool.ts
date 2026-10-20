import { island } from '@/ui/ToolRoot';
import { converterTool } from '../../_shared/tool';

export const def = converterTool('fuel', {
  order: 100,
  related: ['speed-converter', 'volume-converter'],
  defaults: { value: 8, from: 'l100', to: 'mpgUs' },
  byLang: {
    en: { value: 30, from: 'mpgUs', to: 'l100' },
    pt: { value: 10, from: 'kml', to: 'l100' },
  },
});

export default island(def);
