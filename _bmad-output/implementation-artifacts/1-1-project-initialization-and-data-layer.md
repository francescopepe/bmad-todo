# Story 1.1: Project Initialization & Data Layer

Status: ready-for-dev

## Story

As a **developer**,
I want a fully configured Next.js project with Prisma, SQLite, Tailwind, and testing infrastructure,
So that all subsequent stories have a solid foundation to build on.

## Acceptance Criteria

1. **Given** a fresh development environment **When** the initialization command is run **Then** a Next.js 16 project is created with TypeScript, Tailwind CSS, ESLint, and App Router

2. **Given** the project is initialized **When** Prisma is configured **Then** SQLite is set as the database provider with `DATABASE_URL=file:./dev.db`

3. **Given** Prisma is configured **When** the schema is defined **Then** the Todo model exists with fields: `id` (String, cuid), `title` (String), `completed` (Boolean, default false), `createdAt` (DateTime, default now), `updatedAt` (DateTime, auto-update)

4. **Given** the schema exists **When** `npx prisma db push` is run **Then** the SQLite database is created with the Todo table

5. **Given** the project structure **When** shared libraries are created **Then** `src/lib/schemas.ts` contains Zod schemas (CreateTodoSchema, UpdateTodoSchema), `src/lib/types.ts` contains TypeScript types (Todo, ApiResponse<T>), `src/lib/apiHelpers.ts` contains response utilities, and `src/lib/prisma.ts` contains the Prisma client singleton

6. **Given** Vitest is installed **When** `npm test` is run **Then** the test runner executes without errors

7. **Given** Playwright is installed **When** `npx playwright --version` is run **Then** the version is returned without errors

8. **Given** the complete setup **When** `npm run dev` is run **Then** the Next.js dev server starts without errors on port 3000

## Tasks / Subtasks

- [ ] Task 1: Initialize Next.js project (AC: #1)
  - [ ] Run `npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm`
  - [ ] Verify project structure matches expected layout
  - [ ] Verify `npm run dev` works

- [ ] Task 2: Install and configure Prisma (AC: #2, #3, #4)
  - [ ] `npm install prisma @prisma/client`
  - [ ] `npx prisma init --datasource-provider sqlite`
  - [ ] Define Todo model in `prisma/schema.prisma`
  - [ ] Create `.env` with `DATABASE_URL=file:./dev.db`
  - [ ] Create `.env.example` documenting required vars
  - [ ] Create `.env.test` with `DATABASE_URL=file:./test.db`
  - [ ] Run `npx prisma db push` to create database
  - [ ] Run `npx prisma generate` to generate client

- [ ] Task 3: Create shared library files (AC: #5)
  - [ ] Create `src/lib/prisma.ts` — Prisma client singleton
  - [ ] Create `src/lib/types.ts` — Todo, ApiResponse<T>, ApiError types
  - [ ] Create `src/lib/schemas.ts` — CreateTodoSchema, UpdateTodoSchema
  - [ ] Create `src/lib/apiHelpers.ts` — successResponse(), errorResponse()

- [ ] Task 4: Install and configure Vitest (AC: #6)
  - [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  - [ ] Create `vitest.config.ts`
  - [ ] Add `"test"` and `"test:coverage"` scripts to package.json
  - [ ] Verify `npm test` runs

- [ ] Task 5: Install and configure Playwright (AC: #7)
  - [ ] `npm install -D @playwright/test @axe-core/playwright`
  - [ ] `npx playwright install`
  - [ ] Create `playwright.config.ts`
  - [ ] Add `"test:e2e"` script to package.json
  - [ ] Create `e2e/` directory

- [ ] Task 6: Update .gitignore and clean up (AC: #8)
  - [ ] Add to .gitignore: `*.db`, `*.db-journal`, `.env`, `.env.test`, `test-results/`, `playwright-report/`
  - [ ] Remove default Next.js boilerplate from `src/app/page.tsx` (replace with minimal placeholder)
  - [ ] Verify `npm run dev` starts cleanly

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Starter Template Evaluation + Implementation Patterns]

**Initialization command (EXACT):**
```bash
npx create-next-app@latest awesome-todo --typescript --tailwind --eslint --app --src-dir --use-npm
```

**Prisma schema (EXACT):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Todo {
  id        String   @id @default(cuid())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Prisma client singleton pattern (EXACT):**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Shared types (EXACT):**
```typescript
// src/lib/types.ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}
```

**Zod schemas (EXACT):**
```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title: z.string().min(1).max(500),
});

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});
```

**API helpers (EXACT):**
```typescript
// src/lib/apiHelpers.ts
import { NextResponse } from 'next/server';
import { ApiError } from './types';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, success: true }, { status });
}

export function errorResponse(error: ApiError, status = 500) {
  return NextResponse.json({ error, success: false }, { status });
}
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Package.json Scripts to Add

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Additional Dependencies to Install

```bash
# Prisma
npm install prisma @prisma/client

# Validation
npm install zod

# Testing - Unit/Component
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

# Testing - E2E
npm install -D @playwright/test @axe-core/playwright

# Install Playwright browsers
npx playwright install
```

### Project Structure Notes

After this story, the project tree should be:

```
awesome-todo/
├── .env                    # DATABASE_URL=file:./dev.db
├── .env.example            # DATABASE_URL=file:./dev.db
├── .env.test               # DATABASE_URL=file:./test.db
├── .gitignore              # Updated with *.db, .env, etc.
├── package.json            # Updated with test scripts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts        # NEW
├── playwright.config.ts    # NEW
├── prisma/
│   └── schema.prisma       # NEW — Todo model
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Cleaned — minimal placeholder
│   │   └── globals.css
│   └── lib/
│       ├── prisma.ts       # NEW — Prisma singleton
│       ├── types.ts        # NEW — Todo, ApiResponse<T>
│       ├── schemas.ts      # NEW — Zod schemas
│       └── apiHelpers.ts   # NEW — Response utilities
├── e2e/                    # NEW — empty, ready for E2E tests
└── dev.db                  # Generated by prisma db push (gitignored)
```

### Naming Conventions (MUST FOLLOW)

**Source:** [architecture.md — Implementation Patterns]

- Files in `src/lib/`: camelCase `.ts` (e.g., `apiHelpers.ts`)
- Types/Interfaces: PascalCase (e.g., `Todo`, `ApiResponse`)
- Zod schemas: PascalCase + `Schema` suffix (e.g., `CreateTodoSchema`)
- Import alias: `@/` for all imports from `src/`
- No `index.ts` barrel exports
- No `any` type — use `unknown` then narrow

### Anti-Patterns (FORBIDDEN)

- Do NOT create any React components in this story — that's Story 1.4+
- Do NOT create any API routes in this story — that's Story 1.2
- Do NOT install a component library (MUI, Chakra, etc.) — Tailwind only
- Do NOT install Redux, Zustand, or any state management library
- Do NOT add authentication packages
- Do NOT use `any` type anywhere

### References

- [Source: architecture.md#Starter Template Evaluation — initialization command]
- [Source: architecture.md#Data Architecture — Prisma schema, Zod schemas, shared types]
- [Source: architecture.md#Implementation Patterns — naming conventions, anti-patterns]
- [Source: architecture.md#Project Structure & Boundaries — file organization]
- [Source: architecture.md#Testing Architecture — Vitest + Playwright setup]
- [Source: epics.md#Story 1.1 — acceptance criteria]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
