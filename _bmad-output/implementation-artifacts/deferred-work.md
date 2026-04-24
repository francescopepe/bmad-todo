# Deferred Work

## Deferred from: code review of 1-1-project-initialization-and-data-layer (2026-04-24)

- **UpdateTodoSchema accepts empty object** — Both `title` and `completed` are optional with no refinement requiring at least one field. A no-op update will still bump `updatedAt`. Revisit when API routes are implemented in Story 1.2.
- **Todo interface date type mismatch** — `createdAt`/`updatedAt` typed as `string` in `src/lib/types.ts` but Prisma returns `Date`. Best to address during serialization when API routes are built (Story 1.2).
- **No Prisma migrations committed** — The spec uses `prisma db push` for local dev, but `prisma/migrations/` is empty. Production/CI deployment via `prisma migrate deploy` will fail without committed migrations. Address before Epic 4 (Docker deployment).
