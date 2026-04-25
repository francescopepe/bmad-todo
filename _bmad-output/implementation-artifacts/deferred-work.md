# Deferred Work

> Triaged during Epic 3 retrospective (2026-04-25). Items are either CLOSED (fixed, accepted risk, or won't-fix) or assigned a target epic/story.

## Closed — Superseded (Epic 4 retrospective, 2026-04-25)

- ~~**No Prisma migrations committed**~~ — Superseded by `init-db.mjs` + `prisma migrate diff` approach implemented in Story 4.1. SQL is auto-generated from `prisma/schema.prisma` at Docker build time, maintaining single source of truth. Committed migrations are not needed for this deployment model. _(Origin: 1.1 review, closed: Epic 4 retro)_

## Closed — Fixed in Epic 5 (Story 5.2, 2026-04-25)

- ~~**No test for input refocus after submit**~~ — Fixed in Story 5.2. Added focus spy test to `TodoForm.test.tsx`. _(Origin: 1.5 review, closed: Story 5.2)_
- ~~**`useTodos` test doesn't verify optimistic timing**~~ — Fixed in Story 5.2. Added deferred-promise test proving todo appears before POST resolves. _(Origin: 1.5 review, closed: Story 5.2)_
- ~~**Toast accumulates unboundedly under rapid failures**~~ — Fixed in Story 5.2. Capped toasts at max 5 in `page.tsx`. _(Origin: 3.2 review, closed: Story 5.2)_
- ~~**Initial fetch error not clearable (no retry mechanism)**~~ — Fixed in Story 5.2. Added `retry()` to `useTodos` hook and retry button to error state in `page.tsx`. _(Origin: 1.5 review, closed: Story 5.2)_
- ~~**`vitest.config.ts` conditional `require('dotenv')` may fail**~~ — Verified safe in Story 5.2. Conditional `existsSync` guard works correctly; `dotenv` is in devDependencies. _(Origin: 2.5 review, closed: Story 5.2)_
- ~~**`fileParallelism: false` disables test parallelism globally**~~ — Evaluated in Story 5.2, kept as-is. Sequential execution is a deliberate trade-off for SQLite-based integration test correctness. _(Origin: 2.1 review, closed: accepted trade-off)_
- ~~**No `global-error.tsx` for layout-level errors**~~ — Not addressed in Epic 5. Low priority, narrow risk. Accepted for portfolio project scope. _(Origin: 2.6 review, closed: accepted risk)_

## Deferred from: code review of 4-2-docker-compose-and-data-persistence (2026-04-25)

- **Podman compose compatibility gap** — `docker-compose.yml` cannot be invoked through `container-engine.sh` for Podman users relying on `podman-compose`. `podman compose` subcommand works. Out of scope for this story.
- **`docker info` probe can stall 30+ seconds** — If Docker daemon is hanging or Docker Desktop is starting up, `container-engine.sh` freezes with no user feedback or timeout.
- **SQLite crash safety and WAL recovery in Docker volumes** — OOM kill or SIGKILL may leave WAL files; `restart: unless-stopped` could restart into corrupted state. Known SQLite-in-Docker tradeoff.
- **No resource limits on container** — No `mem_limit`/`cpus` constraints in `docker-compose.yml`. Production hardening, out of scope for portfolio project.

## Deferred from: code review of 5-1-e2e-test-suite (2026-04-25)

- **Duplicated `deleteAllTodos` helper across spec files** — The identical cleanup function is copy-pasted in `e2e/todo-crud.spec.ts` and `e2e/empty-state.spec.ts`. Extract to a shared Playwright fixture or utility when the test suite grows beyond 2 spec files.

## Deferred from: code review of 5-2-test-coverage-and-unit-tests (2026-04-25)

- **Retry doesn't abort in-flight fetch (no AbortController)** — The `useTodos` retry mechanism uses a `cancelled` flag to prevent stale state writes, but never aborts the HTTP request itself. Rapid retries produce parallel requests. Correctness is maintained; this is a network efficiency optimization.
- **No test for concurrent mutation + retry overlap** — No test verifies behavior when a mutation (add/toggle/update/delete) is in-flight and `retry()` fires simultaneously. The fetch response could overwrite optimistic state from in-flight mutations.

## Deferred from: code review of 5-3-accessibility-audit (2026-04-25)

- **`deleteTodo` rollback uses full array replacement, discarding concurrent optimistic updates** — `setTodos(savedTodos)` replaces entire state rather than using a functional updater like other mutations. If a concurrent mutation applies an optimistic update while a delete is in-flight, the rollback overwrites it. Pre-existing pattern, not introduced by story 5-3.
- **Lighthouse audit script has no timeout** — `scripts/lighthouse-audit.mjs` has no timeout on `chrome-launcher` or `lighthouse()`. Can hang indefinitely in CI if Chrome is unresponsive or URL is unreachable. Nice-to-have hardening.

## Deferred from: code review of 5-4-security-review-and-documentation (2026-04-25)

- **sr-only pattern may cause layout reflow on hover** — The `sr-only`→`not-sr-only` toggle removes/re-inserts elements from visual flow, unlike the old opacity approach. May cause visual jump on hover. Pre-existing from story 5-3 accessibility work.
- **Toast ID counter unbounded** — `nextId.current++` never resets. Theoretical overflow at 2^53 — extremely unlikely in practice. Pre-existing.
- **Sequential Playwright execution masks concurrency bugs** — `workers: 1` is necessary for shared SQLite but hides potential race conditions under concurrent load. Separate concurrency testing would be needed for production hardening.

## Closed — Already Fixed

- ~~**UpdateTodoSchema accepts empty object**~~ — Fixed in Story 2.1. _(Origin: 1.1 review)_
- ~~**Todo interface date type mismatch**~~ — Fixed during API serialization. _(Origin: 1.1 review)_
- ~~**`.refine()` changes UpdateTodoSchema to ZodEffects**~~ — Fixed in Story 2.1. _(Origin: 1.3 review)_
- ~~**Extra/unknown properties pass through UpdateTodoSchema**~~ — Fixed in Story 2.1. _(Origin: 1.3 review)_
- ~~**`addTodo` failures produce no user feedback**~~ — Fixed in Story 2.5 (Toast system). _(Origin: 1.5 review)_

## Closed — Accepted Risk

- ~~**No structured error logging in API handlers**~~ — Out of scope for portfolio project. No observability requirements defined. _(Origin: 1.2 review)_
- ~~**`text-text-primary` naming collision**~~ — Cosmetic naming issue, works correctly. Document for future contributors. _(Origin: 1.4 review)_
- ~~**Empty/whitespace edit silently discards without feedback**~~ — Intentional cancel behavior per spec. _(Origin: 3.1 review)_
- ~~**No debounce/disable on form submit allows duplicate adds**~~ — Narrow race, single-user app. Form clearing is implicit debounce. _(Origin: 1.5/3.1 review)_
- ~~**Duplicate `Date.now()` temp IDs on rapid double-add**~~ — Sub-millisecond race, single-user app. _(Origin: 2.5 review)_
- ~~**`deleteTodo` full-array rollback overwrites concurrent mutations**~~ — Documented single-user trade-off for position-preserving rollback. _(Origin: 2.4 review)_
- ~~**Rapid double-toggle sends contradictory PATCHes**~~ — Narrow race window, single-user app. _(Origin: 2.4 review)_
- ~~**Operating on temp-id todo before addTodo resolves hits 404**~~ — Edge case, single-user app. _(Origin: 2.4 review)_
- ~~**Toast `slideOutTimer` race on rapid re-trigger**~~ — ~200ms window, minimal user impact. _(Origin: 2.3 review)_
