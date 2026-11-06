import type { ToolProps } from '@/ui/define';
import { PageEditor } from '@/ui/pdf/PageEditor';

export const OrganizePdf = (props: ToolProps) => <PageEditor {...props} organize suffix="_edited" />;
