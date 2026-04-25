# Awesome Todo

A single-user task management application built as an SPA with a REST API backend, using SQLite for persistence. Designed as a portfolio project demonstrating modern full-stack development with AI-assisted workflows.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript 5
- **Database:** SQLite via Prisma 7 ORM (with libSQL adapter)
- **Validation:** Zod 4
- **Testing:** Vitest, Playwright, axe-core, Lighthouse

## Prerequisites

- Node.js (v20+)
- npm
- Docker or Podman (optional, for containerized deployment)

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd bmad-todo

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize the database
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit/component tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:lighthouse` | Run Lighthouse performance audit |

## Testing

- **Unit/Component tests:** 147+ tests using Vitest and Testing Library (88%+ coverage)
- **E2E tests:** 16+ tests using Playwright (CRUD, empty state, accessibility, security headers)
- **Accessibility:** axe-core automated checks and Lighthouse audits
- **Coverage thresholds:** 70% statements/lines enforced in CI

## Docker Deployment

This project supports both Docker and Podman. Use the container engine proxy script for all container commands:

```bash
# Build the image
./scripts/container-engine.sh build -t awesome-todo .

# Run with compose
./scripts/container-engine.sh compose up -d
```

The `docker-compose.yml` provides:
- Multi-stage build for minimal image size
- Named volume (`todo-data`) for SQLite persistence
- Health check at `/api/health`
- Automatic restart (`unless-stopped`)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts    # Health check endpoint
│   │   └── todos/
│   │       ├── route.ts       # GET, POST /api/todos
│   │       └── [id]/route.ts  # PATCH, DELETE /api/todos/:id
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main todo page
├── components/
│   ├── TodoForm.tsx           # Task creation form
│   ├── TodoItem.tsx           # Individual task component
│   └── Toast.tsx              # Notification system
├── hooks/
│   └── useTodos.ts            # Todo state management with optimistic updates
├── lib/
│   ├── apiHelpers.ts          # API response utilities
│   ├── prisma.ts              # Prisma client singleton
│   ├── schemas.ts             # Zod validation schemas
│   └── types.ts               # TypeScript type definitions
└── generated/prisma/          # Prisma generated client
e2e/                           # Playwright E2E tests
prisma/schema.prisma           # Database schema
scripts/
├── container-engine.sh        # Docker/Podman proxy
└── lighthouse-audit.mjs       # Lighthouse CI script
```

## Security

Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) are configured in `next.config.ts`. See [SECURITY-REVIEW.md](SECURITY-REVIEW.md) for the full security audit.

## AI-Assisted Development

This project was built using the BMad Method with Claude Code. See [AI-INTEGRATION-LOG.md](AI-INTEGRATION-LOG.md) for details on the AI-assisted development process.
