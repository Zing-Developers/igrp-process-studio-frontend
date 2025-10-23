import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

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
      return token;
    },
    async redirect({ url, baseUrl }) {
      const basePath = process.env.IGRP_APP_BASE_PATH || '';
      
      // If URL is relative, make it absolute with baseUrl and basePath
      if (url.startsWith('/')) {
        return `${baseUrl}${basePath}${url}`;
      }
      
      // If URL is absolute and starts with baseUrl, ensure it includes the basePath
      if (url.startsWith(baseUrl)) {
        const pathWithoutBaseUrl = url.replace(baseUrl, '');
        return `${baseUrl}${basePath}${pathWithoutBaseUrl}`;
      }
      
      // For external URLs, return as is
      return url;
    },
  },
};
