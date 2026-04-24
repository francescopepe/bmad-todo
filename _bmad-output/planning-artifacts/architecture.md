---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-24'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/product-brief-bmad-todo.md
  - docs/Product Requirement Document (PRD) for the Todo App.md
workflowType: 'architecture'
project_name: 'Awesome Todo'
user_name: 'Francesco'
date: '2026-04-24'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
32 FRs across 7 capability areas. Architecturally, these decompose into three layers:

- **Frontend (14 FRs):** Task CRUD UI, optimistic updates, visual feedback, responsive layout, application states (empty, loading, error)
- **API (6 FRs):** 4 REST endpoints (create, read, update, delete), input validation, consistent response envelopes
- **Infrastructure (2 FRs):** Docker containerization, persistent database volume
- **Cross-layer (10 FRs):** Data persistence across sessions, error handling chain (optimistic rollback → toast → error boundary)

**Non-Functional Requirements:**
16 NFRs across 4 categories that directly shape architectural decisions:

| NFR Category | Architectural Impact |
|---|---|
| Performance (NFR1-5) | Optimistic UI pattern required. Bundle size constraint eliminates heavy frameworks/libraries. System font stack (no web font loading). |
| Security (NFR6-8) | Schema validation layer on all API inputs. Error response sanitization. Security headers middleware. |
| Accessibility (NFR9-12) | Semantic HTML component structure. Keyboard navigation support in component design. Focus management. |
| Reliability (NFR13-16) | Persistent storage with volume mount. Optimistic update + rollback pattern. Error boundary at app root. |

**Scale & Complexity:**

- Primary domain: Full-stack web (SPA + REST API)
- Complexity level: Low
- Estimated architectural components: ~12 (6 React components, 4 API routes, 1 database model, 1 Docker config)

### Technical Constraints & Dependencies

- **Bundle size:** Under 200KB gzipped — eliminates component libraries (MUI, Ant Design), heavy state management (Redux), and large utility libraries
- **Database:** SQLite via Prisma ORM — file-based, no separate database server needed, persisted via Docker volume
- **Deployment:** Docker required for MVP — application and database in container(s)
- **No authentication:** Single implicit user — no auth middleware, no session management, no user model
- **Extensibility requirement:** Architecture must not prevent future addition of auth, multi-user, priorities, filtering. This means: clean API contract, database adapter pattern, separated concerns.

### Cross-Cutting Concerns Identified

1. **Optimistic UI pattern** — Spans frontend state management (immediate update), API communication (background request), and error handling (rollback on failure). This is the most architecturally significant pattern — it touches every layer.

2. **Error handling chain** — Three levels: (a) optimistic rollback for failed mutations, (b) toast notifications for user-facing errors, (c) error boundary for unhandled exceptions. Must be consistent across all CRUD operations.

3. **Type safety** — TypeScript throughout with shared interfaces (`Todo`, `ApiResponse<T>`) ensuring frontend-backend alignment. Zod schemas for runtime validation on API boundary.

4. **Docker deployment** — Container configuration, volume mounting for SQLite persistence, environment variable management. Affects both development workflow and production deployment.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SPA with API routes) — Next.js with App Router as a unified frontend + backend platform.

### Starter Options Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| `create-next-app` (default) | Official, maintained, includes TS + Tailwind + ESLint + App Router + Turbopack. Clean starting point. | No Prisma, no Vitest, no Docker out of the box | **Selected** — add what's needed, don't remove what isn't |
| `nextjs-prisma-sqlite` (community) | Includes Prisma + SQLite setup | Unmaintained, outdated Next.js version, includes Redux (unnecessary) | Rejected |
| T3 Stack (`create-t3-app`) | Includes Prisma + TypeScript + Tailwind | Adds tRPC (unnecessary — we want REST), NextAuth (unnecessary), opinionated structure | Rejected |
| Custom starter from scratch | Full control | Unnecessary effort for a standard stack | Rejected |

### Selected Starter: create-next-app (Next.js 16)

**Rationale:**
- Official and always current — no maintenance risk
- Default setup already includes TypeScript, Tailwind CSS, ESLint, App Router, and Turbopack
- Clean starting point without unnecessary dependencies to remove
- Prisma, Vitest, and Docker are simple additions on top of a clean base

**Initialization Command:**

```bash
npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript (strict mode) with Next.js 16
- Node.js runtime for API routes

**Styling Solution:**
- Tailwind CSS configured with PostCSS
- `tailwind.config.ts` ready for design token customization

**Build Tooling:**
- Turbopack for development (fast HMR)
- Next.js production build with automatic optimization
- SWC compiler for TypeScript transpilation

**Code Organization:**
- `src/app/` — App Router pages and API routes
- `src/app/api/` — REST API route handlers
- `@/*` import alias configured

**Development Experience:**
- Hot module replacement via Turbopack
- TypeScript type checking
- ESLint with Next.js rules

**What We Add After Initialization:**

| Addition | Purpose |
|---|---|
| Prisma + `@prisma/client` | ORM for SQLite database |
| Vitest + `@testing-library/react` | Unit and component testing |
| Playwright + `@axe-core/playwright` | E2E testing + accessibility audits |
| Zod | Runtime schema validation for API inputs |
| Dockerfile + docker-compose.yml | Container deployment with SQLite volume |

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model and Prisma schema
- API route structure and response format
- State management approach (useTodos hook with optimistic updates)
- Docker multi-stage build with health checks
- Test infrastructure (Vitest + Playwright + coverage)

**Important Decisions (Shape Architecture):**
- Error handling chain (validation → API → optimistic rollback → toast → error boundary)
- Security headers and input sanitization
- Accessibility compliance (WCAG AA — zero critical violations)

**Deferred Decisions (Post-MVP):**
- Authentication strategy
- CI/CD pipeline
- External monitoring/logging
- Database migration to PostgreSQL

### Data Architecture

**Database:** SQLite via Prisma ORM v7

**Data Model:**

```prisma
model Todo {
  id        String   @id @default(cuid())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Validation:** Zod schemas at the API boundary, shared between request validation and TypeScript type inference:

```typescript
// Shared types
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: { message: string; code: string; details?: unknown };
}

// Zod schemas
const CreateTodoSchema = z.object({ title: z.string().min(1).max(500) });
const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});
```

**Migrations:** `prisma db push` for development, `prisma migrate deploy` for Docker production builds.

**Caching:** None. Single user, small dataset, SQLite direct queries are sufficient.

### Authentication & Security

**Authentication:** None in V1. Single implicit user.

**Security measures:**

| Measure | Implementation |
|---|---|
| Input validation | Zod schemas on all API inputs — reject invalid data before it reaches the database |
| Error sanitization | API error responses never expose stack traces, file paths, or query structures |
| Security headers | Next.js config: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block` |
| XSS prevention | React's default JSX escaping. No `dangerouslySetInnerHTML`. |
| SQL injection | Prisma parameterized queries — no raw SQL |
| Non-root Docker | Container runs as non-root user for defense in depth |

### API & Communication Patterns

**API structure:** Next.js Route Handlers

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/todos` | Retrieve all todos |
| POST | `/api/todos` | Create a new todo |
| PATCH | `/api/todos/[id]` | Update a todo (title or completed) |
| DELETE | `/api/todos/[id]` | Delete a todo |
| GET | `/api/health` | Health check endpoint for Docker |

**Response format:**

```typescript
// Success
{ data: Todo | Todo[], success: true }

// Error
{ error: { message: string, code: string, details?: unknown }, success: false }
```

**Error codes:** `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500)

**Health check endpoint:** Returns `{ status: "ok", timestamp: string }` — used by Docker `HEALTHCHECK` directive.

### Frontend Architecture

**State management:** Custom `useTodos` hook encapsulating:
- Local state (`useState`) for the todo list
- API communication functions (fetch, create, update, delete)
- Optimistic update logic with rollback on failure
- Toast trigger on error

No external state library. The hook is the single source of truth for todo data.

**Component tree:**

```
App (page.tsx)
├── TodoForm
├── TodoList
│   └── TodoItem[] (map)
├── EmptyState (conditional)
├── LoadingSpinner (conditional)
├── ErrorBoundary (wrapper)
└── Toast (portal)
```

**Routing:** Single page — `src/app/page.tsx`. No client-side routing needed.

### Infrastructure & Deployment

**Docker — multi-stage build:**

```
Stage 1: deps     — Install npm dependencies
Stage 2: builder  — Build Next.js production app + generate Prisma client
Stage 3: runner   — Minimal production image, non-root user, copy built assets
```

**docker-compose.yml:**

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    volumes:
      - todo-data:/app/data    # SQLite persistence
    environment:
      - DATABASE_URL=file:/app/data/todos.db
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    user: "nextjs"             # Non-root user

volumes:
  todo-data:
```

**Compose profiles:** `docker compose --profile test` for test environment with separate database.

**Environment configuration:**

| Variable | Dev | Production | Test |
|---|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | `file:/app/data/todos.db` | `file:./test.db` |
| `NODE_ENV` | `development` | `production` | `test` |

### Testing Architecture

| Layer | Tool | Target | Coverage |
|---|---|---|---|
| Unit tests | Vitest | Utility functions, Zod schemas, API route handlers | Core logic |
| Component tests | Vitest + React Testing Library | React components in isolation | UI behavior |
| Integration tests | Vitest | API routes with real SQLite (test DB) | API contracts |
| E2E tests | Playwright | Full user journeys in browser | Minimum 5 tests |
| Coverage | Vitest c8/istanbul | All source code | Minimum 70% |
| Accessibility | Playwright + axe-core | WCAG AA audit | Zero critical violations |

**E2E test plan (minimum 5):**
1. Create a todo
2. Complete a todo (toggle)
3. Edit a todo
4. Delete a todo
5. Empty state display + first task creation flow

**Test database strategy:** Separate SQLite file for tests, reset between test suites.

### Documentation Requirements

- **README.md:** Setup instructions, development workflow, Docker deployment, test commands
- **AI integration log:** Maintained throughout implementation documenting agent usage, MCP servers, test generation, debugging, and limitations

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`create-next-app` + Prisma + Vitest + Playwright setup)
2. Data layer (Prisma schema, database setup, Zod schemas)
3. API routes (4 CRUD endpoints + health check + tests)
4. Frontend components (TodoForm → TodoList/TodoItem → EmptyState → Toast → LoadingSpinner)
5. Optimistic UI integration (`useTodos` hook connecting components to API)
6. E2E tests (Playwright covering all 5 journeys)
7. Docker containerization (multi-stage build, compose, health checks)
8. QA reports (coverage, accessibility, security review)

**Cross-Component Dependencies:**
- Zod schemas shared between API validation and frontend type inference
- `useTodos` hook depends on API response format
- Toast component triggered by hook error callbacks
- Docker health check depends on `/api/health` endpoint
- E2E tests depend on all components and API being functional

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make different choices

### Naming Patterns

**Database Naming (Prisma):**

| Element | Convention | Example |
|---|---|---|
| Model names | PascalCase, singular | `Todo` |
| Field names | camelCase | `createdAt`, `updatedAt` |
| ID format | cuid string | `clyf8z0001` |

**API Naming:**

| Element | Convention | Example |
|---|---|---|
| Endpoints | Plural nouns, kebab-case if multi-word | `/api/todos` |
| Route params | `[id]` (Next.js convention) | `/api/todos/[id]` |
| Query params | camelCase | `?sortBy=createdAt` (future) |
| HTTP methods | GET (read), POST (create), PATCH (partial update), DELETE (remove) | Never PUT for partial updates |

**Code Naming:**

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `TodoItem`, `TodoForm` |
| Component files | PascalCase `.tsx` | `TodoItem.tsx` |
| Hooks | camelCase with `use` prefix | `useTodos` |
| Hook files | camelCase `.ts` | `useTodos.ts` |
| Utility functions | camelCase | `formatApiError` |
| Utility files | camelCase `.ts` | `apiHelpers.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `Todo`, `ApiResponse<T>` |
| Type files | camelCase `.ts` | `types.ts` |
| Zod schemas | PascalCase + `Schema` suffix | `CreateTodoSchema` |
| Test files | Co-located, `.test.ts` / `.test.tsx` suffix | `TodoItem.test.tsx` |
| E2E test files | In `e2e/` folder, `.spec.ts` suffix | `todo-crud.spec.ts` |

### Structure Patterns

**Project Organization:**

```
src/
├── app/
│   ├── page.tsx                # Single page (home)
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Tailwind base styles
│   └── api/
│       ├── todos/
│       │   ├── route.ts        # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts    # PATCH (update), DELETE (remove)
│       └── health/
│           └── route.ts        # GET (health check)
├── components/
│   ├── TodoForm.tsx
│   ├── TodoForm.test.tsx
│   ├── TodoList.tsx
│   ├── TodoList.test.tsx
│   ├── TodoItem.tsx
│   ├── TodoItem.test.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   └── Toast.tsx
├── hooks/
│   ├── useTodos.ts
│   └── useTodos.test.ts
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── schemas.ts              # Zod schemas
│   ├── types.ts                # Shared TypeScript types
│   └── apiHelpers.ts           # Error formatting, response builders
├── __tests__/
│   └── api/
│       ├── todos.test.ts       # API integration tests
│       └── health.test.ts
e2e/
├── todo-crud.spec.ts
├── empty-state.spec.ts
└── error-handling.spec.ts
prisma/
├── schema.prisma
└── migrations/
```

**Rules:**
- Component tests are **co-located** next to the component file
- API integration tests are in `src/__tests__/api/`
- E2E tests are in `e2e/` at project root (Playwright convention)
- One component per file. No barrel exports (`index.ts`) — import directly.
- `lib/` for non-component shared code (database, schemas, types, utilities)

### Format Patterns

**API Response Format:**

```typescript
// ALL successful responses:
{ data: T, success: true }

// ALL error responses:
{ error: { message: string, code: string, details?: unknown }, success: false }

// NEVER return raw data without wrapper
// NEVER mix formats between endpoints
```

**Date/Time Format:**
- API returns ISO 8601 strings: `"2026-04-24T10:30:00.000Z"`
- Frontend displays relative or locale-formatted dates if needed (V1: no date display)
- Database stores as DateTime (Prisma handles conversion)

**JSON Field Naming:** camelCase in all API request/response bodies. Matches TypeScript conventions and Prisma default output.

**Null Handling:** Never return `null` for missing fields. Use `undefined` (omit from response) or provide a default value.

### Communication Patterns

**State Management (useTodos hook):**

```typescript
// State shape — ALWAYS this structure
interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
}

// Hook return — ALWAYS this interface
interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, title: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}
```

**Optimistic Update Pattern — ALWAYS follow this sequence:**
1. Save current state (for rollback)
2. Apply optimistic update to local state
3. Fire API request in background
4. On success: do nothing (state already correct)
5. On failure: rollback to saved state + trigger toast

### Process Patterns

**Error Handling Chain:**

| Layer | Responsibility | Pattern |
|---|---|---|
| Zod validation | Reject malformed input | Return 400 with `VALIDATION_ERROR` code and field-level details |
| API route handler | Catch database/business errors | Return appropriate status code with sanitized message |
| `useTodos` hook | Handle API failures | Rollback optimistic state, call toast callback |
| Toast component | Display error to user | Show message for 4 seconds, auto-dismiss |
| ErrorBoundary | Catch unhandled React errors | Render fallback UI with "Reload" button |

**Loading State Pattern:**
- `isLoading: true` ONLY on initial data fetch
- Individual mutations are NEVER loading — they're optimistic
- No per-item loading spinners
- No per-action "saving..." indicators

**Import Order Convention:**

```typescript
// 1. React/Next.js imports
import { useState } from 'react';
// 2. Third-party libraries
import { z } from 'zod';
// 3. Local imports (absolute paths with @/)
import { Todo } from '@/lib/types';
import { TodoItem } from '@/components/TodoItem';
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly as specified (PascalCase components, camelCase functions, etc.)
- Use the API response wrapper format for every endpoint — no exceptions
- Co-locate component tests next to component files
- Use the optimistic update pattern for all mutations (never loading-then-update)
- Import using `@/` alias, never relative paths with `../`

**Anti-Patterns (FORBIDDEN):**
- `any` type — use `unknown` if type is truly unknown, then narrow
- `console.log` in production code — use proper error handling
- Inline styles — use Tailwind utilities exclusively
- `index.ts` barrel exports — import from specific files
- `useEffect` for data fetching — fetch in hook initialization or server component
- Raw `fetch` calls in components — all API calls go through `useTodos` hook

## Project Structure & Boundaries

### Complete Project Directory Structure

```
awesome-todo/
├── README.md                        # Setup, dev workflow, Docker, test commands
├── AI-INTEGRATION-LOG.md            # AI agent usage documentation
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .env                             # DATABASE_URL=file:./dev.db
├── .env.example
├── .env.test                        # DATABASE_URL=file:./test.db
├── .gitignore
├── Dockerfile                       # Multi-stage build
├── docker-compose.yml               # App + volume for SQLite
├── prisma/
│   ├── schema.prisma                # Todo model
│   └── migrations/                  # Generated by prisma migrate
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (ErrorBoundary wrapper, metadata)
│   │   ├── page.tsx                 # Home page — single page app
│   │   ├── globals.css              # Tailwind directives + design tokens
│   │   └── api/
│   │       ├── todos/
│   │       │   ├── route.ts         # GET /api/todos, POST /api/todos
│   │       │   └── [id]/
│   │       │       └── route.ts     # PATCH /api/todos/:id, DELETE /api/todos/:id
│   │       └── health/
│   │           └── route.ts         # GET /api/health
│   ├── components/
│   │   ├── TodoForm.tsx
│   │   ├── TodoForm.test.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoList.test.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoItem.test.tsx
│   │   ├── EmptyState.tsx
│   │   ├── EmptyState.test.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorBoundary.test.tsx
│   │   └── Toast.tsx
│   ├── hooks/
│   │   ├── useTodos.ts
│   │   └── useTodos.test.ts
│   └── lib/
│       ├── prisma.ts                # Prisma client singleton
│       ├── schemas.ts               # Zod schemas (CreateTodoSchema, UpdateTodoSchema)
│       ├── schemas.test.ts
│       ├── types.ts                 # Todo, ApiResponse<T>, ApiError
│       └── apiHelpers.ts            # formatError(), successResponse(), errorResponse()
├── e2e/
│   ├── todo-crud.spec.ts            # Create, complete, edit, delete
│   ├── empty-state.spec.ts          # Empty state + first task flow
│   └── error-handling.spec.ts       # Error scenarios
└── public/
    └── favicon.ico
```

### Architectural Boundaries

**API Boundary (src/app/api/):**
- The ONLY layer that touches Prisma directly
- Validates all inputs via Zod before processing
- Returns consistent `ApiResponse<T>` envelopes
- Never exposes internal errors — sanitizes all responses
- The frontend treats this as an external service (could be replaced with a separate backend later)

**Component Boundary (src/components/):**
- Presentational components — receive data and callbacks via props
- Never call APIs directly — all data flows through `useTodos` hook
- Never import from `src/app/api/` or `prisma/`
- Each component owns its own visual state (hover, edit mode) but NOT data state

**Hook Boundary (src/hooks/):**
- `useTodos` is the single interface between components and the API
- Owns all data state (todos array, loading, error)
- Owns all optimistic update logic
- Components consume the hook's return value — nothing else

**Data Boundary (prisma/ + src/lib/prisma.ts):**
- Prisma client instantiated once via singleton pattern
- Only imported in API route handlers — never in components or hooks
- Schema is the single source of truth for the database structure

### Requirements to Structure Mapping

| FR Category | Files |
|---|---|
| Task Management (FR1-7) | `useTodos.ts`, `TodoForm.tsx`, `TodoItem.tsx`, `route.ts` (todos) |
| Data Persistence (FR8-11) | `prisma.ts`, `schema.prisma`, `route.ts` (todos) |
| Feedback & Error Handling (FR12-18) | `useTodos.ts` (optimistic), `Toast.tsx`, `ErrorBoundary.tsx` |
| Application States (FR19-21) | `EmptyState.tsx`, `LoadingSpinner.tsx`, `ErrorBoundary.tsx` |
| Responsive Experience (FR22-24) | `tailwind.config.ts`, all component `.tsx` files |
| API Contract (FR25-30) | `route.ts` (todos), `apiHelpers.ts`, `schemas.ts`, `types.ts` |
| Deployment (FR31-32) | `Dockerfile`, `docker-compose.yml` |

### Data Flow

```
User Action
    ↓
Component (TodoForm/TodoItem)
    ↓ calls hook method
useTodos Hook
    ↓ optimistic update (local state)
    ↓ async API call
    ↓
fetch('/api/todos')
    ↓
Next.js Route Handler
    ↓ Zod validation
    ↓ Prisma query
    ↓
SQLite Database
    ↓
Response (ApiResponse<T>)
    ↓
useTodos Hook
    ↓ success: no-op / failure: rollback + toast
    ↓
Component re-renders
```

### Development Workflow

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm test` | Run Vitest (unit + integration tests) |
| `npm run test:coverage` | Run Vitest with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npx prisma db push` | Push schema to dev database |
| `npx prisma studio` | Open Prisma database browser |
| `docker compose up` | Run production build in Docker |
| `docker compose --profile test up` | Run with test environment |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** Pass
- Next.js 16 + Prisma 7 + Tailwind CSS + Vitest + Playwright — all compatible, all actively maintained, all TypeScript-native
- SQLite via Prisma works with Next.js Route Handlers — no ORM/framework conflicts
- Tailwind CSS is framework-agnostic — no conflict with Next.js or React
- Vitest and Playwright occupy separate test domains (unit/integration vs E2E) — no overlap or conflict

**Pattern Consistency:** Pass
- camelCase throughout (TypeScript, API responses, Prisma fields) — no naming collisions
- PascalCase for components and types — consistent with React/TypeScript conventions
- All patterns reference the same API response envelope format
- Optimistic update pattern documented identically in decisions, patterns, and UX spec

**Structure Alignment:** Pass
- Project structure maps directly to architectural boundaries (api/ → API boundary, components/ → component boundary, hooks/ → hook boundary, lib/ → shared utilities)
- Test co-location pattern aligns with component structure
- E2E tests separated at project root per Playwright convention

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Category | Architectural Support | Status |
|---|---|---|
| Task Management (FR1-7) | API routes + useTodos hook + components | Covered |
| Data Persistence (FR8-11) | Prisma + SQLite + Docker volume | Covered |
| Feedback & Error Handling (FR12-18) | Optimistic UI pattern + Toast + ErrorBoundary | Covered |
| Application States (FR19-21) | EmptyState + LoadingSpinner + ErrorBoundary | Covered |
| Responsive Experience (FR22-24) | Tailwind CSS + mobile-first breakpoints | Covered |
| API Contract (FR25-30) | Route Handlers + Zod + ApiResponse<T> | Covered |
| Deployment (FR31-32) | Docker multi-stage + volume mount | Covered |

**Non-Functional Requirements Coverage:**

| NFR Category | Architectural Support | Status |
|---|---|---|
| Performance (NFR1-5) | Optimistic UI, Turbopack, system fonts, Tailwind purge, bundle constraint | Covered |
| Security (NFR6-8) | Zod validation, error sanitization, security headers, non-root Docker | Covered |
| Accessibility (NFR9-12) | Semantic HTML, keyboard navigation, focus indicators, labels | Covered |
| Reliability (NFR13-16) | SQLite persistence, Docker volume, optimistic rollback, ErrorBoundary | Covered |

**Acceptance Criteria Coverage:**

| Criterion | Architectural Support | Status |
|---|---|---|
| Working CRUD application | Full stack architecture defined | Covered |
| 70% test coverage | Vitest + coverage config | Covered |
| 5 Playwright E2E tests | E2E test plan with 5 scenarios | Covered |
| Docker deployment | Multi-stage Dockerfile + compose | Covered |
| Zero critical WCAG violations | Playwright + axe-core audit | Covered |
| Health checks | /api/health endpoint + Docker HEALTHCHECK | Covered |
| Non-root Docker user | Multi-stage build with nextjs user | Covered |
| README + AI integration log | Documentation requirements defined | Covered |

### Implementation Readiness Validation

**Decision Completeness:** Pass — All critical decisions documented with specific technology versions (Next.js 16, Prisma 7, Playwright latest). All patterns include concrete code examples.

**Structure Completeness:** Pass — Every file in the project tree has a defined purpose. Every FR maps to specific files. No placeholder directories.

**Pattern Completeness:** Pass — Naming, structure, format, communication, and process patterns all defined with examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** 0

**Important Gaps:** 1
- The PRD's "Code and Craftsmanship" section specifies implementation details (specific hook names, component tree, TypeScript interfaces) that partially duplicate architectural decisions here. The architecture document is authoritative — if there's a conflict, this document wins.

**Minor Gaps:** 1
- No explicit decision on favicon/metadata strategy. Minor — Next.js handles metadata via `layout.tsx` `metadata` export. Can be addressed during implementation.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (bundle size, SQLite, Docker)
- [x] Cross-cutting concerns mapped (optimistic UI, error chain, type safety, Docker)
- [x] Acceptance criteria from training program integrated

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (Next.js 16 + Prisma 7 + Tailwind + Vitest + Playwright)
- [x] Integration patterns defined (API boundary, hook boundary, component boundary)
- [x] Performance considerations addressed (optimistic UI, bundle constraints)
- [x] Testing architecture defined (unit + component + integration + E2E + accessibility)

**Implementation Patterns**
- [x] Naming conventions established (database, API, code, tests)
- [x] Structure patterns defined (project tree, file organization)
- [x] Communication patterns specified (state management, optimistic updates)
- [x] Process patterns documented (error handling chain, loading states)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete
- [x] Development workflow commands defined

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Architecture matches product philosophy — deliberately simple, no over-engineering
- Every FR and NFR traces to specific architectural components
- Acceptance criteria fully covered including testing, Docker, and accessibility requirements
- Clear boundaries prevent AI agents from making conflicting decisions
- Concrete code examples for all critical patterns

**Areas for Future Enhancement:**
- Authentication layer (Phase 3) — architecture is ready via clean API boundary
- Database migration to PostgreSQL — Prisma adapter pattern supports this
- CI/CD pipeline — not needed for V1 single-developer workflow

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- The architecture document is authoritative over PRD implementation details

**First Implementation Priority:**

```bash
npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm
```
