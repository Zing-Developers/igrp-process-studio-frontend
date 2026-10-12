# SDK Route Access Control Plan

## Approach

1. Replace the legacy token-only middleware with `createAuthMiddleware`.
2. Keep Process Studio's root and external-login wrapper behavior outside the
   SDK call.
3. Use one Node-only private-key resolver for middleware and existing server
   token clients.
4. Document endpoint/JWT environment inputs in `.env-example`.
5. Record evidence by acceptance criterion and publish the feature status in
   the project specification dashboard.

## App-Specific Inputs

- Public routes and matcher exclusions.
- `IGRP_APP_BASE_PATH` support.
- `/forbidden` and dashboard redirect paths.
- Existing internal login page query parameter compatibility.

## Security Decisions

- No route-mapping or permission bypass exists.
- Revocation cold failures remain fail closed.
- The SDK's transient permission fallback remains unchanged and documented.
- Production private-key paths are read only in Node middleware/server code.
