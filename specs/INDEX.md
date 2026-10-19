# Specification Status Dashboard

Updated: 2026-10-09

This dashboard summarizes feature status. Each feature's own specification,
plan, tasks, and verification artifacts remain the source of truth.

| Feature | Lifecycle status | Next action | Artifacts |
| --- | --- | --- | --- |
| SDK route access control | Verification blocked | Run the production build with the declared Node 22 runtime | [spec](sdk-route-access-control/spec.md), [plan](sdk-route-access-control/plan.md), [tasks](sdk-route-access-control/tasks.md), [verification](sdk-route-access-control/verification.md) |
| IGRP design-system removal | In progress; upstream blocked | Obtain a self-contained IRN design-system release before completing removal | [spec](igrp-design-system-removal-spec.md) |
| IGRP framework-package removal | Historical implementation record | Revalidate only after dependency/framework changes | [spec](igrp-framework-package-removal-spec.md) |
| Email access mappings | Existing feature specification | Use the feature specification as the current source of truth | [spec](email-access-mappings.md) |
| IRN MR !37 history-safe sync | Existing delivery specification | Use the specification before any related Git synchronization work | [spec](irn-mr-37-history-safe-sync.md) |

## Update Rules

1. Update a feature's tasks and verification artifacts first.
2. Then update this dashboard when lifecycle status, blocker, or next action changes.
3. Do not duplicate detailed implementation progress here.
