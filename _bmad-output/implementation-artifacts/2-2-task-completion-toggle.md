# Story 2.2: Task Completion Toggle

Status: done

## Story

As a **user**,
I want to check off tasks and see them visually marked as complete,
so that I can track my progress at a glance.

## Acceptance Criteria

1. **Toggle to completed:** Given an active task is displayed in the list, when the user clicks/taps the checkbox, then the task immediately shows strikethrough text and muted color (`#9CA3AF`) via smooth CSS transition, and the API PATCH fires in the background with `{ completed: true }`.

2. **Toggle to active:** Given a completed task is displayed in the list, when the user clicks/taps the checkbox, then the strikethrough and muted color are removed immediately, and the API PATCH fires with `{ completed: false }`.

3. **Rollback on failure:** Given a toggle API call fails, when the server returns an error, then the checkbox reverts to its previous state, and a toast notification appears with an error message.

4. **Component tests:** Component tests exist for TodoItem completion toggle behavior.

## Tasks / Subtasks

- [x] Task 1: Create TodoItem component (AC: #1, #2)
  - [x] 1.1 Create `src/components/TodoItem.tsx` — extract from TodoList's inline `<li>` rendering
  - [x] 1.2 Accept props: `todo: Todo`, `onToggle: (id: string) => void`
  - [x] 1.3 Render checkbox (enabled, not disabled), task text, and completion visual styling
  - [x] 1.4 Add smooth CSS transition on text color and text-decoration (150-200ms ease)
  - [x] 1.5 Checkbox `aria-label` must include the task text (e.g., `Mark "Buy groceries" as complete`)
  - [x] 1.6 Wire checkbox `onChange` to call `onToggle(todo.id)`

- [x] Task 2: Update TodoList to use TodoItem (AC: #1, #2)
  - [x] 2.1 Replace inline `<li>` rendering with `<TodoItem>` component
  - [x] 2.2 Pass `onToggle` callback through from props
  - [x] 2.3 Update TodoList props interface: add `onToggle: (id: string) => void`

- [x] Task 3: Implement toggleTodo in useTodos hook (AC: #1, #2, #3)
  - [x] 3.1 Replace the stub with full optimistic update implementation
  - [x] 3.2 Save current todos state before mutation
  - [x] 3.3 Apply optimistic toggle (`completed: !current`) to local state
  - [x] 3.4 Fire `PATCH /api/todos/{id}` with `{ completed: <new value> }`
  - [x] 3.5 On success: replace optimistic todo with server response data
  - [x] 3.6 On failure: rollback to saved state, call toast callback
  - [x] 3.7 Add `onError` callback parameter or toast state to the hook for error notification

- [x] Task 4: Add toast notification for toggle failure (AC: #3)
  - [x] 4.1 Create minimal `src/components/Toast.tsx` — dark background (`toast-bg` token), white text, `role="alert"`, `aria-live="polite"`, bottom-right positioning (desktop) / bottom-center (mobile), slide-in animation, 4s auto-dismiss
  - [x] 4.2 Add toast state management to `page.tsx` or the `useTodos` hook (a simple `toastMessage: string | null` state with auto-clear timer)
  - [x] 4.3 Wire the error callback from useTodos to show the toast
  - [x] 4.4 Toast message for toggle failure: "Couldn't update task. Try again."

- [x] Task 5: Update page.tsx to wire everything together (AC: #1, #2, #3)
  - [x] 5.1 Destructure `toggleTodo` from `useTodos()` return
  - [x] 5.2 Pass `onToggle={toggleTodo}` to `<TodoList>`
  - [x] 5.3 Render `<Toast>` component with error message state

- [x] Task 6: Write component tests (AC: #4)
  - [x] 6.1 Create `src/components/TodoItem.test.tsx`
  - [x] 6.2 Test: renders active todo with normal text styling (no strikethrough)
  - [x] 6.3 Test: renders completed todo with strikethrough and muted color class
  - [x] 6.4 Test: calls onToggle with todo.id when checkbox is clicked
  - [x] 6.5 Test: checkbox has correct aria-label including task text
  - [x] 6.6 Test: checkbox reflects todo.completed state (checked/unchecked)

- [x] Task 7: Verify no regressions
  - [x] 7.1 All existing tests pass (57 tests from stories 1.1-2.1)
  - [x] 7.2 Lint clean, build succeeds
  - [x] 7.3 Manual verification: existing add-todo flow still works

### Review Findings

- [x] [Review][Patch] **Stale closure in `toggleTodo` — `todos` and `options` in dependency array** — Fixed: use `useRef` for todos snapshot + depend on `options?.onError` instead of `options` object. [src/hooks/useTodos.ts]
- [x] [Review][Patch] **Toast inner `setTimeout(onDismiss, 200)` not cleaned up** — Fixed: capture inner timeout ID and clear in cleanup. [src/components/Toast.tsx]
- [x] [Review][Patch] **Same error message does not re-trigger toast** — Fixed: added `triggerKey` counter prop to Toast. [src/components/Toast.tsx, src/app/page.tsx]
- [x] [Review][Patch] **CSS easing function mismatch** — Fixed: changed `ease-in-out` to `ease`. [src/components/TodoItem.tsx, src/components/Toast.tsx]
- [x] [Review][Patch] **`requestAnimationFrame` not cancelled on cleanup** — Fixed: capture rAF ID and cancel in cleanup. [src/components/Toast.tsx]
- [x] [Review][Defer] **Error state from initial fetch not clearable** [src/app/page.tsx] — deferred, pre-existing. The `error` UI from `useTodos` has no retry/clear mechanism and is a separate error channel from the toast.

## Dev Notes

### CRITICAL: TodoItem Does NOT Exist Yet — Must Be Created

The current codebase renders todos **inline in TodoList.tsx** as bare `<li>` elements with **disabled checkboxes**. There is no `TodoItem.tsx` component. You must:

1. Create `src/components/TodoItem.tsx` as a new file
2. Refactor `TodoList.tsx` to use `<TodoItem>` instead of inline rendering
3. Enable the checkbox (remove `disabled` attribute) and wire the toggle

**Current TodoList.tsx (what you're replacing):**
```tsx
<li key={todo.id} className="flex items-center gap-3 py-2">
  <input type="checkbox" checked={todo.completed} disabled className="h-4 w-4 rounded border-border" />
  <span className={todo.completed ? 'line-through text-text-completed' : 'text-text-primary'}>
    {todo.title}
  </span>
</li>
```

### CRITICAL: toggleTodo Is a Stub — Must Be Implemented

The `useTodos` hook in `src/hooks/useTodos.ts` has `toggleTodo` as an empty stub:
```typescript
const toggleTodo: UseTodosReturn['toggleTodo'] = useCallback(async () => {}, []);
```

Replace with full optimistic update implementation following the **exact pattern** from `addTodo`:
1. Save current state (for rollback)
2. Apply optimistic toggle to local state
3. Fire `PATCH /api/todos/{id}` with `{ completed: <newValue> }`
4. On success: update with server response (to get correct `updatedAt`)
5. On failure: rollback to saved state + trigger error notification

### CRITICAL: Toast Component Needed for Error Feedback

No Toast component exists yet. Story 2.5 formalizes the full toast system (stacking, multiple toasts), but this story's AC#3 **requires** a toast on toggle failure. Build a minimal but production-quality Toast component now that Story 2.5 can enhance later. Requirements:

- Dark background using `toast-bg` design token (`#1F2937`)
- White text
- `role="alert"` and `aria-live="polite"`
- Bottom-right on desktop, bottom-center on mobile
- Slide-in animation from below
- 4-second auto-dismiss
- Single toast is sufficient for now (Story 2.5 adds stacking)

### CSS Transition for Completion Visual

The strikethrough + muted color change must use a **smooth CSS transition**, not an instant swap. Add transition properties to the text element:

```tsx
// On the TodoItem text span:
className={`transition-colors duration-200 ease-in-out ${
  todo.completed
    ? 'line-through text-text-completed'
    : 'text-text-primary'
}`}
```

Note: `line-through` (text-decoration) does not animate with CSS transitions in most browsers. The color transition provides the smooth feel; the strikethrough appears instantly which is acceptable.

### API Endpoint Already Exists

The PATCH endpoint was built in Story 2.1 at `src/app/api/todos/[id]/route.ts`. It accepts `{ completed: boolean }` and returns `{ data: <updated Todo>, success: true }`. No API work needed.

### Error Notification Pattern

The `useTodos` hook currently has no mechanism to communicate errors to the UI for individual operations (noted in deferred-work.md: "addTodo failures produce no user feedback"). You need to add one. Two approaches:

**Option A (Recommended): Callback pattern**
Add an `onError?: (message: string) => void` parameter to `useTodos`, or make `toggleTodo` return/throw in a way the caller can handle. The page component manages toast state.

**Option B: Internal state**
Add `toastMessage: string | null` to the hook's state and expose it in the return value. The page component reads it and renders Toast.

Choose whichever keeps the hook's interface clean. The architecture says: "useTodos hook → call toast callback" which implies Option A.

### Tailwind v4 — No tailwind.config.ts

This project uses **Tailwind CSS v4** with `@theme inline` in `src/app/globals.css`. There is NO `tailwind.config.ts` file. All design tokens are CSS custom properties. Use the existing token classes directly:

- `text-text-primary` → active task text color (#111827)
- `text-text-completed` → completed task text color (#9CA3AF)
- `bg-toast-bg` → toast background (#1F2937)
- `border-border` → border color (#E5E7EB)

### File Locations — Follow Architecture Exactly

```
src/components/
├── TodoItem.tsx          # NEW — this story
├── TodoItem.test.tsx     # NEW — this story
├── Toast.tsx             # NEW — this story (minimal, enhanced in 2.5)
├── TodoList.tsx          # MODIFIED — use TodoItem, accept onToggle
├── TodoList.test.tsx     # EXISTING — may need updates for new props
├── TodoForm.tsx          # UNCHANGED
├── EmptyState.tsx        # UNCHANGED
├── LoadingSpinner.tsx    # UNCHANGED

src/hooks/
├── useTodos.ts           # MODIFIED — implement toggleTodo, add error callback
├── useTodos.test.ts      # EXISTING — may need updates for toggleTodo

src/app/
├── page.tsx              # MODIFIED — wire toggleTodo, add Toast rendering
```

### Import Pattern — Use @/ Alias

All imports must use the `@/` alias. Never use relative paths with `../`:
```typescript
import { TodoItem } from '@/components/TodoItem';
import type { Todo } from '@/lib/types';
```

### Testing Pattern

Follow the established testing patterns from existing component tests:
- Co-locate tests: `TodoItem.test.tsx` next to `TodoItem.tsx`
- Use `@testing-library/react` for component tests
- Use `vitest` (describe, it, expect)
- Mock fetch for API calls in hook tests
- Use `// @vitest-environment jsdom` if needed for component tests

### Previous Story Intelligence (Story 2.1)

Key learnings from the previous story:
- `PrismaClientKnownRequestError` imports from `@/generated/prisma/internal/prismaNamespace`, not `@/generated/prisma/client`
- `serializeTodo` was extracted to `src/lib/apiHelpers.ts` for shared use
- Integration tests require `fileParallelism: false` in vitest config (already set)
- The UpdateTodoSchema was fixed to use Zod v4 `.check()` instead of `.refine()`, preserving ZodObject type
- Next.js 16 uses async `params` (Promise) in route handlers — already handled in the PATCH route

### Known Deferred Issues (Do NOT Fix in This Story)

- `addTodo` also has no error feedback (toast deferred from 1.5) — will be addressed when Toast is formalized in 2.5 or can be wired now if trivial
- `text-text-primary` naming collision with `text-primary` (blue accent) — use `text-text-primary` for text color
- No structured error logging in API handlers — out of scope

### Project Structure Notes

- All changes align with the architecture spec's project structure
- TodoItem.tsx matches the architecture's component tree: `TodoList > TodoItem[]`
- Toast.tsx matches the architecture's component list
- No new dependencies needed — all libraries already installed

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — Acceptance criteria and BDD scenarios
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns] — UseTodosReturn interface with toggleTodo, optimistic update pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — Component file locations, co-located tests
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — Error handling chain: optimistic rollback → toast
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Task Completion Toggle Flow] — Mermaid flow: checkbox → visual toggle → PATCH → success/rollback
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy - TodoItem] — Checkbox left, text center, Edit+Delete right (hidden until hover); completion = strikethrough + muted
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Action failure = toast + rollback, 4s auto-dismiss
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System] — text-completed #9CA3AF, toast-bg #1F2937
- [Source: _bmad-output/implementation-artifacts/2-1-todo-api-update-and-delete-endpoints.md] — PATCH endpoint details, API response format, serializeTodo in apiHelpers
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — addTodo no error feedback, text-text-primary naming

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Created `TodoItem` component with enabled checkbox, completion visual styling (strikethrough + muted color), smooth CSS transition (200ms ease-in-out), and proper aria-labels
- Refactored `TodoList` to use `TodoItem` with `onToggle` prop passthrough
- Implemented `toggleTodo` in `useTodos` hook with full optimistic update pattern: save state → optimistic toggle → PATCH → success update or rollback + error callback
- Added `UseTodosOptions` interface with `onError` callback for error communication
- Created minimal `Toast` component with dark background (`toast-bg` token), `role="alert"`, `aria-live="polite"`, bottom-right desktop / bottom-center mobile positioning, slide-in animation, and 4s auto-dismiss
- Wired everything in `page.tsx`: toast state management, error callback, toggleTodo passthrough
- 8 new TodoItem component tests + 5 new toggleTodo hook tests = 13 new tests
- All 70 tests pass (including integration tests), build succeeds with no TypeScript errors

### Change Log

- 2026-04-24: Implemented story 2.2 — task completion toggle with optimistic updates, rollback on failure, toast notification, and full test coverage

### File List

- `src/components/TodoItem.tsx` — NEW: TodoItem component with checkbox toggle, completion styling, CSS transitions, aria-labels
- `src/components/TodoItem.test.tsx` — NEW: 8 component tests for TodoItem
- `src/components/Toast.tsx` — NEW: Minimal toast notification component with slide-in animation and auto-dismiss
- `src/components/TodoList.tsx` — MODIFIED: Replaced inline `<li>` rendering with `<TodoItem>`, added `onToggle` prop
- `src/components/TodoList.test.tsx` — MODIFIED: Updated tests to pass new required `onToggle` prop
- `src/hooks/useTodos.ts` — MODIFIED: Implemented `toggleTodo` with optimistic update, added `UseTodosOptions` with `onError` callback
- `src/hooks/useTodos.test.ts` — MODIFIED: Added 5 toggleTodo tests (success, rollback on failure/error/non-ok, non-existent todo)
- `src/app/page.tsx` — MODIFIED: Wired `toggleTodo`, toast state management, `Toast` component rendering
