# SDK Route Access Control

Status: Approved

Created: 2026-10-09

## Objective

Protect Process Studio page routes with the IRN auth SDK. Every protected page
request must run session validation, session revocation, route mapping, and
selected-profile permission checks. Route mapping and permission enforcement
are mandatory in every environment; this frontend provides no application-level
bypass.

## Goals

- Use `createAuthMiddleware` as the page-level authentication and
  authorization engine.
- Deny unmapped pages and definitive missing-permission results before page
  rendering.
- Keep the existing root landing/redirect, external login, base-path, and
  `/forbidden` behavior compatible.
- Use the shared local/Kubernetes/production APISIX JWT key contract.
- Make the implementation and its verification repeatable in other IRN
  frontends.

## Scope

### In Scope

- Application page routes covered by the Next.js middleware matcher.
- Base paths from `IGRP_APP_BASE_PATH`, `APP_BASE_PATH`, or
  `NEXT_PUBLIC_BASE_PATH`.
- Session revocation, route mappings, and permissions from System
  Administration.
- APISIX JWT creation for middleware and existing server clients.
- Root, login, external-login, and unauthorized-page compatibility.

### Out of Scope

- Authorization within BFF/upstream APIs, which keep their existing controls.
- Changing SDK retry, cache, cookie, or transient-permission semantics.
- Generated files under `src/app/(igrp)/(generated)`.

## Functional Requirements

### FR-01 — Mandatory SDK authorization

`src/middleware.ts` must call `createAuthMiddleware` with all of:

- revocation configured with `ttlMs: 10_000`;
- route mappings configured from `/modules/route-mappings`;
- per-session permissions configured from `/auth/permissions`; and
- `denyByDefault: true`.

No environment variable, development branch, test hook, or application branch
may omit route mapping or permission enforcement.

### FR-02 — Request behavior

- Protected requests without `session_id` redirect to `/login` with `returnUrl`.
- Invalid, expired, or revoked sessions redirect to login and use SDK cookie
  cleanup.
- A protected mapped page lacking
  `<resourceCode>:<requiredAction>` redirects to `/forbidden`.
- A missing mapping redirects to `/forbidden`.
- Revocation cold-cache failures are treated as revoked.
- The SDK may allow a page request after its transient permission retry is
  exhausted; this wrapper must not misrepresent that SDK fallback as fail closed.

### FR-03 — Public, root, and login routes

Public prefixes are `/login`, `/logout`, `/forbidden`, `/auth/error`,
`/api/auth`, `/api/health`, `/_next`, `/favicon.ico`, `/images`, `/fonts`, and
`/static`.

`/` bypasses mapping because Process Studio owns its root landing/redirect
behavior. An external `AUTH_LOGIN_PATH_URL` receives a callback URL. The local
login page must accept both legacy `callbackUrl` and SDK `returnUrl` query
parameters.

### FR-04 — Endpoint resolution

Resolve the local System Administration base URL in this order:

1. `SYSTEM_ADMIN_API_URL`
2. `IRN_API_BACKOFFICE_BASE_URL`
3. `NEXT_PUBLIC_API_URL`, resolved against `NEXTAUTH_URL_INTERNAL` or
   `NEXTAUTH_URL` when relative

Resolve the Kubernetes base URL in this order:

1. `API_URL`
2. `IRN_API_BACKOFFICE_BASE_URL`
3. the local base URL

Append `/api/v1` to explicit service URLs only when absent. A relative
`NEXT_PUBLIC_API_URL` is used as written and must include the intended API
prefix. Missing endpoint configuration fails middleware initialization.

### FR-05 — APISIX JWT key contract

| Deployment | Private-key source |
| --- | --- |
| Local and Kubernetes | `JWT_PRIVATE_KEY` contains PKCS#8 or PKCS#1 PEM content |
| IRN production/Vault | `Authentication__JwtPrivateKey` contains the mounted-key pathname |

`JWT_KEY` is the APISIX consumer identifier. Direct PEM takes precedence when
both sources exist. Escaped `\n` content is normalized.

Because SDK middleware signing accepts PEM content rather than a pathname,
middleware must run in the Node.js runtime and hydrate the production file key
to an internal process-only environment slot.

### FR-06 — Logging and matcher

- Debug logs are opt-in through `IRN_EXPERIENCE_SDK_DEBUG` (`1` or `true`).
- Authorization headers, cookies, secrets, tokens, session identifiers, and
  error objects that might contain them must be redacted.
- The matcher protects pages and excludes API routes, `apps`, `health`, Next.js
  internals, the favicon, and file-extension assets. API exclusions remain
  acceptable only because BFF/upstream APIs authorize independently.

### FR-07 — Stable header Server Actions

The application header must keep the first `IRNHeader` handlers reference for
its mounted lifetime. It must not provide a new Server Action handlers object
after every server re-render, because `IRNHeader` responds by reloading user
data and menu actions repeatedly.

## Acceptance Criteria

- AC-01 — Middleware configures revocation, mappings, permissions, and
  `denyByDefault: true` unconditionally.
- AC-02 — No bypass code, environment declaration, or environment type exists.
- AC-03 — Anonymous, invalid, expired, revoked, unmapped, and missing-
  permission page requests follow FR-02.
- AC-04 — Public prefixes, root, external login, and both local-login query
  parameter names follow FR-03.
- AC-05 — Endpoint resolution and initialization failure follow FR-04.
- AC-06 — Direct and file-backed JWT key sources follow FR-05 for middleware
  and existing server token clients.
- AC-07 — Logs are redacted and middleware coverage follows FR-06.
- AC-08 — TypeScript, targeted lint, focused key/config assertions, and the
  production build pass.
- AC-09 — A server re-render does not change the header handlers reference or
  retrigger header Server Actions solely due to that render.

## Reference Files

- `src/middleware.ts`
- `src/lib/jwt-private-key.ts`
- `src/app/(myapp)/lib/rsa-token-handlers.ts`
- `src/app/(auth)/login/page.tsx`
- `.env-example`
- `src/app/(myapp)/components/irn-ui-commons/stable-irn-header.tsx`
