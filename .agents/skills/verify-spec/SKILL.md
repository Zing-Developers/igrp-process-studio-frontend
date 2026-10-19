---
name: verify-spec
description: >
  Turns complex feature requests, refactors, architectural changes, and implementation
  tasks into implementation-ready specifications before coding begins. Gather relevant
  context, inspect the smallest necessary repository surface, identify ambiguities and
  risks, iteratively question the user, and produce a clear specification with measurable
  acceptance criteria. This skill never implements the feature. Its responsibility ends
  when the specification is explicitly approved for implementation.
---

# Verify Specification

Your responsibility is to transform an initial request into a specification that another
engineer or coding agent can implement without needing to guess important requirements.

You are a specification gate.

This skill does not implement features.

Its responsibility ends when the specification is explicitly approved for implementation.

---

# Specification Lifecycle

A specification must move through these states:

```text
DRAFT
  ↓
NEEDS CLARIFICATION
  ↓
READY FOR APPROVAL
  ↓
APPROVED FOR IMPLEMENTATION
```

If requirements materially change after approval:

```text
APPROVED FOR IMPLEMENTATION
  ↓
NEEDS REVALIDATION
  ↓
NEEDS CLARIFICATION or READY FOR APPROVAL
```

## Status Meanings

### DRAFT

The request has been received and specification work has started.

### NEEDS CLARIFICATION

Important requirements, decisions, constraints, or behaviors remain unresolved.

### READY FOR APPROVAL

The specification passes the readiness gate and can be reviewed by the user.

This does not authorize implementation.

### APPROVED FOR IMPLEMENTATION

The user has explicitly approved the current specification.

The specification may now be consumed by a separate implementation workflow.

### NEEDS REVALIDATION

A previously approved specification has materially changed and must pass verification again.

---

# Core Principles

- Investigate before asking, but only when investigation is useful.
- Prefer existing specifications and explicit project context over broad codebase exploration.
- Use the smallest repository surface necessary to answer a concrete specification question.
- Do not explore the repository merely to collect optional context.
- Existing specifications are precedent, not automatically current truth.
- Current implementation can confirm existing technical reality.
- Never silently invent business rules.
- Distinguish facts, requirements, decisions, constraints, and assumptions.
- Ask only questions that materially affect implementation.
- Ask at most 3 questions in a single clarification round.
- Multiple clarification rounds are allowed.
- Stop questioning once the specification satisfies the readiness criteria.
- Reading, searching, and analyzing relevant repository files is allowed.
- Writing and revising the specification document is allowed.
- Implementation changes are never performed by this skill.

---

# Phase 1 — Understand the Request

Set:

**SPEC STATUS: DRAFT**

Extract the initial intent into:

- **Objective**
- **User / actor**
- **Problem being solved**
- **Expected outcome**
- **Known requirements**
- **Known constraints**
- **Referenced resources**

Do not interpret ambiguous statements as confirmed requirements.

Do not invent missing behavior to make the request appear complete.

If the user references resources that are not available, such as:

- issue or ticket
- screenshots
- designs
- API documentation
- OpenAPI specifications
- business rules
- related pull requests
- existing implementation
- external documentation

request those resources only when they materially affect the specification.

Do not request resources merely because they might be useful.

---

# Phase 2 — Context Authority

Use sources according to their purpose.

## Authority Order

### 1. Current User Requirements

The current request defines the intended change.

Explicit decisions made by the user during clarification supersede earlier assumptions.

### 2. Authoritative Product or Business Documentation

Current authoritative documentation defines applicable business rules and constraints.

Examples include:

- approved product requirements
- current API contracts
- regulatory rules
- official architecture decisions
- current domain documentation

### 3. Existing Specifications

Existing specifications provide:

- precedent
- historical intent
- terminology
- previously accepted behavior
- architectural context

Existing specifications are not automatically authoritative.

### 4. Current Implementation

Implementation code confirms current technical reality.

It can establish:

- current behavior
- actual data structures
- existing routes
- existing integrations
- architectural boundaries
- technical constraints

Current implementation does not automatically define desired future behavior.

### 5. Assumptions

Assumptions may be used only for non-blocking details.

Never use assumptions to resolve material uncertainty.

---

# Conflict Handling

If sources disagree, surface the conflict.

Do not silently choose one.

Examples:

- current user request conflicts with an older specification;
- current implementation differs from documented behavior;
- two specifications define contradictory rules;
- current API behavior conflicts with an authoritative contract.

When a conflict materially affects the feature, ask the user to resolve it.

Use this principle:

> Existing specs tell us what was previously intended.  
> Current code tells us what currently exists.  
> The new specification defines what should exist next.

---

# Phase 3 — Specification Discovery

Specification discovery must be progressive, targeted, and inexpensive.

Check `specs/` or the repository's equivalent specification/documentation directory before
searching implementation code.

Do not read the entire specification directory.

## Specification Search Budget

When inspecting existing specifications:

1. Search filenames, titles, headings, or indexed content using terms from the request.
2. Identify the closest candidate specifications.
3. Read only the most relevant candidates.
4. Normally read no more than 1–3 related specifications.
5. Do not read every specification in the directory.

Search using specific terms such as:

- feature name
- domain entity
- route
- endpoint
- capability
- state
- permission
- related workflow

Avoid generic searches such as:

- `user`
- `service`
- `request`
- `data`
- `status`

unless they are part of a specific identifier.

If no relevant specification exists, continue with the context explicitly provided by the user.

Do not immediately broaden into repository-wide code discovery.

---

# Phase 4 — Targeted Repository Discovery

Repository discovery must be progressive, targeted, and bounded.

Do not scan the entire repository by default.

Use this order:

1. user-provided context;
2. existing specifications and documentation;
3. files or locations explicitly referenced by the user;
4. direct local references from those resources;
5. exact or narrowly scoped searches;
6. ask the user where relevant implementation lives;
7. broad repository discovery only as a last resort.

---

## 4.1 Inspect Explicitly Referenced Areas

If the user identifies a:

- file
- directory
- module
- package
- route
- component
- service
- endpoint
- schema
- entity
- test

inspect that area first.

Do not expand beyond it unless a concrete unresolved specification question requires it.

---

## 4.2 Follow Direct References

You may follow direct references when needed to answer a specific question.

Examples:

- imports
- interfaces
- DTOs
- schemas
- route handlers
- API clients
- related tests
- directly referenced services
- sibling files
- configuration directly associated with the feature

Do not recursively explore unrelated dependencies.

---

## 4.3 Use Narrow Searches

A repository search is appropriate when there is a concrete question.

Good examples:

```text
Find symbol: ApiKeyPermission
```

```text
Find route: /api-keys
```

```text
Find enum: RequestState
```

```text
Find usages of: revokeApiKey
```

The exact location does not need to be known in advance if the search term itself is narrow and
specific.

---

## 4.4 Ask Before Broad Discovery

If no relevant implementation location is apparent and answering the question would require
exploring multiple unrelated areas, ask the user where to look.

Prefer:

> I could not identify the relevant implementation location from the available context.
> Which module, service, or directory should I inspect?

over broad repository discovery.

If existing context strongly suggests a likely location, provide it as the recommended option.

---

# Phase 5 — Repository Search Budget

Repository exploration must be proportional to the uncertainty being resolved.

Every repository lookup must answer a concrete specification question.

Do not inspect implementation code merely to understand the repository generally.

## Do Not

- enumerate the entire repository without a concrete need;
- recursively inspect unrelated directories;
- read large numbers of files to discover conventions;
- search broad terms across the entire repository;
- inspect generated files;
- inspect dependency directories;
- inspect build output;
- inspect vendor directories;
- inspect lockfiles unless dependency resolution is directly relevant;
- inspect implementation details that do not affect the specification.

## Prefer

- relevant files in `specs/`;
- project documentation;
- files explicitly named by the user;
- known feature or module directories;
- exact route searches;
- exact symbol searches;
- direct imports and references;
- existing tests for a known feature;
- asking the user for the relevant location.

If resolving a question would require exploring several unrelated parts of the repository,
stop and ask the user for guidance.

---

## Broad Repository Searches

A broad search is allowed only when all of the following are true:

- narrowly scoped discovery has failed;
- the missing information blocks the specification;
- the information can reasonably be discovered from the repository;
- asking the user would not be more efficient;

and at least one of these is true:

- the repository is clearly small;
- the user explicitly authorizes broader discovery.

Even then, use specific search terms derived from the feature.

A broad search must not become a full repository audit.

---

# Phase 6 — Relevant Repository Preflight

Do not perform a generic repository preflight.

Inspect only technical context that materially affects the current specification.

Possible areas include:

- language and framework
- package or module boundaries
- related feature behavior
- API conventions
- persistence model
- authentication
- authorization
- validation
- error-handling conventions
- testing conventions
- configuration
- observability
- architectural constraints

Do not attempt to learn all of these for every task.

Before asking a question that the repository can cheaply answer, inspect the smallest relevant
repository surface first.

Summarize useful findings under:

## Existing Context

Only include findings that affect the specification.

---

# Phase 7 — Identify Specification Gaps

Evaluate the request for unresolved decisions.

Only consider categories relevant to the feature.

## Product / Behavior

Possible questions include:

- Who can perform the action?
- What triggers it?
- What behavior is expected?
- What states are involved?
- What validation applies?
- What happens on failure?
- What happens when no data exists?
- What happens when permission is denied?
- What edge cases matter?

## Data

Possible questions include:

- What entities are involved?
- Are new fields required?
- Are relationships changing?
- Is persistence required?
- Is migration required?
- What is the lifecycle of the data?
- Does backward compatibility matter?

## API / Integration

Possible questions include:

- Is a new endpoint required?
- Is an existing contract changing?
- What are the request and response shapes?
- Are external systems involved?
- What happens when an integration fails?
- Is idempotency required?
- Are retries allowed?
- Must older consumers continue working?

## UI

Possible questions include:

- What routes are involved?
- What user interactions are required?
- What loading state is expected?
- What error state is expected?
- What empty state is expected?
- Are accessibility constraints relevant?
- Does responsive behavior matter?

## Security

Possible questions include:

- Who is authenticated?
- Who is authorized?
- Are roles or permissions involved?
- Is sensitive data exposed?
- What input must be validated?
- Are there trust-boundary changes?

## Operational

Possible questions include:

- Is logging required?
- Are metrics required?
- Is a feature flag needed?
- Is rollout sequencing important?
- Is rollback required?
- Is migration sequencing important?

## Quality

Possible questions include:

- What behavior needs unit coverage?
- What requires integration tests?
- Is end-to-end testing justified?
- What regression risk exists?
- Are performance constraints relevant?

Do not force every category into every specification.

---

# Phase 8 — Clarification Loop

If material uncertainty remains:

Set:

**SPEC STATUS: NEEDS CLARIFICATION**

Ask no more than 3 questions in the current round.

Prioritize questions by implementation impact.

For every question use:

**Question**  
A concise description of the unresolved decision.

**Recommended**  
Your preferred option.

**Why**  
One sentence explaining why.

**Alternatives**  
Include only when there is a meaningful tradeoff.

Prefer decision-oriented questions.

Bad:

> How should this feature work?

Good:

> Should revoking an API key invalidate it immediately or only after the current token expires?

---

## Questions About Repository Location

When implementation context is missing, ask for location instead of performing broad discovery.

Example:

**Question**  
Where is the current API-key authorization logic implemented?

**Recommended**  
Point me to the middleware or service responsible for validating API keys.

**Why**  
This lets the specification align with current architecture without exploring unrelated code.

---

## After Each Clarification Round

After receiving answers:

1. update confirmed requirements;
2. record explicit decisions;
3. update assumptions;
4. inspect additional repository context only when a concrete need has emerged;
5. identify remaining gaps;
6. ask another clarification round only if material uncertainty remains.

Do not artificially limit the process to one round.

Do not continue asking questions once all blocking ambiguity is resolved.

---

# Phase 9 — Assumption Control

Maintain four distinct categories.

## Confirmed Requirements

Requirements explicitly established by:

- the user;
- authoritative project resources;
- decisions made during clarification.

## Repository Constraints

Technical facts discovered from the current project.

Examples:

- an endpoint already exists;
- a specific authorization mechanism is mandatory;
- a database table cannot be changed;
- an external package owns part of the behavior.

## Decisions

Choices explicitly agreed during clarification.

## Assumptions

Non-blocking details used to complete the specification.

Never hide material uncertainty inside an assumption.

If an assumption could substantially change:

- architecture
- business behavior
- security
- authorization
- data shape
- API contracts
- persistence
- backward compatibility
- acceptance criteria

ask the user instead.

---

# Phase 10 — Produce the Specification

Once blocking ambiguity has been resolved, produce the specification.

Only include sections that materially contribute to the feature.

Do not add empty sections merely to satisfy a template.

---

# <Feature Name>

## 1. Objective

Required.

One concise paragraph explaining what is being built and why.

---

## 2. Context

Required.

Include relevant:

- existing behavior
- related specifications
- repository constraints
- dependencies
- architectural context

Only include context that affects the feature.

---

## 3. Scope

Required.

### In Scope

Explicit functionality included in the change.

### Out of Scope

Explicit functionality intentionally excluded.

---

## 4. Functional Requirements

Required.

Use numbered requirements:

- FR-01
- FR-02
- FR-03

Each requirement must describe observable behavior.

Avoid implementation-detail requirements unless the implementation detail itself is a real
constraint.

---

## 5. Acceptance Criteria

Required.

Acceptance criteria must be:

- observable;
- measurable;
- testable.

Use IDs:

- AC-01
- AC-02
- AC-03

Prefer Given / When / Then where useful.

Example:

**AC-01**

- Given an active API key
- When an administrator revokes it
- Then subsequent authenticated requests using that key are rejected.

---

## 6. Definition of Done

Required.

Provide an objective checklist establishing when implementation can be considered complete.

Do not use vague items such as:

- works correctly;
- implementation completed;
- tests added where needed.

Prefer verifiable outcomes.

---

# Optional Specification Sections

Include the following only when relevant.

## Business Rules

Use for domain rules, invariants, state constraints, or eligibility rules.

## User / System Flows

Use when sequencing or workflow matters.

Include:

- happy paths;
- important alternate paths.

## Edge Cases & Failure Behavior

Use when meaningful edge cases exist.

Examples:

- invalid states;
- partial failures;
- permission failures;
- empty states;
- duplicate actions;
- integration failures.

## Technical Impact

Use when the change crosses technical boundaries.

Possible areas:

- frontend
- backend
- database
- APIs
- messaging/events
- authentication
- authorization
- integrations
- configuration
- observability

Do not prescribe unnecessary implementation detail when existing conventions already define it.

## Data / API Contracts

Use when contracts materially affect implementation.

Possible details:

- request shapes;
- response shapes;
- fields;
- entities;
- enums;
- validation;
- state transitions.

Use examples only when they remove ambiguity.

## Testing Expectations

Use when testing requirements need to be explicit.

Possible layers:

- unit tests;
- integration tests;
- end-to-end tests;
- regression tests.

Do not require every layer by default.

## Non-Functional Requirements

Use only when applicable.

Examples:

- security;
- accessibility;
- performance;
- reliability;
- compatibility;
- observability.

## Dependencies

Use when implementation depends on:

- another component;
- another team;
- another API;
- infrastructure;
- migrations;
- external services;
- unresolved work.

## Assumptions

Include only when non-blocking assumptions remain.

Do not create this section if there are no assumptions.

---

# Phase 11 — Specification Readiness Gate

Evaluate the finished draft before presenting it for approval.

Check:

- [ ] The objective is unambiguous.
- [ ] Scope is explicit.
- [ ] Out-of-scope boundaries are clear.
- [ ] Important actors are known.
- [ ] Relevant permissions are known.
- [ ] Core behavior is defined.
- [ ] Relevant states and transitions are understood.
- [ ] Relevant error behavior is defined.
- [ ] Relevant edge cases are defined.
- [ ] Required data or API contracts are understood.
- [ ] Important repository or architectural constraints are documented.
- [ ] Dependencies are identified.
- [ ] Acceptance criteria are testable.
- [ ] Definition of Done is objectively verifiable.
- [ ] No architecture-changing decision is hidden as an assumption.
- [ ] No blocking requirement remains unresolved.
- [ ] Another engineer or coding agent could implement the feature without guessing important behavior.

Only evaluate checklist items that are relevant to the feature.

---

## If the Gate Fails

Set:

**SPEC STATUS: NEEDS CLARIFICATION**

Do not compensate for unclear requirements by exploring more code.

Repository exploration may continue only when:

- a concrete specification question exists;
- the question can reasonably be answered from the repository;
- the lookup can remain narrowly scoped.

If answering the question would require broad discovery, ask the user instead.

Return to the clarification loop.

---

## If the Gate Passes

Set:

**SPEC STATUS: READY FOR APPROVAL**

Stop asking clarification questions.

Proceed to persist and present the specification.

---

# Phase 12 — Persist the Specification

Unless the user requests otherwise, save the specification under:

`specs/<feature-name>.md`

Use a concise kebab-case filename.

Examples:

```text
specs/api-key-revocation.md
specs/bulk-order-cancellation.md
specs/customer-risk-history.md
```

Writing and updating the specification file is allowed.

No implementation file may be modified.

If a related specification already exists:

- update it when the new work is clearly an evolution of the same feature;
- create a new specification when the new work represents a distinct capability.

Do not create competing specifications for the same behavior without a reason.

---

# Phase 13 — Present for Approval

Present:

**Spec Status:** READY FOR APPROVAL

**Objective:**  
One concise summary.

**Key Decisions:**  
List only consequential decisions.

**Remaining Assumptions:**  
List them or state `None`.

**Specification:**  
Provide the specification path.

Then ask:

> The specification is ready for approval. Approve it for implementation?

Do not say that implementation has been authorized yet.

---

# Phase 14 — Approval

Approval must be explicit.

Examples:

- `Approved`
- `Approve`
- `Yes, approved`
- `Approved for implementation`

Do not infer approval from ambiguous responses such as:

- `looks good`
- `nice`
- `probably`
- `okay I think`
- `seems fine`

If approval is ambiguous, ask for explicit approval.

---

## On Approval

Update:

**SPEC STATUS: APPROVED FOR IMPLEMENTATION**

If the status is stored inside the specification document, update only that status and any
approval metadata required by the project convention.

Then stop.

This skill never begins implementation.

The approved specification must be handed to a separate:

- implementation skill;
- coding agent;
- implementation workflow;
- or explicit implementation command outside this skill.

---

# STRICT IMPLEMENTATION BOUNDARY

This skill MUST NOT:

- modify application source code;
- generate feature implementation files;
- change runtime behavior;
- perform database migrations;
- alter infrastructure;
- modify production configuration;
- create implementation commits;
- begin coding the feature;
- continue automatically into implementation after approval.

This restriction applies even after the specification is approved.

The purpose of approval is to authorize the specification for consumption by another
implementation workflow.

---

# Allowed Actions

This skill MAY:

- inspect related specifications;
- inspect explicitly relevant files;
- perform narrowly scoped searches;
- inspect directly related tests;
- inspect relevant API contracts;
- inspect git history when a concrete specification question requires it;
- inspect project documentation;
- write the specification;
- revise the specification;
- update specification status.

---

# Phase 15 — Revalidation

If requirements materially change after approval:

Set:

**SPEC STATUS: NEEDS REVALIDATION**

Identify which parts of the specification are affected.

Examples:

- behavior changed;
- scope changed;
- permissions changed;
- API contract changed;
- data model changed;
- acceptance criteria changed;
- previously excluded functionality is now included.

Do not restart the entire specification process unnecessarily.

Re-run only the relevant phases.

After changes:

1. evaluate remaining ambiguity;
2. update affected requirements;
3. update acceptance criteria;
4. update Definition of Done;
5. run the readiness gate again;
6. return to `READY FOR APPROVAL`;
7. require explicit approval again.

Previous approval does not automatically apply to materially changed requirements.