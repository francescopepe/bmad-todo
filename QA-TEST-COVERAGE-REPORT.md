# QA Test Coverage Report

**Date:** 2026-04-25
**Project:** Awesome Todo
**Tool:** Vitest 4.1.5 + @vitest/coverage-v8

## Summary

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Statement Coverage | 70% | 88.65% | EXCEEDS |
| Line Coverage | 70% | 90.39% | EXCEEDS |
| Unit/Component Tests | — | 147 passing | — |
| E2E Tests | 5+ | 16 passing | EXCEEDS |
| Total Automated Tests | — | 163 | — |

Coverage thresholds are enforced in `vitest.config.ts` — builds fail if statements or lines drop below 70%.

## Coverage by Module

| Module | Tests | Coverage Notes |
|--------|-------|---------------|
| `src/lib/schemas.ts` | ~10 | CreateTodoSchema + UpdateTodoSchema validation |
| `src/lib/apiHelpers.ts` | 7 | successResponse, errorResponse, serializeTodo |
| `src/hooks/useTodos.ts` | ~47 | State, fetch, optimistic updates, rollback, retry, onError |
| `src/components/TodoForm.tsx` | ~8 | Submission, input clearing, empty submit, refocus |
| `src/components/TodoItem.tsx` | ~20 | Edit mode, toggle, delete, keyboard, hover-reveal |
| `src/components/TodoList.tsx` | ~5 | List rendering, checkbox states |
| `src/components/EmptyState.tsx` | ~2 | Text rendering |
| `src/components/LoadingSpinner.tsx` | ~2 | Spinner rendering, aria-label |
| `src/components/Toast.tsx` | ~8 | Display, dismissal, auto-dismiss, stacking |
| `src/components/ErrorBoundary.tsx` | ~6 | Error catching, fallback UI, reload |
| `src/app/page.tsx` | 11 | Loading, empty, error, retry, toast cap, todo rendering |
| `src/__tests__/api/todos.test.ts` | ~8 | GET/POST /api/todos |
| `src/__tests__/api/todos-id.test.ts` | ~10 | PATCH/DELETE /api/todos/[id] |
| `src/__tests__/api/health.test.ts` | ~2 | GET /api/health |

## E2E Test Suites (Playwright)

| Suite | Tests | Coverage |
|-------|-------|----------|
| `e2e/todo-crud.spec.ts` | 9 | Create (Enter + button), complete, toggle back, edit (button + click), cancel edit, delete |
| `e2e/empty-state.spec.ts` | 2 | Empty state display, disappears after adding task |
| `e2e/accessibility.spec.ts` | 4 | axe-core audit on 4 page states (empty, with todos, edit mode, error/toast) |
| `e2e/security-headers.spec.ts` | 2 | Security headers on page and API responses |

## Known Coverage Gaps

| File | Reason | Mitigation |
|------|--------|------------|
| `src/components/TodoItem.tsx` lines 53-54 | jsdom cannot fire contentEditable keyboard events — Escape keyDown causes React to unmount input before blur fires | Covered by E2E tests in Playwright |
| `src/app/layout.tsx` | Static metadata + ErrorBoundary wrapper — no runtime logic to test | Low risk, no mitigation needed |
| `src/lib/prisma.ts` | Database client singleton initialization — testing adds no value | Low risk |
| `src/lib/types.ts` | Type-only file — no runtime behavior | N/A |

## FR/NFR Traceability

| Requirement | Test Type | Evidence |
|-------------|-----------|----------|
| FR1 (create task) | Unit + E2E | TodoForm.test.tsx, useTodos.test.ts, todo-crud.spec.ts |
| FR2 (view all tasks) | Unit + E2E | TodoList.test.tsx, page.test.tsx, todo-crud.spec.ts |
| FR3 (mark completed) | Unit + E2E | TodoItem.test.tsx, useTodos.test.ts, todo-crud.spec.ts |
| FR4 (reactivate task) | Unit + E2E | TodoItem.test.tsx, useTodos.test.ts, todo-crud.spec.ts |
| FR5 (edit task) | Unit + E2E | TodoItem.test.tsx, useTodos.test.ts, todo-crud.spec.ts |
| FR6 (delete task) | Unit + E2E | TodoItem.test.tsx, useTodos.test.ts, todo-crud.spec.ts |
| FR7 (visual distinction) | Unit + E2E | TodoItem.test.tsx, todo-crud.spec.ts |
| FR8-11 (persistence) | Integration + E2E | todos.test.ts, todos-id.test.ts |
| FR12-15 (optimistic feedback) | Unit | useTodos.test.ts (optimistic timing test) |
| FR16-17 (error notification + rollback) | Unit | useTodos.test.ts (rollback tests), Toast.test.tsx |
| FR18 (error boundary) | Unit | ErrorBoundary.test.tsx |
| FR19 (empty state) | Unit + E2E | EmptyState.test.tsx, empty-state.spec.ts |
| FR20 (loading state) | Unit | LoadingSpinner.test.tsx, page.test.tsx |
| FR21 (error state) | Unit | page.test.tsx (error + retry) |
| FR22-24 (responsive) | E2E | Validated via Playwright viewport |
| FR25-28 (REST API) | Integration | todos.test.ts, todos-id.test.ts |
| FR29 (input validation) | Unit + Integration | schemas.test.ts, todos.test.ts |
| FR30 (response envelopes) | Unit + Integration | apiHelpers.test.ts, todos.test.ts |
| FR31-32 (Docker) | Manual | Verified in Story 4.1/4.2 |
| NFR1 (optimistic <100ms) | Unit | useTodos.test.ts (deferred promise timing test) |
| NFR6-8 (security) | E2E + Review | security-headers.spec.ts, SECURITY-REVIEW.md |
| NFR9-12 (accessibility) | E2E | accessibility.spec.ts (axe-core) |
| NFR13-16 (reliability) | Unit + Integration | useTodos.test.ts (rollback), ErrorBoundary.test.tsx |
