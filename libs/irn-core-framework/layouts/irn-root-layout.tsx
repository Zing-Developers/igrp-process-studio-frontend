import { IRNProviders } from '../components/irn-providers';
import type { IRNRootLayoutProps } from '../types';

function buildAuthBasePath(basePath: string) {
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, '');
  return normalizedBasePath ? `/${normalizedBasePath}/api/auth` : '/api/auth';
}

export function IRNRootLayout({ children, config }: IRNRootLayoutProps) {
  const {
    session,
    activeThemeValue = 'default',
    isScaled = false,
    font = '',
    basePath = '',
    language = 'pt',
    loginPath = '/login',
  } = config;

  return (
    <html lang={language} suppressHydrationWarning className={font}>
      <body
        className={`bg-background overscroll-none h-screen font-sans antialiased theme-${activeThemeValue}${isScaled ? ' theme-scaled' : ''}`}
      >
        <IRNProviders
          session={session}
          basePath={buildAuthBasePath(basePath)}
          loginPath={loginPath}
        >
          {children}
        </IRNProviders>
      </body>
    </html>
  );
}
