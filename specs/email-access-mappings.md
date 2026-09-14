# Process Studio Email Access Mappings Management

**SPEC STATUS: IMPLEMENTED**

## 1. Objective

Add an authenticated, directly addressable page at `/email-access-mappings` where authorized administrators can list, create, edit, and revoke the email-to-permission mappings used by external systems calling the Process Studio API with their own Keycloak token. The page must faithfully preserve the Process Studio-specific information hierarchy and management flow of the supplied “Consola de Acessos por Email” reference while using this application's existing shell and design-system conventions. The route must intentionally remain undiscoverable from the application's navigation and other UI surfaces.

## 2. Context

- The visual and behavioral reference is `_resources/Consola de Acessos por Email.htm`; its rendered application is embedded in `_resources/Consola de Acessos por Email_files/saved_resource.html`.
- Only the reference's **Process Studio** variant applies. The backend selector and Backend summary card are not part of this page.
- The related implementation precedent is `src/app/(igrp)/(generated)/api-keys/page.tsx` and its server-action integration in `src/app/(myapp)/functions/m2m-keys.ts`.
- The previously approved Process Management specification at `/Users/user/DATA/WORK/ZING_URGENCY/IRN/igrp-process-management-frontend/specs/email-access-mappings.md` provides behavioral precedent, adapted here for Process Studio and this repository's client and components.
- `@irn/framework-process-studio-client` version `0.0.1-beta.21` exposes the required operations through `client.emailAccessMappings`:
  - `list()`
  - `create(request)`
  - `update(id, request)`
  - `revoke(id)`
- `EmailAccessMappingDTO` contains mapping identity, email, permissions, description, notes, active and expiration state, revocation metadata, and create/update audit metadata. `EmailAccessMappingRequestDTO` provides optional email, permissions, description, notes, and expiration fields; the UI imposes the stronger create/update validation defined below.
- The existing `createServerClient()` configures the Process Studio client with the authenticated server-side token, API gateway, timeout, and gateway headers.
- The generated layout already supplies React Query context and mounts one `IGRPToaster`; the feature must use those facilities and must not mount a second toaster.
- No confirmed canonical route permission for this feature exists in the repository. The Email Access Mappings API remains the authorization authority.

## 3. Confirmed Decisions

1. The page manages Process Studio mappings only.
2. The page has no backend selector and no Backend summary card.
3. The page is available by its exact URL but must not be linked from navigation, the Process page, menus, shortcuts, or other discovery surfaces.
4. Route access relies on the API rather than a newly invented route-level permission string.
5. A list response rejected with `401` or `403` replaces the page content with `AccessDeniedPage`.
6. A create, update, or revoke response rejected with `401` or `403` keeps the current page/dialog context and displays the API error in a toast, as for other mutation errors.
7. The reference's Process Studio permission catalogue is a static set of quick-add suggestions; valid free-form permission entry remains supported.
8. Email cannot be changed after a mapping has been created.
9. Revocation is irreversible from this page. Revoked mappings remain visible for audit purposes.

## 4. Scope

### In Scope

- A client-rendered page at `/email-access-mappings` within the existing generated/authenticated application layout.
- Server-side wrappers for list, create, update, and revoke using `@irn/framework-process-studio-client`.
- Loading, populated, empty, access-denied, and non-access error states.
- Summary values for active, expiring, and revoked mappings.
- A mapping table containing state, expiration, audit information, and row actions.
- Create and edit dialogs for email, permissions, description, notes, and expiration.
- Static Process Studio permission suggestions plus validated free-form permissions.
- Irreversible revocation with explicit confirmation.
- Authoritative list refresh and success/error feedback after mutations.
- Responsive and keyboard-accessible behavior consistent with the project design system.
- Static checks and manual verification using the repository's existing tooling.

### Out of Scope

- Process Management mappings or a backend switcher.
- Any navigation, menu, Process-page link, shortcut, search registration, or other discoverability mechanism for the route.
- A dynamic permission-catalogue API or catalogue administration.
- Changes to the backend, generated client package, or shared types package.
- A new route-level permission guard without a separately confirmed canonical permission contract.
- Restoring or reactivating a revoked mapping.
- Deleting revoked mappings from history.
- Changing a mapping's email after creation.
- Search, filtering, sorting controls, pagination, or bulk actions.
- Recreating the standalone reference's global administration/session header or bespoke theme.
- Introducing a new automated test framework.

## 5. Business Rules

### Mapping state

- A mapping whose `active` value is explicitly `false` is **Revogado**.
- A non-revoked mapping whose valid `expiresAt` is at or before the current local date and time is **Expirado**.
- Every other non-revoked mapping is **Activo**.
- Revoked state takes precedence over expired state.
- An expired mapping remains editable and revocable.
- A revoked mapping remains visible but cannot be edited or revoked again.
- Missing or invalid optional date values must degrade to an unavailable/no-expiration presentation without breaking the list.

### Summary counts

- **Activos** counts mappings currently in the Active state.
- **A expirar em 30 dias** counts Active mappings whose expiration is after the current time and no later than 30 days from the current time.
- **Revogados** counts mappings whose `active` value is explicitly `false`.
- Expired mappings are excluded from all three summary values.
- The page header badge shows the total number of returned mappings, including expired and revoked mappings.

### Email

- Email is required when creating a mapping and must be syntactically valid.
- Leading and trailing whitespace is removed and the email is normalized to lowercase before creation.
- Email is displayed as read-only when editing and must remain unchanged by an update.
- Duplicate-active-email decisions remain authoritative on the backend; the backend validation message must be surfaced.

### Permissions

- At least one permission is required.
- Each permission must match `^[A-Z0-9_.]+:[a-z_]+$`, representing `MODULE:action`.
- Values beginning with `ROLE_` or `GROUP_` are rejected even if they otherwise match the pattern.
- Empty values are ignored and duplicate permissions are not added.
- The static Process Studio quick-add suggestions are:
  - `STUDIO_PROJECTS:visualizar`
  - `STUDIO_PROJECTS:criar`
  - `STUDIO_PROCESS_DEFINITIONS:visualizar`
  - `STUDIO_PROCESS_DEFINITIONS:publicar`
  - `STUDIO_PARAMETERIZATION:visualizar`
- The suggestion list is non-exhaustive. Any free-form value satisfying the validation rules is accepted by the UI.

### Optional fields and expiration

- Description and notes are optional trimmed free-text values.
- Notes are administrative context only and do not participate in access decisions.
- Expiration is optional and consists of a date selected with `IGRPDatePickerSingle` and a time entered with `IGRPInputTime`.
- A selected expiration is sent as a local date-time string without a timezone offset, matching the reference and API contract.
- The UI does not add a future-only restriction that is absent from the reference; backend validation remains authoritative.
- The edit dialog provides an explicit action to clear the complete expiration value.
- Clearing description, notes, or expiration during editing omits that optional property from the update request and is expected to clear the persisted value under the endpoint's full-replacement semantics.

### Revocation

- Revocation takes effect for the external system's next request and cannot be undone from the page.
- The mapping remains in the list with its revocation audit information.
- Restoring access requires creating a new mapping.

## 6. User and System Flows

### Load and review mappings

1. The user navigates directly to `/email-access-mappings`.
2. The page requests mappings through a server-side wrapper and displays a loading state.
3. On success, it calculates the summary values and renders the authoritative returned list.
4. An empty successful response displays the dedicated empty state.
5. A `401` or `403` list response replaces normal content with `AccessDeniedPage` and status-appropriate Portuguese guidance.
6. Any other list failure displays the best available API error in a toast and persistent in-page feedback; retry follows the application's existing React Query behavior.

### Create a mapping

1. The user selects **Novo mapeamento**.
2. A dialog opens with blank email, permissions, description, notes, and expiration fields.
3. The user adds permissions from the Studio suggestions or through free-form entry.
4. Client validation runs on submission.
5. A valid form is normalized and passed to `client.emailAccessMappings.create()` through the server wrapper.
6. On success, the dialog closes, the list is refreshed, and a success toast identifies the email.
7. On failure, including `401/403`, the dialog and entered values remain available and the API error is shown in a toast.

### Edit a mapping

1. The user selects **Editar** on a non-revoked mapping with an ID.
2. The shared form dialog opens with current values and a read-only email.
3. The user may replace the permission set and change or clear description, notes, and expiration.
4. A valid form is passed to `client.emailAccessMappings.update(id, request)` through the server wrapper.
5. On success, the dialog closes, the list is refreshed, and a success toast is shown.
6. On failure, including `401/403`, the dialog and unsaved changes remain available and the API error is shown in a toast.

### Revoke a mapping

1. The user selects **Revogar** on a non-revoked mapping with an ID.
2. A destructive confirmation identifies the email and explains the immediate and irreversible effect and retained audit record.
3. Cancel closes the confirmation without calling the API.
4. Confirm calls `client.emailAccessMappings.revoke(id)` once and prevents repeated submission while pending.
5. On success, the confirmation closes, the list is refreshed, and a success toast identifies the email.
6. On failure, including `401/403`, the confirmation remains recoverable, the visible mapping remains unchanged, and the API error is shown in a toast.

## 7. Functional Requirements

**FR-01** The application shall expose `/email-access-mappings` inside the existing authenticated generated layout without adding any UI link or navigation registration that reveals the route.

**FR-02** Browser code shall call server-side functions that obtain the configured client through `createServerClient()`; browser code shall not instantiate the API client or handle tokens directly.

**FR-03** The server-side functions shall wrap `client.emailAccessMappings.list`, `create`, `update`, and `revoke` using a discriminated success/error result consistent with the API-key feature, preserving HTTP status and the best API-provided error text.

**FR-04** Error extraction shall prefer a non-empty `details.error`, then `details.message`, then `details.detail`, then a non-empty string `details`, then the SDK error message, with a generic Portuguese retry message as the final fallback.

**FR-05** The page header shall use `PageHeader`, display **Mapeamentos de acesso por email**, explain that external systems using their own Keycloak tokens receive permissions mapped from the token email, and show the total mapping count.

**FR-06** The page shall provide a primary **Novo mapeamento** action and three summary tiles: **Activos**, **A expirar em 30 dias**, and **Revogados**. It shall not display a backend selector or Backend tile.

**FR-07** The table shall display Email, Permissões, Estado, Expira, Criado, Última alteração, and Ações columns.

**FR-08** The email cell shall show email prominently and description as secondary text. Descriptions longer than 46 characters shall initially show the first 46 characters followed by `...`, with accessible controls to expand and collapse the full value. Descriptions of 46 characters or fewer shall display without an expansion control.

**FR-09** When notes exist, the table shall show a discoverable notes indicator or tooltip without rendering the note text inline by default.

**FR-10** Permissions shall render as chips. A row shall initially show no more than three permissions; additional permissions shall be available through an accessible **Ver todos**/**Ver menos** control that reports its expanded state.

**FR-11** Status shall render as a visually distinct Active, Expired, or Revoked indicator following the state precedence rules.

**FR-12** Expiration shall use the application's Portuguese local date/time presentation or **sem expiração** when absent.

**FR-13** Creation and last-change audit cells shall show the applicable date/time and `UserCell`. Resolved `userProfile*` values take precedence; raw `createdBy`, `updatedBy`, or `revokedBy` values are fallbacks, and absent values render a neutral unavailable state.

**FR-14** A revoked row shall show revocation date/user information and visually communicate inactivity without making its content unreadable.

**FR-15** The create/edit dialog shall contain Email, Permissions, Description, Notes, and Expiration controls and shall adapt its title, guidance, submit label, initial focus, and email editability to its mode.

**FR-16** Permission entry shall support quick-add suggestions, free-form addition on Enter or comma, and removable chips. Invalid values shall show a programmatically associated error and shall not be added.

**FR-17** The expiration controls shall use `IGRPDatePickerSingle` and `IGRPInputTime`; an explicit **Limpar data** action shall clear both values.

**FR-18** Cancelling or closing Create shall reset its values and errors. Cancelling Edit shall discard unsaved form state without modifying the displayed mapping.

**FR-19** Submission and dialog dismissal paths that could duplicate or interrupt a pending mutation shall be disabled until it settles.

**FR-20** Successful mutations shall invalidate or refetch the mapping query before refreshed server data is presented as authoritative. The page shall not optimistically alter mappings or summary values.

**FR-21** A successful empty list shall show **Ainda não há mapeamentos neste backend.** and shall not be treated as an error.

**FR-22** A list-time `401/403` shall render `AccessDeniedPage`. Mutation-time `401/403` and all other mutation failures shall retain the current page/dialog and display the extracted error in a toast.

**FR-23** A non-access list failure shall produce at most one error toast per unchanged error response and retain persistent in-page error feedback.

**FR-24** The existing layout-level `IGRPToaster` shall render feature toasts; this page shall not mount an additional toaster.

**FR-25** The table shall remain usable through horizontal overflow on narrow viewports. Dialogs, validation, expansion controls, and destructive actions shall remain keyboard operable with accessible names, visible focus, and appropriate semantics.

## 8. Data and API Contracts

| UI operation | Client method | Request behavior | Success behavior |
|---|---|---|---|
| List | `client.emailAccessMappings.list()` | No body | Use returned `EmailAccessMappingDTO[]` as the authoritative list |
| Create | `client.emailAccessMappings.create(request)` | Lowercase normalized email, unique validated permissions, populated optional fields | Refresh list and report success |
| Edit | `client.emailAccessMappings.update(id, request)` | Existing ID, immutable email, complete desired permission set, populated optional fields; omit cleared optional fields | Refresh list and report success |
| Revoke | `client.emailAccessMappings.revoke(id)` | Existing ID and no body | Refresh list and report success |

The feature shall import `EmailAccessMappingDTO` and `EmailAccessMappingRequestDTO` from `@irn/framework-process-studio-types` instead of duplicating API models. All DTO fields are optional at the type level, so missing optional response data must render a fallback rather than throw or suppress the remaining list.

## 9. Edge Cases and Failure Behavior

- `active: false` plus past expiration renders as Revoked.
- Past expiration without explicit revocation renders as Expired and retains Edit/Revoke actions when an ID exists.
- A mapping without an ID remains displayable, but ID-dependent actions are disabled.
- A missing email displays a neutral unavailable value and does not break row identity or layout.
- Re-entering an existing permission does not duplicate its chip.
- Empty permission entry performs no action.
- Invalid email, missing permissions, `ROLE_`/`GROUP_` values, and malformed permission values block submission locally.
- Backend validation, conflict, duplicate-email, and authorization messages are surfaced using the defined extraction order.
- Transport and unexpected failures use the generic Portuguese fallback.
- Failed mutations do not close the form, discard entered values, or alter local authoritative data.
- Missing audit profiles fall back to raw audit identifiers; missing identifiers render a neutral unavailable state.
- Invalid date values do not crash rendering or incorrectly count a mapping as expiring.
- An empty array is an empty state, not an error.

## 10. Technical Impact

### Frontend

- Add the Next.js page under the generated route segment corresponding to `/email-access-mappings`.
- Reuse `PageHeader`, `AccessDeniedPage`, `IgrpLoading`, `UserCell`, React Query, and appropriate IGRP dialog/form/button/date/time/toast components.
- Adapt the reference's content hierarchy and flow to application-native components rather than copying its standalone shell or CSS.
- Do not modify the Process page or any global/local navigation source to expose this route.

### API integration

- Add server-side email-access-mapping functions alongside the existing function modules.
- Use `createServerClient()` and `client.emailAccessMappings` for all four operations.
- Keep token, gateway header, timeout, and session behavior centralized in the existing server-client configuration.

### Persistence

- No local persistence, schema change, migration, or optimistic source of truth is introduced.
- All persisted mapping state and audit metadata come from the Process Studio API.

## 11. Dependencies and Contract Constraints

- Clearing optional values depends on the live PUT endpoint applying full-replacement semantics when `description`, `notes`, or `expiresAt` are omitted.
- `EmailAccessMappingRequestDTO` does not permit explicit `null`. If the live API requires `null` rather than omission to clear a value, that is a backend/shared-contract mismatch outside this frontend feature and must be resolved before the clearing acceptance criterion can pass.
- The static Studio permission suggestions are frontend-owned because no dynamic catalogue is exposed by the installed client.
- A future route-level guard requires a separately confirmed canonical IRN permission/role mapping; this feature must not invent one.

## 12. Testing Expectations

- Run the repository's production build/type check and lint command for static verification; unrelated pre-existing failures must be documented separately from feature regressions.
- Manually verify with development or mocked API responses:
  - loading, populated, empty, non-access error, and list-time `401/403` states;
  - email normalization and validation;
  - permission validation, role/group rejection, quick-add values, and duplicate suppression;
  - Active/Expired/Revoked precedence and all summary calculations, including the exact 30-day boundary;
  - create success/failure and preservation of form values on failure;
  - edit initialization, immutable email, optional-field clearing, success/failure, and preservation of unsaved values;
  - revoke cancellation, single confirmed request, pending-state protection, failure behavior, and disabled revoked-row actions;
  - audit fallbacks, permission expansion, description expansion, notes discovery, and malformed optional response fields;
  - desktop and narrow viewports, light and dark themes, keyboard navigation, focus behavior, and programmatic error exposure;
  - absence of any new navigation or discovery link to `/email-access-mappings`.
- If an automated frontend test harness is introduced before implementation begins, state/counting/validation helpers and primary component flows should receive automated coverage while mocking the server-function boundary.

## 13. Acceptance Criteria

**AC-01**

- Given an authenticated user whose list request is authorized
- When the user opens `/email-access-mappings` directly
- Then the page calls `client.emailAccessMappings.list()` through the server boundary and renders inside the existing application shell.

**AC-02**

- Given any normal application navigation, menu, Process-page action, shortcut, or search/discovery surface
- When it renders
- Then it contains no new link or entry revealing `/email-access-mappings`.

**AC-03**

- Given returned active, soon-expiring, expired, and revoked mappings
- When the page renders
- Then the header badge and three summary values follow the total, state, and 30-day rules in this specification.

**AC-04**

- Given a populated mapping
- When its row renders
- Then email, description/notes affordances, permission chips, state, expiration, creation audit, last-change/revocation audit, and permitted actions are available in the specified table structure.

**AC-05**

- Given a successful empty list response
- When loading completes
- Then **Ainda não há mapeamentos neste backend.** is displayed and the response is not treated as an error.

**AC-06**

- Given a list request returning `401` or `403`
- When the result is handled
- Then mapping content is replaced by `AccessDeniedPage` with status-appropriate guidance.

**AC-07**

- Given a list request returning another API error
- When the result is handled
- Then the extracted API error appears in persistent page feedback and no more than one toast is emitted for the unchanged error response.

**AC-08**

- Given the create dialog with a mixed-case email surrounded by whitespace, at least one valid permission, and optional details
- When the user submits
- Then one create request contains the trimmed lowercase email, unique permissions, and correctly represented optional values.

**AC-09**

- Given a malformed permission, a value starting with `ROLE_` or `GROUP_`, an invalid email, or no permissions
- When the user attempts to add or submit it
- Then an actionable validation error is exposed and no mutation request is sent.

**AC-10**

- Given a Studio suggestion or valid free-form permission
- When the user adds it by selection, Enter, or comma
- Then it appears once as a removable chip.

**AC-11**

- Given a non-revoked mapping with an ID
- When the user opens Edit
- Then the form is populated, email is read-only, and permissions, description, notes, and expiration can be changed or cleared.

**AC-12**

- Given valid edited values
- When update succeeds
- Then the dialog closes, an authoritative list refresh completes, and a success toast is shown.

**AC-13**

- Given an expired but non-revoked mapping with an ID
- When its row renders
- Then its state is Expired and its Edit and Revoke actions remain enabled.

**AC-14**

- Given a non-revoked mapping with an ID
- When the user opens Revoke
- Then the confirmation identifies the email and communicates immediate effect, irreversibility, and retained audit history.

**AC-15**

- Given an open revoke confirmation
- When the user cancels
- Then no API request occurs and displayed data remains unchanged.

**AC-16**

- Given an open revoke confirmation
- When the user confirms and the API succeeds
- Then exactly one revoke request is sent, the list is refreshed, the API-returned row becomes Revoked, its actions are disabled, and a success toast identifies the email.

**AC-17**

- Given a create, update, or revoke failure, including `401/403`
- When the result is handled
- Then the current page remains rendered, the dialog/form state remains recoverable, the extracted API message is shown in a toast, and no unconfirmed local data change is presented.

**AC-18**

- Given a revoked mapping
- When the table renders
- Then the mapping remains visible, shows revocation audit information, and cannot be edited or revoked again.

**AC-19**

- Given more than three permissions in a mapping
- When its row first renders
- Then only three chips and **Ver todos** are visible; activating the control reveals all chips and changes it to **Ver menos**, which restores the collapsed state.

**AC-20**

- Given a description longer than 46 characters
- When its row first renders
- Then the 46-character preview and an accessible expansion control are shown; expanding reveals the full text and allows it to be collapsed again.
- Given notes
- When the row renders
- Then notes are available through a discoverable indicator/tooltip and are not displayed inline by default.

**AC-21**

- Given a selected expiration date and valid time
- When create or update is submitted
- Then the request contains the combined local date-time without a timezone offset.
- When **Limpar data** is activated
- Then both date and time are cleared and no expiration is sent.

**AC-22**

- Given a narrow viewport or keyboard-only interaction
- When the user reviews the table and operates dialogs
- Then all content and actions remain reachable, focus is visible and managed, controls have accessible names/states, validation is programmatically exposed, and the table can scroll horizontally.

## 14. Definition of Done

- [ ] `/email-access-mappings` is directly reachable inside the existing authenticated generated layout.
- [ ] No navigation, menu, Process-page link, shortcut, or discovery entry exposes the route.
- [ ] All four operations use `@irn/framework-process-studio-client` through `createServerClient()` and server-side wrappers.
- [ ] The page implements the Process Studio-only header, three summaries, table, create/edit dialog, revoke confirmation, and feedback states using application-native components.
- [ ] All functional requirements FR-01 through FR-25 are satisfied.
- [ ] All acceptance criteria AC-01 through AC-22 pass documented verification.
- [ ] API models come from `@irn/framework-process-studio-types`; no incompatible local contract is introduced.
- [ ] Exactly the existing layout-level `IGRPToaster` is used, with no duplicate toaster added.
- [ ] Production build/type checking and linting complete without new feature-related errors or suppressions.
- [ ] Manual verification covers every case listed in Testing Expectations, including optional-field clearing against the live PUT behavior.
- [ ] No backend, database, client package, shared types, route-permission configuration, or unrelated application behavior is changed.
- [ ] The page is verified in supported light/dark themes and desktop/narrow viewport widths.

## 15. Remaining Assumptions

- Existing project-level React Query retry defaults remain acceptable; the feature does not add custom retry or idempotency behavior.
