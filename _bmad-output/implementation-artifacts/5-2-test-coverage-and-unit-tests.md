# Story 5.2: Test Coverage & Unit Tests

Status: done

## Story

As a **developer**,
I want comprehensive unit and integration tests with at least 70% code coverage,
So that code quality is verifiable and regressions are caught.

## Acceptance Criteria

1. **Given** the test suite, **When** `npm run test:coverage` is executed, **Then** code coverage is at least 70%
2. **And** all unit tests pass (Zod schemas, API helpers, useTodos hook logic)
3. **And** all component tests pass (TodoForm, TodoItem, TodoList, EmptyState, Toast, ErrorBoundary)
4. **And** all integration tests pass (API route handlers with real SQLite test database)

## Tasks / Subtasks

- [x] Task 1: Install coverage dependency (AC: #1)
  - [x] 1.1 Install `@vitest/coverage-v8` as a devDependency — this is the ONLY missing piece to make `npm run test:coverage` work
  - [x] 1.2 Verify `npm run test:coverage` runs and produces a coverage report

- [x] Task 2: Add unit tests for `src/lib/apiHelpers.ts` (AC: #2)
  - [x] 2.1 Create `src/lib/apiHelpers.test.ts` co-located with source
  - [x] 2.2 Test `successResponse()` — returns NextResponse with `{data, success: true}` and correct status code (default 200, custom status)
  - [x] 2.3 Test `errorResponse()` — returns NextResponse with `{error: {message, code, details?}, success: false}` and correct status code
  - [x] 2.4 Test `serializeTodo()` — converts Prisma Date objects to ISO 8601 strings for createdAt and updatedAt

- [x] Task 3: Add missing useTodos hook test — optimistic timing verification (AC: #2)
  - [x] 3.1 In `src/hooks/useTodos.test.ts`, add test that verifies the todo is in state *before* the fetch resolves (use a deferred promise pattern — mock fetch to return a promise you control, assert state after hook call but before resolving the promise)
  - [x] 3.2 Add test for input refocus after submit if not already covered (verify the hook's flow triggers the expected sequence)

- [x] Task 4: Add page component test for `src/app/page.tsx` (AC: #3)
  - [x] 4.1 Create `src/app/page.test.tsx` — test that the page renders TodoForm, handles loading state (shows LoadingSpinner), handles empty state (shows EmptyState), and renders TodoList when todos exist
  - [x] 4.2 Mock the `useTodos` hook to return controlled state for each scenario
  - [x] 4.3 Test toast rendering — verify toasts appear when the onError callback fires

- [x] Task 5: Fill component test gaps (AC: #3)
  - [x] 5.1 Review existing component tests for coverage gaps — run coverage and identify untested branches
  - [x] 5.2 Add any missing branch coverage in TodoItem (edit mode edge cases), Toast (stacking, max toasts), TodoForm (empty submit prevention)
  - [x] 5.3 Verify LoadingSpinner test covers `aria-label="Loading tasks"` assertion

- [x] Task 6: Fix vitest.config.ts dotenv loading (AC: #1, #4)
  - [x] 6.1 The current `require('dotenv')` in `vitest.config.ts` can fail if the `.env.test` file doesn't exist and dotenv behaves unexpectedly — verify the conditional logic works correctly; fix if needed

- [x] Task 7: Verify coverage threshold and finalize (AC: #1)
  - [x] 7.1 Run `npm run test:coverage` — verify total coverage >= 70%
  - [x] 7.2 If below 70%, identify the lowest-coverage files and add targeted tests
  - [x] 7.3 Run `npm test` — all 125+ existing tests still pass (no regressions)
  - [x] 7.4 Run `npm run test:e2e` — all 9 E2E tests still pass (no regressions)

## Dev Notes

### Critical: Install @vitest/coverage-v8

`npm run test:coverage` currently fails because `@vitest/coverage-v8` is not installed:

```
MISSING DEPENDENCY  Cannot find dependency '@vitest/coverage-v8'
```

This is the **first thing to do**. Install it:
```bash
npm install --save-dev @vitest/coverage-v8
```

Do NOT change the coverage config in `vitest.config.ts` — the existing reporter and include/exclude settings are correct.

### Current Test Inventory (125 tests passing)

| File | Tests | What it covers |
|---|---|---|
| `src/lib/schemas.test.ts` | ~10 | CreateTodoSchema + UpdateTodoSchema validation |
| `src/hooks/useTodos.test.ts` | ~47 | Hook state, fetch, optimistic updates, rollback, onError |
| `src/components/TodoForm.test.tsx` | ~8 | Form submission, input clearing, empty submit |
| `src/components/TodoItem.test.tsx` | ~20 | Edit mode, toggle, delete, keyboard, styling |
| `src/components/TodoList.test.tsx` | ~5 | List rendering, checkbox states |
| `src/components/EmptyState.test.tsx` | ~2 | Text rendering |
| `src/components/LoadingSpinner.test.tsx` | ~2 | Spinner rendering |
| `src/components/Toast.test.tsx` | ~8 | Display, dismissal, auto-dismiss |
| `src/components/ErrorBoundary.test.tsx` | ~6 | Error catching, fallback UI, reload |
| `src/__tests__/api/todos.test.ts` | ~8 | GET/POST /api/todos |
| `src/__tests__/api/todos-id.test.ts` | ~10 | PATCH/DELETE /api/todos/:id |
| `src/__tests__/api/health.test.ts` | ~2 | GET /api/health |

### Files WITHOUT Tests (Coverage Gaps)

| File | Lines | Why it needs tests |
|---|---|---|
| `src/lib/apiHelpers.ts` | 20 | `successResponse`, `errorResponse`, `serializeTodo` — core API utilities, easy to unit test |
| `src/app/page.tsx` | 48 | Main page component orchestrating all subcomponents — integration point |
| `src/app/layout.tsx` | 22 | Root layout — low priority, mostly static metadata + ErrorBoundary wrapper |
| `src/lib/prisma.ts` | 18 | Prisma singleton — skip, testing database client initialization adds no value |
| `src/lib/types.ts` | 19 | Type-only file — no runtime behavior to test |

### Deferred Work Items Targeting This Story

From `_bmad-output/implementation-artifacts/deferred-work.md`, these are assigned to Story 5.2:

1. **No test for input refocus after submit** — Add test asserting `inputRef.current?.focus()` is called after TodoForm submission. This may be covered by E2E tests already (Story 5.1 covered this in e2e), but add a unit test for completeness.

2. **`useTodos` test doesn't verify optimistic timing** — The test awaits the full `addTodo` call, so it never asserts the todo is visible *before* the POST resolves. Add a deferred-promise test:
   ```typescript
   // Pattern: control when fetch resolves
   let resolveFetch: () => void;
   const fetchPromise = new Promise(resolve => { resolveFetch = resolve; });
   vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchPromise);
   // Call addTodo, assert todo is in state BEFORE resolving
   // Then resolve and verify final state
   ```

3. **Toast accumulates unboundedly** — This is a CODE FIX, not just a test. Cap toasts array to max 5 in `page.tsx`. Add test verifying the cap.

4. **Initial fetch error not clearable (no retry)** — This is a CODE FIX. Add a retry button when initial fetch fails. Add test verifying retry triggers re-fetch.

5. **`vitest.config.ts` conditional `require('dotenv')` may fail** — Verify and fix if needed. The config loads dotenv via `require()` only if `.env.test` exists, which should be safe since dotenv IS in devDependencies.

6. **`fileParallelism: false` disables test parallelism globally** — Evaluate but DO NOT change if it risks test instability. The sequential run is a known trade-off for SQLite-based integration tests. Document the reasoning if keeping.

### Testing Patterns to Follow

**Component tests** — co-located next to component file as `ComponentName.test.tsx`:
```typescript
import { render, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
// Use getByRole, getByText, getByPlaceholderText — NOT CSS selectors
```

**API route tests** — in `src/__tests__/api/` with `// @vitest-environment node` comment:
```typescript
// @vitest-environment node
import { GET, POST } from '@/app/api/todos/route';
// Create Request objects, call handlers directly, assert response
```

**Hook tests** — co-located as `hookName.test.ts`:
```typescript
// Mock globalThis.fetch, render hook via test component, use act() + waitFor()
```

**Unit tests** — co-located as `filename.test.ts`:
```typescript
// Direct function imports, simple input/output assertions
```

### Anti-Patterns — DO NOT

- **DO NOT** add `istanbul ignore` comments to inflate coverage — fix gaps with real tests
- **DO NOT** test implementation details (internal state shape) — test observable behavior
- **DO NOT** add snapshot tests — they're brittle and add no value for this project
- **DO NOT** import from `@prisma/client` in component/hook tests — mock the API boundary
- **DO NOT** use `any` type in test files — use proper typing or `unknown`
- **DO NOT** change the coverage threshold from the architecture spec (70%) — if exceeded, great, but don't lower it
- **DO NOT** modify working source code solely to make it more testable unless it's addressing a deferred-work bug fix (items 3 and 4 above)
- **DO NOT** create a global test setup file — the current per-file setup pattern works

### Architecture Compliance

- Test files co-located with source per architecture spec [Source: architecture.md — Structure Patterns]
- API integration tests in `src/__tests__/api/` [Source: architecture.md — Structure Patterns]
- Vitest for unit/component/integration, minimum 70% coverage [Source: architecture.md — Testing Architecture]
- Coverage via `npm run test:coverage` [Source: architecture.md — Development Workflow]
- `@/` import alias in all test imports [Source: architecture.md — Enforcement Guidelines]

### Previous Story Intelligence

**From Story 5.1 (E2E Test Suite):**
- 9 E2E tests pass covering all 5 user journeys
- `playwright.config.ts` was modified to set `workers: 1` and `fullyParallel: false` for shared SQLite DB
- Edit mode locator required using input within list element (not text span filter)
- Completed todo color assertion was unreliable in headless Chromium — tests use `text-decoration-line` + checkbox state instead
- `deleteAllTodos` helper is duplicated across spec files (deferred extraction)

**From Story 4.2 (Docker Compose):**
- 125 unit/component tests pass — this is the regression baseline
- Dev server works via `npm run dev`

### Git Intelligence

Recent commits show the project is mature with all 4 epics complete. The codebase has been through multiple rounds of code review with findings addressed. Testing patterns are well-established across 12 existing test files.

### Project Structure Notes

All test file locations follow the unified project structure:
- Component tests: `src/components/ComponentName.test.tsx` (co-located)
- Hook tests: `src/hooks/useTodos.test.ts` (co-located)
- Schema tests: `src/lib/schemas.test.ts` (co-located)
- API tests: `src/__tests__/api/*.test.ts` (dedicated folder)
- New tests should follow these exact patterns.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing Architecture, Development Workflow, Structure Patterns]
- [Source: _bmad-output/implementation-artifacts/5-1-e2e-test-suite.md — Previous story intelligence]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — Open items targeting Story 5.2]
- [Source: vitest.config.ts — Current coverage configuration]
- [Source: package.json — Missing @vitest/coverage-v8 dependency]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- TodoItem lines 53-54 remain uncovered by v8 — Escape keyDown causes React to unmount the input before jsdom can fire blur, so the escapePressedRef guard path is unreachable in jsdom. Functionally tested via the "Escape followed by blur does not trigger a save" test which validates the behavior through the observable outcome.

### Completion Notes List

- Installed `@vitest/coverage-v8` — `npm run test:coverage` now works and reports 88.65% statements / 90.39% lines (well above 70% threshold)
- Created `src/lib/apiHelpers.test.ts` with 7 unit tests covering successResponse, errorResponse, and serializeTodo
- Added optimistic timing verification test to useTodos using deferred promise pattern — proves todo appears in state before POST resolves
- Added retry functionality to useTodos hook (fetchKey + retry callback) — addresses deferred work item #4
- Added retry button to page.tsx error state — users can now recover from initial fetch failures
- Capped toasts at max 5 in page.tsx addToast callback — addresses deferred work item #3
- Added input refocus test to TodoForm (spy on focus method after submit)
- Created `src/app/page.test.tsx` with 11 tests covering loading, empty, error, retry, toast cap, and todo rendering states
- Added Escape+blur edge case test to TodoItem
- Added retry test to useTodos hook (verifies error clear + re-fetch)
- Verified vitest.config.ts dotenv loading is safe — conditional existsSync guard works correctly
- Final: 147 unit/component tests passing, 10 E2E tests passing, 0 regressions

### Implementation Plan

Red-green-refactor approach: wrote failing tests first for new test files (apiHelpers, page), then implemented. For code fixes (toast cap, retry), wrote the test first to confirm the gap, implemented the fix, then verified the test passes.

### Change Log

- Story 5.2 implementation — 2026-04-25
  - Added @vitest/coverage-v8 dependency
  - Created src/lib/apiHelpers.test.ts (7 tests)
  - Created src/app/page.test.tsx (11 tests)
  - Added optimistic timing test + retry test to src/hooks/useTodos.test.ts (2 tests)
  - Added refocus test to src/components/TodoForm.test.tsx (1 test)
  - Added Escape+blur edge case test to src/components/TodoItem.test.tsx (1 test)
  - Added retry() to useTodos hook (src/hooks/useTodos.ts)
  - Added retry button to error state in src/app/page.tsx
  - Capped toast accumulation to max 5 in src/app/page.tsx

### Review Findings

- [x] [Review][Patch] **No enforced coverage threshold in vitest.config.ts** — Fixed: added `thresholds: { statements: 70, lines: 70 }` to vitest.config.ts
- [x] [Review][Defer] **Retry doesn't abort in-flight fetch (no AbortController)** [src/hooks/useTodos.ts:35-67] — deferred, new code but `cancelled` flag handles correctness; only extra network requests on rapid retry
- [x] [Review][Defer] **No test for concurrent mutation + retry overlap** [src/hooks/useTodos.test.ts] — deferred, test gap where retry fetch could overwrite in-flight optimistic state

### File List

- src/lib/apiHelpers.test.ts (new)
- src/app/page.test.tsx (new)
- src/hooks/useTodos.test.ts (modified)
- src/hooks/useTodos.ts (modified — added retry)
- src/app/page.tsx (modified — toast cap, retry button)
- src/components/TodoForm.test.tsx (modified)
- src/components/TodoItem.test.tsx (modified)
- package.json (modified — added @vitest/coverage-v8)
- package-lock.json (modified)
