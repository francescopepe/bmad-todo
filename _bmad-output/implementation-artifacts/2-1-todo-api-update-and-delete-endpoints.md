# Story 2.1: Todo API — Update & Delete Endpoints

Status: done

## Story

As a **user**,
I want to update and delete tasks via API,
so that my task changes are persisted reliably.

## Acceptance Criteria

1. **PATCH success (completed):** Given a todo exists with id "abc123", when a PATCH request is sent to `/api/todos/abc123` with `{ "completed": true }`, then the todo is updated in the database and the response is `{ data: <updated Todo>, success: true }` with status 200.

2. **PATCH success (title):** Given a todo exists with id "abc123", when a PATCH request is sent to `/api/todos/abc123` with `{ "title": "Updated title" }`, then the todo title is updated in the database and the response includes the updated todo.

3. **DELETE success:** Given a todo exists with id "abc123", when a DELETE request is sent to `/api/todos/abc123`, then the todo is removed from the database and the response is `{ data: { id: "abc123" }, success: true }` with status 200.

4. **Not found:** Given no todo exists with id "nonexistent", when a PATCH or DELETE request is sent to `/api/todos/nonexistent`, then the response is `{ error: { message, code: "NOT_FOUND" }, success: false }` with status 404.

5. **PATCH validation:** Given a PATCH request with an empty body `{}`, then the response is `{ error: { message, code: "VALIDATION_ERROR" }, success: false }` with status 400.

6. **Integration tests:** Integration tests exist for PATCH and DELETE covering success, validation, and not-found cases.

## Tasks / Subtasks

- [x] Task 1: Fix UpdateTodoSchema ZodEffects issue (AC: #5)
  - [x] 1.1 Replace `.refine()` with a Zod v4 approach that keeps the schema as ZodObject (not ZodEffects) while still requiring at least one field
  - [x] 1.2 Add `.strict()` or `.strip()` to reject unknown properties
  - [x] 1.3 Update existing UpdateTodoSchema tests in `src/lib/schemas.test.ts` to cover: valid title-only, valid completed-only, valid both fields, reject empty object, reject unknown properties, reject whitespace-only title
- [x] Task 2: Create dynamic route file `src/app/api/todos/[id]/route.ts` (AC: #1, #2, #3, #4, #5)
  - [x] 2.1 Export `PATCH` handler: parse body as JSON, validate with UpdateTodoSchema, look up todo by id, update via Prisma, return serialized response
  - [x] 2.2 Export `DELETE` handler: look up todo by id, delete via Prisma, return `{ data: { id }, success: true }`
  - [x] 2.3 Handle not-found (Prisma `P2025` error code for record-not-found) — return 404 with `NOT_FOUND` code
  - [x] 2.4 Handle validation errors — return 400 with `VALIDATION_ERROR` code
  - [x] 2.5 Handle invalid JSON body — return 400 with `VALIDATION_ERROR` code
  - [x] 2.6 Handle unexpected errors — return 500 with `INTERNAL_ERROR` code
- [x] Task 3: Write integration tests in `src/__tests__/api/todos-id.test.ts` (AC: #6)
  - [x] 3.1 PATCH tests: update completed, update title, update both, reject empty body, reject unknown properties, reject invalid JSON, 404 for nonexistent id
  - [x] 3.2 DELETE tests: delete existing todo, 404 for nonexistent id
  - [x] 3.3 Verify response envelope format matches `{ data, success }` / `{ error, success }` contract
  - [x] 3.4 Verify dates are ISO 8601 strings in PATCH responses
- [x] Task 4: Verify no regressions — all existing tests pass, lint clean, build succeeds

### Review Findings
- [x] [Review][Defer] `fileParallelism: false` is global — slows all tests [vitest.config.ts:9] — deferred, pre-existing pattern choice

## Dev Notes

### Critical: UpdateTodoSchema Must Be Fixed First

The current `UpdateTodoSchema` in `src/lib/schemas.ts` uses `.refine()` which converts it to `ZodEffects`. This means `.shape`, `.pick()`, `.extend()`, `.partial()` won't work. This was flagged in deferred work from Stories 1.1 and 1.3.

**Current (broken for future use):**
```typescript
export const UpdateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
}).refine(data => data.title !== undefined || data.completed !== undefined, {
  message: 'At least one field (title or completed) must be provided',
});
```

**Required fix:** Use a Zod v4 approach that preserves the ZodObject type. Research the latest Zod v4 API for alternatives to `.refine()` that keep the object type (e.g., `z.object().check()` or custom validation in the route handler). If no clean Zod-only solution exists, validate at the route level after parsing.

Also add `.strip()` to prevent unknown properties from passing through (deferred from Story 1.3).

### Next.js 16 Dynamic Route Handler Signature

In Next.js 16, `params` is a **Promise** that must be awaited:

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

**Do NOT use the old synchronous pattern** — `params.id` directly will not work.

### API Response Pattern — Reuse Existing Helpers

Use the existing helpers from `src/lib/apiHelpers.ts`:

```typescript
import { successResponse, errorResponse } from '@/lib/apiHelpers';
```

- `successResponse(data, status?)` — wraps as `{ data, success: true }`
- `errorResponse(error, status?)` — wraps as `{ error, success: false }`

### Prisma Error Handling for Not-Found

Prisma `update` and `delete` throw a `PrismaClientKnownRequestError` with code `P2025` when the record doesn't exist. Catch this specifically:

```typescript
import { PrismaClientKnownRequestError } from '@/generated/prisma/client';

// In catch block:
if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
  return errorResponse({ message: 'Todo not found', code: 'NOT_FOUND' }, 404);
}
```

**Important:** Import `PrismaClientKnownRequestError` from the generated client at `@/generated/prisma/client`, not from `@prisma/client`.

### Reuse serializeTodo

The `serializeTodo` function exists in `src/app/api/todos/route.ts`. To avoid duplication, either:
- Extract it to `src/lib/apiHelpers.ts` and import in both route files, OR
- Re-import from the sibling route (less clean but acceptable)

The function converts Prisma `Date` objects to ISO strings:
```typescript
function serializeTodo(todo: PrismaTodo): Todo {
  return { ...todo, createdAt: todo.createdAt.toISOString(), updatedAt: todo.updatedAt.toISOString() };
}
```

### DELETE Response Format

Per AC#3, DELETE returns `{ data: { id }, success: true }` — NOT the full todo object. This is intentional (the record no longer exists).

### Integration Test Pattern

Follow the established pattern in `src/__tests__/api/todos.test.ts`:
- Use `// @vitest-environment node` directive at top of file
- Import from vitest: `describe, it, expect, beforeEach`
- Import `prisma` from `@/lib/prisma`
- `beforeEach` clears all todos with `await prisma.todo.deleteMany()`
- Create test todos inline with `await prisma.todo.create({ data: { title: '...' } })`
- Construct `Request` objects manually: `new Request('http://localhost/api/todos/ID', { method, headers, body })`
- Import route handlers directly: `import { PATCH, DELETE } from '@/app/api/todos/[id]/route'`
- Pass the second argument with params Promise: `PATCH(request, { params: Promise.resolve({ id }) })`

### File Structure

```
src/app/api/todos/
├── route.ts              # GET, POST (existing)
└── [id]/
    └── route.ts          # PATCH, DELETE (new — this story)

src/__tests__/api/
├── todos.test.ts         # Existing tests for GET/POST
└── todos-id.test.ts      # New tests for PATCH/DELETE (this story)
```

### Project Structure Notes

- Route file at `src/app/api/todos/[id]/route.ts` matches architecture spec exactly
- Test file at `src/__tests__/api/todos-id.test.ts` follows the existing `src/__tests__/api/` convention
- Schema changes remain in `src/lib/schemas.ts` (co-located with existing schemas)
- No new dependencies needed — all libraries already installed

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1] — Acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — PATCH/DELETE endpoints, response format, error codes
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — File organization for `[id]/route.ts`
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — Error handling chain, Zod validation → API handler
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — UpdateTodoSchema ZodEffects issue, extra properties issue
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-04-24.md#Action Items] — Fix UpdateTodoSchema targeted for Story 2.1
- [Source: node_modules/next/dist/docs — route handlers] — `params` is Promise in Next.js 16

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- PrismaClientKnownRequestError import: `@/generated/prisma/client` does not export it; correct path is `@/generated/prisma/internal/prismaNamespace`
- SQLite concurrency: integration test files must run sequentially (fileParallelism: false) to avoid database lock timeouts

### Completion Notes List

- Task 1: Replaced `.refine()` with Zod v4 `.check()` to preserve ZodObject type. Added `.strict()` to reject unknown properties. Expanded UpdateTodoSchema tests from 3 to 7 cases.
- Task 2: Created `src/app/api/todos/[id]/route.ts` with PATCH and DELETE handlers. Uses Next.js 16 async params pattern. Extracted `serializeTodo` to `apiHelpers.ts` for reuse across both route files.
- Task 3: Created 13 integration tests covering PATCH success (completed, title, both), validation errors (empty body, unknown props, invalid JSON), not-found (404), response envelope format, and ISO 8601 date strings. DELETE tests cover success, not-found, and envelope format.
- Task 4: All 57 tests pass with no regressions. Pre-existing TS errors in `todos.test.ts` (GET arg count) are unrelated.

### Change Log

- 2026-04-24: Implemented Story 2.1 — PATCH and DELETE endpoints for todos API

### File List

- src/lib/schemas.ts (modified) — Replaced .refine() with .strict().check() on UpdateTodoSchema
- src/lib/schemas.test.ts (modified) — Expanded UpdateTodoSchema tests to 7 cases
- src/lib/apiHelpers.ts (modified) — Added serializeTodo export
- src/app/api/todos/route.ts (modified) — Import serializeTodo from apiHelpers instead of defining locally
- src/app/api/todos/[id]/route.ts (new) — PATCH and DELETE route handlers
- src/__tests__/api/todos-id.test.ts (new) — 13 integration tests for PATCH/DELETE
- vitest.config.ts (modified) — Added fileParallelism: false for SQLite compatibility
