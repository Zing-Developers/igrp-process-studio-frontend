import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { refreshAccessToken } from './auth-helpers';

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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      // Check if token needs refresh (refresh if less than 5 minutes until expiry)
      if (token.expiresAt && typeof token.expiresAt === 'number') {
        const expiresIn = token.expiresAt * 1000 - Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        // If token expires in less than 5 minutes, try to refresh
        if (expiresIn < fiveMinutes && token.refreshToken) {
          const refreshed = await refreshAccessToken(token.refreshToken as string);

          if (refreshed) {
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
            token.expiresAt = refreshed.expiresAt;
            console.debug('[Auth] Token refreshed successfully');
          }
        }
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log('baseUrl', baseUrl);
      const nextPublicUrl = process.env.NEXTAUTH_URL_INTERNAL || '';
      const igrpAppHomeSlug = process.env.IGRP_APP_HOME_SLUG || '';

      const redirectTo = nextPublicUrl ? `${nextPublicUrl}${igrpAppHomeSlug}` : '';

      return redirectTo ? redirectTo : url;
    },
  },
};
