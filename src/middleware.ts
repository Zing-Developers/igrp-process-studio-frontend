import { createAuthMiddleware } from '@irn/irn-auth-sdk/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {
  getJwtMiddlewarePrivateKeyEnvVar,
  prepareJwtPrivateKeyForMiddleware,
} from '@/lib/jwt-private-key';

const basePath =
  process.env.IGRP_APP_BASE_PATH ||
  process.env.APP_BASE_PATH ||
  process.env.NEXT_PUBLIC_BASE_PATH ||
  '';
const isKubernetes = Boolean(process.env.KUBERNETES_SERVICE_HOST);

prepareJwtPrivateKeyForMiddleware();
const jwtMiddlewarePrivateKeyEnvVar = getJwtMiddlewarePrivateKeyEnvVar();

export const PUBLIC_ROUTES: readonly string[] = [
  '/login',
  '/logout',
  '/forbidden',
  '/auth/error',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/static',
];

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const withApiVersion = (value: string) => {
  const normalized = trimTrailingSlash(value.trim());
  return /\/api\/v1$/i.test(normalized) ? normalized : `${normalized}/api/v1`;
};

const getFrontendOrigin = () => {
  const frontendUrl = process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL;
  if (!frontendUrl) return '';

  try {
    return new URL(frontendUrl).origin;
  } catch {
    return '';
  }
};

const getPublicApiBase = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) return '';

  if (/^https?:\/\//i.test(configuredUrl)) return withApiVersion(configuredUrl);

  const frontendOrigin = getFrontendOrigin();
  if (!frontendOrigin) return '';

  const apiPath = configuredUrl.startsWith('/') ? configuredUrl : `/${configuredUrl}`;
  return trimTrailingSlash(`${frontendOrigin}${apiPath}`);
};

const localApiBase =
  (process.env.SYSTEM_ADMIN_API_URL ? withApiVersion(process.env.SYSTEM_ADMIN_API_URL) : '') ||
  (process.env.IRN_API_BACKOFFICE_BASE_URL
    ? withApiVersion(process.env.IRN_API_BACKOFFICE_BASE_URL)
    : '') ||
  getPublicApiBase();

const kubernetesApiBase = process.env.API_URL
  ? withApiVersion(process.env.API_URL)
  : process.env.IRN_API_BACKOFFICE_BASE_URL
    ? withApiVersion(process.env.IRN_API_BACKOFFICE_BASE_URL)
    : localApiBase;

if (!localApiBase || !kubernetesApiBase) {
  throw new Error(
    '[AuthMiddleware] System Administration API URL is not configured. Set SYSTEM_ADMIN_API_URL, IRN_API_BACKOFFICE_BASE_URL, or NEXT_PUBLIC_API_URL with NEXTAUTH_URL_INTERNAL.',
  );
}

const localRevocationUrl = `${localApiBase}/sessions`;
const kubernetesRevocationUrl = `${kubernetesApiBase}/sessions`;
const activeRevocationUrl = isKubernetes ? kubernetesRevocationUrl : localRevocationUrl;

const isDebugEnabled = /^(1|true)$/i.test(process.env.IRN_EXPERIENCE_SDK_DEBUG?.trim() ?? '');

const redactLogValue = (value: unknown): unknown => {
  if (value instanceof Error) return '[REDACTED_ERROR]';
  if (Array.isArray(value)) return value.map(redactLogValue);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      /authorization|cookie|secret|session|token/i.test(key) ? '[REDACTED]' : redactLogValue(entry),
    ]),
  );
};

const sanitizeLogArgs = (args: unknown[]) =>
  args.map((arg, index) => {
    const previous = args[index - 1];
    if (index > 0 && typeof previous === 'string' && /session|token|cookie|secret/i.test(previous)) {
      return '[REDACTED]';
    }

    return redactLogValue(arg);
  });

const appendRevocationContext = (args: unknown[]) => {
  const isRevocationEvent = args.some(
    (arg) => typeof arg === 'string' && arg.includes('[session-revocation]'),
  );

  return isRevocationEvent ? [...args, { url: activeRevocationUrl }] : args;
};

const safeLogArgs = (args: unknown[]) => sanitizeLogArgs(appendRevocationContext(args));

const logger = isDebugEnabled
  ? {
      log: (...args: unknown[]) => console.info('[AuthMiddleware]', ...safeLogArgs(args)),
      warn: (...args: unknown[]) => console.warn('[AuthMiddleware]', ...safeLogArgs(args)),
      error: (...args: unknown[]) => console.error('[AuthMiddleware]', ...safeLogArgs(args)),
    }
  : false;

const sdkMiddleware = createAuthMiddleware({
  basePath,
  publicRoutes: [...PUBLIC_ROUTES],
  revocation: {
    url: localRevocationUrl,
    k8sUrl: kubernetesRevocationUrl,
    ttlMs: 10_000,
  },
  routeMappings: {
    url: `${localApiBase}/modules/route-mappings`,
    k8sUrl: `${kubernetesApiBase}/modules/route-mappings`,
  },
  userPermissions: {
    url: `${localApiBase}/auth/permissions`,
    k8sUrl: `${kubernetesApiBase}/auth/permissions`,
  },
  denyByDefault: true,
  cleanupCookies: [],
  redirects: {
    login: '/login',
    unauthorized: '/forbidden',
    dashboard: process.env.IGRP_APP_HOME_SLUG || '/',
  },
  jwt: {
    privateKeyEnvVar: jwtMiddlewarePrivateKeyEnvVar,
    keyEnvVar: 'JWT_KEY',
  },
  logger,
});

const normalizePathname = (pathname: string) => {
  if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    return pathname.slice(basePath.length) || '/';
  }

  return pathname;
};

const getExternalLoginCallbackUrl = (request: NextRequest) => {
  const returnUrl = request.nextUrl.searchParams.get('returnUrl');
  if (!returnUrl?.startsWith('/')) return request.nextUrl.href;

  const publicAppUrl = (process.env.NEXTAUTH_URL || '')
    .replace(/\/api\/auth\/?$/, '')
    .replace(/\/$/, '');

  if (publicAppUrl) {
    const publicAppHasBasePath = !basePath || publicAppUrl.endsWith(basePath);
    return `${publicAppUrl}${publicAppHasBasePath ? '' : basePath}${returnUrl}`;
  }

  return new URL(`${basePath}${returnUrl}`, request.nextUrl.origin).href;
};

export async function middleware(request: NextRequest) {
  const normalizedPathname = normalizePathname(request.nextUrl.pathname);

  // Process Studio owns the root landing/redirect and it has no mapping.
  if (normalizedPathname === '/') return NextResponse.next();

  if (normalizedPathname.startsWith('/login') && process.env.AUTH_LOGIN_PATH_URL) {
    const loginRedirectUrl = new URL(process.env.AUTH_LOGIN_PATH_URL, request.nextUrl.origin);
    loginRedirectUrl.searchParams.set('callbackUrl', getExternalLoginCallbackUrl(request));
    return NextResponse.redirect(loginRedirectUrl);
  }

  prepareJwtPrivateKeyForMiddleware();
  return sdkMiddleware(request);
}

// adictional paths for apps, is used as subdomains
export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/((?!api|apps|health|_next|favicon.ico|.*\\..*).*)'],
};
