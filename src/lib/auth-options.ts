import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { refreshAccessToken } from './auth-helpers';
import { expSystemAdminAPIClient } from '@/app/(myapp)/lib/irn-sdk-clients';

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, user }) {

      if (account && user) {

        try {

          if (!process.env.IRN_SYSTEM_ADMINISTRATION_DISABLED) {

            const sessionData = await expSystemAdminAPIClient.auth.login({
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresIn: account.expires_at,
            });

            if (!sessionData.sessionId) {
              throw new Error('Null session data');
            }

            token.session_id = sessionData.sessionId;

          }


          token.accessToken = account.access_token;
          token.expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
          token.refreshToken = account.refresh_token;
        } catch (error) {
          console.error('[Auth] Backend login failed:', error);
          throw new Error('Error creating BFF Session ID');
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
    async redirect({ url }) {
      const nextInternalUrl = process.env.NEXTAUTH_URL_INTERNAL || '';
      const igrpAppHomeSlug = process.env.IGRP_APP_HOME_SLUG || '';
      const redirectTo = `${nextInternalUrl}${igrpAppHomeSlug}`;

      return nextInternalUrl ? redirectTo : url;
    },
  },
};
