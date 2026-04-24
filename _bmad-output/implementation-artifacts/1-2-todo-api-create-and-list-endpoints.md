# Story 1.2: Todo API — Create & List Endpoints

Status: done

## Story

As a **user**,
I want to create tasks and retrieve my task list via API,
So that my tasks are stored and retrievable.

## Acceptance Criteria

1. **Given** the API is running **When** a POST request is sent to `/api/todos` with `{ "title": "Buy groceries" }` **Then** a new todo is created in the database **And** the response is `{ data: { id, title, completed: false, createdAt, updatedAt }, success: true }` with status 201

2. **Given** the API is running **When** a POST request is sent to `/api/todos` with an empty title `{ "title": "" }` **Then** the response is `{ error: { message, code: "VALIDATION_ERROR", details }, success: false }` with status 400

3. **Given** todos exist in the database **When** a GET request is sent to `/api/todos` **Then** all todos are returned as `{ data: Todo[], success: true }` with status 200 **And** todos are ordered by createdAt descending (newest first)

4. **Given** no todos exist in the database **When** a GET request is sent to `/api/todos` **Then** the response is `{ data: [], success: true }` with status 200

5. Integration tests exist for both endpoints covering success and error cases

## Tasks / Subtasks

- [x] Task 1: Create the GET and POST route handler (AC: #1, #3, #4)
  - [x] Create `src/app/api/todos/route.ts`
  - [x] Implement `GET` handler — query all todos, ordered by `createdAt` descending
  - [x] Implement `POST` handler — validate body with `CreateTodoSchema`, create todo, return 201
  - [x] Serialize Prisma `Date` fields to ISO 8601 strings in responses (see Dev Notes)

- [x] Task 2: Implement validation error handling (AC: #2)
  - [x] Catch Zod validation errors in POST handler
  - [x] Return `{ error: { message, code: "VALIDATION_ERROR", details }, success: false }` with 400
  - [x] Test: empty title, whitespace-only title, missing body, title > 500 chars

- [x] Task 3: Fix deferred issue — UpdateTodoSchema empty object (AC: n/a, deferred from 1.1)
  - [x] Add `.refine()` to `UpdateTodoSchema` requiring at least one field
  - [x] Update the schema test in `src/lib/schemas.test.ts`

- [x] Task 4: Write integration tests (AC: #5)
  - [x] Create `src/__tests__/api/todos.test.ts`
  - [x] Test POST success — valid title returns 201 with correct shape
  - [x] Test POST validation — empty title returns 400 with VALIDATION_ERROR
  - [x] Test POST validation — whitespace-only title returns 400
  - [x] Test POST validation — missing body returns 400
  - [x] Test GET success — returns todos ordered by createdAt desc
  - [x] Test GET empty — returns `{ data: [], success: true }` with 200
  - [x] Use real SQLite test database (not mocks)

- [x] Task 5: Verify end-to-end manually (AC: #1–#4)
  - [x] `npm run dev` and test with curl or similar
  - [x] Confirm `npm test` passes all new + existing tests
  - [x] Confirm `npm run lint` passes

## Dev Notes

### Critical: Prisma Date → String Serialization

**Deferred from Story 1.1** — The `Todo` interface in `src/lib/types.ts` types `createdAt`/`updatedAt` as `string`, but Prisma returns `Date` objects. You MUST serialize dates when building API responses.

Pattern to use:

```typescript
function serializeTodo(todo: PrismaTodo): Todo {
  return {
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
```

Where `PrismaTodo` is the Prisma-generated type (import from `@/generated/prisma/client`). Place this helper in the route file or in `src/lib/apiHelpers.ts` if you prefer (it will be reused by Story 2.1's PATCH/DELETE routes).

### Critical: Prisma 7 Import Path

Prisma 7 generates the client to `src/generated/prisma/`. The correct import is:

```typescript
import { prisma } from '@/lib/prisma';
```

The Prisma client singleton already exists in `src/lib/prisma.ts` — use it, do NOT create a new one. The PrismaClient type and model types come from `@/generated/prisma/client`.

### Critical: Next.js 16 Route Handler Signature

In Next.js 16, `params` in route handlers is a **Promise** that must be awaited. This story's routes (`/api/todos`) have no dynamic segments, so the second parameter is not needed. But for reference (Story 2.1 will need it for `[id]`):

```typescript
// For routes WITHOUT dynamic segments (this story):
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }

// For routes WITH dynamic segments (Story 2.1):
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}
```

### Existing Utilities to Reuse

**DO NOT recreate these — they already exist from Story 1.1:**

| File | Exports | Purpose |
|---|---|---|
| `src/lib/apiHelpers.ts` | `successResponse(data, status)`, `errorResponse(error, status)` | Wrap API responses in consistent envelope |
| `src/lib/schemas.ts` | `CreateTodoSchema`, `UpdateTodoSchema` | Zod validation schemas |
| `src/lib/types.ts` | `Todo`, `ApiResponse<T>`, `ApiError` | Shared TypeScript interfaces |
| `src/lib/prisma.ts` | `prisma` | Prisma client singleton (LibSQL adapter) |

### API Response Format (MUST follow exactly)

```typescript
// Success — POST creates with 201, GET returns 200
successResponse(data, 201) // POST
successResponse(data, 200) // GET (default)

// Validation error — 400
errorResponse({ message: "Validation failed", code: "VALIDATION_ERROR", details: zodError.errors }, 400)

// Internal error — 500 (catch-all, do NOT expose stack traces)
errorResponse({ message: "Internal server error", code: "INTERNAL_ERROR" }, 500)
```

### Deferred Fix: UpdateTodoSchema

The `UpdateTodoSchema` currently accepts `{}` (empty object) as valid since both fields are optional. Add a refinement:

```typescript
export const UpdateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
}).refine(data => data.title !== undefined || data.completed !== undefined, {
  message: "At least one field (title or completed) must be provided",
});
```

Update the existing test in `src/lib/schemas.test.ts` to verify `{}` is rejected.

### File Structure After This Story

```
src/app/api/
└── todos/
    └── route.ts          # NEW — GET (list), POST (create)

src/__tests__/api/
└── todos.test.ts         # NEW — integration tests
```

### Integration Test Strategy

Tests MUST use a real SQLite database, NOT mocks. The project has `.env.test` with `DATABASE_URL=file:./test.db`.

**Test isolation approach:**
- Before each test (or test suite), clear the `Todo` table using `prisma.todo.deleteMany()`
- Import `prisma` from `@/lib/prisma` for test setup/teardown
- Call the route handlers directly (import `GET`/`POST` from the route file) or use `fetch` against a running dev server — direct import is preferred for speed and isolation

**Important:** When importing route handlers directly for testing, create a `Request` object:

```typescript
const request = new Request('http://localhost/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Test todo' }),
});
const response = await POST(request);
const data = await response.json();
```

### Naming Conventions (MUST follow)

- Route file: `route.ts` (Next.js convention)
- Test file: `todos.test.ts` (in `src/__tests__/api/`)
- Function exports: `GET`, `POST` (uppercase, Next.js convention)
- Import alias: `@/` for all `src/` imports — never relative `../`
- No `any` type — use `unknown` then narrow
- No `console.log` — use proper error handling

### Anti-Patterns (FORBIDDEN)

- Do NOT create React components — that's Story 1.4+
- Do NOT create a `useTodos` hook — that's Story 1.5
- Do NOT create `[id]/route.ts` — that's Story 2.1 (PATCH/DELETE)
- Do NOT install any new packages — everything needed is already installed
- Do NOT use raw SQL — use Prisma's typed query API
- Do NOT use `try/catch` with generic "Something went wrong" — differentiate validation errors from database errors
- Do NOT return Prisma objects directly — serialize dates to ISO strings

### Project Structure Notes

- Alignment with architecture: `src/app/api/todos/route.ts` matches the defined project structure exactly [Source: architecture.md#Project Structure]
- Integration tests go in `src/__tests__/api/` per the co-location rules [Source: architecture.md#Structure Patterns]
- The `src/__tests__/` directory does not exist yet — create it

### References

- [Source: architecture.md#API & Communication Patterns — route structure, response format, error codes]
- [Source: architecture.md#Implementation Patterns — naming conventions, anti-patterns]
- [Source: architecture.md#Project Structure — file locations for routes and tests]
- [Source: architecture.md#Data Architecture — Prisma schema, Zod schemas, shared types]
- [Source: epics.md#Story 1.2 — acceptance criteria]
- [Source: deferred-work.md — UpdateTodoSchema empty object fix, Date serialization]
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md — Next.js 16 Route Handler API]
- [Source: Story 1.1 Dev Agent Record — Prisma v7 uses LibSQL adapter, client at @/generated/prisma/client]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Zod v4 uses `.issues` instead of `.errors` for validation error details — fixed during implementation.

### Completion Notes List

- Created `src/app/api/todos/route.ts` with GET and POST handlers using existing `prisma`, `CreateTodoSchema`, `successResponse`, and `errorResponse` utilities.
- Implemented `serializeTodo()` helper to convert Prisma Date objects to ISO 8601 strings, matching the `Todo` interface's string-typed date fields.
- GET returns todos ordered by `createdAt` descending; POST validates with Zod and returns 201 on success, 400 on validation error, 500 on internal error. Invalid JSON bodies are caught and returned as validation errors.
- Fixed deferred `UpdateTodoSchema` issue — added `.refine()` to reject empty objects. Updated existing test accordingly.
- Created comprehensive integration tests in `src/__tests__/api/todos.test.ts` (7 tests) using real SQLite test database, testing all acceptance criteria.
- All 13 tests pass (6 existing schema tests + 7 new integration tests). Lint is clean.
- Verified end-to-end with `curl` against running dev server — POST creates todos correctly, GET lists them in correct order, validation errors return proper format.

### Change Log

- 2026-04-24: Implemented Story 1.2 — Todo API Create & List Endpoints (all 5 tasks complete)

### Review Findings

- [x] [Review][Patch] Missing test for invalid JSON body — SyntaxError catch branch in POST handler is untested; add a test sending non-JSON body (e.g., `body: "not json"`) [src/__tests__/api/todos.test.ts]
- [x] [Review][Defer] No structured error logging in handlers — both GET and POST swallow errors silently with no logging; pre-existing architectural gap, not caused by this change [src/app/api/todos/route.ts]

### File List

- `src/app/api/todos/route.ts` (NEW) — GET and POST route handlers
- `src/__tests__/api/todos.test.ts` (NEW) — Integration tests for both endpoints
- `src/lib/schemas.ts` (MODIFIED) — Added `.refine()` to `UpdateTodoSchema`
- `src/lib/schemas.test.ts` (MODIFIED) — Updated test: empty object now rejected
