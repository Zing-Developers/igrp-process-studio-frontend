# IRN MR !37 History-Safe Synchronization

**SPEC STATUS: APPROVED FOR IMPLEMENTATION**

## 1. Objective

Resolve IRN GitLab merge request !37 through the approved Zing delivery path while preserving the complete reconciled `origin/develop` application tree, retaining the current IRN `dev` history, and preventing any direct developer push to the IRN repository.

## 2. Context

- The primary repository is Zing GitHub remote `origin`.
- The primary development branch is `origin/develop`.
- The primary release branch is `origin/irn-releases`.
- The IRN GitLab remote is locally named `up-stream`.
- The IRN target is `up-stream/dev`.
- The automated IRN source branch is `up-stream/feature/zing-commits`.
- MR !37 merges `feature/zing-commits` into `dev`.
- At the audited refs, `up-stream/dev` (`3c031714a2c2c010b72f66aedd2e5d924086cf94`) is already an ancestor of `origin/develop` (`c92bd8778902ea6196e024ce63afec560ea82a54`). Therefore, the primary Zing history already contains the current IRN target history.
- The synchronized IRN source tree at `8da6a679409fa9fc728705f812199b58759ee457` matches `origin/develop` outside `.github`, but `git filter-repo` rewrote the imported IRN commits. This changed their identities and left MR !37 with the older merge base `369aa5623f26faf66f895b044bbe057620601dbe`.
- The resulting MR conflict is limited to `pnpm-lock.yaml`. IRN `dev` contains twelve pre-existing conflict-marker groups in that generated file; `origin/develop` contains a clean, newer lockfile aligned with its current `package.json`.
- A local experimental direct-IRN resolution is preserved at `archive/irn-mr-37-direct-resolution` and must not be pushed.
- The working resolution branch `resolve/irn-mr-37` is based on `origin/develop`.
- `origin/irn-releases` already permits workflow-only changes to trigger synchronization by commenting out the `.github/**` path exclusion. The final workflow change must retain this release-branch behavior.

## 3. Scope

### In Scope

- Update the Zing-owned synchronization workflow on a branch based on `origin/develop`.
- Preserve the complete application tree from the Zing release commit after its existing workflow-path filtering.
- Verify before filtering that the exact fetched IRN `dev` tip is already contained in the Zing release history.
- After filtering, record that exact IRN `dev` tip as a parent of the synchronized commit without reapplying or discarding file content.
- Update `feature/zing-commits` only through the GitHub workflow.
- Protect the automated force update with a lease pinned to the freshly fetched destination SHA.
- Leave MR !37 able to recalculate against IRN `dev` with a current merge base.

### Out of Scope

- Direct local pushes to any branch in the IRN GitLab repository.
- Changing application source, dependency versions, or the resolved `pnpm-lock.yaml` content.
- Rewriting `origin/develop`, `origin/irn-releases`, or IRN `dev` history.
- Automatically choosing one side when IRN `dev` is not already contained in the Zing release history.
- Automatically resolving future semantic source conflicts.
- Merging MR !37 in GitLab.

## 4. Functional Requirements

- **FR-01:** Resolution work shall originate from `origin/develop`, using `resolve/irn-mr-37` as the local preparation branch.
- **FR-02:** The workflow shall fetch the current IRN `dev` tip before rewriting history.
- **FR-03:** The workflow shall verify that the fetched IRN `dev` tip is an ancestor of the checked-out Zing release commit before filtering. If it is not, the workflow shall fail before any push and instruct the operator to reconcile IRN `dev` into `origin/develop` locally.
- **FR-04:** The workflow shall retain the current intentional exclusion of `.github/workflows` from the synchronized IRN tree.
- **FR-05:** After filtering, the workflow shall fetch IRN `dev` again and verify that it has not moved since FR-02. A moved target shall fail the workflow before any push.
- **FR-06:** When the exact IRN `dev` tip is not an ancestor only because filtering rewrote commit identities, the workflow shall create an ancestry-only merge commit whose first parent is the filtered Zing source and whose second parent is the verified IRN `dev` tip. The merge commit shall retain the filtered Zing tree byte-for-byte.
- **FR-07:** The workflow shall not use an ancestry-only merge when FR-03 has not proved that the IRN target history was already reconciled into the unfiltered Zing history.
- **FR-08:** The workflow shall fetch the current `feature/zing-commits` destination SHA and update it with `--force-with-lease` pinned to that SHA. It shall not use raw `--force`.
- **FR-09:** If the destination branch moves after it is fetched, the leased push shall fail without overwriting the new remote history.
- **FR-10:** The workflow shall retain the existing GitLab merge-request options targeting `dev`, including the configured title, assignee, and reviewer.
- **FR-11:** The workflow shall retain the `origin/irn-releases` behavior that allows workflow-file changes to trigger synchronization.
- **FR-12:** No local or manual command in this resolution shall push directly to `up-stream/feature/zing-commits` or another IRN branch.

## 5. Failure Behavior

- If IRN `dev` is not an ancestor of the unfiltered Zing release commit, stop before filtering or pushing and report both SHAs.
- If IRN `dev` moves between the initial ancestry check and post-filter merge preparation, stop before pushing and report the old and new SHAs.
- If `feature/zing-commits` moves after its lease is captured, allow the leased push to fail; do not retry with raw force.
- If the post-filter ancestry merge changes the filtered source tree, stop before pushing because the no-loss invariant has failed.
- If MR !37 still reports semantic conflicts after synchronization, stop and audit the new refs rather than selecting a side automatically.

## 6. Acceptance Criteria

**AC-01 — Primary-history base**

- Given the local `resolve/irn-mr-37` branch
- Then its base is `origin/develop`, not the filtered IRN feature branch.

**AC-02 — Upstream containment guard**

- Given an IRN `dev` tip that is not an ancestor of the unfiltered release commit
- When synchronization runs
- Then it exits non-zero before any IRN push and reports that local reconciliation is required.

**AC-03 — Tree preservation**

- Given an IRN `dev` tip already contained in the unfiltered release history
- When filtering and ancestry repair complete
- Then the synchronized commit tree equals the filtered Zing tree exactly.

**AC-04 — Correct ancestry**

- Given successful synchronization
- Then the verified IRN `dev` SHA is an ancestor of the commit sent to `feature/zing-commits`.

**AC-05 — Conflict removal**

- Given the synchronized result and the verified IRN `dev` tip
- When their mergeability is checked locally
- Then no `pnpm-lock.yaml` conflict or other unmerged path is produced.

**AC-06 — No application-code loss**

- Given the pre-filter Zing release tree and configured workflow exclusion
- When the synchronized tree is compared with it
- Then every non-excluded tracked path and blob is identical.

**AC-07 — Protected automation update**

- Given a destination SHA captured immediately before push
- When the destination remains unchanged
- Then the workflow updates `feature/zing-commits` with the pinned force-with-lease.
- When the destination changes
- Then the workflow fails without replacing it.

**AC-08 — Approved route only**

- No developer-originated push is made to the IRN remote.
- Publication proceeds from Zing development to Zing release and then through the GitHub workflow.

**AC-09 — Validation**

- The workflow syntax is valid.
- A local dry-run reproduction proves the ancestry guard, unchanged-tree invariant, and conflict-free merge result.
- The existing production build remains successful because application files are unchanged.

## 7. Definition of Done

- [ ] `resolve/irn-mr-37` is based on the latest fetched `origin/develop`.
- [ ] The prior direct-IRN experimental commit remains preserved on its archive branch and is not published.
- [ ] The synchronization workflow implements FR-02 through FR-11.
- [ ] No application or lockfile content changes are present in the implementation diff.
- [ ] Local workflow validation and ancestry/tree-invariant tests pass.
- [ ] The production build passes, or any unrelated pre-existing failures are recorded separately.
- [ ] A local implementation commit is created.
- [ ] Before any push, a concrete proposal identifies the exact local SHA, `origin` destination branch, push mode, contents, replaced history, and expected downstream automation.
- [ ] The user explicitly approves that exact primary-repository push.
- [ ] After the approved push and normal Zing merge path, MR !37 is refreshed without conflict.

## 8. Key Decisions

- The primary Zing tree is preserved exactly; no application-side conflict choice is made.
- IRN `dev` is attached as ancestry only after a pre-filter containment proof establishes that its code is already present in Zing history.
- Direct IRN pushes are prohibited.
- Automated history replacement uses a pinned lease and stops if either relevant IRN ref moves.

## 9. Remaining Assumptions

- The existing `EXT_REPO_PAT` secret retains fetch and automated push access to the configured IRN repository.
- GitHub Actions continues to permit `git-filter-repo`, fetching the IRN refs, creating a local merge commit, and using GitLab push options.
