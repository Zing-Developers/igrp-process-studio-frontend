# IRN Core Framework

Local framework boundary intended to become an external package.

## Entry points

- `@irn/irn-core-framework`: layouts and shared public types.
- `@irn/irn-core-framework/client`: client-side session hooks and sign-in/sign-out functions.
- `@irn/irn-core-framework/server/auth`: Node.js authentication handlers.
- `@irn/irn-core-framework/server/keycloak`: Keycloak provider creation.
- `@irn/irn-core-framework/server/token`: Edge-compatible token access.

Keep runtime-specific entry points separate. In particular, middleware must import only
`server/token`; importing the Node.js authentication handler into middleware breaks the Edge
Runtime build.
