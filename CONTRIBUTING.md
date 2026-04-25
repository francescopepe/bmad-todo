# Contributing to Awesome Todo

This project follows the **BMad Spec-Driven Development** methodology. All work flows through a structured artifact chain, ensuring traceability from requirements to implementation.

## Artifact Chain

```
Product Brief → PRD → Architecture → UX Design → Epics → Stories → Implementation → Retrospective
```

| Artifact | Location | Purpose |
|---|---|---|
| Product Brief | `_bmad-output/planning-artifacts/product-brief-bmad-todo.md` | Vision, problem, solution, differentiators |
| PRD | `_bmad-output/planning-artifacts/prd.md` | 32 functional requirements, 16 non-functional requirements, user journeys |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Technology choices, patterns, component tree, anti-patterns |
| UX Design | `_bmad-output/planning-artifacts/ux-design-specification.md` | Design tokens, responsive strategy, accessibility |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | 5 epics, 21 stories with Given/When/Then acceptance criteria |
| Implementation Stories | `_bmad-output/implementation-artifacts/{epic}-{story}-*.md` | Granular tasks, dev notes, completion records |
| Retrospectives | `_bmad-output/implementation-artifacts/epic-{n}-retro-*.md` | Post-epic review with action items |
| Deferred Work | `_bmad-output/implementation-artifacts/deferred-work.md` | Tracked scope changes with dispositions |
| Sprint Status | `_bmad-output/implementation-artifacts/sprint-status.yaml` | Story/epic status tracking |

Each artifact's frontmatter lists its `inputDocuments`, creating a verifiable dependency graph.

## Development Workflow

### 1. Story Creation

Stories are created from epics using the BMad `create-story` skill. Each story file includes:
- Acceptance criteria (Given/When/Then)
- Granular subtasks with file-level guidance
- Dev notes with architecture compliance references
- Anti-patterns to avoid
- Previous Story Intelligence (learnings from prior stories)

### 2. Implementation

Stories are implemented using the BMad `dev-story` skill, which follows the story spec strictly:
- All acceptance criteria must be met
- All tests must pass before marking complete
- Dev Agent Record documents model used, debug issues, and files changed

### 3. Code Review

Every story goes through code review (BMad `code-review` skill). Reviews produce:
- **Patch** findings — fixed immediately
- **Decision** findings — require judgment call
- **Defer** findings — documented in `deferred-work.md` with dispositions

### 4. Commit

Each story's changes should be committed separately after review, before starting the next story. Commit messages reference the story (e.g., `feat: implement story 3.2 — keyboard navigation`).

### 5. Retrospective

After all stories in an epic are complete, run a retrospective (BMad `bmad-retrospective` skill). Retros produce:
- Successes and challenges
- Action items with owners
- Previous retro follow-through assessment
- Next epic preparation tasks

## Deferred Work Tracking

`deferred-work.md` tracks all scope changes with categorized dispositions:
- **Open** — targeted to a future story/epic
- **Closed — Fixed** — resolved in a specific story
- **Closed — Superseded** — solved by a different approach
- **Closed — Accepted Risk** — documented and accepted

Items are triaged during code review with a target or disposition assigned at that time.

## Testing

| Type | Tool | Location | Command |
|---|---|---|---|
| Unit/Component | Vitest | `src/**/*.test.{ts,tsx}` | `npm test` |
| Integration (API) | Vitest | `src/__tests__/api/*.test.ts` | `npm test` |
| Coverage | @vitest/coverage-v8 | — | `npm run test:coverage` |
| E2E | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` |
| Accessibility | @axe-core/playwright | `e2e/accessibility.spec.ts` | `npm run test:e2e` |
| Lighthouse | lighthouse | `scripts/lighthouse-audit.mjs` | `npm run test:lighthouse` |

Coverage threshold: 70% statements/lines (currently 88.65%).

## Code Conventions

- **Imports:** Use `@/` alias for all project imports
- **Components:** Co-located tests (`ComponentName.test.tsx`)
- **Hooks:** Co-located tests (`hookName.test.ts`)
- **API routes:** Tests in `src/__tests__/api/`
- **E2E tests:** `e2e/` at project root with `.spec.ts` suffix
- **Locators:** Semantic (`getByRole`, `getByText`) over CSS selectors
- **Container commands:** Use `./scripts/container-engine.sh` proxy, never hardcode `docker` or `podman`
