# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Run all packages in parallel
pnpm dev

# Run individually
pnpm --filter @med-monorepo/frontend dev    # Next.js on port 3000
pnpm --filter @med-monorepo/backend dev     # NestJS on port 4000

# Build
pnpm build
pnpm --filter @med-monorepo/frontend build
pnpm --filter @med-monorepo/backend build

# Lint & format
pnpm lint
pnpm --filter @med-monorepo/frontend lint
pnpm --filter @med-monorepo/backend lint

# Backend tests
pnpm --filter @med-monorepo/backend test
pnpm --filter @med-monorepo/backend test:watch
pnpm --filter @med-monorepo/backend test:cov
pnpm --filter @med-monorepo/backend test:e2e

# E2E tests (Playwright)
pnpm --filter @med-monorepo/e2e test
pnpm --filter @med-monorepo/e2e test:ui

# Database
pnpm --filter @med-monorepo/backend prisma:migrate
pnpm --filter @med-monorepo/backend prisma:generate
pnpm --filter @med-monorepo/backend prisma:studio
pnpm --filter @med-monorepo/backend db:seed
pnpm --filter @med-monorepo/backend db:reset:demo
```

## Architecture

This is a **multi-tenant medical clinic management system** (pnpm + Lerna monorepo).

```
packages/
├── frontend/   # Next.js 15 + React 19, port 3000
├── backend/    # NestJS 10 + PostgreSQL/Prisma, port 4000 (/api/v1)
└── e2e/        # Playwright tests
```

**Frontend → NestJS API → PostgreSQL** (Prisma ORM)

### Frontend (`packages/frontend/src/`)

- **`app/`** — Next.js App Router pages (`app/cabinet/[feature]/`)
- **`features/`** — Feature modules (see structure below)
- **`components/`** — Shared UI components (shadcn/ui)
- **`store/`** — Redux Toolkit store + RTK Query (`rootApi`)
- **`hooks/`**, **`lib/`**, **`types/`** — Shared utilities

Feature module structure (singular naming, e.g. `employee` not `employees`):
```
features/[feature]/
├── components/          # UI components
├── [feature].api.ts     # RTK Query endpoints
├── [feature].dto.ts     # TypeScript interfaces matching backend
├── [feature].constants.ts
├── [feature].schema.ts  # Yup validation schemas
├── [feature].model.ts   # Pure utility functions
└── index.ts             # Public exports (never `export *`)
```

### Backend (`packages/backend/src/`)

- **`modules/`** — Feature modules (controller/service/dto per domain)
- **`common/`** — Shared decorators, guards, pipes, Prisma service
- **`prisma/`** — Prisma schema (~40 models) and migrations

Each backend module follows:
```
modules/[name]/
├── dto/                 # create/update/find/response DTOs
├── [name].controller.ts
├── [name].service.ts
└── [name].module.ts
```

## Multi-tenancy

All tenant-scoped DTOs use `@InjectOrganizationId()` + `@Expose()`:

```typescript
@Expose()
@InjectOrganizationId()
organizationId: string;
```

Always include `organizationId` in Prisma `where` clauses. Never manually assign it in services.

## Backend Conventions

- DTOs use `@Exclude()` at class level + `@Expose()` per field
- All Prisma results are transformed via `plainToInstance(ResponseDto, result)`
- Use `$transaction` for multi-table writes
- Custom transformers: `@TransformEmpty()`, `@TransformDate()`, `@TransformDecimal()`
- Response DTOs extend `BaseResponseDto`
- Controllers are thin — no transformations, all logic in services
- Always add `@ApiTags`, `@ApiOperation`, `@ApiResponse` to controllers
- Guard order: `AuthGuard("jwt")`, then `PermissionGuard` with `@RequirePermission()`
- Place specific routes before parameterized routes (e.g. `employees/stats` before `:id`)

## Frontend Conventions

- Named exports only — never `default export`
- No React default import (`import React from 'react'` is not needed)
- Use `"use client"` directive on components using hooks/browser APIs
- Forms: `react-hook-form` + `yupResolver` + Yup schemas
- API calls: RTK Query — always `providesTags` on queries, `invalidatesTags` on mutations
- Import from feature index (`@/features/items`), not internal paths
- Import order: React → Next.js → UI libs → Features
- Pages use `use(params)` for async params (Next.js 15)
- Always handle loading/error states in pages

## TypeScript Rules

- Prefer `type` for simple types, `interface` for extendable shapes
- Use `unknown` over `any`; avoid `any` in DTOs
- Never prefix interfaces with `I`
- Private class properties use `#` prefix
- Use `??` over `||` for nullish coalescing
- Use `async/await` — no Promise chains
- No barrel files (`index.ts` re-exports are for feature public APIs only)

## Utility Libraries

- **Dates**: Always use `date-fns` (never native `Date` methods for calculations)
- **Utilities**: Use `lodash` for null-safe access (`get`), object manipulation (`omit`/`pick`/`merge`/`cloneDeep`), array ops (`groupBy`/`keyBy`/`orderBy`/`uniqBy`)
- Import functions individually for tree-shaking
