# Security Review

**Date:** 2026-04-25
**Scope:** Full codebase audit — XSS, SQL injection, input validation, error handling, security headers

## XSS Prevention — PASS

- **`dangerouslySetInnerHTML`**: Zero instances in `src/` (verified via codebase grep)
- **User text rendering**: All user-supplied text (`todo.title`) renders through JSX expressions with React auto-escaping
- **Dangerous APIs**: No `eval()`, `Function()`, or `innerHTML` usage in production code (one `innerHTML` reference exists in a test assertion only)

**Evidence:** Grep of `src/` for `dangerouslySetInnerHTML`, `eval(`, `Function(`, `.innerHTML` — zero production hits.

## SQL Injection Prevention — PASS

- **ORM usage**: All database access uses Prisma client methods (`prisma.todo.findMany()`, `.create()`, `.update()`, `.delete()`)
- **Raw queries**: No `$queryRaw` or `$executeRaw` in application code (references exist only in Prisma's generated documentation comments)
- **Parameterization**: Prisma generates parameterized queries automatically

**Evidence:** Grep of `src/` for `$queryRaw`, `$executeRaw` — only matches in `src/generated/prisma/` (auto-generated code docs).

## Input Validation — PASS

| Endpoint | Schema | Constraints |
|---|---|---|
| `POST /api/todos` | `CreateTodoSchema` | `title`: string, trimmed, min 1, max 500 |
| `PATCH /api/todos/[id]` | `UpdateTodoSchema` | `title`: string, trimmed, min 1, max 500 (optional); `completed`: boolean (optional); strict mode; at least one field required |
| `DELETE /api/todos/[id]` | URL param `id` | String from URL, passed to Prisma `where` clause (Prisma handles type safety) |

- Both schemas applied via `safeParse()` before any database operation
- Invalid input returns `400` with `VALIDATION_ERROR` code and field-level Zod issue details
- `UpdateTodoSchema` uses `.strict()` to reject unknown properties

**Evidence:** `src/lib/schemas.ts`, `src/app/api/todos/route.ts`, `src/app/api/todos/[id]/route.ts`.

## Error Response Handling — PASS

- **Sanitized responses**: All API catch blocks return `errorResponse()` from `src/lib/apiHelpers.ts`
- **Generic messages**: Internal errors use `{ message: 'Internal server error', code: 'INTERNAL_ERROR' }` — no stack traces, file paths, or query structures
- **Typed error codes**: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500)
- **JSON parse errors**: `SyntaxError` caught and returned as `VALIDATION_ERROR` with "Invalid JSON body" message

**Evidence:** All catch blocks in `src/app/api/todos/route.ts` and `src/app/api/todos/[id]/route.ts`.

## Security Headers — PASS (configured in this story)

Headers added to `next.config.ts` via the `headers()` async function, applied to all routes (`/(.*)`):

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframes |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |

**Verification:**
- `curl -I http://localhost:3000` — all three headers present on page responses
- `curl -I http://localhost:3000/api/todos` — all three headers present on API responses
- E2E tests in `e2e/security-headers.spec.ts` — 2 tests verifying headers on both page and API routes

## Summary

| Area | Status | Notes |
|---|---|---|
| XSS Prevention | PASS | React auto-escaping, no dangerous APIs |
| SQL Injection Prevention | PASS | Prisma ORM, no raw queries |
| Input Validation | PASS | Zod schemas on all write endpoints |
| Error Response Handling | PASS | Sanitized via `errorResponse()` helper |
| Security Headers | PASS | Configured in `next.config.ts` |
