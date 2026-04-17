import '@/styles/globals.css';
/* start area to add custom styles */

/* end area to add custom styles */
import '@igrp/framework-process-studio-bpmn-editor/dist/src/styles.css';

import '@igrp/framework-next-ui/dist/styles.css';
import '@igrp/igrp-framework-react-design-system/dist/styles.css';

import type { Metadata, Viewport } from 'next';
import { IGRPRootLayout } from '@igrp/framework-next';
import { IGRP_META_THEME_COLORS } from '@igrp/igrp-framework-react-design-system';

import { configLayout } from '@/actions/igrp/layout';
import { createConfig } from '@/igrp.template.config';
import { IGRPLayoutConfigArgs } from '@igrp/framework-next-types';
import { withBasePath } from './(myapp)/lib/url';

export const metadata: Metadata = {
  title: {
    default: "Home - PIR | Centro de Aplicações'",
    template: '%s - PIR | Centro de Aplicações'
  },
  description: "PIR | Centro de Aplicações",
  manifest: withBasePath('/site.webmanifest'),
  icons: {
    icon: [
      { url: withBasePath('/favicon.ico') },
      { url: withBasePath('/favicon-16x16.png'), sizes: '16x16', type: 'image/png' },
      { url: withBasePath('/favicon-32x32.png'), sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: withBasePath('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
    shortcut: [withBasePath('/favicon.ico')],
  },
};

export const viewport: Viewport = {
  themeColor: IGRP_META_THEME_COLORS.light,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const layoutConfig = await configLayout();
  const config = await createConfig(layoutConfig as IGRPLayoutConfigArgs);

  return <IGRPRootLayout config={config}>{children}</IGRPRootLayout>;
}
