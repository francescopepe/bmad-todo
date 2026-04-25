# QA Accessibility Report

**Date:** 2026-04-25
**Project:** Awesome Todo
**Tools:** @axe-core/playwright 4.11.2, Lighthouse 13.1.0

## Summary

| Criterion | Target | Achieved | Status |
|-----------|--------|----------|--------|
| Critical WCAG Violations | 0 | 0 | PASS |
| Serious WCAG Violations | 0 | 0 | PASS |
| Lighthouse Accessibility Score | 90+ | 100/100 | EXCEEDS |

## axe-core Automated Audit

4 E2E tests run via `@axe-core/playwright` across all major page states:

| Page State | Critical | Serious | Moderate | Minor | Status |
|------------|----------|---------|----------|-------|--------|
| Empty state (no todos) | 0 | 0 | 0 | 0 | PASS |
| With todos (active + completed) | 0 | 0 | 0 | 0 | PASS |
| Edit mode (inline editing active) | 0 | 0 | 0 | 0 | PASS |
| Error/toast state | 0 | 0 | 0 | 0 | PASS |

## Violations Found and Fixed

Two violations were found during the initial audit and fixed before final pass:

### 1. Edit input missing accessible label (Critical)
- **axe rule:** `label` (WCAG 4.1.2 — Name, Role, Value)
- **Issue:** Inline edit `<input>` in TodoItem had no `aria-label`, `<label>`, or other accessible name
- **Fix:** Added `aria-label={`Edit "${todo.title}"`}` to the edit input
- **File:** `src/components/TodoItem.tsx`

### 2. Button color contrast with opacity-0 (Serious)
- **axe rule:** `color-contrast` (WCAG 1.4.3 — Contrast Minimum)
- **Issue:** Edit/Delete buttons used `opacity-0` for hover-reveal, causing computed foreground color of #babec4 on #ffffff (1.86:1 ratio, needs 4.5:1)
- **Fix:** Changed from `opacity-0`/`opacity-100` to `sr-only`/`not-sr-only` pattern — buttons remain in tab order for keyboard accessibility while being visually hidden until hover
- **File:** `src/components/TodoItem.tsx`

## Semantic HTML Audit

| Element | Usage | Status |
|---------|-------|--------|
| `<main>` | Wraps primary content in page.tsx | PASS |
| `<form>` | TodoForm uses native form submission | PASS |
| `<ul>` / `<li>` | TodoList renders semantic list structure | PASS |
| `<button>` | All interactive controls use `<button>`, not `<div>` | PASS |
| `<input>` | Form inputs with associated labels | PASS |
| `<label>` | Visible or `sr-only` labels on all inputs | PASS |
| `lang="en"` | Set on `<html>` element in layout.tsx | PASS |

## ARIA Usage

| Attribute | Component | Purpose |
|-----------|-----------|---------|
| `aria-label` | Checkboxes | Dynamic per-task label (e.g., "Toggle Buy milk") |
| `aria-label` | Edit input | Dynamic label (e.g., 'Edit "Buy milk"') |
| `aria-label="Loading tasks"` | LoadingSpinner | Screen reader announcement |
| `role="status"` | LoadingSpinner | Live region for loading state |
| `role="alert"` | Toast | Assertive announcement for errors |
| `aria-live="polite"` | Toast container | Non-intrusive updates |
| `role="alert"` | ErrorBoundary | Error state announcement |

## Keyboard Navigation

| Interaction | Keys | Status |
|-------------|------|--------|
| Navigate between elements | Tab / Shift+Tab | PASS |
| Submit new todo | Enter | PASS |
| Save inline edit | Enter | PASS |
| Cancel inline edit | Escape | PASS |
| Activate button | Enter / Space | PASS |
| Toggle checkbox | Space | PASS |

## Focus Management

| Scenario | Behavior | Status |
|----------|----------|--------|
| After adding todo | Input clears and refocuses | PASS |
| Edit mode | Edit input auto-focuses | PASS |
| Error boundary | Reload button auto-focused | PASS |
| Focus indicators | `focus:ring-2 focus:ring-primary` on all interactive elements | PASS |

## Color and Contrast

| Element | Foreground | Background | Ratio | Requirement | Status |
|---------|-----------|------------|-------|-------------|--------|
| Primary text | #111827 | #FFFFFF | 15.4:1 | 4.5:1 (AA) | PASS |
| Secondary text | #6B7280 | #FFFFFF | 5.0:1 | 4.5:1 (AA) | PASS |
| Completed text | #757575 | #FFFFFF | 4.6:1 | 4.5:1 (AA) | PASS |
| Primary button | #FFFFFF | #2563EB | 5.1:1 | 4.5:1 (AA) | PASS |
| Error button | #FFFFFF | #DC2626 | 4.6:1 | 4.5:1 (AA) | PASS |

**Note:** Completed task text was darkened from #9CA3AF (2.53:1) to #757575 (4.6:1) to meet WCAG AA. Strikethrough provides an additional visual signal.

## Responsive Accessibility

- Touch targets: Minimum 44x44px on mobile interactive elements (checkbox, Add button, action buttons)
- Action buttons: Always visible on mobile (`<768px`), hover-reveal on desktop with keyboard fallback (`sr-only`/`not-sr-only`)
- Single-column layout on mobile preserves reading order

## NFR Traceability

| NFR | Description | Evidence |
|-----|-------------|----------|
| NFR9 | Keyboard navigation | Keyboard nav tests in accessibility.spec.ts + manual audit |
| NFR10 | Form input labels | All inputs have labels (visible or sr-only) |
| NFR11 | Focus indicators | focus:ring-2 on all interactive elements |
| NFR12 | Semantic HTML | Verified in semantic HTML audit above |
