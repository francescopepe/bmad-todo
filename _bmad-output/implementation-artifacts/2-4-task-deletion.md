# Story 2.4: Task Deletion

Status: done

## Story

As a **user**,
I want to delete tasks I no longer need,
so that my list stays relevant.

## Acceptance Criteria

1. **Delete removes task immediately:** Given a task is displayed in the list, when the user clicks the Delete button, then the task is removed from the list immediately (optimistic) and the API DELETE fires in the background.

2. **Rollback on failure:** Given a delete API call fails, when the server returns an error, then the task reappears in the list at its original position and a toast notification appears with message "Couldn't delete task. Try again."

3. **Component tests:** Component tests exist for TodoItem delete behavior.

## Tasks / Subtasks

- [x] Task 1: Add Delete button to TodoItem component (AC: #1)
  - [x] 1.1 Add `onDelete: (id: string) => void` prop to `TodoItemProps` interface
  - [x] 1.2 Add a "Delete" button next to the Edit button inside the existing hover-reveal `<div>` container
  - [x] 1.3 Style as destructive button: transparent background, gray border, gray text at rest; red text (`text-error`) on hover (`hover:text-error-hover hover:border-error-hover`)
  - [x] 1.4 Match sizing of Edit button: `min-h-[44px] min-w-[44px]`, `text-[0.875rem] font-medium`, `rounded border px-3 py-1`
  - [x] 1.5 Add small gap between Edit and Delete buttons (`gap-2`)
  - [x] 1.6 Button has accessible text label "Delete"
  - [x] 1.7 Hide Delete button in edit mode (only show when `!isEditing`)

- [x] Task 2: Wire onDelete through TodoList (AC: #1)
  - [x] 2.1 Add `onDelete: (id: string) => void` to `TodoListProps` interface
  - [x] 2.2 Pass `onDelete` to each `<TodoItem>` in the map

- [x] Task 3: Implement deleteTodo in useTodos hook (AC: #1, #2)
  - [x] 3.1 Replace the `deleteTodo` stub with full optimistic delete implementation
  - [x] 3.2 Find target todo in `todosRef.current`; bail if not found
  - [x] 3.3 Save current todos array via `todosRef.current` for rollback (preserves position)
  - [x] 3.4 Apply optimistic removal: `setTodos(prev => prev.filter(t => t.id !== id))`
  - [x] 3.5 Fire `DELETE /api/todos/${id}`
  - [x] 3.6 On success (res.ok): no-op — todo already removed from UI
  - [x] 3.7 On failure (non-ok response or network error): rollback to saved array + `options?.onError?.("Couldn't delete task. Try again.")`
  - [x] 3.8 Add `options?.onError` to useCallback dependency array

- [x] Task 4: Wire deleteTodo in page.tsx (AC: #1)
  - [x] 4.1 Destructure `deleteTodo` from `useTodos()` return (currently unused)
  - [x] 4.2 Add `onDelete` prop to `<TodoList>` passing `deleteTodo`

- [x] Task 5: Write component tests for delete behavior (AC: #3)
  - [x] 5.1 Test: Delete button is rendered with accessible "Delete" text label
  - [x] 5.2 Test: clicking Delete button calls onDelete with todo.id
  - [x] 5.3 Test: Delete button is NOT visible in edit mode
  - [x] 5.4 Test: Delete button has destructive hover styling classes

- [x] Task 6: Write hook tests for deleteTodo (AC: #1, #2)
  - [x] 6.1 Test: deleteTodo fires DELETE to `/api/todos/{id}` and removes todo from local state on success
  - [x] 6.2 Test: deleteTodo rolls back (todo reappears) on API error response and calls onError
  - [x] 6.3 Test: deleteTodo rolls back on network error and calls onError
  - [x] 6.4 Test: deleteTodo does nothing for non-existent todo id

- [x] Task 7: Update TodoList tests (AC: #3)
  - [x] 7.1 Update all existing TodoList test renders to pass `onDelete={noop}` prop
  - [x] 7.2 Verify existing tests still pass with the new prop

- [x] Task 8: Verify no regressions
  - [x] 8.1 All existing tests pass (update count from 82+)
  - [x] 8.2 Build succeeds, TypeScript clean
  - [x] 8.3 Manual verification: toggle, add, edit, and existing flows still work

## Dev Notes

### CRITICAL: deleteTodo Is a Stub — Must Be Implemented

The `useTodos` hook at `src/hooks/useTodos.ts:177` currently has `deleteTodo` as an empty stub:
```typescript
const deleteTodo: UseTodosReturn['deleteTodo'] = useCallback(async () => {}, []);
```

Replace with full optimistic delete implementation. The pattern is similar to `toggleTodo` and `updateTodo` but simpler — instead of per-item save/restore, save the entire array (via `todosRef.current`) and restore it on failure. This automatically preserves the task's original position.

**Implementation pattern:**
```typescript
const deleteTodo = useCallback(async (id: string) => {
  const todo = todosRef.current.find((t) => t.id === id);
  if (!todo) return;

  const savedTodos = todosRef.current;

  // Optimistic removal
  setTodos((prev) => prev.filter((t) => t.id !== id));

  try {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      setTodos(savedTodos);
      options?.onError?.("Couldn't delete task. Try again.");
    }
  } catch {
    setTodos(savedTodos);
    options?.onError?.("Couldn't delete task. Try again.");
  }
}, [options?.onError]);
```

**Key difference from toggle/update:** No need to parse the response body on success. The DELETE endpoint returns `{ data: { id }, success: true }` but the UI doesn't need it — the todo is already removed.

### CRITICAL: Delete Button Placement — Same Hover-Reveal Container as Edit

The Edit button is already inside a hover-reveal `<div>` at `src/components/TodoItem.tsx:94`:
```tsx
<div className="[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100 transition-opacity duration-200">
```

Add the Delete button **inside this same container** next to the Edit button. Add `flex gap-2` to the container to space the buttons. Both buttons share the same hover-reveal behavior.

### Delete Button Styling — Destructive Pattern

Per UX spec Button Hierarchy:
- **At rest:** Identical to Edit button (transparent bg, gray border `border-text-secondary`, gray text `text-text-secondary`)
- **On hover:** Red text and border (`hover:text-error-hover hover:border-error-hover`)
- This differentiates the destructive action without making the default state visually alarming

### No Confirmation Dialog

Per UX spec Flow Optimization Principles: "No confirmation dialogs — Delete is immediate. No 'Are you sure?' interruptions. Speed over safety for low-stakes personal data."

### API Endpoint Already Exists

The DELETE endpoint at `src/app/api/todos/[id]/route.ts:59-86` is fully implemented (Story 2.1). It:
- Accepts `DELETE /api/todos/{id}`
- Deletes the todo from the database
- Returns `{ data: { id }, success: true }` with status 200
- Returns 404 with `NOT_FOUND` code if todo doesn't exist
- No request body needed

### Toast Already Wired

The Toast component and `onError` callback are already wired in `page.tsx`. Use the same pattern as toggle/update: `options?.onError?.("Couldn't delete task. Try again.")`.

### Tailwind v4 — Design Token Reminders

This project uses **Tailwind CSS v4** with `@theme inline` in `src/app/globals.css`. Relevant tokens:
- `text-text-secondary` / `border-text-secondary` — button default gray
- `text-error` — destructive red (#DC2626)
- `text-error-hover` — destructive hover red (#B91C1C)
- `border-error-hover` — use for hover border color

### Import Pattern — Use @/ Alias

All imports must use the `@/` alias. Never use relative paths with `../`.

### Testing Pattern

Follow established patterns:
- Co-locate tests next to component files
- Use `@testing-library/react` with `fireEvent`
- Use `vitest` (describe, it, expect, vi)
- Add delete tests to the **existing** `TodoItem.test.tsx` file — don't create a separate file
- Add deleteTodo tests to the **existing** `useTodos.test.ts` file
- Update the **existing** `TodoList.test.tsx` to pass the new `onDelete` prop

### Existing Test File Updates Required

All renders in `TodoList.test.tsx` currently pass `onToggle={noop} onEdit={noop}`. After adding `onDelete` to TodoListProps, every render call must also include `onDelete={noop}` or tests will fail with a TypeScript error.

Similarly, all renders in `TodoItem.test.tsx` currently pass `onToggle={noop} onEdit={noop}`. Add `onDelete={noop}` to all existing renders.

### Existing Stub Test to Replace

In `useTodos.test.ts:381-400`, there's a test `'deleteTodo is a callable no-op'` under `describe('stub methods')`. This test should be **removed** and replaced with the new `describe('deleteTodo — optimistic delete')` tests.

### File Changes Summary

```
src/components/
├── TodoItem.tsx          # MODIFIED — add Delete button, onDelete prop, destructive styling
├── TodoItem.test.tsx     # MODIFIED — add delete tests, add onDelete={noop} to all renders
├── TodoList.tsx          # MODIFIED — add onDelete prop passthrough
├── TodoList.test.tsx     # MODIFIED — add onDelete={noop} to all renders

src/hooks/
├── useTodos.ts           # MODIFIED — implement deleteTodo (replace stub)
├── useTodos.test.ts      # MODIFIED — replace stub test, add deleteTodo tests

src/app/
├── page.tsx              # MODIFIED — destructure deleteTodo, pass onDelete to TodoList
```

No new files needed. No new dependencies needed.

### Previous Story Intelligence (Story 2.3)

Key learnings from Story 2.3:
- **Per-item rollback pattern:** Story 2.3 code review refactored `toggleTodo` and `updateTodo` to use per-item rollback instead of full-array snapshot. For `deleteTodo`, full-array rollback is actually the correct approach since we need to restore the todo at its original position — `todosRef.current` captures the array before removal.
- **`escapePressedRef` pattern:** TodoItem uses a ref to prevent blur-after-Escape double-fire. No interaction with delete — delete simply calls `onDelete(todo.id)`.
- **Hover-reveal container:** Edit button is already in the hover-reveal div. Delete goes in the same container.
- **`focus-within:opacity-100`:** The hover-reveal container already has this so keyboard-focused buttons remain visible. Delete button benefits from this automatically.

### Known Deferred Issues (Do NOT Fix in This Story)

- `addTodo` failures produce no user feedback (deferred from 1.5) — out of scope
- Error state from initial fetch not clearable — out of scope
- Toast `slideOutTimer` race on rapid re-trigger — out of scope, pre-existing
- `text-text-primary` naming collision — use `text-text-primary` for text color

### Project Structure Notes

- All changes align with the architecture spec's component tree: `TodoList > TodoItem[]`
- TodoItem renders the Delete button; useTodos hook owns the data mutation
- `onDelete` prop follows the same callback pattern as `onToggle` and `onEdit`
- No new dependencies or files needed — everything extends existing code

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4] — Acceptance criteria and BDD scenarios
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundary] — "Each component owns its own visual state but NOT data state"
- [Source: _bmad-output/planning-artifacts/architecture.md#Hook Boundary] — useTodos as single interface, owns optimistic update logic
- [Source: _bmad-output/planning-artifacts/architecture.md#Optimistic Update Pattern] — save → optimistic → API → success: no-op / failure: rollback + toast
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Task Deletion Flow] — Mermaid flow: click Delete → task removed instantly → DELETE → success/rollback+toast
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy] — Destructive button: transparent, gray border, turns red on hover
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow Optimization Principles] — No confirmation dialogs for delete
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Error toast message: "Couldn't delete task. Try again."
- [Source: src/app/api/todos/[id]/route.ts:59-86] — DELETE endpoint already implemented
- [Source: src/hooks/useTodos.ts:177] — deleteTodo stub to replace
- [Source: src/components/TodoItem.tsx:94] — Hover-reveal container where Delete button goes
- [Source: _bmad-output/implementation-artifacts/2-3-inline-task-editing.md] — Previous story learnings and patterns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation with no blockers.

### Completion Notes List

- Implemented `onDelete` prop on TodoItem with destructive-styled Delete button in hover-reveal container alongside Edit button
- Wired `onDelete` through TodoList to TodoItem
- Replaced `deleteTodo` stub in useTodos with full optimistic delete: removes todo immediately, fires DELETE API, rolls back with toast on failure
- Wired `deleteTodo` from useTodos into page.tsx, passing as `onDelete` to TodoList
- Added 4 component tests for delete button (render, click handler, hidden in edit mode, hover styling)
- Added 4 hook tests for deleteTodo (success removal, API error rollback, network error rollback, non-existent id no-op)
- Updated all existing TodoItem and TodoList test renders to include `onDelete={noop}`
- All 89 tests pass, build succeeds, TypeScript clean (pre-existing API test type errors not related to this story)

### Review Findings

- [x] [Review][Defer] `deleteTodo` full-array rollback can overwrite concurrent mutations [src/hooks/useTodos.ts:180] — deferred, spec-chosen trade-off for single-user app
- [x] [Review][Defer] Rapid double-toggle sends contradictory PATCHes due to stale `todosRef` read [src/hooks/useTodos.ts:96] — deferred, toggle/update architecture (stories 2.2/2.3)
- [x] [Review][Defer] Operating on temp-id todo before addTodo resolves hits 404 [src/hooks/useTodos.ts] — deferred, pre-existing from story 1.5 addTodo pattern

### Change Log

- 2026-04-24: Implemented Story 2.4 — Task Deletion (all 8 tasks complete)

### File List

- src/components/TodoItem.tsx — MODIFIED: added onDelete prop, Delete button with destructive hover styling
- src/components/TodoItem.test.tsx — MODIFIED: added onDelete={noop} to all renders, added 4 delete tests
- src/components/TodoList.tsx — MODIFIED: added onDelete prop passthrough
- src/components/TodoList.test.tsx — MODIFIED: added onDelete={noop} to all renders
- src/hooks/useTodos.ts — MODIFIED: replaced deleteTodo stub with full optimistic delete implementation
- src/hooks/useTodos.test.ts — MODIFIED: replaced stub test with 4 deleteTodo tests
- src/app/page.tsx — MODIFIED: destructured deleteTodo, passed onDelete to TodoList
