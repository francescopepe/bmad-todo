# AI Integration Log

This document records how AI tools were used throughout the development of Awesome Todo.

## Agent Usage

- **Orchestration:** BMad Method v6.3.0 — a structured workflow framework for AI-assisted software development. Used for product briefing, PRD creation, architecture design, epic/story planning, story creation, implementation (dev-story), code review, and retrospectives.
- **AI Tool:** Claude Code CLI with Claude Opus 4.6 (1M context window)
- **Workflow cycle:** For each story: `create-story` → `dev-story` (implementation) → `code-review` (using a different LLM for independent review) → fix review findings → `retrospective`

### Epics Completed

| Epic | Description | Stories |
|---|---|---|
| Epic 1 | Project Foundation & Core Task Creation | 5 stories |
| Epic 2 | Complete Task Lifecycle | 6 stories |
| Epic 3 | Responsive Experience & Accessibility | 2 stories |
| Epic 4 | Docker Deployment & Production Readiness | 2 stories |
| Epic 5 | Quality Assurance & Documentation | 4 stories |

## MCP Servers Used

No MCP servers were configured for this project. All development was done through Claude Code CLI with direct file system access and shell commands.

## Test Generation Approach

AI generated all tests following a red-green-refactor cycle as specified in the BMad dev-story workflow:

- **Unit/Component tests (Vitest + Testing Library):** 147+ tests covering React components, custom hooks (`useTodos`), API route handlers, and utility functions. Coverage: 88.65% statements / 90.39% lines (threshold: 70%).
- **E2E tests (Playwright):** 16+ tests covering CRUD operations, empty state, accessibility (axe-core), and security headers. Sequential execution due to shared SQLite database.
- **Accessibility testing:** @axe-core/playwright for automated WCAG compliance checks. 4 dedicated accessibility E2E tests covering various page states.
- **Performance auditing:** Lighthouse programmatic audit via `scripts/lighthouse-audit.mjs` using chrome-launcher. CI-compatible with configurable thresholds.

### Test generation observations

- AI consistently wrote tests before implementation (TDD), catching interface mismatches early
- Component tests used Testing Library idioms (querying by role/label, not implementation details)
- E2E tests were structured with proper cleanup (deleteAllTodos) to ensure test isolation
- Coverage gaps were identified during dedicated test coverage stories (5-2) rather than relying on per-story coverage alone

## Debugging Cases

Key issues encountered and resolved during development (tracked in `_bmad-output/implementation-artifacts/deferred-work.md`):

1. **UpdateTodoSchema accepting empty objects** — Initial Zod schema lacked `.strict()` and empty-body validation. Fixed in Story 2.1 with `.strict().check()` ensuring at least one field is provided.

2. **Todo interface date type mismatch** — Prisma returns `Date` objects but the frontend expected ISO strings. Resolved with `serializeTodo()` helper in `apiHelpers.ts`.

3. **ZodEffects type incompatibility** — `.refine()` changed the schema type from `ZodObject` to `ZodEffects`, breaking `.safeParse()` type inference. Migrated to `.check()` (Zod 4 API).

4. **Opacity-based hover-reveal breaking keyboard navigation** — Action buttons hidden via `opacity-0` were invisible to screen readers and keyboard users. Replaced with `sr-only`/`not-sr-only` pattern for proper accessibility.

5. **SQLite WAL recovery in Docker volumes** — OOM kill or SIGKILL could leave WAL files in inconsistent state. Documented as accepted risk for portfolio project scope.

6. **jsdom keyboard event limitations** — `TodoItem` lines 53-54 (keyboard event handler branching) cannot be covered in jsdom because `contentEditable` key events don't fire properly. Documented as known test infrastructure limitation.

7. **Podman compose compatibility** — `docker-compose.yml` invocation through `container-engine.sh` doesn't work for `podman-compose`. The `podman compose` subcommand works. Documented as known limitation.

## Limitations Encountered

### AI-specific limitations

- **Context window management:** Long implementation sessions required careful context management. The BMad Method's story-scoped workflow helped keep each session focused.
- **Code review independence:** Using the same LLM for both implementation and review reduces review effectiveness. The BMad workflow recommends using a different LLM for code review.
- **Test coverage blind spots:** AI-generated tests tended toward happy-path scenarios. Dedicated test coverage stories (Epic 5) were needed to catch edge cases and improve coverage from ~70% to 88%+.

### Technical limitations

- **jsdom vs browser behavior:** Several component behaviors (contentEditable keyboard events, focus management) couldn't be fully tested in jsdom. E2E tests with Playwright covered these gaps.
- **Single-user race conditions:** Multiple optimistic update edge cases (rapid double-toggle, concurrent mutations) were identified during code reviews but accepted as risks given the single-user scope.
- **SQLite concurrency:** SQLite's write-lock model means concurrent write operations will serialize. Acceptable for single-user portfolio project.
- **Lighthouse in CI:** Chrome-based Lighthouse audits require a display server or headless Chrome configuration, adding CI complexity.
