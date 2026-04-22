# Architecture

Grez is a monorepo with two apps and shared packages.

## Data Flow

```
Browser → Next.js (apps/web) → Fastify API (apps/api) → PostgreSQL
                                      ↕
                              ATProto OAuth (identity)
```

## Apps
- **`apps/web`** — Next.js 15 frontend. UI only; all data fetched from the API.
- **`apps/api`** — Fastify server. Handles auth, CRUD, business logic. Runs in Docker alongside PostgreSQL.

## Packages
- **`packages/db`** — Prisma schema, migrations, generated client, seed script.
- **`packages/shared`** — Zod schemas, env validation, shared TypeScript types.
- **`packages/api-client`** — (Future) Auto-generated typed API client from OpenAPI spec.
- **`packages/ui`** — (Future) Shared UI component library.

## Auth Flow
1. User clicks "Sign in" → frontend calls `POST /oauth/login` with their ATProto handle
2. API initiates ATProto OAuth → returns authorization URL
3. User authenticates with their PDS → redirected back to `GET /oauth/callback`
4. API resolves DID, fetches profile, upserts user in DB, issues JWT cookie
5. Subsequent requests include the cookie; API verifies JWT on protected routes
