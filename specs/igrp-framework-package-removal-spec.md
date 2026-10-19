# Specification: Removing the legacy IGRP framework packages

## Status and purpose

This specification records both the plan and the implementation used in this repository to remove these direct dependencies:

```json
{
  "@igrp/framework-next": "0.1.0-beta.91",
  "@igrp/framework-next-auth": "0.1.0-beta.91",
  "@igrp/framework-next-types": "0.1.0-beta.91",
  "@igrp/framework-next-ui": "0.1.0-beta.91"
}
```

It is also a repeatable procedure for other projects. The objective is not merely to delete dependency declarations. A migration is complete only when every required runtime behavior and public type has either been removed as unused or placed behind the local `@irn/irn-core-framework` contract.

<!-- This document does not cover the separate migration from `@igrp/igrp-framework-react-design-system` to `@irn/irn-backoffice-design-system`. -->

## Core rules

Use these decisions consistently:

| Observed usage | Decision |
| --- | --- |
| No source import, runtime use, configuration use, or required peer use | Remove the dependency. |
| References occur only in comments, dead code, mocks, obsolete configuration, or unreachable components | Delete those consumers, then remove the dependency. |
| Low usage is only a thin abstraction over an existing library | Add one domain-named wrapper to `irn-core-framework`; application code must use the wrapper. |
| Low usage provides required framework behavior | Reimplement the minimum behavior in `irn-core-framework` and verify behavioral parity. |
| Usage is broad, complex, or belongs to a different domain such as a design system | Keep it temporarily or migrate it to the appropriate package; do not turn the core framework into a miscellaneous component library. |
| The package appears only as a transitive or peer dependency | Inspect the consuming package's published JavaScript and declarations. Remove or override the peer only when it is demonstrably stale or optional. |

Import count alone is not sufficient. One root layout import can be critical, while many imports inside unused mock files can be safely deleted.

## What was measured in this repository

The initial source and dependency audit produced this result:

| Package | Finding at audit time | Classification | Implemented action |
| --- | --- | --- | --- |
| `@igrp/framework-next-ui` | No active import; only a commented CSS reference | None | Removed the package and obsolete reference. |
| `@igrp/framework-next-auth` | Three direct consumer areas: an unused server action plus live client session/logout behavior | Low, partly dead and partly required | Deleted the unused action. Re-exposed the required auth operations through `irn-core-framework`. |
| `@igrp/framework-next-types` | Approximately 13 files, concentrated in mock data, obsolete components, an unused hook, and legacy configuration types | Low effective runtime use | Deleted obsolete consumers and moved the required session declarations to `irn-core-framework`. |
| `@igrp/framework-next` | Four imported APIs: identity-style config builder, root layout, access-client setter, and access-client getter | Low, with one critical runtime responsibility | Deleted dead access/config consumers and replaced the required root layout with `IRNRootLayout`. |

Representative dead code removed included legacy application/menu/user mocks, an unused user hook, unused authentication action, legacy template configuration, and deprecated header components. The obsolete `@igrp/template-config` TypeScript alias was also removed.

Generated application code under `src/app/(igrp)/(generated)` was deliberately not edited. Generated sources should be migrated through their generator or a stable compatibility boundary, not by hand.

## Planned result versus implemented result

| Plan | Implementation in this repository |
| --- | --- |
| Remove packages with no real use | Removed all four direct dependency declarations and their unused consumers. |
| Consolidate low-use framework behavior | Created `libs/irn-core-framework`. |
| Prevent direct NextAuth use throughout editable application code | Non-generated application consumers import domain wrappers from `@irn/irn-core-framework/client` or a specific server entry point. NextAuth imports are isolated inside the framework implementation; existing generated sources remain a documented exception until their generator is migrated. |
| Preserve root layout behavior | Added `IRNRootLayout`, shared configuration types, provider composition, theme metadata, session provider, and auth redirect handling. |
| Centralize shared authentication types | Moved the NextAuth module augmentation into `libs/irn-core-framework/auth.d.ts`. |
| Keep middleware compatible with the Edge runtime | Split Node authentication and Edge token access into separate entry points. |
| Remove a stale transitive peer resolution | Marked the design system's unused framework-types peer as optional using a targeted pnpm package extension. |
| Validate the migrated application | Type checking and production build passed; changed files passed targeted lint checks. |

## Target architecture

The local package is shaped like a future external package:

```text
libs/irn-core-framework/
├── package.json
├── index.ts
├── client.ts
├── auth.d.ts
├── constants.ts
├── types.ts
├── components/
│   └── irn-providers.tsx
├── layouts/
│   └── irn-root-layout.tsx
└── server/
    ├── auth.ts
    ├── keycloak.ts
    └── token.ts
```

Its public entry points have distinct runtime responsibilities:

```text
@irn/irn-core-framework                 layouts, constants, public types
@irn/irn-core-framework/client          browser session and sign-in/sign-out APIs
@irn/irn-core-framework/server/auth     Node.js NextAuth handler/session APIs
@irn/irn-core-framework/server/keycloak Node.js provider creation
@irn/irn-core-framework/server/token    Edge-compatible token access
```

The application maps those package-style imports to the local implementation:

```json
{
  "compilerOptions": {
    "paths": {
      "@irn/irn-core-framework": ["./libs/irn-core-framework/index.ts"],
      "@irn/irn-core-framework/*": ["./libs/irn-core-framework/*"]
    }
  }
}
```

The local package declares the underlying libraries as peers so that it can later be extracted without changing its consumer-facing API:

```json
{
  "name": "@irn/irn-core-framework",
  "version": "0.1.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    ".": "./index.ts",
    "./client": "./client.ts",
    "./server/auth": "./server/auth.ts",
    "./server/keycloak": "./server/keycloak.ts",
    "./server/token": "./server/token.ts"
  },
  "peerDependencies": {
    "next": "^15.5.0",
    "next-auth": "^4.24.0",
    "next-themes": "^0.4.6",
    "react": "^19.1.0"
  }
}
```

Versions must be adapted to each consuming repository.

## Migration examples

### 1. A package with no usage

First prove that there are no live imports or configuration references:

```sh
rg -n '@igrp/framework-next-ui' src libs package.json tsconfig.json next.config.*
pnpm why @igrp/framework-next-ui
```

Comments, documentation, and lockfile text should be reviewed, but they are not runtime usage. If no consumer exists, remove the package:

```sh
pnpm remove @igrp/framework-next-ui
```

Then repeat the searches and run the validation suite.

### 2. Client authentication: preserve behavior behind the IRN API

Legacy application code must not be changed to import `next-auth` directly:

```ts
// Before
import { getSession, signOut } from '@igrp/framework-next-auth/client';
```

Instead, application code consumes the stable IRN contract:

```ts
// After: application code
import { getIRNSession, signOutIRN } from '@irn/irn-core-framework/client';

const session = await getIRNSession();

if (!session) {
  await signOutIRN({ redirect: true });
}
```

Only the local framework knows about the underlying implementation:

```ts
// libs/irn-core-framework/client.ts
'use client';

import {
  getSession,
  signIn,
  signOut,
  useSession,
  type SignInOptions,
  type SignOutParams,
} from 'next-auth/react';

export const getIRNSession = getSession;
export const signInIRN = (provider?: string, options?: SignInOptions) =>
  signIn(provider, options);
export const signOutIRN = <Redirect extends boolean = true>(
  options?: SignOutParams<Redirect>,
) => signOut<Redirect>(options);
export const useIRNSession = useSession;
```

This is intentional encapsulation: direct `next-auth` imports are allowed inside `irn-core-framework`, but not repeated across application features.

### 3. Root layout: replace critical low usage

The old root layout import was low-frequency but critical, so deleting it without a replacement was not valid.

```tsx
// Before
import { IGRPRootLayout } from '@igrp/framework-next';

return <IGRPRootLayout config={config}>{children}</IGRPRootLayout>;
```

The application now depends on the IRN abstraction:

```tsx
// After
import { IRNRootLayout } from '@irn/irn-core-framework';

return (
  <IRNRootLayout
    config={{
      session,
      activeThemeValue,
      isScaled,
      font: fontVariables,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    }}
  >
    {children}
  </IRNRootLayout>
);
```

The replacement must preserve the required HTML shell, body classes, theme provider, session provider, base path handling, and authentication redirect behavior. Copy only behavior the application needs; do not copy the entire legacy framework.

### 4. Server authentication

Route handlers use the Node-only server entry point:

```ts
import { createIRNAuthHandler } from '@irn/irn-core-framework/server/auth';
import { authOptions } from '@/lib/auth-options';

const handler = createIRNAuthHandler(authOptions);

export { handler as GET, handler as POST };
```

The implementation remains centralized:

```ts
import NextAuth, { getServerSession, type AuthOptions } from 'next-auth';

export type IRNAuthOptions = AuthOptions;
export const createIRNAuthHandler = (options: IRNAuthOptions) => NextAuth(options);
export const getIRNServerSession = (options: IRNAuthOptions) =>
  getServerSession(options);
```

### 5. Middleware and Edge-runtime safety

Do not export all server functions from one barrel. During this migration, a combined server entry point caused the middleware bundle to pull in Node-only NextAuth code and fail with `Dynamic Code Evaluation not allowed in Edge Runtime`.

Middleware must import only the Edge-compatible token entry point:

```ts
import { getIRNToken } from '@irn/irn-core-framework/server/token';

const token = await getIRNToken({
  req,
  secret: process.env.NEXTAUTH_SECRET,
});
```

Its implementation imports only `next-auth/jwt`:

```ts
import { getToken, type GetTokenParams, type JWT } from 'next-auth/jwt';

export type IRNJWT = JWT;
export type IRNGetTokenOptions = GetTokenParams<false>;
export const getIRNToken = (options: IRNGetTokenOptions) =>
  getToken<false>(options);
```

Never make `server/token.ts` re-export or import `server/auth.ts` or `server/keycloak.ts`.

### 6. Shared types

Types that define IRN's public contract belong in `irn-core-framework`:

```ts
export type IRNRootLayoutConfig = {
  session: IRNSessionInput;
  activeThemeValue?: string;
  isScaled?: boolean;
  font?: string;
  basePath?: string;
};
```

Module augmentation associated with authentication is centralized in `libs/irn-core-framework/auth.d.ts`. Do not duplicate the same session augmentation in multiple application folders.

## Repeatable removal procedure

### Step 1: establish a baseline

Before editing, record whether the project already passes type checking, linting, tests, and production build. Existing failures must not be confused with migration regressions.

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Use only scripts that exist in the target repository.

### Step 2: inventory every kind of dependency

Search package manifests, source, configuration, scripts, styles, declarations, and tests:

```sh
rg -n '@igrp/framework-next(-auth|-types|-ui)?' \
  package.json pnpm-lock.yaml src libs test tests scripts \
  tsconfig.json next.config.*

pnpm why @igrp/framework-next
pnpm why @igrp/framework-next-auth
pnpm why @igrp/framework-next-types
pnpm why @igrp/framework-next-ui
```

For each match, record:

- importing file and imported symbol;
- whether the file is reachable from a route, layout, provider, middleware, test, or build configuration;
- client, Node.js server, or Edge runtime;
- whether the behavior is business-critical;
- whether the import is type-only or runtime code;
- whether a maintained IRN package already owns that responsibility;
- whether the package is direct, transitive, or peer-only.

### Step 3: classify the consumer, not only the package

A package can have mixed usage. Classify each consumer as one of:

1. live and required;
2. live but replaceable with an existing IRN API;
3. dead or obsolete;
4. generated and requiring generator-level treatment;
5. peer/transitive metadata only.

Delete category 3. Wrap or reimplement the minimum needed for categories 1 and 2. Do not hand-edit category 4. Investigate category 5 before changing dependency metadata.

### Step 4: create the compatibility boundary

Add only reusable framework responsibilities to `libs/irn-core-framework`, such as:

- authentication/session wrappers;
- root application layout and provider composition;
- common framework types and declarations;
- runtime-specific server helpers;
- framework constants.

Do not add feature components, project-specific screens, mock data, or general design-system components.

### Step 5: migrate callers

Replace legacy imports with the correct package-shaped entry point. Search again after each group of changes:

```sh
rg -n '@igrp/framework-next|@igrp/framework-next-auth|@igrp/framework-next-types|@igrp/framework-next-ui' src libs
```

The expected result is zero live source imports.

### Step 6: remove dependencies and refresh the lockfile

After callers have been migrated or deleted:

```sh
pnpm remove \
  @igrp/framework-next \
  @igrp/framework-next-auth \
  @igrp/framework-next-types \
  @igrp/framework-next-ui
```

Review both `package.json` and `pnpm-lock.yaml`. A package name can remain as peer metadata without being installed. The acceptance test is no direct declaration, no resolved package snapshot, and no active dependency path reported by `pnpm why`.

## Handling stale peer dependencies safely

In this repository, `@irn/irn-backoffice-design-system` declared `@igrp/framework-next-types` as a peer even though inspection of its published JavaScript and TypeScript declarations found no use requiring that package. The peer was therefore made optional with the narrowest possible override:

```json
{
  "pnpm": {
    "packageExtensions": {
      "@irn/irn-backoffice-design-system@*": {
        "peerDependenciesMeta": {
          "@igrp/framework-next-types": {
            "optional": true
          }
        }
      }
    }
  }
}
```

Do not copy this override automatically. Before using it in another repository:

1. identify the package declaring the peer with `pnpm why` and the lockfile;
2. inspect that package's published JavaScript, declaration files, and package exports;
3. confirm no runtime or compile-time symbol requires the peer;
4. add a package-and-version-scoped override;
5. reinstall and run type checking and production build;
6. remove the override when the upstream package corrects its peer metadata.

If the published package really imports the legacy peer, it must be upgraded, fixed upstream, patched, or kept. Marking a required peer optional is not a valid migration.

## Validation and acceptance criteria

Run all applicable checks after removal:

```sh
rg -n '@igrp/framework-next|@igrp/framework-next-auth|@igrp/framework-next-types|@igrp/framework-next-ui' \
  src libs package.json tsconfig.json

pnpm why @igrp/framework-next
pnpm why @igrp/framework-next-auth
pnpm why @igrp/framework-next-types
pnpm why @igrp/framework-next-ui

pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

The migration is accepted when:

- none of the four packages is a direct dependency;
- there are no live application imports from them;
- required behavior is accessed through `@irn/irn-core-framework`;
- non-generated application features do not import NextAuth directly; any generated-code exception is documented and handled at generator level;
- middleware imports only the Edge-compatible token entry point;
- dead framework-dependent code and obsolete aliases are removed;
- no generated file was manually changed;
- the lockfile has no active resolution of an unwanted package;
- type checking passes;
- targeted lint checks for changed files pass;
- the production build passes;
- authentication login, logout, session refresh, protected routes, theming, and base-path behavior are smoke-tested where applicable.

For this repository, `pnpm exec tsc --noEmit` and the production build passed after the final runtime split. Targeted linting of changed files passed; unrelated pre-existing full-lint findings were kept separate from the migration assessment.

## Per-project migration record template

Copy this table into the pull request or migration ticket for each repository:

| Package | Direct imports | Transitive/peer paths | Live symbols | Runtime | Decision | Replacement or deletion evidence |
| --- | ---: | --- | --- | --- | --- | --- |
| `@igrp/framework-next` |  |  |  |  |  |  |
| `@igrp/framework-next-auth` |  |  |  |  |  |  |
| `@igrp/framework-next-types` |  |  |  |  |  |  |
| `@igrp/framework-next-ui` |  |  |  |  |  |  |

Also record:

- baseline check results;
- files deleted as obsolete;
- APIs added to `irn-core-framework`;
- runtime entry points used by each caller;
- peer overrides and the evidence supporting them;
- final type, lint, test, build, and smoke-test results;
- any generated code intentionally left unchanged.

## Review guidance

Reviewers should reject a migration that only deletes the four lines from `package.json`, replaces legacy imports with repeated direct third-party imports, mixes Edge and Node authentication code in one import graph, suppresses a peer dependency without inspecting its consumer, or moves unrelated UI components into `irn-core-framework`.

The reusable outcome is a small IRN-owned contract. Applications depend on that contract, and the underlying authentication, theme, or framework implementation can then change without another repository-wide rewrite.
