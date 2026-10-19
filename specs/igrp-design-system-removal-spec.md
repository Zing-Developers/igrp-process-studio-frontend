# Specification: Migrating away from the IGRP React Design System

## Status and purpose

This specification records the partial migration already performed in this repository and defines the work required to remove:

```json
"@igrp/igrp-framework-react-design-system": "0.1.0-beta.91"
```

The preferred visual replacement is:

```json
"@irn/irn-backoffice-design-system": "^1.0.0"
```

This procedure is designed to be reused in other workspaces. It must be applied from a fresh inventory in each repository because component usage, generated code, package versions, and transitive dependencies can differ.

This migration is **in progress**. The IGRP design-system dependency cannot safely be removed from this repository yet.

## Current removal blockers

At the time of this specification, the repository has:

- 86 source files importing the IGRP design system;
- 64 editable source files containing IGRP imports;
- 22 generated source files containing IGRP imports;
- 107 source files already importing the IRN backoffice design system;
- direct imports from both the IGRP package root and unsupported `dist/components/primitives/*` paths;
- a direct dependency on the IGRP design system;
- a required peer/runtime dependency from `@irn/irn-backoffice-design-system@1.10.3` to the IGRP design system.

The last point is a hard blocker. The published IRN design-system bundle currently imports IGRP components such as commands, dropdown menus, switches, inputs, scroll areas, calendar, and popover primitives. Its declaration file also imports IGRP types. Therefore, making the peer optional or deleting the application dependency would be incorrect.

The final removal requires a new self-contained release of `@irn/irn-backoffice-design-system` whose JavaScript and declaration output no longer imports `@igrp/igrp-framework-react-design-system`.

## Ownership rules

Every migrated symbol must be placed according to its responsibility:

| Responsibility | Destination |
| --- | --- |
| Reusable visual component, visual primitive, token, style utility, toast, modal, table, or form control | `@irn/irn-backoffice-design-system` |
| Framework behavior or non-visual application contract shared across IRN applications | `@irn/irn-core-framework` |
| Feature-specific composite with business behavior | The owning application feature |
| Generated component contract | Generator/template package, optionally backed by a stable IRN contract |
| Obsolete or unreachable component | Delete it |

Do not move buttons, dialogs, dropdowns, inputs, or other visual components into `irn-core-framework`. The core framework is not a substitute design system.

## Migration decision criteria

Classify every imported symbol, not only the package:

| Classification | Criteria | Action |
| --- | --- | --- |
| Unused | Import or component is unreachable, obsolete, or no longer rendered | Delete the consumer or unused import. |
| Exact IRN equivalent | Same semantics, required props, events, accessibility, styling behavior, and state model | Replace directly and validate. |
| Adaptable IRN equivalent | IRN has the capability but its API or composition differs | Refactor the consumer or add a temporary, tested adapter in the application. |
| Missing reusable UI | No IRN equivalent and the component is useful across applications | Implement and publish it in `@irn/irn-backoffice-design-system`. |
| Feature-specific UI | No IRN equivalent, but behavior is application-specific | Keep or rebuild it locally. |
| Non-visual framework contract | Type or behavior does not belong to a design system | Move it to `irn-core-framework` or another appropriate shared package. |
| Generated usage | Source is produced by an IGRP generator | Migrate the generator/template first, regenerate, and avoid manual edits. |
| Transitive runtime usage | Another installed package imports IGRP at runtime | Fix and release that upstream package before removal. |

A component name that looks similar is only a migration candidate. It is not evidence of API or behavioral compatibility.

## What was implemented in this repository

The first safe migration was intentionally limited to low-risk replacements already supported by the IRN design system.

The reference implementation is commit `cf09a2ea` (`first simple migration`). Between its parent and that commit:

- files importing the IGRP design system decreased from 95 to 86;
- files importing the IRN backoffice design system increased from 99 to 107;
- nine source files stopped importing the IGRP design system completely;
- other mixed-import files moved individual safe symbols while keeping unsupported IGRP symbols.

### Completed: class-name utility

Editable consumers of IGRP's `cn` utility were changed to the IRN public export:

```ts
// Before
import { cn, IGRPFormHandle } from '@igrp/igrp-framework-react-design-system';

// After
import { IGRPFormHandle } from '@igrp/igrp-framework-react-design-system';
import { cn } from '@irn/irn-backoffice-design-system';
```

This was applied only where `cn` could be separated from other legacy symbols. Mixed imports remain mixed until every symbol has a valid destination.

### Completed: loading spinner

Low-complexity loading states were migrated from `IGRPLoadingSpinner` to `IRNSpinner`:

```tsx
// Before
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system';

return <IGRPLoadingSpinner />;
```

```tsx
// After
import { IRNSpinner } from '@irn/irn-backoffice-design-system';

return <IRNSpinner size="lg" />;
```

The surrounding layout was reviewed as part of the replacement. For example, session screens stopped compensating for the old spinner's dimensions with a negative top margin:

```tsx
<div className="flex flex-col items-center justify-center">
  <IRNSpinner size="lg" />
  <p className="mt-3 font-medium text-slate-600">Checking session...</p>
</div>
```

This proves that a component replacement can require local layout changes even when its purpose is identical.

### Completed: toast API

The hook-based IGRP toast API was migrated to the IRN design system's public toast service:

```tsx
// Before
const { igrpToast } = useIGRPToast();

igrpToast({
  title: 'Erro ao qualificar em lote',
  description: message,
  type: 'error',
});
```

```tsx
// After
import { toast } from '@irn/irn-backoffice-design-system';

toast.error({
  title: 'Erro ao qualificar em lote',
  description: message,
});
```

Success notifications use the corresponding method:

```ts
toast.success({
  title: 'Migração aprovada',
  description: 'Os dados ficam disponíveis.',
});
```

Unused `useIGRPToast` instances were deleted rather than replaced.

The application already renders `IRNToastContainer` in its layout. Other workspaces must confirm that the IRN container is mounted exactly once before migrating toast calls.

### Completed: framework-owned theme metadata

`IGRP_META_THEME_COLORS` did not belong in an application dependency on the legacy visual package. The required values were moved behind the IRN core-framework contract:

```ts
// libs/irn-core-framework/constants.ts
export const IRN_META_THEME_COLORS = {
  dark: '#ffffff',
  light: '#09090b',
} as const;
```

```ts
// Application usage
import {
  IRN_META_THEME_COLORS,
  IRNRootLayout,
} from '@irn/irn-core-framework';

export const viewport = {
  themeColor: IRN_META_THEME_COLORS.light,
};
```

This was placed in `irn-core-framework` because it configures the application shell, not because visual components should move into that package.

### Current prerequisite: IRN styles and content discovery

This foundation already existed and was retained during the safe batch. The application consumes the public IRN stylesheet and includes the package build output in Tailwind content discovery:

```css
@source "../../node_modules/@irn/irn-backoffice-design-system/dist/styles.css";
@source "../../node_modules/@irn/irn-backoffice-design-system/dist/index.mjs";
@import '@irn/irn-backoffice-design-system/styles';
```

Each workspace must adapt paths to its stylesheet location and build system. Missing content discovery can make migrated components render without the expected generated utility classes.

## What remains to be migrated

### Editable application code

The 64 editable files still use one or more of these categories:

- IGRP composites such as `IGRPButton`, `IGRPBadge`, `IGRPAlert`, `IGRPSwitch`, `IGRPTabs`, dropdown menus, command components, and modal/dialog components;
- `IGRPFormHandle`, a non-visual form contract;
- icon and calendar helpers;
- skeleton and loading components;
- deep-imported primitives for button, dialog, input, label, switch, popover, select, dropdown menu, card, calendar, avatar, chart, and skeleton.

Deep imports are especially important:

```ts
import { Button } from '@igrp/igrp-framework-react-design-system/dist/components/primitives/button';
```

They couple the application to unpublished internal file structure. The target state must use a public IRN export:

```ts
import { IRNButton } from '@irn/irn-backoffice-design-system';
```

If the required primitive is not publicly exported by IRN, add a supported public component to the IRN design system or refactor to a higher-level IRN component. Do not reproduce the same `dist/*` coupling with the new package.

### Generated code

Twenty-two generated files still import the IGRP design system. Common generated dependencies include:

- `IGRPFormHandle`;
- `IGRPTabs` and `IGRPTabItem`;
- `useIGRPToast`;
- `useIGRPMenuNavigation`;
- `cn`;
- generated loading/toast components.

Do not manually migrate `src/app/(igrp)/(generated)`. Change the generator templates or generated-code compatibility layer, publish/version that change, and regenerate. A manual edit would be overwritten and would not solve the same problem in other workspaces.

### IRN design-system internals

`@irn/irn-backoffice-design-system@1.10.3` is not yet independent. Its built JavaScript imports IGRP command, dropdown, checkbox, separator, input, scroll-area, icon, switch, collapsible, calendar, and popover implementations. Its declarations refer to IGRP types including `IGRPSwitch` and `DateRange`.

The IRN design-system repository must:

1. inventory all IGRP imports in source and compiled output;
2. replace internal imports with IRN-owned primitives or direct maintained foundations;
3. expose only stable IRN public APIs;
4. remove IGRP types from exported declarations;
5. remove the IGRP peer and development dependency when no longer required;
6. test all affected IRN components in isolation and Storybook;
7. publish a self-contained version;
8. verify its packed artifact, not only its source tree.

Artifact verification example:

```sh
pnpm pack

# Extract the package into a temporary directory, then inspect it.
rg -n '@igrp/igrp-framework-react-design-system|IGRP' package/dist package/package.json
```

The expected package-level result is no runtime import, no declaration import, and no required peer dependency on IGRP. Text in documentation or migration notes must be assessed separately.

## Candidate mapping for future work

The following table is a routing guide, not permission for a blind rename:

| Current IGRP usage | Candidate destination | Required review |
| --- | --- | --- |
| `IGRPLoadingSpinner` | `IRNSpinner` or `IRNLoading` | Size, centering, accessible label, surrounding spacing. |
| `useIGRPToast` | IRN `toast` plus `IRNToastContainer` | Method mapping, container placement, duration, actions, error/success semantics. |
| `cn` | IRN `cn` | Class precedence and Tailwind merge behavior. |
| `IGRPButton` or primitive `Button` | `IRNButton` | Variants, sizes, icon-only behavior, loading, links, `asChild`, disabled state. |
| `IGRPBadge` | `IRNBadge` | Variant/color mapping and status semantics. |
| `IGRPSwitch` or primitive `Switch` | `IRNSwitch` or `IRNLabeledSwitch` | Controlled value, event signature, label association, disabled state. |
| `IGRPAlert` | `IRNAlert` | Severity mapping, icon, dismiss behavior, accessibility role. |
| `IGRPTabs` | `IRNTabs`, `IRNTabsList`, `IRNTab`, `IRNTabContent` | Convert item-array API to composition, controlled tab state, icons, badges, content lifecycle. |
| IGRP dialog primitives | `IRNModal`, `IRNConfirmModal`, or a new public IRN dialog primitive | Controlled open/close behavior, portal, focus trap, escape handling, footer composition. |
| IGRP dropdown/popover primitives | `IRNPopoverMenu`, a suitable higher-level component, or new public IRN primitives | Keyboard navigation, portal positioning, submenu and checkbox items. |
| IGRP select/command primitives | `IRNSelect`, `IRNSelectInputSearch`, `IRNMultiSelect*`, or new IRN component | Search, async loading, single/multiple selection, value types, clear behavior. |
| IGRP calendar | `IRNDatePicker`, `IRNDateRangePicker`, or new public IRN calendar | Date versus range model, locale, timezone, disabled dates. |
| IGRP card primitives | IRN semantic card component or feature-local markup | Header/body structure, spacing, border, interactive behavior. |
| IGRP chart primitives | `IRNChart` or a new IRN chart API | Recharts configuration, tooltips, legends, responsiveness, accessibility. |
| `IGRPIcon` | `lucide-react` or an IRN-owned icon abstraction | Dynamic icon names, tree-shaking, fallback behavior. |
| `IGRPFormHandle` | IRN-neutral generator/form contract outside the visual layer | Method shape, generated code compatibility, ref typing. |
| `IGRPSkeletonPrimitive` | New/existing public IRN skeleton or application-local skeleton | Dimensions, animation, theme colors, prop forwarding. |

If several workspaces need a missing component, implement it once in `@irn/irn-backoffice-design-system`; do not create divergent copies in every application.

## Examples of migrations that require adaptation

### Button migration

A simple button may be migrated directly after checking variants:

```tsx
// Before
<Button size="icon" onClick={onOpen} aria-label="Abrir">
  <Settings />
</Button>
```

```tsx
// Candidate after
<IRNButton
  size="sm"
  className="h-9 w-9 p-0"
  onClick={onOpen}
  aria-label="Abrir"
>
  <Settings />
</IRNButton>
```

Do not perform a global symbol replacement until uses of `asChild`, link rendering, custom variants, loading behavior, and ref forwarding have been compared.

### Tabs migration

IGRP tabs commonly use an item-array API:

```tsx
<IGRPTabs
  variant="underline"
  items={[
    {
      value: 'request',
      label: 'Dados do Pedido',
      icon: 'FolderOpen',
      content: <PedidoBody pedido={pedido} />,
    },
  ]}
/>
```

The IRN API is compositional and requires an explicit conversion:

```tsx
<IRNTabs defaultValue="request">
  <IRNTabsList>
    <IRNTab id="request">Dados do Pedido</IRNTab>
  </IRNTabsList>
  <IRNTabContent id="request">
    <PedidoBody pedido={pedido} />
  </IRNTabContent>
</IRNTabs>
```

Verify the exact installed IRN API before copying this example. Preserve selected-state control, icon placement, lazy rendering, disabled tabs, URL state, and content classes.

### Dialog migration

IGRP primitive dialogs use compound components:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogTitle>Atribuição de pedido</DialogTitle>
    {children}
    <DialogFooter>{actions}</DialogFooter>
  </DialogContent>
</Dialog>
```

`IRNModal` uses a higher-level prop contract, so the migration is a refactor:

```tsx
<IRNModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Atribuição de pedido"
  footer={actions}
>
  {children}
</IRNModal>
```

Test focus restoration, close-on-escape, overlay behavior, scroll locking, portal mounting, and the consumer's `onOpenChange(false)` side effects.

## Reusable workspace procedure

### Phase 1: establish a baseline

Record existing results before migration:

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Also capture representative screenshots or visual tests for frequently used components. Design-system migration is not validated by compilation alone.

### Phase 2: inventory source and dependency usage

```sh
rg -l '@igrp/igrp-framework-react-design-system' src libs | sort

rg -n '@igrp/igrp-framework-react-design-system' \
  package.json pnpm-lock.yaml src libs test tests scripts \
  tsconfig.json next.config.*

pnpm why @igrp/igrp-framework-react-design-system
```

Separate:

- editable from generated files;
- package-root from deep imports;
- runtime values from type-only imports;
- rendered from dead components;
- direct from transitive or peer dependency paths.

Create a symbol inventory with these columns:

| Legacy symbol/import path | Files | Editable/generated | Candidate target | Compatibility gaps | Owner | Status |
| --- | ---: | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

### Phase 3: verify the replacement package

Inspect the exact installed IRN version:

```sh
pnpm list @irn/irn-backoffice-design-system --depth 0
pnpm why @irn/irn-backoffice-design-system
rg -n '@igrp/igrp-framework-react-design-system' \
  node_modules/@irn/irn-backoffice-design-system/dist \
  node_modules/@irn/irn-backoffice-design-system/package.json
```

Do not assume the latest source repository matches the package installed by the application.

### Phase 4: migrate safe equivalents in small batches

Recommended first batches are utilities, simple loading states, unused imports, and straightforward notification calls. For every batch:

1. migrate one component family;
2. remove only the legacy names replaced in that batch;
3. type-check and lint changed files;
4. run relevant tests;
5. inspect light and dark themes;
6. test keyboard and screen-reader behavior where interactive;
7. compare responsive layouts;
8. commit the batch independently.

Avoid repository-wide search-and-replace for component names.

### Phase 5: implement missing shared components upstream

When an IRN capability is missing:

1. collect requirements from all consuming workspaces;
2. design an IRN-owned API without exposing IGRP types;
3. implement it in `@irn/irn-backoffice-design-system`;
4. add unit, interaction, accessibility, and visual tests;
5. document it in Storybook and package documentation;
6. export it from the public package entry point;
7. publish a version;
8. update applications to that version;
9. remove temporary local adapters.

Do not copy compiled IGRP source into applications. If implementation reuse is legally and technically appropriate, it must be reviewed and owned in the IRN design-system repository.

### Phase 6: migrate generator output

Update generator templates so new code uses IRN APIs. Provide a migration path for already generated projects, then regenerate a representative project and verify the diff. Generated-code acceptance includes:

- no new IGRP imports;
- stable regenerated output;
- preserved form handle and step contracts;
- working toast, navigation, tabs, and loading behavior;
- successful production build.

### Phase 7: publish a self-contained IRN design system

The new IRN release is acceptable only when its packed artifact:

- has no IGRP JavaScript imports;
- has no IGRP declaration imports;
- has no required IGRP peer dependency;
- does not expose IGRP-named public types;
- passes its unit, interaction, accessibility, visual, type, and build checks.

Update related IRN packages, including `@irn/irn-backoffice-integration`, so their lockfile graph resolves the self-contained IRN version.

### Phase 8: remove the legacy dependency

Only after application, generated, and transitive usage reaches zero:

```sh
pnpm remove @igrp/igrp-framework-react-design-system
```

Reinstall and inspect the graph:

```sh
pnpm install
pnpm why @igrp/igrp-framework-react-design-system
rg -n '@igrp/igrp-framework-react-design-system' \
  package.json pnpm-lock.yaml src libs
```

Do not use `peerDependenciesMeta.optional` to hide the current dependency: the installed IRN design system genuinely imports IGRP at runtime.

## Validation matrix

Each migrated component family requires checks appropriate to its behavior:

| Family | Minimum checks |
| --- | --- |
| Utility (`cn`) | Conditional classes and conflicting Tailwind classes resolve correctly. |
| Spinner/loading | Size, centering, surrounding spacing, loading text, light/dark theme. |
| Toast | Container mounted once, severity, title/description, action, duration, stacking. |
| Button | Variants, sizes, loading, disabled, icon-only label, keyboard activation, links. |
| Modal/dialog | Controlled state, focus trap/return, escape, overlay, portal, scroll lock. |
| Dropdown/popover | Keyboard navigation, outside click, positioning, portal, submenu, checkbox state. |
| Select/multi-select | Value type, clear, async loading, search, empty state, multiple selection. |
| Tabs | Controlled/default value, keyboard navigation, disabled tabs, content lifecycle, URL state. |
| Date controls | Locale, timezone, min/max dates, disabled dates, range boundaries. |
| Table/chart | Responsive behavior, sorting/selection, tooltip/legend, empty state, accessibility. |
| Generated flows | Regeneration stability plus end-to-end process execution. |

Repository-wide final checks:

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Run the scripts that exist in the target workspace and record pre-existing failures separately.

## Final acceptance criteria

Removal is complete only when all of the following are true:

- `package.json` has no direct IGRP design-system dependency;
- editable source has no IGRP design-system import;
- generated source has no IGRP design-system import after regeneration;
- no application imports another design system through a `dist/*` path;
- the installed IRN design-system JavaScript and declarations contain no IGRP imports;
- `pnpm why @igrp/igrp-framework-react-design-system` reports no active dependency path;
- the lockfile has no resolved IGRP design-system package snapshot;
- all required visual components use public IRN exports or intentionally local feature components;
- non-visual contracts are owned outside the visual design system;
- type checking, tests, and production build pass;
- accessibility and visual regression checks pass for affected component families;
- critical user flows are smoke-tested in light/dark themes and supported viewport sizes.

A package name may remain in historical documentation without being installed. Conversely, a clean application search is insufficient if a dependency's compiled bundle still imports IGRP.

## Cross-workspace tracking template

Copy this section into each migration ticket or pull request:

| Metric | Baseline | Current | Target |
| --- | ---: | ---: | ---: |
| Editable files importing IGRP DS |  |  | 0 |
| Generated files importing IGRP DS |  |  | 0 |
| IGRP root import statements |  |  | 0 |
| IGRP deep import statements |  |  | 0 |
| IRN package runtime IGRP imports |  |  | 0 |
| Active dependency paths from `pnpm why` |  |  | 0 |

For each batch, record:

- legacy symbols migrated;
- target IRN symbols or components added upstream;
- API differences and adaptations;
- files intentionally left unchanged;
- generated-template changes;
- package versions used;
- validation commands and results;
- screenshots or visual-regression references;
- remaining blockers and their owning repository.

## Review guidance

Reject a migration that:

- removes the dependency while compiled IRN output still imports it;
- replaces names without comparing APIs and behavior;
- edits generated sources without fixing the generator;
- moves visual primitives into `irn-core-framework`;
- changes from IGRP deep imports to IRN deep imports;
- duplicates reusable missing components in several applications;
- suppresses the IGRP peer even though it is used at runtime;
- considers TypeScript success sufficient without interaction, accessibility, and visual validation.

The target architecture is a self-contained IRN backoffice design system with stable public exports, an IRN core framework containing only framework responsibilities, generators that emit IRN contracts, and applications with no direct or transitive dependency on the IGRP design system.
