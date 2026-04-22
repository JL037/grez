# Database Design

PostgreSQL 16, managed via Prisma ORM.

## Tables

### `User`
- **PK**: `did` (ATProto DID, e.g., `did:plc:abc123`)
- `handle`, `displayName`, `avatarUrl` — synced from ATProto profile on login
- `role` — `USER` or `ADMIN`

### `Restaurant`
- **PK**: `id` (cuid)
- `name`, `address`, `cuisine`, `insuranceType`, `insuranceProvider`, `website`, `description`
- `submittedBy` → `User.did`

### `Review`
- **PK**: `id` (cuid)
- `restaurantId` → `Restaurant.id`, `authorDid` → `User.did`
- `rating` (1–5), `body`
- **Unique constraint**: one review per user per restaurant (`restaurantId` + `authorDid`)

### `ForumCategory`
- **PK**: `id` (cuid)
- `name`, `slug` (both unique), `description`

### `ForumThread`
- **PK**: `id` (cuid)
- `categoryId` → `ForumCategory.id`, `authorDid` → `User.did`
- `title`, `body`

### `ForumPost`
- **PK**: `id` (cuid)
- `threadId` → `ForumThread.id`, `authorDid` → `User.did`
- `parentId` → `ForumPost.id` (nullable, for future nested replies)
- `body`

## Nesting Strategy
`ForumPost.parentId` is nullable. When `NULL`, the post is a flat reply to the thread. To enable threaded/nested replies in the future, populate `parentId` and update the UI — no schema migration needed.

## Running Migrations
```bash
pnpm db:migrate    # Create/apply migrations
pnpm db:generate   # Regenerate Prisma client
pnpm db:seed       # Populate with sample data
```
