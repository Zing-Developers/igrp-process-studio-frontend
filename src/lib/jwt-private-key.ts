import { readFileSync } from 'node:fs';

export const JWT_PRIVATE_KEY_ENV = 'JWT_PRIVATE_KEY';
export const JWT_PRIVATE_KEY_FILE_ENV = 'Authentication__JwtPrivateKey';
export const JWT_MIDDLEWARE_PRIVATE_KEY_ENV = 'IRN_AUTH_MIDDLEWARE_PRIVATE_KEY';

const normalizePem = (value: string) => value.trim().replace(/\\n/g, '\n');

/**
 * Matches the @irn/irn-auth-sdk/server key-source precedence:
 * direct PEM for local/Kubernetes, then a Vault-mounted production key file.
 */
export function resolveJwtPrivateKey(): string | null {
  const inlinePrivateKey = process.env.JWT_PRIVATE_KEY?.trim();
  if (inlinePrivateKey) return normalizePem(inlinePrivateKey);

  const privateKeyPath = process.env.Authentication__JwtPrivateKey?.trim();
  if (!privateKeyPath) return null;

  try {
    return normalizePem(readFileSync(privateKeyPath, 'utf8'));
  } catch {
    throw new Error(
      'Unable to read the JWT private key file configured by Authentication__JwtPrivateKey',
    );
  }
}

/**
 * The SDK middleware signer accepts PEM content only. This adapts the
 * production pathname contract without changing public deployment variables.
 */
export function prepareJwtPrivateKeyForMiddleware(): boolean {
  if (process.env.JWT_PRIVATE_KEY?.trim()) return true;
  if (process.env[JWT_MIDDLEWARE_PRIVATE_KEY_ENV]?.trim()) return true;

  try {
    const privateKey = resolveJwtPrivateKey();
    if (!privateKey) return false;

    process.env[JWT_MIDDLEWARE_PRIVATE_KEY_ENV] = privateKey;
    return true;
  } catch {
    return false;
  }
}

export function getJwtMiddlewarePrivateKeyEnvVar(): string {
  return process.env.JWT_PRIVATE_KEY?.trim()
    ? JWT_PRIVATE_KEY_ENV
    : JWT_MIDDLEWARE_PRIVATE_KEY_ENV;
}
