# Project Status
**Last updated:** 2026-04-22

---

## Phase Overview

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Monorepo scaffold, infra, DB, API, auth, frontend shell | 🟡 In Progress |
| 2 | Restaurant listing CRUD + UI | ⬜ Not Started |
| 3 | Review system (ratings, comments) | ⬜ Not Started |
| 4 | Forum (categories, threads, posts) | ⬜ Not Started |
| 5 | Admin tools, moderation, polish | ⬜ Not Started |

---

## Phase 1 — Detailed Breakdown

### ✅ Monorepo & Tooling
- **pnpm workspaces** configured (`pnpm-workspace.yaml`) with `apps/*` and `packages/*`.
- **Turborepo** (`turbo.json`) orchestrates `dev`, `build`, `lint`, `typecheck`, `test`, `db:generate`, `db:migrate`, `db:seed`.
- **Biome** (`biome.json`) handles linting + formatting: single quotes, semicolons, trailing commas, 2-space indent, 100-char line width.
- **Shared tsconfig** (`tsconfig.base.json`) for consistent TypeScript strict mode.
- Root scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm typecheck`, `pnpm test`.

### ✅ Docker & Infrastructure
- **`docker/docker-compose.yml`** — PostgreSQL 16 (Alpine) with healthcheck, named volume (`pgdata`), exposed on `:5432`.
- **`docker/api.Dockerfile`** — Multi-stage build (deps → build → runner) using Node 22 Alpine + pnpm 9.15.4. Generates Prisma client at build time. Exposes `:3001`.

### ✅ Database (`packages/db`)
- **Prisma schema** (`prisma/schema.prisma`) with 6 models:
  - `User` — PK: `did` (ATProto DID), fields: `handle`, `displayName`, `avatarUrl`, `role` (USER/ADMIN).
  - `Restaurant` — `name`, `address`, `cuisine`, `insuranceType`, `insuranceProvider`, `website`, `description`. FK → `User.did`. Indexed on `cuisine`, `insuranceType`.
  - `Review` — `rating` (1–5), `body`. FK → `Restaurant.id` (cascade delete), `User.did`. Unique constraint on `(restaurantId, authorDid)`.
  - `ForumCategory` — `name` (unique), `slug` (unique), `description`.
  - `ForumThread` — `title`, `body`. FK → `ForumCategory.id`, `User.did`. Indexed on `categoryId`.
  - `ForumPost` — `body`, nullable `parentId` for future nested replies. FK → `ForumThread.id` (cascade delete), `ForumPost.id` (self-relation). Indexed on `threadId`, `parentId`.
- **Singleton Prisma client** (`src/index.ts`) with global caching for dev hot-reload.
- **Seed script** (`prisma/seed.ts`) creates: 2 users (admin + demo), 3 restaurants, 2 reviews, 2 forum categories (General, Recommendations), 1 thread, 1 post. All upserts for idempotency.
- Exports: `prisma` instance, `PrismaClient`, all generated types.

### ✅ Shared Package (`packages/shared`)
- **Zod-validated env config** (`src/env.ts`) validating 9 variables: `DATABASE_URL`, `API_PORT`, `API_HOST`, `JWT_SECRET` (min 16 chars), `ATPROTO_CLIENT_ID`, `ATPROTO_REDIRECT_URI`, `NEXT_PUBLIC_API_URL` (optional), `ADMIN_DID`, `NODE_ENV`.
- Cached singleton — parsed once, reused.
- Exports: `env()` function + `Env` type.

### ✅ API Server (`apps/api`)
- **Fastify 5** with Zod type provider (`fastify-type-provider-zod`).
- **Plugins registered:**
  - `@fastify/cors` — open in dev, restricted in prod, credentials enabled.
  - `@fastify/cookie` — signed with `JWT_SECRET`.
  - `@fastify/rate-limit` — 100 req/min.
  - `@fastify/swagger` + `@fastify/swagger-ui` — OpenAPI spec served at `/docs`.
- **Logger:** Pino with `pino-pretty` in dev, structured JSON in prod. Request IDs via `crypto.randomUUID()`.
- **Routes implemented:**
  - `GET /health` — DB connectivity check (`SELECT 1`), returns `{ status, db }`.
  - `GET /oauth/client-metadata.json` — ATProto dynamic client registration metadata.
  - `POST /oauth/login` — Accepts `{ handle }`, returns `{ url }` for ATProto authorization.
  - `GET /oauth/callback` — Exchanges auth code for session, fetches profile, upserts user, sets JWT cookie, redirects to frontend.
  - `POST /oauth/logout` — Clears `grez_session` cookie.
  - `GET /oauth/me` — Returns authenticated user from JWT cookie.
- **Auth implementation:**
  - `@atproto/oauth-client-node` with in-memory state/session stores (Map-based).
  - `jose` for HS256 JWT signing/verification, 7-day expiry.
  - HTTP-only cookie `grez_session`, secure in prod, SameSite=lax.
  - Admin role auto-assigned when `ADMIN_DID` matches on first login.
- **Dev:** `tsx watch src/index.ts` on port 3001.

### 🟡 Frontend (`apps/web`) — Partially Complete
- **Next.js 15** (App Router) + React 19 + TailwindCSS v4.
- **Styling:** Custom theme tokens in `globals.css` (green primary `#16a34a`, Inter font). Using `clsx` + `tailwind-merge` via `cn()` utility.
- **`next.config.ts`:** Remote image pattern for `cdn.bsky.app` (ATProto avatars).
- **Layout (`layout.tsx`):** Header with nav links (Restaurants, Forum, Sign In) + centered content area.
- **Home page (`page.tsx`):** Hero section with tagline, description, and two CTAs.
- **⚠️ Missing:** All linked pages (`/restaurants`, `/forum`, `/login`) return 404. Auth state not implemented. No API client utility.

### ✅ CI/CD (`.github/workflows/ci.yml`)
- Triggers on push/PR to `main`.
- **Services:** PostgreSQL 16 Alpine with healthcheck.
- **Steps:** checkout → pnpm install → Prisma generate → lint → typecheck → test → migration drift check (`prisma migrate diff`).
- Uses Node 22, pnpm 9, caching enabled.

### ✅ Documentation
- `docs/architecture.md` — Data flow diagram, app/package descriptions, auth flow summary.
- `docs/atproto-auth.md` — Full 8-step OAuth flow, client metadata, env vars, no-Lexicon policy.
- `docs/database.md` — All 6 tables documented with PKs, FKs, constraints, nesting strategy, CLI commands.
- `docs/worklog.md` — Session-by-session log of completed work.
- `AGENTS.md` — AI agent instructions (conventions, do's/don'ts, run commands).
- `README.md` — Quick-start guide.
- `.env.example` — All 9 env vars with placeholder values.

---

## What's Not Built Yet

### API Endpoints Needed
- **Restaurants:** `GET /restaurants` (list/search/filter), `GET /restaurants/:id`, `POST /restaurants`, `PUT /restaurants/:id`, `DELETE /restaurants/:id`
- **Reviews:** `GET /restaurants/:id/reviews`, `POST /restaurants/:id/reviews`, `PUT /reviews/:id`, `DELETE /reviews/:id`
- **Forum:** `GET /forum/categories`, `GET /forum/categories/:slug/threads`, `GET /forum/threads/:id`, `POST /forum/threads`, `POST /forum/threads/:id/posts`, `PUT /posts/:id`, `DELETE /posts/:id`
- **Admin:** User management, content moderation endpoints
- **Auth middleware:** Reusable `requireAuth` / `requireAdmin` hooks for protected routes

### Frontend Pages Needed
- `/restaurants` — List with search, cuisine/insurance filters, pagination
- `/restaurants/[id]` — Detail page with reviews, add-review form
- `/restaurants/new` — Submission form (authenticated)
- `/forum` — Category list
- `/forum/[slug]` — Thread list within a category
- `/forum/[slug]/[threadId]` — Thread detail with posts
- `/forum/new` — Create thread (authenticated)
- `/login` — ATProto handle input form
- `/profile` — Current user's activity (submitted restaurants, reviews, posts)
- `/admin` — Admin dashboard (if admin role)

### Infrastructure / DX
- `packages/api-client` — Auto-generated typed API client (planned)
- `packages/ui` — Shared component library (planned)
- Vitest test suites (no tests written yet)
- Production deployment config (hosting, domain, env management)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `API_PORT` | No | `3001` | Fastify listen port |
| `API_HOST` | No | `0.0.0.0` | Fastify listen host |
| `JWT_SECRET` | Yes | — | ≥16 chars, signs session JWTs |
| `ATPROTO_CLIENT_ID` | Yes | — | URL to client-metadata.json |
| `ATPROTO_REDIRECT_URI` | Yes | — | OAuth callback URL |
| `NEXT_PUBLIC_API_URL` | No | — | API base URL for frontend |
| `ADMIN_DID` | Yes | — | DID that gets ADMIN role |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |

---

## Key Dependency Versions

| Package | Version |
|---------|---------|
| Node.js | 22 |
| pnpm | 9.15.4 |
| TypeScript | ^5.7.0 |
| Next.js | ^15.3.0 |
| React | ^19.1.0 |
| Fastify | ^5.2.0 |
| Prisma | ^6.2.0 |
| Tailwind CSS | ^4.1.0 |
| Zod | ^3.24.0 |
| Biome | ^1.9.0 |
| Turborepo | ^2.3.0 |
