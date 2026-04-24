---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - docs/Product Requirement Document (PRD) for the Todo App.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 1
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - Awesome Todo

**Author:** Francesco
**Date:** 2026-04-23

## Executive Summary

Awesome Todo is a full-stack web application that helps individual users track personal tasks with zero cognitive overhead. The product solves a specific problem: existing task managers burden users with features, configuration, and learning curves that get between them and the simple act of recording and completing tasks. Awesome Todo removes that friction entirely — users open the app, see their tasks, and act on them without explanation or onboarding.

The application provides four core operations — create, view, complete, and delete — backed by a responsive SPA frontend and a persistent REST API backend. Updates feel instantaneous through optimistic UI rendering. The interface works across desktop and mobile with polished empty, loading, and error states that communicate reliability from the first interaction.

### What Makes This Special

Awesome Todo's differentiator is deliberate restraint. Where competitors (Todoist, Things, Apple Reminders) add layers of complexity, this product succeeds by removing everything except the core need. The interface transparently represents the user's mental model: "tasks I need to do." Completed tasks remain visible with strikethrough styling rather than being hidden — respecting the user's awareness of what they've accomplished.

This restraint runs through every layer: a single data model with five fields, a four-endpoint API, a component tree shallow enough to understand in minutes. The architecture is intentionally extensible (audit trails via `updatedAt`, sort/filter parameters, swappable database adapter) without prematurely activating any of those extensions. The result is a product that does one thing and does it well — earning trust through reliability and speed rather than feature count.

## Project Classification

- **Project Type:** Web application (SPA with backend API)
- **Domain:** General / Productivity
- **Complexity:** Low
- **Project Context:** Greenfield

## Success Criteria

### User Success

Users can immediately understand and use the application without documentation, onboarding flows, or tutorials. The interface communicates available actions through standard web conventions: a text input with an "Add" button, checkboxes for completion, explicit "Edit" and "Delete" buttons on each item. Users experience instant visual feedback when they create, toggle, edit, or delete tasks — the UI updates optimistically before the server confirms, ensuring the interface never feels sluggish. Completed tasks are visually distinct through strikethrough text and muted color, making task status immediately apparent at a glance. The application works equally well on desktop and mobile browsers, adapting its layout without breaking functionality or readability.

### Business Success

This is a greenfield portfolio/demonstration project. Success is measured by completeness and craft rather than adoption metrics. The project succeeds when it can be presented as a fully functional, well-architected product that demonstrates deliberate technical decision-making — a reference implementation of "do one thing well." Future business success would be validated if the architecture cleanly supports extensions (auth, multi-user, priorities) without requiring rewrites.

### Technical Success

The application persists all user data reliably to an SQLite database through Prisma ORM — no data loss on page refresh, browser close, or server restart. The frontend and backend are cleanly decoupled through a well-defined REST API contract with consistent JSON response envelopes (`{ data, success }` for success; `{ error: { message, code, details }, success }` for failure). All request bodies and query parameters are validated with Zod schemas before processing. Error handling prevents broken states: API errors surface as toast notifications, optimistic updates roll back on failure, and the error boundary catches unhandled exceptions with a recovery action. The application functions correctly across modern desktop and mobile browsers without layout breakage or interaction failures.

### Code and Craftsmanship

The codebase demonstrates clear separation of concerns: API routes handle HTTP and validation, Prisma handles persistence, the `useTodos` hook encapsulates all state management and API communication, and presentational components remain stateless where possible. TypeScript is used throughout with strict typing — shared interfaces (`Todo`, `ApiResponse<T>`) ensure frontend-backend alignment. Code is readable, maintainable, and avoids unnecessary abstraction. The component tree is flat and discoverable: `TodoProvider` > `TodoForm` + `TodoList` > `TodoItem`, with `EmptyState`, `LoadingSpinner`, and `Toast` as utility components. No over-engineering — the solution matches the problem scope. The architecture is simple enough that a new developer can understand the entire system in a single reading session.

### Measurable Outcomes

- A user can add, complete, and delete a task within 10 seconds of first opening the app
- All CRUD operations reflect in the UI in under 100ms (optimistic), with server confirmation under 500ms
- Zero data loss across page refresh, browser close, and server restart scenarios
- Full functionality on latest Chrome, Firefox, Safari (desktop and mobile)
- A new developer can read and understand the full codebase in under 30 minutes

## User Journeys

### Journey 1: Marco — First-Time User, Happy Path

**Who:** Marco, a freelance graphic designer who keeps forgetting small tasks between client projects. He's tried Todoist but felt overwhelmed by projects, labels, and filters. He just wants a place to dump tasks and check them off.

**Opening Scene:** Marco opens Awesome Todo for the first time in his browser. No sign-up wall, no onboarding tour, no "getting started" guide — just an empty state that says something like "No todos yet" and a text input at the top.

**Rising Action:** He types "Send invoice to Laura" and hits Add. The task appears instantly. He adds two more: "Buy printer ink" and "Reply to Alex's email." Within seconds he has a clean list of three tasks. No categories to choose, no priority to set, no due date to think about. He just typed and it's there.

**Climax:** Marco finishes the invoice and checks it off. The task gets a strikethrough and fades to a muted color — but it doesn't disappear. He can see what he's done alongside what's left. That small moment — seeing his progress without losing context — is where the product earns trust.

**Resolution:** Marco closes the tab and moves on with his day. The next morning, he opens the app again. Everything is exactly where he left it. Two tasks remaining, one completed. No "session expired," no sync conflict, no surprise. He adds today's tasks and keeps going. Awesome Todo becomes the tab he never closes.

### Journey 2: Marco — Error Recovery and Edge Cases

**Who:** Same Marco, a few days into using the app.

**Opening Scene:** Marco has built a habit. He has eight tasks — five active, three completed. He's on his laptop, moving through his list.

**Rising Action:** Marco notices a typo — "Prepare presentaton for Friday" — and edits the task inline to fix it. The correction saves instantly. Later, he accidentally deletes the task instead of completing it. He notices immediately — the task vanishes from the list. He needs to re-add it manually. He types it again and adds it back. Minor friction, but the app doesn't fight him.

**Climax:** Later, his Wi-Fi drops while he's adding a new task. He hits Add, the task appears optimistically in the list — but the server call fails. A toast notification appears briefly letting him know something went wrong, and the task disappears from the list (optimistic rollback). Marco waits a moment, refreshes, and the connection is back. He re-adds the task. The app didn't silently lose data or leave a ghost entry.

**Resolution:** Marco trusts the app because it's honest. When things fail, they fail visibly and cleanly. The app never pretends to succeed when it hasn't. He's never in a state where he's unsure what's real.

### Journey 3: Sofia — Mobile User on the Go

**Who:** Sofia, a university student who uses her phone for everything. She opens Awesome Todo in mobile Safari between classes to capture quick reminders.

**Opening Scene:** Sofia is walking between lectures. She pulls out her phone and opens Awesome Todo. The layout adapts — the input field is prominent, the task list fills the screen, and the touch targets (checkboxes, edit, delete buttons) are large enough to tap without precision.

**Rising Action:** She quickly adds "Email professor about extension" with her thumb. The task appears instantly. She scrolls through her existing tasks — the list is readable, nothing is cut off, and completed tasks are clearly distinguished even on the smaller screen. She taps the checkbox on "Return library books" and sees the strikethrough immediately.

**Climax:** Between bites at lunch, she reviews her list. Five tasks, two done. She deletes a completed task she no longer cares about. Every interaction is a single tap — no long-press menus, no swipe gestures to learn. The mobile experience is the desktop experience, just reflowed.

**Resolution:** Sofia never thinks about the app being "mobile" — it just works. She switches between her laptop at home and her phone on campus seamlessly. The same data, the same interactions, the same clarity.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Inline task editing | Marco J2 |
| Instant task creation (single input + Add) | Marco J1, Sofia J3 |
| Optimistic UI with instant visual feedback | Marco J1, Marco J2, Sofia J3 |
| Persistent storage across sessions | Marco J1 |
| Completed task visibility (strikethrough + muted) | Marco J1, Sofia J3 |
| Toast notifications for error states | Marco J2 |
| Optimistic rollback on server failure | Marco J2 |
| Error boundary with recovery action | Marco J2 |
| Responsive layout for mobile browsers | Sofia J3 |
| Touch-friendly interaction targets | Sofia J3 |
| No onboarding / zero learning curve | Marco J1, Sofia J3 |

## Web App Specific Requirements

### Project-Type Overview

Awesome Todo is a single-page application (SPA) with a REST API backend. The frontend renders entirely in the browser, communicating with the server exclusively through JSON API calls. No server-side rendering, no page reloads during normal operation. The architecture prioritizes simplicity and perceived speed through optimistic UI updates.

### Browser Support

| Browser | Version | Platform |
|---|---|---|
| Chrome | Latest stable | Desktop, Android |
| Firefox | Latest stable | Desktop |
| Safari | Latest stable | Desktop (macOS), Mobile (iOS) |

No legacy browser support required. No polyfills for older standards. The app targets modern ES module-capable browsers only.

### Responsive Design

The application adapts to desktop and mobile viewports using CSS-native responsive techniques. No separate mobile build or adaptive serving. Key breakpoints:

- **Desktop (768px+):** Full-width layout with comfortable spacing
- **Mobile (<768px):** Single-column layout with touch-friendly targets (minimum 44x44px tap areas)

All functionality is identical across breakpoints — no features are hidden or added based on screen size.

### SEO Strategy

Not applicable for V1. The application serves personal content with no public-facing pages requiring indexation. No SSR, meta tags, or structured data needed.

### Implementation Considerations

- No WebSocket or real-time sync — single user, single session model
- No offline/PWA capabilities in V1 — requires network connectivity
- No authentication layer — the app serves a single implicit user
- Docker containerization for consistent development and deployment environments
- SQLite database file persisted via Docker volume for data durability

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — deliver the core value proposition (track personal tasks with zero cognitive overhead) reliably and completely. The MVP is intentionally the whole product for V1. Nothing is deferred that would make the experience feel incomplete; nothing is included that doesn't serve the single value proposition.

**Resource Requirements:** Single developer. The architecture (one data model, four endpoints, shallow component tree) is designed to be built and maintained by one person. No specialized roles needed for V1.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Marco J1: First-time user, happy path (create, complete, delete tasks)
- Marco J2: Error recovery (optimistic rollback, toast notifications, error boundary)
- Sofia J3: Mobile user (responsive layout, touch-friendly targets)

**Must-Have Capabilities:**
- Task creation via text input + Add button
- Task completion toggle with strikethrough + muted styling
- Task deletion with immediate removal
- Task editing inline
- Optimistic UI updates with rollback on failure
- Persistent storage (SQLite + Prisma) across sessions
- REST API with Zod validation and consistent JSON envelopes
- Responsive layout (desktop + mobile)
- Empty state, loading state, error handling (toasts + error boundary)
- Docker containerization for development and deployment

**Design Constraint:** The product is optimized for small, personal task lists (tens of items, not hundreds). Users who need search, filtering, or categorization have outgrown V1 — the Phase 2 roadmap addresses this.

**Privacy:** No analytics, no tracking, no third-party data sharing. User tasks are stored on the server and nowhere else.

### Phase 2 — Growth (Post-MVP)

- Sort and filter tasks (API parameters already designed for this)
- Keyboard shortcuts for power users
- Dark mode / theme support

### Phase 3 — Expansion (Future)

- User authentication and personal accounts
- Multi-device sync
- Task priorities and due dates
- Collaboration and shared lists
- Audit trail leveraging `updatedAt`

### Risk Mitigation Strategy

**Technical Risks:** Low. The stack is well-understood (React, Node/Express, SQLite, Prisma, Docker). The biggest technical risk is over-engineering — mitigated by the product philosophy of deliberate restraint. If optimistic UI proves complex, fall back to simple loading states for V1 and add optimistic updates as a fast-follow.

**Market Risks:** Not applicable. This is a portfolio/demonstration project. Success is measured by craft quality, not adoption. No market validation needed.

**Resource Risks:** Minimal. The scope is calibrated for a single developer. If time is constrained, the Docker containerization could be deferred to post-MVP without affecting core functionality — though it's strongly preferred for V1.

## Functional Requirements

### Task Management

- FR1: User can create a new task by entering a text description
- FR2: User can view all tasks (active and completed) in a single list
- FR3: User can mark a task as completed
- FR4: User can mark a completed task as active again
- FR5: User can edit an existing task's description
- FR6: User can delete a task
- FR7: User can distinguish completed tasks from active tasks visually

### Data Persistence

- FR8: System persists all tasks across page refreshes
- FR9: System persists all tasks across browser close and reopen
- FR10: System persists all tasks across server restarts
- FR11: System maintains task state (active/completed) across sessions

### Feedback & Error Handling

- FR12: System provides immediate visual feedback when a task is created
- FR13: System provides immediate visual feedback when a task is completed or reactivated
- FR14: System provides immediate visual feedback when a task is deleted
- FR15: System provides immediate visual feedback when a task is edited
- FR16: System notifies the user when a server operation fails
- FR17: System reverts optimistic UI changes when the corresponding server operation fails
- FR18: System catches unhandled exceptions and presents a recovery action

### Application States

- FR19: System displays an empty state when no tasks exist
- FR20: System displays a loading state while tasks are being fetched
- FR21: System displays an error state when task fetching fails

### Responsive Experience

- FR22: User can perform all task operations on desktop browsers
- FR23: User can perform all task operations on mobile browsers
- FR24: System adapts layout to the user's viewport without losing functionality

### API Contract

- FR25: System exposes a REST API for creating a task
- FR26: System exposes a REST API for retrieving all tasks
- FR27: System exposes a REST API for updating a task
- FR28: System exposes a REST API for deleting a task
- FR29: System validates all API request inputs before processing
- FR30: System returns consistent response envelopes for success and error cases

### Deployment

- FR31: System runs in a Docker container for consistent development and deployment
- FR32: System persists database data outside the container lifecycle

## Non-Functional Requirements

### Performance

- NFR1: User-initiated actions (create, complete, edit, delete) reflect in the UI within 100ms via optimistic updates
- NFR2: API responses return within 500ms for all CRUD operations under normal conditions
- NFR3: First Contentful Paint under 1.5s on a 3G connection
- NFR4: Time to Interactive under 2s on a modern broadband connection
- NFR5: Frontend bundle size under 200KB gzipped for initial load — no heavy dependencies beyond the core framework

### Security

- NFR6: All API inputs are validated and sanitized before processing (Zod schemas) to prevent injection attacks
- NFR7: API error responses do not leak internal implementation details (stack traces, file paths, query structures)
- NFR8: The application sets appropriate HTTP security headers (Content-Type, X-Content-Type-Options, X-Frame-Options)

### Accessibility

- NFR9: All interactive elements are reachable and operable via keyboard (Tab, Enter, Escape)
- NFR10: All form inputs have associated labels
- NFR11: Focus indicators are visible on all interactive elements
- NFR12: Semantic HTML elements are used in place of generic containers where applicable

### Reliability

- NFR13: Zero data loss across page refresh, browser close, and server restart scenarios
- NFR14: Failed API operations never leave the UI in an inconsistent state — optimistic updates roll back on failure
- NFR15: Unhandled exceptions are caught by an error boundary and present a recovery path to the user
- NFR16: The SQLite database file is persisted via Docker volume, surviving container restarts and rebuilds
