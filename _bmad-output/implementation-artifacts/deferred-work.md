# Deferred Work

## Deferred from: code review of 1-1-project-initialization-and-data-layer (2026-04-24)

- **UpdateTodoSchema accepts empty object** — Both `title` and `completed` are optional with no refinement requiring at least one field. A no-op update will still bump `updatedAt`. Revisit when API routes are implemented in Story 1.2.
- **Todo interface date type mismatch** — `createdAt`/`updatedAt` typed as `string` in `src/lib/types.ts` but Prisma returns `Date`. Best to address during serialization when API routes are built (Story 1.2).
- **No Prisma migrations committed** — The spec uses `prisma db push` for local dev, but `prisma/migrations/` is empty. Production/CI deployment via `prisma migrate deploy` will fail without committed migrations. Address before Epic 4 (Docker deployment).

## Deferred from: code review of 1-2-todo-api-create-and-list-endpoints (2026-04-24)

- **No structured error logging in API handlers** — Both GET and POST in `src/app/api/todos/route.ts` catch errors and return 500 but log nothing. Database outages and unexpected errors will be invisible. Pre-existing gap — spec forbids `console.log` but structured logging (e.g., pino, Next.js logger) was never set up. Address when observability requirements are defined.

## Deferred from: code review of 1-3-health-check-endpoint (2026-04-24)

- **`.refine()` changes UpdateTodoSchema to ZodEffects** — Adding `.refine()` converts the schema from `ZodObject` to `ZodEffects`, meaning `.shape`, `.pick()`, `.extend()`, and `.partial()` will not work. Address when the update route is implemented in Story 2-1.
- **Extra/unknown properties pass through UpdateTodoSchema** — No `.strict()` or `.strip()` on the `z.object()`. Unexpected keys survive parsing and could reach the database layer. Address when the update route is implemented in Story 2-1.

## Deferred from: code review of 1-4-design-tokens-and-core-layout (2026-04-24)

- **`text-text-primary` naming collision** — `text-primary` utility maps to the blue accent color (#2563EB) not the primary text color (#111827). Future contributors will likely write `text-primary` expecting text color. The correct utility is `text-text-primary`. Consider renaming tokens (e.g., `--color-accent` instead of `--color-primary`) if confusion arises.

## Deferred from: code review of 1-5-task-creation-ui-and-optimistic-add (2026-04-24)

- **No test for input refocus after submit** — AC1 specifies the input refocuses after submission. The behavior is implemented (`inputRef.current?.focus()`) but no test asserts post-submit focus. Address in Epic 5 test coverage story.
- **`useTodos` test doesn't verify optimistic timing** — The test awaits the full `addTodo` call, so it never asserts the todo is visible *before* the POST resolves. The optimistic pattern works correctly; the test gap is coverage-only. Address in Epic 5.
- **`addTodo` failures produce no user feedback** — When `addTodo` fails, the optimistic todo is silently removed with no error message or toast. Spec defers toast notifications to Story 2.5.

## Deferred from: code review of 2-1-todo-api-update-and-delete-endpoints (2026-04-24)

- **`fileParallelism: false` disables test parallelism globally** — Added to `vitest.config.ts` to prevent SQLite lock timeouts across integration test files. Correct for SQLite but forces all test files (including unit tests) to run sequentially. Consider vitest workspace configs or project-level overrides to scope this to integration tests only as the suite grows.
