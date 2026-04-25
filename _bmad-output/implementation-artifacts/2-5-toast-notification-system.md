# Story 2.5: Toast Notification System

Status: done

## Story

As a **user**,
I want to be informed when something goes wrong,
so that I'm never uncertain about the state of my data.

## Acceptance Criteria

1. **Toast appears on API failure:** Given an API operation fails, when the `useTodos` hook triggers a toast, then a dark toast notification slides in from the bottom and displays a plain-language error message (e.g., "Couldn't add task. Try again.") and the toast auto-dismisses after 4 seconds and the toast has `role="alert"` and `aria-live="polite"`.

2. **Multiple toasts stack:** Given multiple errors occur in quick succession, when multiple toasts are triggered, then toasts stack vertically with 8px gap.

3. **addTodo failure shows toast:** Given an `addTodo` API call fails, when the server returns an error or the network fails, then the optimistic todo is removed AND a toast notification appears with message "Couldn't add task. Try again." (Currently `addTodo` failures are silent — this is a deferred fix from Story 1.5.)

4. **Component tests:** Component tests exist for Toast rendering and auto-dismiss behavior.

## Tasks / Subtasks

- [x] Task 1: Refactor Toast to support multiple simultaneous toasts (AC: #1, #2)
  - [x] 1.1 Create a `ToastItem` interface: `{ id: number; message: string }`
  - [x] 1.2 Refactor `Toast` component to accept an array of toast items instead of a single message
  - [x] 1.3 Render each toast item in a stacked container (`fixed bottom-4 right-4`, flex-col, `gap-2`)
  - [x] 1.4 Each individual toast manages its own slide-in/out animation and 4s auto-dismiss timer
  - [x] 1.5 On dismiss, remove that specific toast by id from the array
  - [x] 1.6 Desktop: position bottom-right (`right-4`); Mobile: bottom-center (`max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2`)
  - [x] 1.7 Each toast retains `role="alert"` and `aria-live="polite"`
  - [x] 1.8 Toast text: `text-[0.875rem]` (14px), white on `bg-toast-bg` (#1F2937), `rounded-lg shadow-lg px-4 py-3`

- [x] Task 2: Create toast state management in page.tsx (AC: #1, #2)
  - [x] 2.1 Replace single `toastMessage`/`toastKey` state with a `toasts` array state: `useState<ToastItem[]>([])`
  - [x] 2.2 Create `addToast` callback: generates unique id (counter or `Date.now()`), appends `{ id, message }` to array
  - [x] 2.3 Create `removeToast` callback: filters out the toast by id
  - [x] 2.4 Pass `addToast` as the `onError` callback to `useTodos`
  - [x] 2.5 Pass `toasts` and `removeToast` to `<Toast>` component

- [x] Task 3: Wire addTodo failure to toast (AC: #3)
  - [x] 3.1 In `useTodos.ts`, add `options?.onError?.("Couldn't add task. Try again.")` to all three failure paths in `addTodo` (non-ok response, non-success JSON, catch block)
  - [x] 3.2 Add `options?.onError` to `addTodo`'s `useCallback` dependency array

- [x] Task 4: Fix Toast slideOutTimer race condition (pre-existing deferred issue)
  - [x] 4.1 The multi-toast refactor inherently fixes this: each toast manages its own lifecycle independently, so one toast's dismiss timer cannot interfere with another's

- [x] Task 5: Write component tests for Toast (AC: #4)
  - [x] 5.1 Create `src/components/Toast.test.tsx`
  - [x] 5.2 Test: renders nothing when toasts array is empty
  - [x] 5.3 Test: renders a single toast with correct message text
  - [x] 5.4 Test: renders multiple toasts simultaneously
  - [x] 5.5 Test: toast has `role="alert"` and `aria-live="polite"` attributes
  - [x] 5.6 Test: calls removeToast with correct id after auto-dismiss timer (use `vi.useFakeTimers`)
  - [x] 5.7 Test: toast container applies correct positioning classes

- [x] Task 6: Write hook tests for addTodo error toast (AC: #3)
  - [x] 6.1 Test: addTodo calls onError with "Couldn't add task. Try again." on API error response
  - [x] 6.2 Test: addTodo calls onError with "Couldn't add task. Try again." on network error

- [x] Task 7: Verify no regressions
  - [x] 7.1 All existing tests pass
  - [x] 7.2 Build succeeds, TypeScript clean
  - [x] 7.3 Manual verification: toggle error, edit error, delete error, and add error all produce toasts
  - [x] 7.4 Manual verification: rapid errors produce stacked toasts with 8px gap

## Dev Notes

### CRITICAL: Toast Must Be Refactored from Single to Multi-Toast

The current Toast component (`src/components/Toast.tsx`) renders a **single toast** at a time. It accepts `message: string | null` and `triggerKey: number`. The page (`src/app/page.tsx:12-18`) manages a single `toastMessage`/`toastKey` state.

Story 2.5 AC #2 requires **multiple toasts stacking vertically**. This requires:

1. **New Toast props interface:**
```typescript
interface ToastItem {
  id: number;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}
```

2. **Toast renders a container with individual toast items.** Each item manages its own 4s auto-dismiss timer and slide-in/out animation independently.

3. **page.tsx state changes from:**
```typescript
const [toastMessage, setToastMessage] = useState<string | null>(null);
const [toastKey, setToastKey] = useState(0);
```
**to:**
```typescript
const [toasts, setToasts] = useState<ToastItem[]>([]);
const nextId = useRef(0);
const addToast = useCallback((message: string) => {
  setToasts(prev => [...prev, { id: nextId.current++, message }]);
}, []);
const removeToast = useCallback((id: number) => {
  setToasts(prev => prev.filter(t => t.id !== id));
}, []);
```

### CRITICAL: addTodo Must Call onError on Failure

Currently `addTodo` in `useTodos.ts:61-93` has THREE failure paths that silently remove the optimistic todo without notifying the user:
- Line 80-81: `!res.ok` — removes temp todo, no toast
- Line 88: `!json.success` — removes temp todo, no toast  
- Line 91: catch block — removes temp todo, no toast

All three must add: `options?.onError?.("Couldn't add task. Try again.")`

Also add `options?.onError` to the `useCallback` dependency array (currently `[]` at line 93).

### This Inherently Fixes the slideOutTimer Race Condition

The deferred issue from Story 2.3 code review: "Toast `slideOutTimer` race on rapid re-trigger — ~200ms window where old timer's `onDismiss` can null a newly triggered message." The multi-toast architecture fixes this because each toast has its own independent lifecycle — no shared timer state.

### Toast Visual Spec

Per UX Design Specification:
- **Background:** `bg-toast-bg` (#1F2937) — dark neutral
- **Text:** white, `text-[0.875rem]` (14px), `font-normal` (400 weight)
- **Padding:** `px-4 py-3`
- **Shape:** `rounded-lg shadow-lg`
- **Position:** Fixed, bottom-right on desktop (`bottom-4 right-4`), bottom-center on mobile (`max-sm:left-1/2 max-sm:-translate-x-1/2`)
- **Animation:** Slide-in from below (`translate-y-4 opacity-0` → `translate-y-0 opacity-100`), 200ms transition
- **Auto-dismiss:** 4 seconds, then slide-out (reverse animation), then remove from DOM
- **Stacking:** Newest at bottom, `gap-2` (8px) between toasts, flex-col layout

### Tailwind v4 — Design Token Reminders

This project uses **Tailwind CSS v4** with `@theme inline` in `src/app/globals.css`. Relevant tokens:
- `bg-toast-bg` — toast background (#1F2937)
- `gap-2` — 8px gap for toast stacking (uses spacing scale)
- The existing tokens are sufficient; no new tokens needed.

### Import Pattern — Use @/ Alias

All imports must use the `@/` alias. Never use relative paths with `../`.

### Testing Pattern

Follow established patterns:
- Create **new** file `src/components/Toast.test.tsx` (no existing test file)
- Use `@testing-library/react` with `fireEvent` / `act`
- Use `vitest` (describe, it, expect, vi)
- Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()` for testing auto-dismiss
- Add addTodo error tests to the **existing** `useTodos.test.ts` file
- Wrap state updates in `act()` when advancing fake timers

### Existing Error Messages to Preserve

The following error messages are already wired through `onError` and must not change:
- `"Couldn't update task. Try again."` — toggleTodo and updateTodo
- `"Couldn't save edit. Try again."` — updateTodo
- `"Couldn't delete task. Try again."` — deleteTodo

New message to add:
- `"Couldn't add task. Try again."` — addTodo (all failure paths)

### No New Dependencies

This story requires no new npm packages. Everything uses existing React, Tailwind, Vitest, and Testing Library.

### File Changes Summary

```
src/components/
├── Toast.tsx              # MODIFIED — refactor from single-toast to multi-toast
├── Toast.test.tsx         # NEW — toast rendering and auto-dismiss tests

src/hooks/
├── useTodos.ts            # MODIFIED — add onError calls to addTodo failure paths
├── useTodos.test.ts       # MODIFIED — add addTodo error toast tests

src/app/
├── page.tsx               # MODIFIED — refactor toast state from single to array
```

### Project Structure Notes

- All changes align with the architecture spec's component tree
- Toast renders as a portal/fixed-position overlay, not within the main content flow
- `useTodos` hook remains the single interface for all API communication
- `page.tsx` remains the toast state owner — components trigger toasts through the `onError` callback chain
- No new files except `Toast.test.tsx`

### Previous Story Intelligence (Story 2.4)

Key learnings from Story 2.4:
- **`options?.onError` pattern:** All mutation methods (toggle, update, delete) call `options?.onError?.(message)` on failure. `addTodo` is the only one missing this.
- **Dependency arrays:** `toggleTodo`, `updateTodo`, and `deleteTodo` all include `options?.onError` in their `useCallback` deps. `addTodo` has `[]` — must be updated.
- **Test pattern for onError:** Existing tests in `useTodos.test.ts` assert `onError` is called with the expected message string. Follow the same pattern for addTodo error tests.
- **89 existing tests pass** — baseline for regression check.

### Known Deferred Issues (Do NOT Fix in This Story)

- `deleteTodo` full-array rollback can overwrite concurrent mutations — deferred, spec trade-off
- Rapid double-toggle sends contradictory PATCHes — deferred, toggle/update architecture
- Operating on temp-id todo before addTodo resolves hits 404 — deferred, pre-existing
- `text-text-primary` naming collision — pre-existing, use `text-text-primary` for text color
- Error state from initial fetch not clearable — deferred, separate error channel

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5] — Acceptance criteria and BDD scenarios
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Chain] — Toast responsibility: "Show message for 4 seconds, auto-dismiss"
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundary] — "Each component owns its own visual state but NOT data state"
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Toast] — Dark bg, white text, bottom-right desktop / bottom-center mobile, slide-in, 4s auto-dismiss, role="alert"
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — "Multiple toasts: Stack vertically with sm (8px) gap. Oldest at top, newest at bottom."
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — "Never require user acknowledgment for errors. Toast auto-dismisses."
- [Source: src/components/Toast.tsx] — Existing single-toast implementation to refactor
- [Source: src/app/page.tsx:12-18] — Current single-toast state management to refactor
- [Source: src/hooks/useTodos.ts:61-93] — addTodo with silent failure paths to fix
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — "addTodo failures produce no user feedback" and "Toast slideOutTimer race on rapid re-trigger"
- [Source: _bmad-output/implementation-artifacts/2-4-task-deletion.md] — Previous story patterns and learnings

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Pre-existing TS error in `src/__tests__/api/todos.test.ts` (GET function signature) confirmed not introduced by this story

### Completion Notes List
- Refactored Toast from single-message to multi-toast array architecture with `ToastItem` interface
- Each toast manages its own slide-in/out animation and 4s auto-dismiss timer via `SingleToast` internal component
- Replaced `toastMessage`/`toastKey` state in page.tsx with `toasts` array + `useRef` counter for unique IDs
- Added `onError` calls to all 3 addTodo failure paths (non-ok, non-success JSON, catch) in useTodos.ts
- Added `options?.onError` to addTodo's useCallback dependency array
- Multi-toast architecture inherently fixes the slideOutTimer race condition (deferred from Story 2.3)
- 6 new Toast component tests + 2 new addTodo onError tests = 8 new tests
- All 97 tests pass, build succeeds, no regressions

### Change Log
- 2026-04-24: Implemented Story 2.5 — multi-toast system, addTodo error notifications, component tests

### Review Findings
- [x] [Review][Patch] slideOutTimer cleanup leak in SingleToast — `return () => clearTimeout(slideOutTimer)` inside setTimeout callback is dead code; inner 200ms timer never cleared on unmount [src/components/Toast.tsx:24]
- [x] [Review][Defer] deleteTodo full-array rollback restores stale snapshot, undoing concurrent mutations [src/hooks/useTodos.ts] — deferred, spec-acknowledged trade-off
- [x] [Review][Defer] Rapid double-toggle sends contradictory PATCHes due to stale todosRef read [src/hooks/useTodos.ts] — deferred, spec-acknowledged
- [x] [Review][Defer] Editing temp-ID todo before addTodo resolves sends PATCH to temp URL (404) [src/hooks/useTodos.ts] — deferred, pre-existing from story 1.5
- [x] [Review][Defer] Duplicate Date.now() temp IDs if addTodo called twice in same millisecond [src/hooks/useTodos.ts] — deferred, pre-existing from story 1.5
- [x] [Review][Defer] vitest.config.ts conditional require('dotenv') may fail if dotenv not in devDependencies [vitest.config.ts] — deferred, not story 2.5 scope

### File List
- `src/components/Toast.tsx` — MODIFIED: refactored from single-toast to multi-toast with ToastItem interface and SingleToast internal component
- `src/components/Toast.test.tsx` — NEW: 6 component tests for Toast rendering, accessibility, auto-dismiss, positioning
- `src/app/page.tsx` — MODIFIED: replaced single toast state with toasts array, addToast/removeToast callbacks
- `src/hooks/useTodos.ts` — MODIFIED: added onError calls to 3 addTodo failure paths, updated dependency array
- `src/hooks/useTodos.test.ts` — MODIFIED: added 2 tests for addTodo onError (API error + network error)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: story status updated
