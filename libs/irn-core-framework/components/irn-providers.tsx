'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { useIRNSession } from '../client';
import type { IRNSessionInput } from '../types';

type IRNProvidersProps = {
  children: ReactNode;
  session: IRNSessionInput;
  basePath: string;
  loginPath: string;
};

function IRNSessionWatcher({ children, loginPath }: { children: ReactNode; loginPath: string }) {
  const { status } = useIRNSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(loginPath);
    }
  }, [loginPath, router, status]);

  return children;
}

export function IRNProviders({ children, session, basePath, loginPath }: IRNProvidersProps) {
  return (
    <SessionProvider
      session={session as Parameters<typeof SessionProvider>[0]['session']}
      basePath={basePath}
      refetchInterval={5 * 60}
      refetchOnWindowFocus
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <IRNSessionWatcher loginPath={loginPath}>{children}</IRNSessionWatcher>
      </ThemeProvider>
    </SessionProvider>
  );
}
