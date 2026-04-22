# AGENTS.md — Instructions for AI Agents

This file provides context and rules for AI agents (Cascade, Copilot, Cursor, etc.) working in this codebase.

## Project Overview
**Grez** is a forum, listing, and rating platform for restaurants that provide insurance for their employees. Users authenticate via AT Protocol (ATProto) OAuth — no passwords are stored. All app data lives in PostgreSQL.

## Tech Stack
| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 15 (App Router), React 19, TailwindCSS v4, shadcn/ui |
| API | Fastify 5, running in Docker |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | ATProto OAuth (`@atproto/oauth-client-node` + `@atproto/api`) |
| Validation | Zod (shared between frontend and API) |
| Session | HTTP-only JWT cookies (signed with `jose`) |
| Testing | Vitest |
| Linting | Biome |

## Monorepo Layout
```
apps/web/          → Next.js frontend (UI only, calls API)
apps/api/          → Fastify API server (auth, CRUD, business logic)
packages/db/       → Prisma schema, migrations, generated client, seed script
packages/shared/   → Shared types, Zod schemas, env validation
packages/api-client/ → (Future) Auto-generated typed API client
packages/ui/       → (Future) Shared UI component library
docker/            → Docker Compose + Dockerfiles
docs/              → Project documentation
```

## How to Run
```bash
# Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start dev servers (API + Web)
pnpm dev
```

## Coding Conventions
- **TypeScript strict mode** is enabled everywhere.
- **Biome** handles linting and formatting. Run `pnpm lint` to check, `pnpm lint:fix` to auto-fix.
- **Single quotes**, **semicolons**, **trailing commas** (configured in `biome.json`).
- **2-space indentation**.
- Use **Zod** for all runtime validation (API request bodies, env vars, form data).
- Use **Prisma** generated types for database interactions — never hand-write DB types.
- Keep imports organized (Biome handles this).

## Database
- Schema lives at `packages/db/prisma/schema.prisma`.
- **Never manually edit** the generated Prisma client (`node_modules/.prisma/client`).
- Run `pnpm db:generate` after any schema change.
- Run `pnpm db:migrate` to create and apply migrations.
- Seed data is in `packages/db/prisma/seed.ts`.

## Auth
- ATProto is used **only for identity**. No custom Lexicons.
- OAuth flow is in `apps/api/src/routes/auth.ts`.
- Session JWT is issued as an HTTP-only cookie named `grez_session`.
- The admin DID is configured via the `ADMIN_DID` environment variable.
- See `docs/atproto-auth.md` for the full auth flow.

## Testing
- Use **Vitest** for all tests.
- Test files go next to the source file: `foo.ts` → `foo.test.ts`.
- Run `pnpm test` from the repo root.

## Do's
- Always update `docs/worklog.md` after completing work.
- Always update `docs/status.md` with current progress.
- Use workspace package imports (`@grez/db`, `@grez/shared`).
- Validate all API inputs with Zod schemas.
- Keep API routes in separate files under `apps/api/src/routes/`.

## Don'ts
- Don't modify the generated Prisma client.
- Don't add ATProto Lexicons without explicit discussion.
- Don't hardcode secrets — use environment variables.
- Don't write raw SQL — use Prisma's query builder.
- Don't add dependencies to the root `package.json` unless they're truly shared dev tools.
- Don't skip updating docs after work sessions.
