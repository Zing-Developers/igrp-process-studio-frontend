# IRN authenticated and authorized pages: implementation guide

This guide is for an AI agent adding or reviewing a protected page in this
frontend. It describes the project conventions for the IRN authentication SDK,
the session/JWT-backed API clients, and safe `401`/`403` handling.

## Required outcome

For every protected route, the implementation must ensure all of the following:

1. A user without a valid session cannot use the route.
2. A user without the required permission cannot receive protected page content
   from a server-rendered route.
3. API `401` and `403` responses never leave protected controls or data visible.
4. Server actions preserve the HTTP status so the UI can make the correct
   access decision.
5. Tokens, cookies, session IDs, and plaintext secrets are never logged.

Do not treat a hidden menu item, disabled button, or client-only role check as
an authorization boundary. The upstream API is the current authorization
boundary; dynamic page authorization must be provided by the IRN auth SDK and
its centrally managed route mappings.

## Project authentication model

There are two related layers in this repository.

| Concern                     | Project mechanism                               | Responsibility                                                                   |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Browser session             | NextAuth JWT cookie, read by `getAccessToken()` | Supplies the access token and `session_id` for server-side API calls.            |
| IRN session and permissions | `@irn/irn-auth-sdk`                             | Validates sessions and provides centrally resolved route authorization.           |
| IRN Experience API          | `getSecureESAApiClient(sessionId)`              | Calls System Administration APIs with the session cookie and interceptor.        |
| Process Studio gateway      | `createServerClient()` / `getServerConfig()`    | Forwards the authenticated user credentials to `API_GATEWAY`.                    |

Relevant implementation files:

- [auth-helpers.ts](../src/lib/auth-helpers.ts) reads the NextAuth JWT.
- [server-client.ts](<../src/app/(myapp)/lib/server-client.ts>) constructs
  authenticated gateway clients.
- [middleware.ts](../src/middleware.ts) redirects a refresh-token failure to
  `/login`.
- [irn-layout.tsx](<../src/app/(myapp)/components/irn-ui-commons/irn-layout.tsx>)
  validates the IRN session and closes or renegotiates an invalid session.

## What an AI agent must do for a new protected page

### 1. Establish the access contract first

Before writing the page, identify and record:

- the route and its central route-mapping entry;
- the canonical resource and action represented by that central mapping;
- the endpoint(s) used by the page and their expected `401` and `403` behavior;
- whether a `401` should redirect to login, display a session-expired screen,
  or use the existing session-renegotiation flow;
- whether the page creates or displays secrets that must never be logged or
  cached.

Do not invent or embed a permission string in this frontend. If the required
central route mapping does not exist, stop and have it provisioned by the
owning System Administration workflow.

### 2. Do not hardcode page permissions in route files

Page components and route layouts must not embed a fixed permission string or
maintain their own route-to-permission table. Route access must be resolved from
the central route mappings and current-session permissions exposed through
`@irn/irn-auth-sdk`.

Until that SDK middleware integration is implemented, the authenticated layout
continues to validate the session and each upstream API remains the
authorization boundary for its own data and operations. Do not add a temporary
fixed-permission guard to compensate for a missing route mapping.

### 3. Use a server-side authenticated API client

Keep browser components free of bearer tokens and session IDs. A server action
or server-side function must obtain the session and create the API client:

```ts
'use server';

import { createServerClient } from '@/app/(myapp)/lib/server-client';

export async function getRecords() {
  const client = await createServerClient();
  return client.records.list();
}
```

`createServerClient()` uses `getAccessToken()` and attaches the normal bearer
token/session cookie combination, including the APISIX variant when configured.
Do not recreate this header logic in a page component.

If an endpoint is not yet represented by the Process Studio SDK, use a small
local server-side adapter such as the M2M keys client. It must reuse
`getServerConfig()` rather than introducing a second authentication scheme.

### 4. Preserve status codes through server actions

The page must be able to distinguish an authorization failure from validation
or transport failure. Return a typed result that preserves the HTTP status:

```ts
export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string; status?: number };

export async function listRecords(): Promise<ActionResult<Record[]>> {
  try {
    return { success: true, data: await client.records.list() };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message, status: error.status };
    }
    throw error;
  }
}
```

Do not collapse all errors into a generic message before returning to the page;
that would make a `401` or `403` indistinguishable from a `400` or `500`.

### 5. Invalidate client-page access for both 401 and 403

A client page must block rendering as soon as its load request returns either
status. It must also do this after mutation failures, because a token can expire
after the initial query succeeded.

The `/api-keys` page is the reference implementation:

```tsx
type AccessErrorStatus = 401 | 403;

const isAccessErrorStatus = (status?: number): status is AccessErrorStatus =>
  status === 401 || status === 403;

const [accessErrorStatus, setAccessErrorStatus] = useState<AccessErrorStatus | null>(null);

const queryAccessErrorStatus =
  keysResult && !keysResult.success && isAccessErrorStatus(keysResult.status)
    ? keysResult.status
    : null;

const deniedStatus = accessErrorStatus ?? queryAccessErrorStatus;

if (deniedStatus) {
  return <AccessDeniedPage status={deniedStatus} />;
}
```

For every create/update/delete action, test the structured result before showing
an ordinary error toast:

```tsx
const result = await revokeRecord(id);

if (!result.success) {
  if (isAccessErrorStatus(result.status)) {
    setAccessErrorStatus(result.status);
    return;
  }

  showErrorToast(result.error);
  return;
}
```

`401` means the session/token is absent, expired, or invalid. `403` means the
request was authenticated but lacks authorization. The shared
`AccessDeniedPage` accepts `status={401 | 403}` and displays the appropriate
copy. It is a UI safety measure; it does not replace the server-side guard or
the backend authorization check.

### 6. Keep diagnostics safe

Development-only logs may include method, URL, response status, response
headers, and duration. They must redact at least:

- `Authorization`, `Proxy-Authorization`, and API key headers;
- cookies and `Set-Cookie`;
- access, refresh, and ID tokens;
- session IDs;
- passwords, secrets, and generated M2M keys.

The M2M client in
[m2m-keys-api-client.ts](<../src/app/(myapp)/client/m2m-keys/m2m-keys-api-client.ts>)
is the reference. Its logs run only when `NODE_ENV === 'development'` and
recursively redact sensitive fields. Never log a create/rotate plaintext key.

## Review and completion checklist

An AI agent must check every item before declaring a protected page complete.

- [ ] The backend endpoint enforces the required permission/role.
- [ ] The route is present in the centrally managed SDK route mappings.
- [ ] The SDK resolves the route mapping and current-session permission before
      protected content renders.
- [ ] The route is dynamic when it reads session/permission data.
- [ ] Server actions use `createServerClient()` or a local adapter built from
      `getServerConfig()`.
- [ ] API-client errors retain the original HTTP status.
- [ ] The page blocks all protected content for query `401` and `403` results.
- [ ] Every mutating endpoint also invalidates page access for `401` and `403`.
- [ ] `401` and `403` have accurate, distinct user-facing messages.
- [ ] The access-denied view contains no protected data, secret, or action.
- [ ] Secrets, tokens, cookies, and session IDs are redacted from logs.
- [ ] Development tracing is disabled outside development.
- [ ] `pnpm build` passes.

## Current-project audit

The following checks have been applied to `igrp-process-studio-frontend`:

| Check                                     | Status                            | Evidence                                                                                                                                                                                                                    |
| ----------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication/session lifecycle          | Pass                              | Middleware handles refresh-token failure; the IRN layout closes or renegotiates invalid sessions.                                                                                                                           |
| Dynamic page permission resolution        | Pending SDK middleware integration | Fixed route permissions were removed from `/process`; route access must be resolved from central mappings through `@irn/irn-auth-sdk`.                                                                                       |
| Authenticated gateway client              | Pass                              | `getServerConfig()` reads the session and supplies gateway headers.                                                                                                                                                         |
| Preserved M2M API status                  | Pass                              | `M2mKeysApiClientError` exposes `status`; M2M server actions return it.                                                                                                                                                     |
| `/api-keys` query 401/403 invalidation    | Pass                              | The page renders `AccessDeniedPage` for either status.                                                                                                                                                                      |
| `/api-keys` mutation 401/403 invalidation | Pass                              | Create, revoke, and rotate store an access-error state and block the page.                                                                                                                                                  |
| Accurate 401/403 screen                   | Pass                              | `AccessDeniedPage` accepts and displays the status.                                                                                                                                                                         |
| Development logging redaction             | Pass                              | The local M2M client redacts credentials and secrets, and logs only in development.                                                                                                                                         |
| Dynamic route mapping for `/api-keys`     | Pending SDK middleware integration | The M2M endpoint itself enforces the super-admin role, and the page blocks its 401/403 response. Page access must come from the central SDK route mapping rather than a fixed frontend permission.                      |

The final audit item is intentionally not marked as complete: a client-side
response block cannot replace dynamic route authorization, and this repository
must not invent the missing central mapping.
