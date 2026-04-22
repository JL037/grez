# Commands Reference

Quick reference for all commands needed to develop, run, and maintain Grez.

---

## Prerequisites

- Node.js 22+
- pnpm 9.15.4+ (`corepack enable` to use)
- Docker & Docker Compose (for PostgreSQL)

---

## Project Setup (First Time)

```bash
# 1. Install pnpm via corepack
corepack enable
corepack prepare pnpm@9.15.4 --activate

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env and set your ADMIN_DID and JWT_SECRET

# 4. Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# 5. Generate Prisma client
pnpm db:generate

# 6. Run migrations
pnpm db:migrate

# 7. Seed the database
pnpm db:seed
```

---

## Development (Daily Use)

### Start Everything
```bash
# Start all dev servers (API + Web) via Turborepo
pnpm dev
```
This runs:
- API server at http://localhost:3001
- Next.js frontend at http://localhost:3000

### Database Operations
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# Reset database (wipes all data, re-runs migrations)
pnpm --filter @grez/db exec prisma migrate reset

# Seed with sample data
pnpm db:seed

# Open Prisma Studio (GUI for database)
pnpm --filter @grez/db db:studio
```

### Code Quality
```bash
# Check linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format all files
pnpm format

# Type check all packages
pnpm typecheck

# Run all tests
pnpm test
```

### Build for Production
```bash
# Build all packages and apps
pnpm build
```

---

## Docker Commands

### PostgreSQL (Required)
```bash
# Start PostgreSQL container
docker compose -f docker/docker-compose.yml up -d

# Stop PostgreSQL container
docker compose -f docker/docker-compose.yml down

# View PostgreSQL logs
docker compose -f docker/docker-compose.yml logs -f postgres

# Check PostgreSQL health
docker compose -f docker/docker-compose.yml ps
```

### API Container (Optional - for deployment testing)
```bash
# Build API Docker image
docker build -f docker/api.Dockerfile -t grez-api .

# Run API container (requires env vars and network setup)
docker run -p 3001:3001 --env-file .env grez-api
```

---

## Working with Individual Packages

### Database Package (`packages/db`)
```bash
# From repo root, targeting the db package:

# Generate Prisma client
pnpm --filter @grez/db db:generate

# Run migrations
pnpm --filter @grez/db db:migrate

# Seed database
pnpm --filter @grez/db db:seed

# Open Prisma Studio
pnpm --filter @grez/db db:studio

# Deploy migrations (production)
pnpm --filter @grez/db exec prisma migrate deploy

# Check migration status
pnpm --filter @grez/db exec prisma migrate status
```

### API Package (`apps/api`)
```bash
# Run dev server with hot reload
pnpm --filter @grez/api dev

# Build for production
pnpm --filter @grez/api build

# Start production server
pnpm --filter @grez/api start

# Type check only
pnpm --filter @grez/api typecheck
```

### Web Package (`apps/web`)
```bash
# Run dev server
pnpm --filter @grez/web dev

# Build for production
pnpm --filter @grez/web build

# Start production server
pnpm --filter @grez/web start

# Type check only
pnpm --filter @grez/web typecheck
```

### Shared Package (`packages/shared`)
```bash
# Type check
pnpm --filter @grez/shared typecheck
```

---

## Package Management

```bash
# Add dependency to specific package
pnpm --filter @grez/api add fastify-some-plugin

# Add dev dependency
pnpm --filter @grez/web add -D @types/some-lib

# Add workspace dependency
pnpm --filter @grez/api add @grez/db@workspace:*

# Remove dependency
pnpm --filter @grez/api remove some-package

# Update all dependencies
pnpm update

# Update specific package across workspace
pnpm update some-package
```

---

## Git & CI

```bash
# Run full CI checks locally (requires PostgreSQL running)
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test

# Check migration drift (CI command)
pnpm --filter @grez/db exec prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --exit-code
```

---

## Troubleshooting

### Reset Everything (Nuclear Option)
```bash
# Stop Docker containers
docker compose -f docker/docker-compose.yml down

# Remove node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstall
pnpm install

# Regenerate Prisma client
pnpm db:generate

# Restart PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# Re-run migrations
pnpm db:migrate

# Reseed
pnpm db:seed
```

### Common Issues
```bash
# Prisma client is out of sync with schema
pnpm db:generate

# Database connection issues - check Docker
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs postgres

# Port already in use - find and kill process
lsof -ti:3000 | xargs kill -9  # Web port
lsof -ti:3001 | xargs kill -9  # API port
lsof -ti:5432 | xargs kill -9  # PostgreSQL port
```

---

## Environment Variables

Key variables needed in `.env`:

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://grez:grez@localhost:5432/grez?schema=public` | PostgreSQL connection |
| `JWT_SECRET` | `your-secret-min-16-chars` | Must be ≥16 characters |
| `ADMIN_DID` | `did:plc:your-did-here` | Your ATProto DID |
| `ATPROTO_CLIENT_ID` | `http://localhost:3001/oauth/client-metadata.json` | OAuth client metadata URL |
| `ATPROTO_REDIRECT_URI` | `http://localhost:3001/oauth/callback` | OAuth callback URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API base URL for frontend |

Get your DID from your ATProto account (e.g., via [bsky.app](https://bsky.app) profile).

---

## Quick Reference

| Task | Command |
|------|---------|
| Start everything | `pnpm dev` |
| Start DB only | `docker compose -f docker/docker-compose.yml up -d` |
| Stop DB | `docker compose -f docker/docker-compose.yml down` |
| New migration after schema change | `pnpm db:migrate` |
| Reset DB | `pnpm --filter @grez/db exec prisma migrate reset` |
| Seed data | `pnpm db:seed` |
| Lint check | `pnpm lint` |
| Lint fix | `pnpm lint:fix` |
| Type check | `pnpm typecheck` |
| Build all | `pnpm build` |
| Prisma Studio | `pnpm --filter @grez/db db:studio` |
