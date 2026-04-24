# Story 1.4: Design Tokens & Core Layout

Status: done

## Story

As a **user**,
I want a clean, minimal app layout with the Awesome Todo branding,
So that I immediately understand this is a focused, intentional tool.

## Acceptance Criteria

1. **Given** the Tailwind config **When** design tokens are configured in `globals.css` via `@theme` **Then** all 11 color tokens from the UX spec are defined (background, surface, text-primary, text-secondary, text-completed, border, primary, primary-hover, error, error-hover, toast-bg)

2. **And** the spacing scale uses 4px base (xs, sm, md, lg, xl, 2xl)

3. **And** the system font stack is configured

4. **And** the app layout (`layout.tsx`) renders with the "Awesome Todo" title

5. **And** the page content is centered with 640px max-width on desktop

6. **And** mobile layout uses 16px margins

## Tasks / Subtasks

- [x] Task 1: Configure design tokens in `globals.css` (AC: #1, #2, #3)
  - [x] Replace the `@theme inline` block with the complete design token system
  - [x] Define all 11 color tokens using `--color-*` pattern
  - [x] Define spacing tokens: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px)
  - [x] Configure system font stack via `--font-sans`
  - [x] Remove dark mode `prefers-color-scheme` media query (not in V1 spec)
  - [x] Remove `:root` CSS custom properties that duplicate `@theme` tokens

- [x] Task 2: Update `layout.tsx` — system font + semantic structure (AC: #3, #4)
  - [x] Remove Geist font imports (Google Fonts) — use system font stack instead
  - [x] Remove Geist CSS variable classes from `<html>`
  - [x] Keep `antialiased` class on `<html>`
  - [x] Keep existing metadata (`title: "Awesome Todo"`)
  - [x] Ensure `<body>` has appropriate base styling

- [x] Task 3: Update `page.tsx` — core layout shell (AC: #4, #5, #6)
  - [x] Replace placeholder content with the app layout shell
  - [x] Add `<main>` wrapper with 640px max-width centered on desktop
  - [x] Add mobile 16px margins, desktop 32px margins
  - [x] Add "Awesome Todo" heading (24px/1.5rem, bold)
  - [x] Use mobile-first responsive: base styles for mobile, `md:` prefix for desktop
  - [x] Structure: heading at top, then a placeholder area for future TodoForm + TodoList

- [x] Task 4: Verify design tokens render correctly (AC: #1–#6)
  - [x] Run `npm run dev` and confirm the app loads without errors
  - [x] Verify heading displays "Awesome Todo" at correct size/weight
  - [x] Verify content is centered with max-width 640px on desktop
  - [x] Verify 16px margins on mobile viewport (via Chrome DevTools)
  - [x] Run `npm run lint` and `npm test` — confirm no regressions

## Dev Notes

### Critical: Tailwind v4 CSS-Based Configuration

This project uses **Tailwind CSS v4** which does NOT use `tailwind.config.ts`. All design tokens are defined in CSS via `@theme` blocks in `src/app/globals.css`.

The current file already has the pattern:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  /* ... */
}
```

Replace the existing `@theme inline` block with the complete design token system. The `@theme inline` approach defines tokens directly in CSS. These tokens automatically generate Tailwind utility classes (e.g., `--color-primary` generates `text-primary`, `bg-primary`, `border-primary`, etc.).

### Critical: Color Token Definitions

All 11 colors from the UX spec, mapped to Tailwind v4 `@theme` variable names:

```css
@theme inline {
  /* Colors */
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-completed: #9CA3AF;
  --color-border: #E5E7EB;
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-error: #DC2626;
  --color-error-hover: #B91C1C;
  --color-toast-bg: #1F2937;
}
```

This generates utilities like `bg-background`, `text-text-primary`, `border-border`, `bg-primary`, `text-error`, `bg-toast-bg`, etc.

### Critical: Spacing Token Definitions

Tailwind v4 uses a `--spacing` base unit that generates the numeric spacing scale. Set the base to `0.25rem` (4px). Then define named spacing aliases:

```css
@theme inline {
  --spacing: 0.25rem;  /* Base: 4px. p-1 = 4px, p-2 = 8px, p-4 = 16px, etc. */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
}
```

The numeric scale (p-1, p-2, p-4, m-8) comes from `--spacing` base automatically. Named tokens (p-xs, p-sm, p-md) are available via the explicit definitions.

### Critical: System Font Stack

The UX spec requires the system font stack — NO Google Fonts:

```css
@theme inline {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

You MUST remove the Geist font imports from `layout.tsx`:
```typescript
// DELETE these lines:
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ ... });
const geistMono = Geist_Mono({ ... });
```

And remove the Geist CSS variable classes from `<html>`:
```tsx
// BEFORE:
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>

// AFTER:
<html lang="en" className="h-full antialiased">
```

### Critical: Remove Dark Mode

The current `globals.css` has a `prefers-color-scheme: dark` media query. Remove it — V1 is light theme only. Also remove the `:root` CSS custom property block since colors will be defined directly in `@theme`.

### Layout Structure

The page layout uses mobile-first responsive design:

```
Mobile (<768px):              Desktop (768px+):
┌─────────────────────┐      ┌────────────────────────────┐
│ px-4 (16px margins) │      │     mx-auto max-w-[640px]  │
│                     │      │     px-8 (32px margins)     │
│ Awesome Todo        │      │                            │
│                     │      │     Awesome Todo            │
│ [future: TodoForm]  │      │                            │
│ [future: TodoList]  │      │     [future: TodoForm]     │
│                     │      │     [future: TodoList]     │
└─────────────────────┘      └────────────────────────────┘
```

Use these Tailwind classes:
- `<main>` — `mx-auto max-w-[640px] px-4 md:px-8 py-8 md:py-12`
- `<h1>` — `text-2xl font-bold text-text-primary mb-6 md:mb-8` (24px, bold, leading-tight)

### Anti-Patterns (FORBIDDEN)

- Do NOT create a `tailwind.config.ts` file — Tailwind v4 uses CSS `@theme` blocks
- Do NOT use `@apply` — use utility classes directly in JSX
- Do NOT add dark mode support — not in V1
- Do NOT add any components yet — this story is layout shell only
- Do NOT install any new packages
- Do NOT use relative imports `../` — use `@/` alias
- Do NOT add `console.log`
- Do NOT create barrel exports (`index.ts`)

### Previous Story Intelligence

**From Story 1.3 (review):**
- Health check endpoint exists at `src/app/api/health/route.ts` — no interaction with this story
- 17 tests pass across schema + API suites — verify they still pass after your changes

**From Story 1.2 (done):**
- API routes exist at `src/app/api/todos/route.ts` — no interaction with this story
- Integration tests use `// @vitest-environment node` directive

**From Story 1.1 (done):**
- Prisma v7 with LibSQL adapter — `src/generated/prisma/client` — no interaction with this story
- Zod v4 is in use — no interaction with this story

**Deferred work items (from deferred-work.md):**
- No items are relevant to this story. All deferred items concern API behavior.

### Git Intelligence

Recent commits show: project initialization (1.1), implementation readiness docs, BMad planning artifacts. No commits yet for stories 1.2 or 1.3 (changes are uncommitted). Your changes should not conflict with uncommitted work in `src/app/api/` or `src/__tests__/`.

### Project Structure Notes

Files to modify:
```
src/app/globals.css     # MODIFY — replace @theme block with full design tokens
src/app/layout.tsx      # MODIFY — remove Geist fonts, simplify
src/app/page.tsx        # MODIFY — replace placeholder with layout shell
```

No new files needed. No new directories needed.

After this story, the remaining files are unchanged:
```
src/app/api/            # Existing — untouched
src/lib/                # Existing — untouched
src/__tests__/          # Existing — untouched
```

### References

- [Source: architecture.md#Implementation Patterns — naming conventions, anti-patterns]
- [Source: architecture.md#Project Structure — layout.tsx, page.tsx, globals.css]
- [Source: architecture.md#Frontend Architecture — component tree, single page]
- [Source: ux-design-specification.md#Color System — all 11 color hex values]
- [Source: ux-design-specification.md#Typography System — system font stack, type scale]
- [Source: ux-design-specification.md#Spacing & Layout Foundation — 4px base, spacing tokens, 640px max-width]
- [Source: ux-design-specification.md#Responsive Strategy — mobile-first, 768px breakpoint]
- [Source: ux-design-specification.md#Design Direction Decision — Clean Minimal direction]
- [Source: epics.md#Story 1.4 — acceptance criteria]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Pre-existing test failure: `src/__tests__/api/todos.test.ts` fails due to missing `DATABASE_URL` env var — not caused by this story's changes. Schema tests (9 tests) pass.

### Completion Notes List

- Replaced `@theme inline` block in `globals.css` with complete design token system: 11 color tokens, spacing scale (4px base + named aliases), system font stack
- Removed dark mode `prefers-color-scheme` media query and `:root` CSS custom properties
- Removed Geist font imports and CSS variable classes from `layout.tsx`, kept `antialiased` and metadata
- Replaced placeholder `page.tsx` with layout shell: `<main>` with 640px max-width, mobile-first responsive margins (px-4/md:px-8), "Awesome Todo" heading (text-2xl, bold)
- `npm run lint` passes cleanly
- `npm test` — 9/9 schema tests pass; 1 pre-existing integration test failure (DATABASE_URL not set)
- `next build` compiles successfully with no errors

### Change Log

- 2026-04-24: Implemented design tokens and core layout (Story 1.4)

### File List

- `src/app/globals.css` — modified (replaced @theme block with full design token system)
- `src/app/layout.tsx` — modified (removed Geist fonts, simplified HTML classes)
- `src/app/page.tsx` — modified (replaced placeholder with layout shell)

### Review Findings

- [x] [Review][Patch] `font-family` double-stacks `sans-serif` — `--font-sans` already ends with `sans-serif`, body rule appends another [src/app/globals.css:33] — fixed
- [x] [Review][Patch] Missing `color-scheme: light` declaration — browsers may render dark scrollbars/form controls on the white page for users with OS dark mode [src/app/globals.css] — fixed
- [x] [Review][Defer] `.refine()` converts UpdateTodoSchema to ZodEffects, breaking `.shape`/`.pick()`/`.extend()` [src/lib/schemas.ts:10] — deferred, pre-existing (already tracked)
- [x] [Review][Defer] UpdateTodoSchema does not strip unknown properties — no `.strict()` or `.strip()` [src/lib/schemas.ts:7] — deferred, pre-existing (already tracked)
- [x] [Review][Defer] `text-text-primary` naming collision — `text-primary` maps to blue (#2563EB) not text color; future contributors will likely reach for wrong utility [src/app/globals.css] — deferred, naming trap for future stories
