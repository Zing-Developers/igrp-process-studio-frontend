import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export async function getAccessToken() {
  const cookieStore = await cookies();

  const token = await getToken({
    req: {
      cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])),
    } as NextApiRequest,
    secret: process.env.NEXTAUTH_SECRET || '',
  });

  return token;
}


/**
 * Refreshes the access token using the refresh token from Keycloak
 * @param refreshToken The refresh token to use
 * @returns Promise with refreshed token data or null if refresh fails
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  try {
    const issuer = process.env.KEYCLOAK_ISSUER;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    if (!issuer || !clientId || !clientSecret) {
      console.error('[Auth] Missing Keycloak configuration for token refresh');
      return null;
    }

    const refreshResponse = await fetch(
      `${issuer}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      }
    );

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('[Auth] Failed to refresh token:', refreshResponse.status, errorText);
      return null;
    }

    const refreshed = await refreshResponse.json();
    const expiresAt = Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600);

    return {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || refreshToken,
      expiresAt,
    };
  } catch (error) {
    console.error('[Auth] Error refreshing token:', error);
    return null;
  }
}