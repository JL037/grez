# Next Steps

Prioritized task list for moving Grez from Phase 1 foundation to a working MVP.

---

## Phase 1 Completion (Foundation)

### 1. Frontend Auth Integration
**Goal:** Make login/logout work end-to-end.

| Task | Files | Notes |
|------|-------|-------|
| Create `/login` page | `apps/web/src/app/login/page.tsx` | Form with handle input, submits to `POST /oauth/login`, redirects to returned URL |
| Create `/logout` endpoint | `apps/web/src/app/logout/route.ts` | Route handler that clears cookie, redirects to home |
| Auth state provider | `apps/web/src/lib/auth.tsx` | React context + hook for `useAuth()` — fetches `/oauth/me`, provides `user`, `login()`, `logout()` |
| Update layout header | `apps/web/src/app/layout.tsx` | Show user avatar/handle + Logout button when authenticated; Sign In button when not |
| API client utility | `apps/web/src/lib/api.ts` | Fetch wrapper that reads `NEXT_PUBLIC_API_URL`, includes credentials, handles errors |

**Acceptance:** User can click "Sign In" → enter handle → auth with ATProto → return to site → see their profile in header → click logout → return to anonymous state.

---

### 2. Restaurant Listing (Read-Only)
**Goal:** Browse restaurants without auth requirement.

| Task | Files | Notes |
|------|-------|-------|
| `GET /restaurants` endpoint | `apps/api/src/routes/restaurants.ts` | List with optional `?q=` search, `?cuisine=`, `?insuranceType=` filters, pagination |
| `GET /restaurants/:id` endpoint | `apps/api/src/routes/restaurants.ts` | Include submitter info, review count, average rating |
| Create `/restaurants` page | `apps/web/src/app/restaurants/page.tsx` | Grid/list view, search input, filter dropdowns |
| Create `/restaurants/[id]` page | `apps/web/src/app/restaurants/[id]/page.tsx` | Detail view: name, address, insurance info, reviews section (read-only for now) |
| Register routes | `apps/api/src/app.ts` | `await app.register(restaurantRoutes, { prefix: '/restaurants' })` |

**Acceptance:** Unauthenticated user can browse restaurants, search, filter, view details. All existing seed data visible.

---

### 3. Restaurant CRUD (Authenticated)
**Goal:** Logged-in users can add/edit/delete their submissions.

| Task | Files | Notes |
|------|-------|-------|
| `POST /restaurants` endpoint | `apps/api/src/routes/restaurants.ts` | Requires auth, sets `submittedBy` from JWT |
| `PUT /restaurants/:id` endpoint | `apps/api/src/routes/restaurants.ts` | Requires auth, verify `submittedBy` matches or user is ADMIN |
| `DELETE /restaurants/:id` endpoint | `apps/api/src/routes/restaurants.ts` | Requires auth, same ownership check |
| Auth middleware | `apps/api/src/lib/auth.ts` | `requireAuth` hook that verifies JWT cookie, attaches `user` to request |
| Create `/restaurants/new` page | `apps/web/src/app/restaurants/new/page.tsx` | Form for adding restaurant, requires auth (redirect to /login if not) |
| Edit button on detail page | `apps/web/src/app/restaurants/[id]/page.tsx` | Show "Edit" / "Delete" buttons only if user is submitter or admin |

**Acceptance:** Authenticated user can submit a restaurant, edit their own submissions, delete their own. Cannot modify others' unless admin.

---

## Phase 2: Reviews

### 4. Review System
**Goal:** Users can rate and review restaurants.

| Task | Files | Notes |
|------|-------|-------|
| `GET /restaurants/:id/reviews` endpoint | `apps/api/src/routes/reviews.ts` | List reviews with author info, pagination |
| `POST /restaurants/:id/reviews` endpoint | `apps/api/src/routes/reviews.ts` | Requires auth, one review per user per restaurant (upsert) |
| `PUT /reviews/:id` endpoint | `apps/api/src/routes/reviews.ts` | Edit own review |
| `DELETE /reviews/:id` endpoint | `apps/api/src/routes/reviews.ts` | Delete own review |
| Review form component | `apps/web/src/components/ReviewForm.tsx` | Star rating input + text area |
| Reviews section on detail page | `apps/web/src/app/restaurants/[id]/page.tsx` | List reviews, show "Add Review" button if authenticated and hasn't reviewed |
| Average rating display | `apps/web/src/app/restaurants/page.tsx` | Show stars/average on restaurant cards |

**Acceptance:** User can leave 1-5 star rating + optional text. Can edit/delete own. Cannot review same restaurant twice (update instead). Average rating visible in listings.

---

## Phase 3: Forum

### 5. Forum (Categories & Threads)
**Goal:** Community discussion organized by category.

| Task | Files | Notes |
|------|-------|-------|
| `GET /forum/categories` endpoint | `apps/api/src/routes/forum.ts` | List all categories with thread counts |
| `GET /forum/categories/:slug` endpoint | `apps/api/src/routes/forum.ts` | List threads in category, pagination |
| `GET /forum/threads/:id` endpoint | `apps/api/src/routes/forum.ts` | Thread with all posts, pagination |
| `POST /forum/threads` endpoint | `apps/api/src/routes/forum.ts` | Create thread (requires auth) |
| `POST /forum/threads/:id/posts` endpoint | `apps/api/src/routes/forum.ts` | Reply to thread (requires auth) |
| Create `/forum` page | `apps/web/src/app/forum/page.tsx` | Category listing |
| Create `/forum/[slug]` page | `apps/web/src/app/forum/[slug]/page.tsx` | Thread listing for category |
| Create `/forum/[slug]/[threadId]` page | `apps/web/src/app/forum/[slug]/[threadId]/page.tsx` | Thread detail with posts, reply form |
| Create `/forum/new` page | `apps/web/src/app/forum/new/page.tsx` | New thread form, requires auth |

**Acceptance:** User can browse categories, view threads, read posts. Authenticated users can create threads and reply. Flat replies only (no nested threads yet).

---

## Phase 4: Admin & Polish

### 6. Admin Tools
**Goal:** ADMIN role can manage content.

| Task | Files | Notes |
|------|-------|-------|
| Admin middleware | `apps/api/src/lib/auth.ts` | `requireAdmin` hook |
| `DELETE /forum/threads/:id` endpoint | `apps/api/src/routes/forum.ts` | Admin can delete any thread |
| `DELETE /forum/posts/:id` endpoint | `apps/api/src/routes/forum.ts` | Admin can delete any post |
| `GET /admin/users` endpoint | `apps/api/src/routes/admin.ts` | List users, filter by role |
| `PUT /admin/users/:did/role` endpoint | `apps/api/src/routes/admin.ts` | Change user role (ADMIN/USER) |
| Create `/admin` page | `apps/web/src/app/admin/page.tsx` | Dashboard with user management |
| Admin-only navigation | `apps/web/src/app/layout.tsx` | Show "Admin" link only if `user.role === 'ADMIN'` |

### 7. Polish & Testing
**Goal:** MVP is shippable.

| Task | Files | Notes |
|------|-------|-------|
| Loading states | Various | Skeleton loaders for lists, spinners for buttons |
| Error handling | Various | Toast notifications for API errors |
| Empty states | Various | Friendly messages when no data ("No restaurants yet") |
| Responsive design | Various | Mobile-first, test on small screens |
| E2E tests | `apps/web/e2e/*.test.ts` | Playwright: auth flow, restaurant CRUD, reviews, forum |
| Unit tests | `*.test.ts` alongside source | Vitest: utilities, API route handlers |
| Seed categories | `packages/db/prisma/seed.ts` | Add realistic forum categories ("Recommendations", "Insurance Q&A", "Industry News") |
| README update | `README.md` | Screenshots, feature list, contribution guide |

---

## Quick Win Checklist

If you only have 30 minutes, do these in order:

- [ ] Add `commands.md` to `.gitignore` (if it's dev-only)
- [ ] Run `pnpm lint:fix` to ensure clean slate
- [ ] Verify `pnpm dev` starts both servers
- [ ] Check `http://localhost:3001/docs` shows Swagger UI
- [ ] Run `pnpm db:seed` to populate fresh data
- [ ] Test auth flow manually (if you have an ATProto account)

---

## Dependency Decisions Needed

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Toast notifications | `sonner`, `react-hot-toast`, custom | `sonner` — lightweight, works with Tailwind |
| Form handling | React state, `react-hook-form` | `react-hook-form` for complex forms, state for simple |
| Data fetching | SWR, TanStack Query, fetch | Start with fetch + auth context, migrate to TanStack Query if needed |
| UI components | shadcn/ui, custom | Install shadcn/ui components as needed (button, input, card, dialog) |

---

## File Structure (New Files Expected)

```
apps/
  api/src/
    lib/
      auth.ts           # requireAuth, requireAdmin hooks
    routes/
      restaurants.ts    # CRUD endpoints
      reviews.ts        # Review endpoints
      forum.ts          # Forum endpoints
      admin.ts          # Admin endpoints
  web/src/
    app/
      login/
        page.tsx        # ATProto login form
      logout/
        route.ts        # Logout handler
      restaurants/
        page.tsx        # List view
        [id]/
          page.tsx      # Detail view
        new/
          page.tsx      # Create form
      forum/
        page.tsx        # Categories
        [slug]/
          page.tsx      # Threads in category
          [threadId]/
            page.tsx    # Thread detail
        new/
          page.tsx      # New thread form
      admin/
        page.tsx        # Admin dashboard
    components/
      ReviewForm.tsx    # Star rating + text input
      RestaurantCard.tsx # Card for list view
      ThreadList.tsx    # Forum thread listing
    lib/
      auth.tsx          # Auth context provider
      api.ts            # API client wrapper
```
