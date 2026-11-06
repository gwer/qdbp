import type { ToolProps } from '@/ui/define';
import { PageEditor } from '@/ui/pdf/PageEditor';

export const RotatePdf = (props: ToolProps) => <PageEditor {...props} organize={false} suffix="_rotated" />;
