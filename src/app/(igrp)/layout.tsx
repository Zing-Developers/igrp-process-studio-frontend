import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { configLayout } from '@/actions/igrp/layout';
import IRNLayout from '../(myapp)/components/irn-ui-commons/irn-layout';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const layoutConfig = await configLayout();

  // TDOD: see to move this to the root-layout
  const { session } = layoutConfig;
  const previewMode = process.env.IGRP_PREVIEW_MODE === 'true';

  const headersList = await headers();
  const currentPath =
    headersList.get('x-pathname') ||
    headersList.get('x-next-url') ||
    headersList.get('referer') ||
    '';

  const baseUrl = process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL;

  const urlLogin = '/login';

  const loginPath = new URL(urlLogin || '/', baseUrl).pathname;

  const isAlreadyOnLogin = currentPath.startsWith(loginPath);

  if (!previewMode && session === null && urlLogin && !isAlreadyOnLogin) {
    redirect(urlLogin);
  }

  return (
    <IRNLayout>
      <main className="px-4">{children}</main>
    </IRNLayout>
  );
}
