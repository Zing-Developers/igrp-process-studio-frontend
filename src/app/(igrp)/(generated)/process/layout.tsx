import { requirePagePermission } from '@/lib/page-permissions';

const PROCESS_VIEW_PERMISSION = 'STUDIO_PROCESS_DEFINITIONS:visualizar';

export const dynamic = 'force-dynamic';

export default async function ProcessAccessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePagePermission(PROCESS_VIEW_PERMISSION);

  return children;
}
