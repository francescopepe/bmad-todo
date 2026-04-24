# Story 1.3: Health Check Endpoint

Status: done

## Story

As a **DevOps engineer**,
I want a health check endpoint,
So that Docker can monitor application status.

## Acceptance Criteria

1. **Given** the application is running **When** a GET request is sent to `/api/health` **Then** the response is `{ status: "ok", timestamp: "<ISO 8601>" }` with status 200

2. **And** an integration test validates the health check response

## Tasks / Subtasks

- [x] Task 1: Create the health check route handler (AC: #1)
  - [x] Create `src/app/api/health/route.ts`
  - [x] Implement `GET` handler returning `{ status: "ok", timestamp: "<ISO 8601>" }` with 200
  - [x] Use `NextResponse.json()` directly (this endpoint has its own response shape — NOT the `{ data, success }` envelope)

- [x] Task 2: Write integration test (AC: #2)
  - [x] Create `src/__tests__/api/health.test.ts`
  - [x] Test GET success — returns 200 with `{ status: "ok", timestamp }` shape
  - [x] Test timestamp is valid ISO 8601 string
  - [x] Verify response Content-Type is `application/json`

- [x] Task 3: Run full test suite and verify (AC: #1, #2)
  - [x] Confirm `npm test` passes all new + existing tests (expect 15+ total: 6 schema + 8 todo API + health)
  - [x] Confirm `npm run lint` passes
  - [x] Verify with `curl http://localhost:3000/api/health` against running dev server

### Review Findings

- [x] [Review][Defer] `.refine()` changes UpdateTodoSchema to ZodEffects — `.shape`, `.pick()`, `.extend()` will not work on the refined schema; address when consumed in Story 2-1 [`src/lib/schemas.ts:10`] — deferred, pre-existing
- [x] [Review][Defer] Extra/unknown properties pass through UpdateTodoSchema — no `.strict()` or `.strip()` on `z.object()`; unexpected keys survive parsing [`src/lib/schemas.ts:7`] — deferred, pre-existing

## Dev Notes

### Critical: Response Shape

The health check endpoint does **NOT** use the standard `{ data, success }` API envelope from `apiHelpers.ts`. Per architecture spec, it returns a flat object:

```typescript
{ status: "ok", timestamp: "2026-04-24T12:00:00.000Z" }
```

Use `NextResponse.json()` directly instead of `successResponse()`.

### Critical: No Database Dependency

This endpoint must NOT import or use Prisma. It is a simple liveness probe — if the Node.js process is running and can respond to HTTP, the health check passes. Do NOT add database connectivity checks.

### Critical: Next.js 16 Route Handler Signature

```typescript
// Health check has no dynamic segments and no request body
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Note: `GET` handler does not need a `request` parameter if unused.

### Docker Context

This endpoint is consumed by Docker's `HEALTHCHECK` directive:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

The endpoint must:
- Always return HTTP 200 when the app is running
- Be fast (no database calls, no external dependencies)
- Return valid JSON (Docker doesn't check the body, but the spec requires it)

### Integration Test Strategy

Follow the same pattern established in Story 1.2's tests (`src/__tests__/api/todos.test.ts`):
- Use `// @vitest-environment node` directive at the top
- Import `GET` from `@/app/api/health/route`
- Call the handler directly (no running server needed)
- No `beforeEach` cleanup needed — this endpoint has no state

```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns 200 with status ok and ISO timestamp', async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeDefined();
    // Verify timestamp is valid ISO 8601
    expect(() => new Date(json.timestamp).toISOString()).not.toThrow();
  });
});
```

### Existing Patterns to Follow

| Pattern | Source | Notes |
|---|---|---|
| Route file location | `src/app/api/health/route.ts` | Matches architecture project structure |
| Test file location | `src/__tests__/api/health.test.ts` | Matches co-location pattern from Story 1.2 |
| Export convention | `export async function GET()` | Uppercase, Next.js convention |
| Import alias | `@/` for all `src/` imports | Never relative `../` |
| Vitest environment | `// @vitest-environment node` | Required for route handler tests |

### Naming Conventions (MUST follow)

- Route file: `route.ts` (Next.js convention)
- Test file: `health.test.ts` in `src/__tests__/api/`
- Function export: `GET` (uppercase, Next.js convention)
- Import alias: `@/` for all `src/` imports
- No `any` type — use `unknown` then narrow
- No `console.log`

### Anti-Patterns (FORBIDDEN)

- Do NOT use `successResponse()` / `errorResponse()` — health check has its own response shape
- Do NOT import Prisma — no database dependency for health checks
- Do NOT add error handling or try/catch — if the process is running, the endpoint works
- Do NOT add additional fields beyond `status` and `timestamp` (no version, uptime, etc.)
- Do NOT create middleware or shared health check utilities
- Do NOT install any new packages

### Previous Story Learnings

**From Story 1.1:**
- Prisma v7 uses LibSQL adapter; client generated at `src/generated/prisma/client` — NOT relevant to this story (no DB needed)
- Next.js 16 uses async `params` in route handlers — NOT relevant (no dynamic segments)

**From Story 1.2:**
- Vitest integration tests work well by importing route handlers directly
- Use `// @vitest-environment node` directive for API route tests
- The `Request` constructor pattern works for testing, but health check `GET` needs no request parameter
- Zod v4 uses `.issues` not `.errors` — NOT relevant (no validation in health check)

### Project Structure Notes

After this story, the API structure should be:

```
src/app/api/
├── health/
│   └── route.ts          # NEW — GET (health check)
└── todos/
    └── route.ts          # Existing — GET (list), POST (create)

src/__tests__/api/
├── health.test.ts        # NEW — health check test
└── todos.test.ts         # Existing — todo API tests
```

### References

- [Source: architecture.md#API & Communication Patterns — health check endpoint spec]
- [Source: architecture.md#Infrastructure & Deployment — Docker HEALTHCHECK directive]
- [Source: architecture.md#Project Structure — file locations]
- [Source: architecture.md#Implementation Patterns — naming conventions]
- [Source: epics.md#Story 1.3 — acceptance criteria]
- [Source: Story 1.2 — integration test patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Task 1: Created `src/app/api/health/route.ts` with a minimal `GET` handler returning `{ status: "ok", timestamp }` using `NextResponse.json()` directly (no API envelope, no Prisma, no error handling per spec).
- Task 2: Created `src/__tests__/api/health.test.ts` with 3 integration tests — response shape, ISO 8601 timestamp validity, and Content-Type header verification. Follows the same vitest-environment node pattern from Story 1.2.
- Task 3: Full test suite passes (17 tests: 6 schema + 8 todo API + 3 health). Lint passes clean. Verified via `curl` against running dev server — returns expected JSON.

### File List

- `src/app/api/health/route.ts` (NEW) — health check GET route handler
- `src/__tests__/api/health.test.ts` (NEW) — integration tests for health endpoint

### Change Log

- 2026-04-24: Implemented Story 1.3 — health check endpoint with integration tests. All ACs satisfied.
