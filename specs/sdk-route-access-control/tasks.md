# SDK Route Access Control Tasks

Status: Implemented; production-build verification blocked by the local Node runtime

- [x] T-01 Add the shared specification, plan, verification, dashboard, and Claude Code guidance.
- [x] T-02 Add direct-PEM/file-path JWT resolution and update existing server token handling — AC-06.
- [x] T-03 Replace legacy middleware with unconditional SDK route control — AC-01 through AC-05, AC-07.
- [x] T-04 Preserve SDK `returnUrl` compatibility in the local login page — AC-04.
- [x] T-05 Document the required environment contract — AC-02, AC-05, AC-06.
- [ ] T-06 Run focused assertions, type/lint/build checks, update verification, and converge — AC-08. Focused checks passed; the production build requires the declared Node 22 runtime.
