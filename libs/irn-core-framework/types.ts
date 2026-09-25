import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

export type IRNSession = Session;
export type IRNSessionInput = Session | JWT | null;

export type IRNRootLayoutConfig = {
  session: IRNSessionInput;
  activeThemeValue?: string;
  isScaled?: boolean;
  font?: string;
  basePath?: string;
  language?: string;
  loginPath?: string;
};

export type IRNRootLayoutProps = {
  children: ReactNode;
  config: IRNRootLayoutConfig;
};
