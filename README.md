# Grez

A forum, listing, and rating platform for restaurants that provide insurance for their employees. Built with AT Protocol for decentralized identity.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS v4, shadcn/ui
- **API**: Fastify 5 (TypeScript)
- **Database**: PostgreSQL 16, Prisma ORM
- **Auth**: AT Protocol OAuth
- **Monorepo**: pnpm workspaces + Turborepo

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# 2. Copy env and configure
cp .env.example .env
# Edit .env with your ADMIN_DID and other settings

# 3. Install dependencies
pnpm install

# 4. Generate Prisma client & run migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed the database
pnpm db:seed

# 6. Start development servers
pnpm dev
```

The API runs at `http://localhost:3001` and the web app at `http://localhost:3000`.

## Project Structure

```
apps/web/        - Next.js frontend
apps/api/        - Fastify API server
packages/db/     - Prisma schema & migrations
packages/shared/ - Shared types & validation
docker/          - Docker Compose & Dockerfiles
docs/            - Project documentation
```

## Documentation

- [Architecture](docs/architecture.md)
- [Database Design](docs/database.md)
- [ATProto Auth](docs/atproto-auth.md)
- [Worklog](docs/worklog.md)
- [Status](docs/status.md)

## License

MIT
