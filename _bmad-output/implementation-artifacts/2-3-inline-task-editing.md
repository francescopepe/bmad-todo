# Story 2.3: Inline Task Editing

Status: done

## Story

As a **user**,
I want to edit a task's description inline,
so that I can fix typos or update tasks without recreating them.

## Acceptance Criteria

1. **Enter edit mode:** Given a task is displayed in the list, when the user clicks the Edit button (or task text), then the task text transforms into an editable input pre-filled with the current text and the input receives focus.

2. **Save via Enter:** Given the user is in edit mode, when the user modifies the text and presses Enter, then the text updates immediately (optimistic) and the API PATCH fires with the new title and edit mode exits.

3. **Save via blur:** Given the user is in edit mode, when the user clicks away (blur), then the edit is saved (same as Enter).

4. **Cancel via Escape:** Given the user is in edit mode, when the user presses Escape, then the edit is cancelled and the original text is restored.

5. **Rollback on failure:** Given an edit API call fails, when the server returns an error, then the text reverts to the previous value and a toast notification appears with message "Couldn't save edit. Try again."

6. **Component tests:** Component tests exist for TodoItem edit mode behavior.

## Tasks / Subtasks

- [x] Task 1: Add Edit button to TodoItem component (AC: #1)
  - [x] 1.1 Add an "Edit" button to `TodoItem` — positioned right of the task text
  - [x] 1.2 Style as secondary button: transparent background, gray border, gray text (14px, font-weight 500)
  - [x] 1.3 Hide Edit (and future Delete) button on hover-capable devices via `@media (hover: hover)` — show on hover of the `<li>`. Always visible on touch/mobile.
  - [x] 1.4 Add `onEdit: (id: string, title: string) => void` prop to TodoItem
  - [x] 1.5 Button has accessible text label "Edit"

- [x] Task 2: Add inline edit mode to TodoItem (AC: #1, #2, #3, #4)
  - [x] 2.1 Add local `isEditing` state and `editText` state to TodoItem
  - [x] 2.2 When `isEditing` is true, replace the `<span>` text with an `<input>` pre-filled with the current title
  - [x] 2.3 Auto-focus the input when entering edit mode
  - [x] 2.4 Handle Enter key: call `onEdit(todo.id, editText.trim())` and exit edit mode (only if text changed and non-empty)
  - [x] 2.5 Handle blur: save the edit (same behavior as Enter)
  - [x] 2.6 Handle Escape key: revert `editText` to original `todo.title` and exit edit mode
  - [x] 2.7 Clicking the task text also enters edit mode (in addition to Edit button)
  - [x] 2.8 If trimmed text is empty or unchanged, treat as cancel (don't call onEdit)

- [x] Task 3: Implement updateTodo in useTodos hook (AC: #2, #5)
  - [x] 3.1 Replace the `updateTodo` stub with full optimistic update implementation
  - [x] 3.2 Save current todos state before mutation (for rollback)
  - [x] 3.3 Apply optimistic title update to local state immediately
  - [x] 3.4 Fire `PATCH /api/todos/{id}` with `{ title: newTitle }`
  - [x] 3.5 On success: replace optimistic todo with server response data (gets correct `updatedAt`)
  - [x] 3.6 On failure: rollback to saved state, call `options.onError("Couldn't save edit. Try again.")`

- [x] Task 4: Wire everything in page.tsx and TodoList (AC: #1, #2)
  - [x] 4.1 Destructure `updateTodo` from `useTodos()` return
  - [x] 4.2 Add `onEdit` prop to `TodoList` interface and pass through to `TodoItem`
  - [x] 4.3 Pass `onEdit={updateTodo}` to `<TodoList>`

- [x] Task 5: Write component tests for edit mode (AC: #6)
  - [x] 5.1 Test: clicking Edit button enters edit mode (input appears with current text)
  - [x] 5.2 Test: clicking task text enters edit mode
  - [x] 5.3 Test: input is auto-focused on entering edit mode
  - [x] 5.4 Test: pressing Enter calls onEdit with the todo id and new title
  - [x] 5.5 Test: blur saves the edit (calls onEdit)
  - [x] 5.6 Test: pressing Escape reverts text and exits edit mode without calling onEdit
  - [x] 5.7 Test: empty/whitespace-only text is treated as cancel (no onEdit call)
  - [x] 5.8 Test: unchanged text is treated as cancel (no onEdit call)
  - [x] 5.9 Test: Edit button has accessible "Edit" text label

- [x] Task 6: Write hook tests for updateTodo (AC: #2, #5)
  - [x] 6.1 Test: updateTodo fires PATCH with `{ title: newTitle }` and updates local state on success
  - [x] 6.2 Test: updateTodo rolls back to previous state on API failure and calls onError
  - [x] 6.3 Test: updateTodo rolls back on network error

- [x] Task 7: Verify no regressions
  - [x] 7.1 All existing tests pass (82 tests total, up from 70)
  - [x] 7.2 Build succeeds, TypeScript clean (lint warnings are pre-existing)
  - [x] 7.3 Manual verification: toggle, add, and existing flows still work

### Review Findings

- [x] [Review][Decision] Stale rollback snapshot on concurrent mutations — Fixed: refactored `toggleTodo` and `updateTodo` to use per-item rollback instead of full-array snapshot.
- [x] [Review][Patch] `vitest.config.ts` crashes if `.env.test` is missing — Fixed: added `existsSync` guard
- [x] [Review][Patch] Edit input has no `maxLength` guard — Fixed: added `maxLength={500}` to edit input
- [x] [Review][Patch] Hidden Edit button invisible on keyboard focus — Fixed: added `focus-within:opacity-100` to button container
- [x] [Review][Defer] Toast `slideOutTimer` race on rapid re-trigger [src/components/Toast.tsx:24-28] — deferred, pre-existing pattern from story 2.2 Toast implementation. ~200ms window where old timer's `onDismiss` can null a newly triggered message.

## Dev Notes

### CRITICAL: updateTodo Is a Stub — Must Be Implemented

The `useTodos` hook in `src/hooks/useTodos.ts` currently has `updateTodo` as an empty stub:
```typescript
const updateTodo: UseTodosReturn['updateTodo'] = useCallback(async () => {}, []);
```

Replace with full optimistic update implementation following the **exact pattern** established by `toggleTodo`:
1. Save `todosRef.current` for rollback
2. Find the target todo; bail if not found
3. Apply optimistic title update: `setTodos(prev => prev.map(t => t.id === id ? { ...t, title } : t))`
4. Fire `PATCH /api/todos/${id}` with `{ title }`
5. On success: replace with server response `json.data`
6. On failure: `setTodos(savedTodos)` + `options?.onError?.("Couldn't save edit. Try again.")`

The signature already exists in `UseTodosReturn`: `updateTodo: (id: string, title: string) => Promise<void>`.

### CRITICAL: Edit Mode Is Local Visual State — Owned by TodoItem

Per architecture: "Each component owns its own visual state (hover, edit mode) but NOT data state." The `isEditing` boolean and `editText` string live as `useState` inside `TodoItem.tsx`. The hook only handles the data mutation via `updateTodo`.

### CRITICAL: Edit and Delete Buttons — Hover-Reveal Pattern

UX spec requires: Edit and Delete buttons hidden by default on hover-capable devices, revealed on `<li>` hover. Always visible on touch devices (no hover). Implementation:
- Use `@media (hover: hover)` to conditionally hide — do NOT use viewport width as a proxy for hover capability
- Wrap buttons in a container with: `opacity-0 group-hover:opacity-100` (within `@media (hover: hover)`)
- Add `group` class to the parent `<li>` element
- On touch/no-hover devices, buttons stay visible (default `opacity-100`)

**Tailwind v4 approach:** Use `@media (hover: hover)` in a custom utility or inline style. In Tailwind v4, arbitrary variants work: `[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100`. Alternatively, add a utility class in `globals.css`.

### Edit Button Styling

Secondary button style per UX spec:
- Transparent background
- Gray border, gray text
- Font size 0.875rem (14px), font-weight 500
- Minimum touch target 44x44px on mobile
- Text label: "Edit" (no icons in V1)

### Blur vs Escape Interaction Subtlety

When the user presses Escape, it cancels the edit. But pressing Escape may also cause a blur event. To avoid the blur handler triggering a save after Escape has already cancelled:
- Set a flag (e.g., `escapePressedRef`) or immediately exit edit mode on Escape so the blur handler can check `isEditing` state
- Alternatively, in the Escape handler, revert the text and set `isEditing = false` — then in the blur handler, check if still in edit mode before saving

### API Endpoint Already Exists

The PATCH endpoint at `src/app/api/todos/[id]/route.ts` already accepts `{ title: string }` (built in Story 2.1). It validates via `UpdateTodoSchema` which accepts optional `title` (string, 1-500 chars) and/or `completed` (boolean). Returns `{ data: <updated Todo>, success: true }`. No API work needed.

### Toast Already Exists

The `Toast` component from Story 2.2 is already wired in `page.tsx` with `onError` callback pattern. The error message "Couldn't save edit. Try again." will appear via the same mechanism — just call `options?.onError?()` in the hook.

### Tailwind v4 — No tailwind.config.ts

This project uses **Tailwind CSS v4** with `@theme inline` in `src/app/globals.css`. All design tokens are CSS custom properties. Relevant tokens:
- `text-text-primary` — active task text color (#111827)
- `text-text-secondary` — secondary text color (#6B7280)
- `text-text-completed` — completed task text color (#9CA3AF)
- `border-border` — border color (#E5E7EB)
- `text-error` — error/destructive red (#DC2626)
- `text-error-hover` — destructive hover red (#B91C1C)

### Import Pattern — Use @/ Alias

All imports must use the `@/` alias. Never use relative paths with `../`:
```typescript
import { TodoItem } from '@/components/TodoItem';
import type { Todo } from '@/lib/types';
```

### Testing Pattern

Follow established patterns from `TodoItem.test.tsx`:
- Co-locate tests: `TodoItem.test.tsx` next to `TodoItem.tsx`
- Use `@testing-library/react` with `fireEvent` for user interactions
- Use `vitest` (describe, it, expect, vi)
- Mock fetch for API calls in hook tests
- Add new edit-mode tests to the existing `TodoItem.test.tsx` file (don't create a separate file)
- Add new updateTodo tests to the existing `useTodos.test.ts` file

### File Changes Summary

```
src/components/
├── TodoItem.tsx          # MODIFIED — add Edit button, inline edit mode, hover-reveal
├── TodoItem.test.tsx     # MODIFIED — add edit mode tests
├── TodoList.tsx          # MODIFIED — add onEdit prop passthrough
├── TodoList.test.tsx     # MODIFIED — update tests for new onEdit prop

src/hooks/
├── useTodos.ts           # MODIFIED — implement updateTodo (replace stub)
├── useTodos.test.ts      # MODIFIED — add updateTodo tests

src/app/
├── page.tsx              # MODIFIED — destructure updateTodo, pass onEdit to TodoList
```

No new files needed. No new dependencies needed.

### Previous Story Intelligence (Story 2.2)

Key learnings from Story 2.2:
- **Stale closure fix:** Use `todosRef` (useRef) for the saved snapshot in optimistic update callbacks, not the `todos` state directly. Already established pattern — follow it for `updateTodo`.
- **`options?.onError` dependency:** In useCallback for `updateTodo`, depend on `options?.onError` (not the entire `options` object) to avoid unnecessary re-renders.
- **Toast re-trigger:** The `triggerKey` pattern ensures duplicate error messages still trigger the toast. Already wired in `page.tsx`.
- **CSS easing:** Use `ease` (not `ease-in-out`) to match the established convention in TodoItem.

### Known Deferred Issues (Do NOT Fix in This Story)

- `addTodo` also has no error feedback (deferred from 1.5) — out of scope
- Error state from initial fetch not clearable — out of scope
- `text-text-primary` naming collision — use `text-text-primary` for text color
- No structured error logging in API handlers — out of scope

### Project Structure Notes

- All changes align with the architecture spec's component tree: `TodoList > TodoItem[]`
- TodoItem owns its visual edit state; useTodos hook owns data mutations
- No new dependencies or files needed — everything extends existing code

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — Acceptance criteria and BDD scenarios
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundary] — "Each component owns its own visual state (hover, edit mode) but NOT data state"
- [Source: _bmad-output/planning-artifacts/architecture.md#Hook Boundary] — useTodos as single interface, owns optimistic update logic
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Task Edit Flow] — Mermaid flow: click Edit/text → input → Enter/blur saves, Escape cancels → PATCH → success/rollback+toast
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#TodoItem Component Strategy] — Checkbox left, text center, Edit+Delete right (hidden until hover)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy] — Secondary button style for Edit (transparent, gray border)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Input Behavior] — Inline editing: Enter/blur saves, Escape cancels
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design] — `@media (hover: hover)` for conditional button visibility
- [Source: _bmad-output/implementation-artifacts/2-2-task-completion-toggle.md] — toggleTodo optimistic pattern, todosRef fix, onError callback pattern
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — Known deferred issues

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Implemented Edit button with hover-reveal pattern using `[@media(hover:hover)]` Tailwind v4 arbitrary variants and `group`/`group-hover` classes
- Added full inline edit mode to TodoItem: `isEditing`/`editText` local state, auto-focus via useEffect + ref, Enter saves, blur saves, Escape cancels with `escapePressedRef` to prevent blur-after-escape double-fire
- Replaced `updateTodo` stub in useTodos hook with full optimistic update following established `toggleTodo` pattern (todosRef snapshot, optimistic setTodos, PATCH, success replace, failure rollback + onError)
- Wired `updateTodo` through page.tsx → TodoList → TodoItem via `onEdit` prop
- Added 9 component tests for edit mode behavior and 3 hook tests for updateTodo (success, API failure, network error)
- Updated existing TodoList and TodoItem tests to pass new `onEdit` prop
- All 82 tests pass, build succeeds, TypeScript clean

### Change Log

- 2026-04-24: Implemented Story 2.3 — inline task editing with optimistic updates, 12 new tests added

### File List

- src/components/TodoItem.tsx (modified — added Edit button, inline edit mode, hover-reveal, onEdit prop)
- src/components/TodoItem.test.tsx (modified — added 9 edit mode tests, updated existing tests for onEdit prop)
- src/components/TodoList.tsx (modified — added onEdit prop passthrough)
- src/components/TodoList.test.tsx (modified — updated tests to pass onEdit prop)
- src/hooks/useTodos.ts (modified — replaced updateTodo stub with full optimistic implementation)
- src/hooks/useTodos.test.ts (modified — added 3 updateTodo tests, updated stub test)
- src/app/page.tsx (modified — destructured updateTodo, passed onEdit to TodoList)
