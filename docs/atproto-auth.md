# ATProto Authentication

Grez uses AT Protocol OAuth for identity. No passwords are stored. Users authenticate with their ATProto handle (e.g., `alice.bsky.social`).

## Packages Used
- `@atproto/oauth-client-node` — Server-side OAuth client handling the ATProto-specific OAuth dance (DID resolution, DPoP tokens, PKCE, dynamic client registration).
- `@atproto/api` — Used to fetch user profiles (display name, avatar) after authentication.

## OAuth Flow
1. **Login initiation**: `POST /oauth/login` with `{ handle: "alice.bsky.social" }`
2. **Authorization**: API calls `oauthClient.authorize(handle)` which resolves the user's PDS and returns an authorization URL.
3. **User consent**: User is redirected to their PDS authorization interface.
4. **Callback**: PDS redirects to `GET /oauth/callback` with authorization code.
5. **Token exchange**: API calls `oauthClient.callback(params)` to exchange code for session.
6. **Profile fetch**: API uses the session to create an Agent and fetch the user's profile.
7. **User upsert**: User record created/updated in PostgreSQL with DID, handle, display name, avatar.
8. **Session token**: API issues an HTTP-only JWT cookie (`grez_session`) valid for 7 days.

## Client Metadata
Served at `GET /oauth/client-metadata.json`. This is required by the ATProto OAuth spec for dynamic client registration.

## Key Environment Variables
- `ATPROTO_CLIENT_ID` — URL where client metadata is served
- `ATPROTO_REDIRECT_URI` — OAuth callback URL
- `JWT_SECRET` — Secret for signing session JWTs
- `ADMIN_DID` — DID of the admin user (gets ADMIN role on first login)

## No Custom Lexicons
Currently ATProto is used **only** for identity. All app data (restaurants, reviews, forum posts) is stored in PostgreSQL, not on the AT network. Custom Lexicons may be added in a future phase.
