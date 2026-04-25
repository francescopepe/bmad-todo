# Story 4.1: Dockerfile & Multi-Stage Build

Status: done

## Story

As a **developer**,
I want a production-optimized Docker image,
So that the application deploys consistently and securely.

## Acceptance Criteria

1. **Given** the Dockerfile, **When** `docker build` is run, **Then** a multi-stage build executes: deps -> builder -> runner.
2. **And** the final image runs as a non-root user (`nextjs`).
3. **And** only production dependencies and built assets are in the final stage.
4. **And** the image size is minimized (no dev dependencies, no source code).

## Tasks / Subtasks

- [x] Task 1: Configure Next.js standalone output (AC: #1, #3, #4)
  - [x] 1.1 Add `output: "standalone"` to `next.config.ts` — this is REQUIRED for Docker. Standalone mode bundles only the files the app needs to run, producing `.next/standalone/` with a self-contained server.
  - [x] 1.2 Verify `npm run build` produces `.next/standalone/` directory with embedded `server.js`
  - [x] 1.3 Verify `.next/static/` is produced (static assets must be copied separately into standalone)
  - [x] 1.4 Test standalone server locally: `node .next/standalone/server.js` serves the app on port 3000

- [x] Task 2: Create `.dockerignore` (AC: #4)
  - [x] 2.1 Create `.dockerignore` at project root excluding: `node_modules`, `.next`, `.git`, `*.db`, `coverage`, `test-results`, `playwright-report`, `e2e`, `_bmad-output`, `.claude`, `.env` (but NOT `.env.example`)
  - [x] 2.2 Verify Docker build context excludes large/unnecessary files

- [x] Task 3: Create multi-stage Dockerfile (AC: #1, #2, #3, #4)
  - [x] 3.1 **Stage 1 — `deps`**: Use `node:22-alpine` base. Install production dependencies only (`npm ci --omit=dev`). Prisma 7 requires Node.js >= 22.
  - [x] 3.2 **Stage 2 — `builder`**: Copy all source + full `node_modules`. Run `npx prisma generate` to generate the Prisma client for the Linux/Alpine target. Run `npm run build` to produce the standalone output.
  - [x] 3.3 **Stage 3 — `runner`**: Use `node:22-alpine` base. Create non-root user `nextjs` (UID 1001). Copy ONLY: `.next/standalone/`, `.next/static/` (into `.next/standalone/.next/static/`), `public/` (into `.next/standalone/public/`), and `prisma/schema.prisma`. Set `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, `PORT=3000`. `CMD ["node", ".next/standalone/server.js"]`.
  - [x] 3.4 Ensure Prisma client files are included — the standalone build should bundle them since they're imported in the app. Verify `src/generated/prisma` files are in `.next/standalone/`.
  - [x] 3.5 Create `/app/data` directory in runner stage, owned by `nextjs` user, for SQLite volume mount point.
  - [x] 3.6 EXPOSE 3000

- [x] Task 4: Build and verify Docker image (AC: #1, #2, #3, #4)
  - [x] 4.1 Run `docker build -t awesome-todo .` — must succeed without errors
  - [x] 4.2 Verify image runs as non-root: `docker run --rm awesome-todo whoami` outputs `nextjs`
  - [x] 4.3 Verify no dev dependencies in final image (no vitest, playwright, testing-library, etc.)
  - [x] 4.4 Verify no source `.ts`/`.tsx` files in final image (only compiled output)
  - [x] 4.5 Run container with volume: `docker run --rm -p 3000:3000 -e DATABASE_URL=file:/app/data/todos.db -v todo-data:/app/data awesome-todo` — app should start and health check at `http://localhost:3000/api/health` should return `{"status":"ok",...}`
  - [x] 4.6 Verify CRUD operations work through the running container (create, read, update, delete todos)

- [x] Task 5: Update `.env.example` (AC: relates to documentation)
  - [x] 5.1 Add comment documenting the Docker production DATABASE_URL: `# Docker production: DATABASE_URL=file:/app/data/todos.db`

## Dev Notes

### Critical: Next.js Standalone Output Mode

The `output: "standalone"` setting in `next.config.ts` is **mandatory** for Docker deployment. Without it, Next.js requires the full `node_modules` directory at runtime, resulting in a massive image. With standalone mode:
- Next.js traces all imports and bundles only needed files into `.next/standalone/`
- A self-contained `server.js` is produced that runs without `npm start`
- Static assets (`.next/static/`) and `public/` must be manually copied alongside the standalone output

**Read `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`** before implementation for the latest Docker guidance.

### Critical: Prisma in Docker

The project uses **Prisma 7.8.0** with the **LibSQL adapter** (`@prisma/adapter-libsql` + `@libsql/client`). Key Docker considerations:

1. **Prisma client generation**: `npx prisma generate` must run during the **builder** stage (not at runtime). The generated client output is at `src/generated/prisma/` and will be bundled into the standalone build.
2. **prisma.config.ts** uses `import "dotenv/config"` — this is a build-time config, not needed at runtime.
3. **No binary engine needed**: Prisma 7 with LibSQL adapter uses the JS-based query engine, not native binaries. No `binaryTargets` configuration needed in schema.prisma.
4. **DATABASE_URL at runtime**: The container receives `DATABASE_URL=file:/app/data/todos.db` via environment variable. The `/app/data/` directory is the Docker volume mount point.
5. **SQLite file creation**: SQLite creates the `.db` file automatically on first write. No migration step needed in Docker — `prisma db push` was used during development and the schema is embedded in the app.

**IMPORTANT**: Prisma 7 with the LibSQL adapter does NOT need `prisma migrate deploy` at container startup. The LibSQL client creates tables as needed. However, if the database doesn't exist yet, the first request will create it. Ensure the data directory exists and is writable.

### Architecture Compliance

- **Docker multi-stage build**: 3 stages — `deps`, `builder`, `runner` [Source: architecture.md — Infrastructure & Deployment]
- **Non-root user**: `nextjs` user in final stage [Source: architecture.md — Authentication & Security]
- **Health check endpoint**: Already exists at `/api/health` returning `{ status: "ok", timestamp: "<ISO 8601>" }` [Source: src/app/api/health/route.ts]
- **Volume mount point**: `/app/data` for SQLite persistence [Source: architecture.md — docker-compose.yml spec]
- **Environment variables**: `DATABASE_URL`, `NODE_ENV`, `HOSTNAME`, `PORT` [Source: architecture.md — Environment configuration]

### Library & Framework Requirements

| Dependency | Version | Docker Notes |
|---|---|---|
| Node.js base image | 22-alpine | Prisma 7 requires Node.js >= 22. Use Alpine for minimal image size. |
| Next.js | 16.2.4 | `output: "standalone"` produces self-contained server |
| Prisma | 7.8.0 | Generate in builder stage; JS engine only (no native binaries) |
| @libsql/client | 0.17.3 | Bundled into standalone output automatically |
| React | 19.2.4 | Bundled into standalone output automatically |

### File Structure Requirements

**Files to CREATE:**
- `Dockerfile` — Multi-stage build at project root
- `.dockerignore` — Build context exclusions at project root

**Files to MODIFY:**
- `next.config.ts` — Add `output: "standalone"`
- `.env.example` — Add Docker production DATABASE_URL comment

**Files NOT to modify:**
- `prisma/schema.prisma` — No `binaryTargets` needed (LibSQL adapter uses JS engine)
- `prisma.config.ts` — Build-time only, not needed in container
- `package.json` — No new dependencies needed
- Any component or API files — This story is infrastructure-only

### Dockerfile Reference Pattern

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite volume mount
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**IMPORTANT NOTES on the reference pattern:**
- The builder stage needs ALL dependencies (including dev) for the build to succeed. Copy `node_modules` from a full install, OR run `npm ci` (without `--omit=dev`) in the builder stage.
- The `deps` stage with `--omit=dev` is an optimization — it can be used if you want a separate layer for prod deps. But the **builder** stage needs dev deps too (TypeScript, Tailwind, etc.). Consider: deps stage installs ALL deps, builder copies from deps.
- Verify the standalone output path — `server.js` may be at `.next/standalone/server.js` depending on Next.js version. Test locally first.
- The `HOSTNAME=0.0.0.0` env var is critical — without it, the server only listens on localhost inside the container and won't be reachable from the host.

### Testing Requirements

- No automated test files needed for this story (infrastructure story)
- Manual verification: build image, run container, test health endpoint, test CRUD operations
- Verify image size is reasonable (target: under 300MB for Node.js Alpine + Next.js standalone)
- Verify non-root user with `docker run --rm <image> whoami`

### Previous Story Intelligence

**From Epic 3 (Stories 3.1, 3.2):**
- All 125 tests pass — no regressions from accessibility work
- Toast component has `role="alert"` + `aria-live="polite"`
- Focus rings on all interactive elements
- These are frontend concerns — no impact on Docker containerization

**From Epic 1 (Story 1.1 — Project Initialization):**
- Prisma configured with LibSQL adapter (not native SQLite driver)
- `prisma.config.ts` uses dotenv for env loading
- Generated Prisma client at `src/generated/prisma/` (gitignored)
- Dev database at `./dev.db` (gitignored)

**From Epic 1 (Story 1.3 — Health Check):**
- Health endpoint exists at `src/app/api/health/route.ts`
- Returns `{ status: "ok", timestamp: "<ISO string>" }` with status 200
- This is the endpoint Docker HEALTHCHECK will poll (in story 4.2)

### Git Intelligence

Recent commits show all 3 epics are complete:
- `4ce6aad` — Epics 2 & 3 (task interactions, UX, accessibility)
- `e7e4936` — Epic 1 stories 1.2-1.5 and story 2.1
- `0ab812c` — Story 1.1 (project initialization)

Working tree is clean — all previous work committed.

### Critical Warnings

1. **DO NOT install `curl` in the Docker image** for health checks. The architecture.md shows `curl -f http://localhost:3000/api/health` in the docker-compose HEALTHCHECK, but `curl` is NOT available in `node:22-alpine`. The healthcheck command belongs in `docker-compose.yml` (story 4.2), not in the Dockerfile. If you need a healthcheck in the Dockerfile itself, use a Node.js script or `wget` (available in Alpine).
2. **DO NOT run `prisma db push` or `prisma migrate deploy` in the Dockerfile**. The LibSQL adapter handles schema at the application level. Running migrations requires a database connection which isn't available at build time.
3. **DO NOT add `prisma/migrations/` to the Docker image** — migrations are a development concern, not needed at runtime with LibSQL.
4. **DO NOT use `npm start`** in the CMD — standalone mode uses `node server.js` directly.
5. **Builder stage needs ALL dependencies** (dev + prod) — TypeScript, Tailwind, PostCSS etc. are needed for `npm run build`. Only the runner stage should be minimal.
6. **Verify `package-lock.json` exists** — `npm ci` requires it. It should already exist from project initialization.

### Scope Boundary

This story creates ONLY the Dockerfile and standalone config. The following belong to **Story 4.2**:
- `docker-compose.yml`
- Docker volume configuration
- HEALTHCHECK directive
- Environment variable documentation beyond .env.example updates
- Data persistence verification across container restarts

### Project Structure Notes

- Dockerfile at project root: `/Dockerfile`
- .dockerignore at project root: `/.dockerignore`
- next.config.ts modification: single line addition
- No new directories created in the source tree
- `/app/data` directory created inside Docker image only

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Authentication & Security]
- [Source: node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md — Docker section]
- [Source: node_modules/next/dist/docs/01-app/02-guides/self-hosting.md — Environment Variables, Build Cache]
- [Source: prisma/schema.prisma — SQLite provider, generated client output path]
- [Source: prisma.config.ts — dotenv config, datasource URL from env]
- [Source: package.json — dependency versions, build scripts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Prisma standalone tracing: Next.js file tracer only copies `.mjs` files for external packages, missing CJS entry points. Resolved by letting Turbopack bundle Prisma adapter inline.
- Database schema: LibSQL adapter does NOT auto-create tables. Added `scripts/init-db.mjs` to create the Todo table on startup.
- Toast.tsx: Pre-existing type error — React 19 `useRef` requires an initial value argument. Fixed by passing `undefined`.

### Completion Notes List

- Configured Next.js standalone output mode in `next.config.ts`
- Created multi-stage Dockerfile: deps -> builder -> runner with `node:22-alpine`
- Builder stage uses `DATABASE_URL=file:/tmp/build.db` dummy for build-time static generation
- Runner stage uses non-root `nextjs` user (UID 1001), `/app/data` volume mount
- Created `scripts/init-db.mjs` to initialize SQLite schema on container startup
- Image verified: 222MB, non-root user, no dev deps, no source files
- CRUD operations verified: create, read, update, delete all working
- Health endpoint returns `{"status":"ok",...}` from container
- All 125 existing tests pass — no regressions

### File List

- `Dockerfile` — NEW: Multi-stage Docker build (deps, builder, runner)
- `.dockerignore` — NEW: Docker build context exclusions
- `scripts/init-db.mjs` — NEW: Database table initialization script for container startup
- `next.config.ts` — MODIFIED: Added `output: "standalone"`
- `.env.example` — MODIFIED: Added Docker production DATABASE_URL comment
- `src/components/Toast.tsx` — MODIFIED: Fixed React 19 useRef type error (pre-existing)

### Change Log

- 2026-04-25: Implemented story 4.1 — Dockerfile & multi-stage build with standalone output, non-root user, and database initialization
- 2026-04-25: Code review completed

### Review Findings

- [x] [Review][Decision] **Schema drift: init-db.mjs duplicates Prisma schema** — Resolved: init SQL is now auto-generated from `prisma/schema.prisma` at Docker build time via `prisma migrate diff`. Single source of truth preserved.
