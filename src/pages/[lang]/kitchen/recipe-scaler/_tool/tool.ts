import { defineTool } from '@/ui/define';
import { island } from '@/ui/ToolRoot';
import { RecipeScaler } from './RecipeScaler';

export const def = defineTool({ order: 50, related: ['cups-to-grams', 'cake-pan', 'yeast'], component: RecipeScaler });

export default island(def);
