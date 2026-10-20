import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { TimezoneConverter } from './TimezoneConverter';

export const def = defineTool({ order: 55, related: ['time-calculator', 'unix-timestamp', 'time-between'], component: TimezoneConverter });

export default island(def);
