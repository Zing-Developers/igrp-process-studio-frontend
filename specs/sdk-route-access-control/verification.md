# SDK Route Access Control Verification

Status: BLOCKED — production-build verification requires a compatible Node runtime

| Acceptance criterion | Status | Evidence |
| --- | --- | --- |
| AC-01 | PASS | `src/middleware.ts` unconditionally creates and invokes the SDK middleware. |
| AC-02 | PASS | Revocation, route-mapping, and user-permission endpoints have local and Kubernetes URL configuration. |
| AC-03 | PASS | Public routes, base-path normalization, root handling, and the matcher are implemented. |
| AC-04 | PASS | The login page accepts both the legacy `callbackUrl` and SDK `returnUrl`. |
| AC-05 | PASS | Route mappings and per-session permission checks are configured with `denyByDefault: true`; no app-level bypass exists. |
| AC-06 | PASS | Focused resolver assertions verified direct PEM precedence, `Authentication__JwtPrivateKey` file loading, newline normalization, and SDK-key hydration. |
| AC-07 | PASS | Node middleware runtime, redacted opt-in debug logging, and the intended matcher are present. |
| AC-08 | BLOCKED | Type check, targeted lint, focused assertions, and static bypass checks pass. `next build` cannot run on local Node 18.10.0; the project declares Node 22 and Next requires at least Node 18.18. |
| AC-09 | PASS | `StableIRNHeader` stores the initial `handlers` in `useRef`; `Header` renders that wrapper instead of `IRNHeader` directly. TypeScript, ESLint, and Prettier checks pass. |

## Checks and Evidence

- PASS: `./node_modules/.bin/tsc --noEmit --tsBuildInfoFile /tmp/igrp-process-studio-tsconfig.tsbuildinfo`
- PASS: targeted ESLint over the middleware, resolver, login page, and server token handler
- PASS: compiled resolver assertions for direct-PEM and path-based key sources
- PASS: static assertions for mandatory SDK configuration, login return URL support, and absence of `IRN_BYPASS_ROUTE_MAPPINGS`
- PASS: header loop safeguard: focused TypeScript, ESLint, and Prettier checks confirm the stable `useRef` wrapper is used
- BLOCKED: `./node_modules/.bin/next build` — local Node is 18.10.0, below both the project's declared Node 22 and Next's minimum supported runtime
- NOT VERIFIED: controlled end-to-end scenarios for the authorization service responses; no project harness or running authorization service was available in this workspace

## Convergence

The implementation, specification, plan, and task list agree. The header Server Action re-render loop is fixed without changing middleware authorization. Remaining work is environmental verification: run the production build under the declared Node 22 runtime, then execute the controlled route-mapping scenarios against the deployed authorization services.
