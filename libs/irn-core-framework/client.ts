'use client';

import {
  getSession,
  signIn,
  signOut,
  useSession,
  type SignInOptions,
  type SignOutParams,
} from 'next-auth/react';

export const getIRNSession = getSession;
export const signInIRN = (provider?: string, options?: SignInOptions) => signIn(provider, options);
export const signOutIRN = <Redirect extends boolean = true>(options?: SignOutParams<Redirect>) =>
  signOut<Redirect>(options);
export const useIRNSession = useSession;
