import { getSession } from '@irn/irn-auth-sdk/server';
import { redirect } from 'next/navigation';

import { getSecureESAApiClient } from '@/app/(myapp)/lib/irn-experiencie-sdk-client';

const isPagePermissionBypassEnabled = () =>
  process.env.IGRP_BYPASS_PAGE_PERMISSIONS?.trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase() === 'true';

const hasPermission = (permissions: string[], requiredPermission: string) => {
  const separatorIndex = requiredPermission.indexOf(':');
  const resourceCode = separatorIndex === -1
    ? requiredPermission
    : requiredPermission.slice(0, separatorIndex);

  return permissions.includes(requiredPermission)
    || permissions.includes(`${resourceCode}:*`)
    || permissions.includes('ADMIN:*')
    || permissions.includes('*:*');
};

/**
 * Server-side page guard. The auth SDK validates the session; permission
 * lookup failures and valid sessions without the grant fail closed.
 */
export async function requirePagePermission(requiredPermission: string) {
  if (isPagePermissionBypassEnabled()) {
    return;
  }

  const { sessionId } = await getSession();

  let permissions: string[];

  try {
    const user = await getSecureESAApiClient(sessionId).auth.me();
    permissions = user.permissions ?? [];
  } catch (error) {
    console.error('[PageAccess] Unable to resolve user permissions', error);
    redirect('/forbidden');
  }

  if (!hasPermission(permissions, requiredPermission)) {
    redirect('/forbidden');
  }
}
