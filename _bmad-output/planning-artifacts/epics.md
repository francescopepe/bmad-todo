---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Awesome Todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Awesome Todo, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can create a new task by entering a text description
- FR2: User can view all tasks (active and completed) in a single list
- FR3: User can mark a task as completed
- FR4: User can mark a completed task as active again
- FR5: User can edit an existing task's description
- FR6: User can delete a task
- FR7: User can distinguish completed tasks from active tasks visually
- FR8: System persists all tasks across page refreshes
- FR9: System persists all tasks across browser close and reopen
- FR10: System persists all tasks across server restarts
- FR11: System maintains task state (active/completed) across sessions
- FR12: System provides immediate visual feedback when a task is created
- FR13: System provides immediate visual feedback when a task is completed or reactivated
- FR14: System provides immediate visual feedback when a task is deleted
- FR15: System provides immediate visual feedback when a task is edited
- FR16: System notifies the user when a server operation fails
- FR17: System reverts optimistic UI changes when the corresponding server operation fails
- FR18: System catches unhandled exceptions and presents a recovery action
- FR19: System displays an empty state when no tasks exist
- FR20: System displays a loading state while tasks are being fetched
- FR21: System displays an error state when task fetching fails
- FR22: User can perform all task operations on desktop browsers
- FR23: User can perform all task operations on mobile browsers
- FR24: System adapts layout to the user's viewport without losing functionality
- FR25: System exposes a REST API for creating a task
- FR26: System exposes a REST API for retrieving all tasks
- FR27: System exposes a REST API for updating a task
- FR28: System exposes a REST API for deleting a task
- FR29: System validates all API request inputs before processing
- FR30: System returns consistent response envelopes for success and error cases
- FR31: System runs in a Docker container for consistent development and deployment
- FR32: System persists database data outside the container lifecycle

### Non-Functional Requirements

- NFR1: User-initiated actions reflect in the UI within 100ms via optimistic updates
- NFR2: API responses return within 500ms for all CRUD operations
- NFR3: First Contentful Paint under 1.5s on a 3G connection
- NFR4: Time to Interactive under 2s on a modern broadband connection
- NFR5: Frontend bundle size under 200KB gzipped for initial load
- NFR6: All API inputs are validated and sanitized before processing to prevent injection attacks
- NFR7: API error responses do not leak internal implementation details
- NFR8: The application sets appropriate HTTP security headers
- NFR9: All interactive elements are reachable and operable via keyboard
- NFR10: All form inputs have associated labels
- NFR11: Focus indicators are visible on all interactive elements
- NFR12: Semantic HTML elements are used in place of generic containers
- NFR13: Zero data loss across page refresh, browser close, and server restart scenarios
- NFR14: Failed API operations never leave the UI in an inconsistent state
- NFR15: Unhandled exceptions are caught by an error boundary and present a recovery path
- NFR16: The database file is persisted via Docker volume, surviving container restarts and rebuilds

### Additional Requirements

- Starter template: `npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm`
- Next.js 16 App Router with API Route Handlers
- Prisma 7 + SQLite with Todo model (id, title, completed, createdAt, updatedAt)
- Health check endpoint (`/api/health`) for Docker HEALTHCHECK
- Multi-stage Docker build with non-root user
- Vitest for unit/component/integration tests (70% minimum coverage)
- Playwright for E2E tests (minimum 5 passing tests)
- Playwright + axe-core for accessibility audits (zero critical WCAG violations)
- Zod schemas shared between API validation and TypeScript type inference
- Optimistic update pattern: save state → optimistic update → API call → success: no-op / failure: rollback + toast
- `useTodos` hook as single data interface between components and API
- README.md with setup instructions + AI-INTEGRATION-LOG.md

### UX Design Requirements

- UX-DR1: Implement Clean Minimal design direction — white background, borderless bottom-border input, hair-thin separators, hidden action buttons on hover
- UX-DR2: Implement color system — 11 design tokens (background #FFFFFF, surface #F9FAFB, text primary #111827, text secondary #6B7280, text completed #9CA3AF, border #E5E7EB, primary action #2563EB, primary hover #1D4ED8, error #DC2626, error hover #B91C1C, toast bg #1F2937)
- UX-DR3: Implement typography system — system font stack, 6 type roles, two weights only (400, 700)
- UX-DR4: Implement spacing system — 4px base unit, 6 token sizes (xs 4px, sm 8px, md 16px, lg 24px, xl 32px, 2xl 48px), 640px max content width centered
- UX-DR5: Implement TodoForm component — bottom-border input with blue focus state, Add button, Enter key submit, auto-clear and refocus
- UX-DR6: Implement TodoItem component — checkbox + text + Edit/Delete buttons (hidden until hover, always visible on mobile), inline edit mode
- UX-DR7: Implement EmptyState component — centered "No todos yet" text, minimal
- UX-DR8: Implement Toast component — dark background, white text, bottom-right desktop / bottom-center mobile, slide-in, 4s auto-dismiss, role="alert"
- UX-DR9: Implement LoadingSpinner — centered CSS spinner, aria-label="Loading tasks"
- UX-DR10: Implement ErrorBoundary — clean error screen with "Reload" button
- UX-DR11: Implement completion transition — strikethrough + muted color with smooth CSS transition
- UX-DR12: Implement responsive breakpoint — mobile-first, 768px breakpoint, @media (hover: hover) for action buttons
- UX-DR13: Implement keyboard accessibility — Tab, Enter, Escape, 2px blue focus ring
- UX-DR14: Implement touch targets — minimum 44x44px on mobile

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create task |
| FR2 | Epic 1 | View all tasks |
| FR3 | Epic 2 | Mark task completed |
| FR4 | Epic 2 | Reactivate completed task |
| FR5 | Epic 2 | Edit task description |
| FR6 | Epic 2 | Delete task |
| FR7 | Epic 1 | Visual distinction for completed tasks |
| FR8 | Epic 1 | Persist across page refresh |
| FR9 | Epic 4 | Persist across browser close |
| FR10 | Epic 4 | Persist across server restart |
| FR11 | Epic 4 | Maintain state across sessions |
| FR12 | Epic 1 | Feedback on create |
| FR13 | Epic 2 | Feedback on complete/reactivate |
| FR14 | Epic 2 | Feedback on delete |
| FR15 | Epic 2 | Feedback on edit |
| FR16 | Epic 2 | Error notification |
| FR17 | Epic 2 | Optimistic rollback |
| FR18 | Epic 2 | Error boundary |
| FR19 | Epic 1 | Empty state |
| FR20 | Epic 1 | Loading state |
| FR21 | Epic 2 | Error state on fetch fail |
| FR22 | Epic 3 | Desktop operations |
| FR23 | Epic 3 | Mobile operations |
| FR24 | Epic 3 | Viewport adaptation |
| FR25 | Epic 1 | POST API |
| FR26 | Epic 1 | GET API |
| FR27 | Epic 2 | PATCH API |
| FR28 | Epic 2 | DELETE API |
| FR29 | Epic 1 | Input validation |
| FR30 | Epic 1 | Consistent envelopes |
| FR31 | Epic 4 | Docker container |
| FR32 | Epic 4 | Persistent volume |

## Epic List

### Epic 1: Project Foundation & Core Task Creation
Users can open the app and create their first task immediately — the "type it, it's there" moment.
**FRs covered:** FR1, FR2, FR7, FR8, FR12, FR19, FR20, FR25, FR26, FR29, FR30
**NFRs addressed:** NFR1, NFR3, NFR4, NFR5, NFR6, NFR7, NFR8, NFR12
**UX-DRs:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5, UX-DR7, UX-DR9

### Epic 2: Complete Task Lifecycle
Users can manage their full task workflow — complete, edit, delete — with instant feedback and honest error handling.
**FRs covered:** FR3, FR4, FR5, FR6, FR13, FR14, FR15, FR16, FR17, FR18, FR21, FR27, FR28
**NFRs addressed:** NFR13, NFR14, NFR15
**UX-DRs:** UX-DR6, UX-DR8, UX-DR10, UX-DR11, UX-DR13

### Epic 3: Responsive Experience & Accessibility
Users on any device get the full experience — mobile, desktop, keyboard-only, screen reader.
**FRs covered:** FR22, FR23, FR24
**NFRs addressed:** NFR9, NFR10, NFR11
**UX-DRs:** UX-DR12, UX-DR14

### Epic 4: Docker Deployment & Production Readiness
The application runs reliably in Docker with persistent data, health monitoring, and production configuration.
**FRs covered:** FR9, FR10, FR11, FR31, FR32
**NFRs addressed:** NFR2, NFR16
**Additional:** Multi-stage Docker build, non-root user, health checks, docker-compose, environment configs

### Epic 5: Quality Assurance & Documentation
The codebase is tested, audited, and documented — ready for presentation.
**FRs covered:** Cross-cutting — validates all FRs
**Additional:** 70% coverage, 5 E2E tests, accessibility audit, security review, README, AI integration log

## Epic 1: Project Foundation & Core Task Creation

Users can open the app and create their first task immediately — the "type it, it's there" moment.

### Story 1.1: Project Initialization & Data Layer

As a **developer**,
I want a fully configured Next.js project with Prisma, SQLite, Tailwind, and testing infrastructure,
So that all subsequent stories have a solid foundation to build on.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the initialization command is run (`npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm`)
**Then** a Next.js 16 project is created with TypeScript, Tailwind CSS, ESLint, and App Router
**And** Prisma is installed and configured with SQLite (`DATABASE_URL=file:./dev.db`)
**And** the Todo model is defined in `prisma/schema.prisma` with fields: id (cuid), title (String), completed (Boolean, default false), createdAt (DateTime), updatedAt (DateTime)
**And** Zod schemas are created in `src/lib/schemas.ts` (CreateTodoSchema, UpdateTodoSchema)
**And** shared TypeScript types are defined in `src/lib/types.ts` (Todo, ApiResponse<T>)
**And** API helper utilities exist in `src/lib/apiHelpers.ts` (successResponse, errorResponse)
**And** Prisma client singleton is configured in `src/lib/prisma.ts`
**And** Vitest is configured with `vitest.config.ts`
**And** Playwright is installed with `playwright.config.ts`
**And** `npm run dev` starts the application without errors
**And** `npm test` runs without errors (even if no tests exist yet)

### Story 1.2: Todo API — Create & List Endpoints

As a **user**,
I want to create tasks and retrieve my task list via API,
So that my tasks are stored and retrievable.

**Acceptance Criteria:**

**Given** the API is running
**When** a POST request is sent to `/api/todos` with `{ "title": "Buy groceries" }`
**Then** a new todo is created in the database
**And** the response is `{ data: { id, title, completed: false, createdAt, updatedAt }, success: true }` with status 201

**Given** the API is running
**When** a POST request is sent to `/api/todos` with an empty title `{ "title": "" }`
**Then** the response is `{ error: { message, code: "VALIDATION_ERROR", details }, success: false }` with status 400

**Given** todos exist in the database
**When** a GET request is sent to `/api/todos`
**Then** all todos are returned as `{ data: Todo[], success: true }` with status 200
**And** todos are ordered by createdAt descending (newest first)

**Given** no todos exist in the database
**When** a GET request is sent to `/api/todos`
**Then** the response is `{ data: [], success: true }` with status 200

**And** integration tests exist for both endpoints covering success and error cases

### Story 1.3: Health Check Endpoint

As a **DevOps engineer**,
I want a health check endpoint,
So that Docker can monitor application status.

**Acceptance Criteria:**

**Given** the application is running
**When** a GET request is sent to `/api/health`
**Then** the response is `{ status: "ok", timestamp: "<ISO 8601>" }` with status 200

**And** an integration test validates the health check response

### Story 1.4: Design Tokens & Core Layout

As a **user**,
I want a clean, minimal app layout with the Awesome Todo branding,
So that I immediately understand this is a focused, intentional tool.

**Acceptance Criteria:**

**Given** the Tailwind config
**When** design tokens are configured in `tailwind.config.ts`
**Then** all 11 color tokens from the UX spec are defined (background, surface, text-primary, text-secondary, text-completed, border, primary, primary-hover, error, error-hover, toast-bg)
**And** the spacing scale uses 4px base (xs, sm, md, lg, xl, 2xl)
**And** the system font stack is configured
**And** the app layout (`layout.tsx`) renders with the "Awesome Todo" title
**And** the page content is centered with 640px max-width on desktop
**And** mobile layout uses 16px margins

### Story 1.5: Task Creation UI & Optimistic Add

As a **user**,
I want to type a task and hit Add (or Enter) and see it appear instantly,
So that capturing tasks feels effortless with zero delay.

**Acceptance Criteria:**

**Given** the app is loaded and the input field is visible
**When** the user types "Send invoice to Laura" and presses Enter
**Then** the task appears in the list immediately (optimistic update)
**And** the input field clears and refocuses for the next task
**And** the API POST fires in the background
**And** on API success, no visible change occurs (state already correct)

**Given** the app is loaded
**When** the user types a task and clicks the "Add" button
**Then** the same behavior occurs as pressing Enter

**Given** the app is loaded
**When** the user submits an empty input
**Then** nothing happens (no API call, no empty task added)

**Given** the app loads for the first time with no tasks
**When** the page renders
**Then** the EmptyState component shows "No todos yet"
**And** the input field is auto-focused

**Given** the app is loading tasks from the API
**When** the initial GET request is in flight
**Then** a centered loading spinner is displayed

**And** the `useTodos` hook manages all state and API communication
**And** component tests exist for TodoForm, TodoList, EmptyState, and LoadingSpinner

## Epic 2: Complete Task Lifecycle

Users can manage their full task workflow — complete, edit, delete — with instant feedback and honest error handling.

### Story 2.1: Todo API — Update & Delete Endpoints

As a **user**,
I want to update and delete tasks via API,
So that my task changes are persisted reliably.

**Acceptance Criteria:**

**Given** a todo exists with id "abc123"
**When** a PATCH request is sent to `/api/todos/abc123` with `{ "completed": true }`
**Then** the todo is updated in the database
**And** the response is `{ data: <updated Todo>, success: true }` with status 200

**Given** a todo exists with id "abc123"
**When** a PATCH request is sent to `/api/todos/abc123` with `{ "title": "Updated title" }`
**Then** the todo title is updated in the database
**And** the response includes the updated todo

**Given** a todo exists with id "abc123"
**When** a DELETE request is sent to `/api/todos/abc123`
**Then** the todo is removed from the database
**And** the response is `{ data: { id: "abc123" }, success: true }` with status 200

**Given** no todo exists with id "nonexistent"
**When** a PATCH or DELETE request is sent to `/api/todos/nonexistent`
**Then** the response is `{ error: { message, code: "NOT_FOUND" }, success: false }` with status 404

**And** integration tests exist for PATCH and DELETE covering success, validation, and not-found cases

### Story 2.2: Task Completion Toggle

As a **user**,
I want to check off tasks and see them visually marked as complete,
So that I can track my progress at a glance.

**Acceptance Criteria:**

**Given** an active task is displayed in the list
**When** the user clicks/taps the checkbox
**Then** the task immediately shows strikethrough text and muted color (`#9CA3AF`) via smooth CSS transition
**And** the API PATCH fires in the background with `{ completed: true }`

**Given** a completed task is displayed in the list
**When** the user clicks/taps the checkbox
**Then** the strikethrough and muted color are removed immediately
**And** the API PATCH fires with `{ completed: false }`

**Given** a toggle API call fails
**When** the server returns an error
**Then** the checkbox reverts to its previous state
**And** a toast notification appears with an error message

**And** component tests exist for TodoItem completion toggle behavior

### Story 2.3: Inline Task Editing

As a **user**,
I want to edit a task's description inline,
So that I can fix typos or update tasks without recreating them.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** the user clicks the Edit button (or task text)
**Then** the task text transforms into an editable input pre-filled with the current text
**And** the input receives focus

**Given** the user is in edit mode
**When** the user modifies the text and presses Enter
**Then** the text updates immediately (optimistic)
**And** the API PATCH fires with the new title
**And** edit mode exits

**Given** the user is in edit mode
**When** the user clicks away (blur)
**Then** the edit is saved (same as Enter)

**Given** the user is in edit mode
**When** the user presses Escape
**Then** the edit is cancelled and the original text is restored

**Given** an edit API call fails
**When** the server returns an error
**Then** the text reverts to the previous value
**And** a toast notification appears

**And** component tests exist for TodoItem edit mode behavior

### Story 2.4: Task Deletion

As a **user**,
I want to delete tasks I no longer need,
So that my list stays relevant.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** the user clicks the Delete button
**Then** the task is removed from the list immediately (optimistic)
**And** the API DELETE fires in the background

**Given** a delete API call fails
**When** the server returns an error
**Then** the task reappears in the list at its original position
**And** a toast notification appears

**And** component tests exist for TodoItem delete behavior

### Story 2.5: Toast Notification System

As a **user**,
I want to be informed when something goes wrong,
So that I'm never uncertain about the state of my data.

**Acceptance Criteria:**

**Given** an API operation fails
**When** the `useTodos` hook triggers a toast
**Then** a dark toast notification slides in from the bottom
**And** the toast displays a plain-language error message (e.g., "Couldn't add task. Try again.")
**And** the toast auto-dismisses after 4 seconds
**And** the toast has `role="alert"` and `aria-live="polite"`

**Given** multiple errors occur in quick succession
**When** multiple toasts are triggered
**Then** toasts stack vertically with 8px gap

**And** component tests exist for Toast rendering and auto-dismiss

### Story 2.6: Error Boundary

As a **user**,
I want the app to recover gracefully from unexpected errors,
So that I'm never stuck on a broken screen.

**Acceptance Criteria:**

**Given** an unhandled exception occurs in a React component
**When** the ErrorBoundary catches the error
**Then** a clean error screen is displayed with a "Reload" button
**And** no stack traces or error codes are visible to the user

**Given** the user sees the error boundary screen
**When** the user clicks "Reload"
**Then** the application reloads and attempts to recover

**And** the ErrorBoundary wraps the app in `layout.tsx`
**And** component tests exist for ErrorBoundary rendering

## Epic 3: Responsive Experience & Accessibility

Users on any device get the full experience — mobile, desktop, keyboard-only, screen reader.

### Story 3.1: Responsive Layout & Mobile Adaptation

As a **mobile user**,
I want the app to work perfectly on my phone,
So that I can capture tasks on the go.

**Acceptance Criteria:**

**Given** the app is viewed on a viewport < 768px
**When** the page renders
**Then** the layout uses single-column with 16px margins
**And** action buttons (Edit, Delete) are always visible (not hidden behind hover)
**And** all touch targets are minimum 44x44px
**And** the input field is prominent and usable with thumb-only interaction

**Given** the app is viewed on a viewport >= 768px
**When** the page renders
**Then** the layout uses 640px centered max-width with 32px margins
**And** action buttons are hidden by default, revealed on hover

**Given** a hover-capable device
**When** `@media (hover: hover)` matches
**Then** action buttons use opacity-based hover reveal
**And** on non-hover devices, buttons are always visible

### Story 3.2: Keyboard Navigation & Accessibility

As a **keyboard user**,
I want to perform all operations without a mouse,
So that the app is usable regardless of input method.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the user navigates via Tab key
**Then** focus moves through: input → Add button → first task checkbox → first task Edit → first task Delete → next task...
**And** all focused elements show a 2px blue (`#2563EB`) focus ring

**Given** the input field is focused
**When** the user types and presses Enter
**Then** the task is created (same as clicking Add)

**Given** a task is in edit mode
**When** the user presses Escape
**Then** the edit is cancelled

**Given** the app uses semantic HTML
**Then** `<main>`, `<form>`, `<ul>`, `<li>`, `<button>`, `<input>` are used appropriately
**And** the input has a visually hidden `<label>`
**And** checkboxes have `aria-label` with the task text
**And** the Toast has `role="alert"` and `aria-live="polite"`
**And** the LoadingSpinner has `aria-label="Loading tasks"`

## Epic 4: Docker Deployment & Production Readiness

The application runs reliably in Docker with persistent data, health monitoring, and production configuration.

### Story 4.1: Dockerfile & Multi-Stage Build

As a **developer**,
I want a production-optimized Docker image,
So that the application deploys consistently and securely.

**Acceptance Criteria:**

**Given** the Dockerfile
**When** `docker build` is run
**Then** a multi-stage build executes: deps → builder → runner
**And** the final image runs as a non-root user (`nextjs`)
**And** only production dependencies and built assets are in the final stage
**And** the image size is minimized (no dev dependencies, no source code)

### Story 4.2: Docker Compose & Data Persistence

As a **user**,
I want my tasks to survive container restarts,
So that I never lose data.

**Acceptance Criteria:**

**Given** a `docker-compose.yml` configuration
**When** `docker compose up` is run
**Then** the application starts and is accessible at `http://localhost:3000`
**And** SQLite database is stored in a named Docker volume (`todo-data`)
**And** `DATABASE_URL` environment variable points to the volume-mounted path

**Given** the application is running with tasks created
**When** the container is stopped and restarted (`docker compose down && docker compose up`)
**Then** all previously created tasks are still present

**Given** the docker-compose configuration
**When** health check is configured
**Then** Docker polls `GET /api/health` every 30 seconds
**And** the container reports healthy when the endpoint returns 200

**Given** environment configuration
**Then** `.env.example` documents all required environment variables
**And** dev and production environments are supported via environment variables

## Epic 5: Quality Assurance & Documentation

The codebase is tested, audited, and documented — ready for presentation.

### Story 5.1: E2E Test Suite

As a **QA engineer**,
I want comprehensive end-to-end tests,
So that all user journeys are validated automatically.

**Acceptance Criteria:**

**Given** Playwright is configured and the app is running
**When** the E2E test suite is executed
**Then** the following 5+ tests pass:

1. **Create a todo:** Open app → type task → submit → task appears in list
2. **Complete a todo:** Create task → click checkbox → task shows strikethrough
3. **Edit a todo:** Create task → click Edit → modify text → save → text updated
4. **Delete a todo:** Create task → click Delete → task disappears
5. **Empty state flow:** Open app with no tasks → see "No todos yet" → add first task → empty state disappears

**And** tests run in headless mode via `npm run test:e2e`

### Story 5.2: Test Coverage & Unit Tests

As a **developer**,
I want comprehensive unit and integration tests,
So that code quality is verifiable and regressions are caught.

**Acceptance Criteria:**

**Given** the test suite
**When** `npm run test:coverage` is executed
**Then** code coverage is at least 70%
**And** all unit tests pass (Zod schemas, API helpers, useTodos hook logic)
**And** all component tests pass (TodoForm, TodoItem, TodoList, EmptyState, Toast, ErrorBoundary)
**And** all integration tests pass (API route handlers with real SQLite test database)

### Story 5.3: Accessibility Audit

As a **user with accessibility needs**,
I want the application to meet accessibility standards,
So that I can use it regardless of ability.

**Acceptance Criteria:**

**Given** the application is running
**When** an axe-core accessibility audit is run via Playwright
**Then** zero critical WCAG violations are found
**And** the audit report is documented

**Given** Lighthouse is run against the application
**When** the accessibility score is calculated
**Then** the score is 90 or above

### Story 5.4: Security Review & Documentation

As a **developer**,
I want security reviewed code and complete documentation,
So that the project is ready for presentation and handoff.

**Acceptance Criteria:**

**Given** the codebase
**When** a security review is conducted
**Then** no XSS vulnerabilities exist (React JSX escaping, no dangerouslySetInnerHTML)
**And** no SQL injection vectors exist (Prisma parameterized queries)
**And** all API inputs are validated via Zod
**And** error responses don't leak internal details
**And** security headers are configured
**And** findings are documented

**Given** the project
**When** documentation is complete
**Then** `README.md` includes: project description, prerequisites, setup instructions, development commands, test commands, Docker deployment instructions
**And** `AI-INTEGRATION-LOG.md` documents: agent usage, MCP servers used, test generation approach, debugging cases, limitations encountered
