# Deferred Work

> Triaged during Epic 3 retrospective (2026-04-25). Items are either CLOSED (fixed, accepted risk, or won't-fix) or assigned a target epic/story.

## Closed — Superseded (Epic 4 retrospective, 2026-04-25)

- ~~**No Prisma migrations committed**~~ — Superseded by `init-db.mjs` + `prisma migrate diff` approach implemented in Story 4.1. SQL is auto-generated from `prisma/schema.prisma` at Docker build time, maintaining single source of truth. Committed migrations are not needed for this deployment model. _(Origin: 1.1 review, closed: Epic 4 retro)_

## Open — Target: Epic 5 (Story 5.2 — Test Coverage & Unit Tests)

- **No test for input refocus after submit** — AC1 specifies the input refocuses after submission. The behavior is implemented (`inputRef.current?.focus()`) but no test asserts post-submit focus. _(Origin: 1.5 review)_
- **`useTodos` test doesn't verify optimistic timing** — The test awaits the full `addTodo` call, so it never asserts the todo is visible *before* the POST resolves. The optimistic pattern works correctly; the test gap is coverage-only. _(Origin: 1.5 review)_
- **Toast accumulates unboundedly under rapid failures** — No max-length guard on the `toasts` array in `page.tsx`. Add a cap (e.g., max 5 toasts) during test/quality pass. _(Origin: 3.2 review)_
- **Initial fetch error not clearable (no retry mechanism)** — If the initial GET /api/todos fails, the error state renders a dead-end `<p>` with no retry button. Add retry button during test/quality pass. _(Origin: 1.5 review, also flagged in 2.2 and 3.1 reviews)_
- **`vitest.config.ts` conditional `require('dotenv')` may fail** — Config loads `dotenv` via `require()` only if `.env.test` exists, but `dotenv` may not be in `devDependencies`. Fix during test infrastructure cleanup. _(Origin: 2.5 review)_
- **`fileParallelism: false` disables test parallelism globally** — Forces all test files to run sequentially. Consider vitest workspace configs to scope to integration tests only. _(Origin: 2.1 review)_
- **No `global-error.tsx` for layout-level errors** — The custom ErrorBoundary catches child page errors but not layout-level errors. Low priority, narrow risk. _(Origin: 2.6 review)_

## Deferred from: code review of 4-2-docker-compose-and-data-persistence (2026-04-25)

- **Podman compose compatibility gap** — `docker-compose.yml` cannot be invoked through `container-engine.sh` for Podman users relying on `podman-compose`. `podman compose` subcommand works. Out of scope for this story.
- **`docker info` probe can stall 30+ seconds** — If Docker daemon is hanging or Docker Desktop is starting up, `container-engine.sh` freezes with no user feedback or timeout.
- **SQLite crash safety and WAL recovery in Docker volumes** — OOM kill or SIGKILL may leave WAL files; `restart: unless-stopped` could restart into corrupted state. Known SQLite-in-Docker tradeoff.
- **No resource limits on container** — No `mem_limit`/`cpus` constraints in `docker-compose.yml`. Production hardening, out of scope for portfolio project.

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
