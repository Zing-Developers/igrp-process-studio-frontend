import { igrpBuildConfig } from '@igrp/framework-next';
import { IGRPConfigArgs, IGRPLayoutConfigArgs } from '@igrp/framework-next-types';
import { fontVariables } from '@/lib/fonts';
import { getMockApps } from '@/temp/applications/use-mock-apps';
import { getMockMenus } from '@/temp/menus/use-mock-menus';
import { getMockMenusFooter } from '@/temp/menus/use-mock-menus-footer';
import { getMockUser } from '@/temp/users/use-mock-user';

export function createConfig(config: IGRPLayoutConfigArgs): Promise<IGRPConfigArgs> {
  const user = getMockUser().mockUser;
  const menu = getMockMenus().mockMenus;
  const footerMwnu = getMockMenusFooter().mockMenusFooter;
  const apps = getMockApps().mockApps;

  function basePath(bp: string) {
    if (!bp) return '/api/auth';

    if (bp.startsWith('/') && bp.endsWith('/')) return `${bp}api/auth`;
    if (bp.startsWith('/') && !bp.endsWith('/')) return `${bp}/api/auth/`;
    if (!bp.startsWith('/') && bp.endsWith('/')) return `/${bp}api/auth`;
    return `${bp}/api/auth`;
  }

  return igrpBuildConfig({
    appCode: process.env.IGRP_APP_CODE || '',
    previewMode: process.env.IGRP_PREVIEW_MODE === 'true',
    syncAccess: process.env.IGRP_SYNC_ACCESS === 'true',
    appInformation: {
      name: process.env.npm_package_name || 'igrp-process-studio-frontend',
      version: process.env.npm_package_version || '1.0.0-dev.2',
      displayName: process.env.IGRP_APP_NAME || 'IGRP Process Studio Frontend',
    },
    layoutMockData: {
      getHeaderData: async () => ({
        user: user,
        showBreadcrumb: true,
        showSearch: true,
        showNotifications: true,
        showUser: true,
        showThemeSwitcher: true,
        showIGRPSidebarTrigger: true,
        showIGRPHeaderTitle: true,
        showIGRPHeaderLogo: true,
      }),
      getSidebarData: async () => ({
        menuItems: menu,
        footerItems: footerMwnu,
        user: user,
        defaultOpen: true,
        showAppSwitcher: true,
        apps: apps,
        appCenterUrl: process.env.IGRP_APP_CENTER_URL || '',
      }),
    },
    font: fontVariables,
    showSidebar: true,
    showHeader: true,

    layout: {
      ...config,
    },
    apiManagementConfig: {
      baseUrl: process.env.IGRP_APP_MANAGER_API || '',
      m2mServiceId: process.env.IGRP_M2M_SERVICE_ID || '',
      m2mToken: process.env.IGRP_M2M_TOKEN || '',
      syncOnCodeMenus: process.env.IGRP_SYNC_ON_CODE_MENUS === 'true',
    },
    toasterConfig: {
      showToaster: true,
      position: 'bottom-right',
      richColors: true,
      closeButton: true,
    },
    showSettings: true,
    sessionArgs: {
      refetchInterval: 5 * 60,
      refetchOnWindowFocus: true,
      basePath: basePath(process.env.NEXT_PUBLIC_BASE_PATH || ''),
    },
  });
}
