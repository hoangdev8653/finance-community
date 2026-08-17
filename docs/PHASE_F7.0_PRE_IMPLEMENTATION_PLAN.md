# PHASE F7.0 — USERS, PROFILES & SOCIAL IDENTITY PRE-IMPLEMENTATION PLAN

**Target**: Public Profiles, Profile Management, Social Identity, Follow/Unfollow & Author Integration (`apps/web`)  
**Phase**: F7.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Application Security Engineer & QA Lead  
**Status**: PLANNING COMPLETE — READY FOR FINAL RE-AUDIT  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F7 — Users, Profiles & Social Identity** for the Finance Community Platform (`apps/web`).

Phase F7 connects analysts across the ecosystem through verifiable social identities, dedicated public analyst profile pages (`/profile/:username`), follow/unfollow capabilities, and profile-authored publication feeds, directly building upon the final-approved **Phase F5.1 (Post Detail)** and **Phase F6.1 (Comments & Discussions)** baselines while adhering to our **EDITORIAL FINANCIAL PRECISION** design language.

Key architectural pillars defined in this plan:
1. **100% Backend API Contract Alignment**:
   - `GET /api/v1/profiles/:username`: Public analyst profile fetch.
   - `GET /api/v1/users/me`: Authenticated user session profile.
   - `PATCH /api/v1/users/me/profile`: Authenticated user profile update (`displayName`, `bio`, `avatarMediaId`).
   - `POST /api/v1/users/:id/follow`: Authenticated user follow mutation.
   - `DELETE /api/v1/users/:id/follow`: Authenticated user unfollow mutation.
   - `GET /api/v1/users/:id/followers` & `GET /api/v1/users/:id/following`: Paginated social graphs.
   - `GET /api/v1/posts?authorId=:userId&status=PUBLISHED`: Public published analyses by author.
2. **App Router Public Profile Route (`/profile/[username]/page.tsx`)**:
   - Server Component prefetching profile data, generating dynamic SEO metadata and JSON-LD `ProfilePage` / `Person` structured schema.
   - 404 handling via `notFound()` for non-existent profiles.
3. **Analyst Header & Tabbed Navigation**:
   - Header: Username, display name, bio, analyst ID badge, member since date, follower & following counts, and dynamic Follow/Unfollow/Edit Profile action button.
   - Tab 1: **Analyses** (Feed of published research notes using existing `PostCard`).
   - Tab 2: **Followers** (Paginated list of follower profiles).
   - Tab 3: **Following** (Paginated list of profiles followed by the user).
4. **Self-Profile Management (`EditProfileModal.tsx`)**:
   - Allows users to edit their `displayName` (max 100) and `bio` (max 1000) with character counts.
5. **Cross-Phase Linking & Author Identity**:
   - Comments (`CommentItem.tsx`) and Post Headers (`PostHeader.tsx`) link author handles to `/profile/${authorProfile.username}`.
6. **Strict Security & XSS Boundaries**:
   - Bio and user metadata rendered exclusively as plain React text nodes.

---

## 2. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/users`**:
  - `UsersController`: `GET /users/me`, `PATCH /users/me/profile`, `GET /profiles/:username`.
  - `ProfilesService`: Logic for retrieving profile by username, session resolution, and profile updates.
  - `ProfilesRepository`: Queries `profilesTable` joined with `usersTable`.
- **`apps/api/src/modules/follows`**:
  - `FollowsController`: `POST /users/:id/follow`, `DELETE /users/:id/follow`, `GET /users/:id/followers`, `GET /users/:id/following`.
  - `FollowsService`: Idempotent follow/unfollow transactions with `CANNOT_FOLLOW_SELF` enforcement.
  - `FollowsRepository`: Manages `followsTable` left-joined with `profilesTable`.
- **`docs/DATABASE_SCHEMA.sql` & Schemas**:
  - `profiles` table: `id` (UUID PK), `user_id` (FK -> users unique), `username` (varchar 50 unique), `display_name` (varchar 100), `avatar_media_id` (UUID FK -> media), `bio` (text), `created_at`, `updated_at`.
  - `follows` table: `id` (UUID PK), `follower_id` (FK -> users), `following_id` (FK -> users), `created_at`, unique constraint `(follower_id, following_id)`.
- **`apps/web`**:
  - Phase F2 UI primitives (Button, Input, Modal/Dialog, Skeleton, Badge, Avatar).
  - Phase F3.1 Auth context (`useAuth()`, `tokenStore`).
  - Phase F4.1 Content feed (`PostCard`, `postsService`).
  - Phase F5.1 Post Detail (`PostHeader`, `PostDetailView`).
  - Phase F6.1 Comments (`CommentItem`, `CommentsSection`).

---

## 3. Existing Backend User/Profile Architecture

The NestJS backend provides a complete user identity and social graph API:
1. `GET /api/v1/profiles/:username`: Publicly returns `PublicProfile` object.
2. `GET /api/v1/users/me`: Authenticated profile for current session.
3. `PATCH /api/v1/users/me/profile`: Updates `displayName`, `bio`, `avatarMediaId`.
4. `POST /api/v1/users/:id/follow`: Follows a user (returns `201 Created` or `200 OK`).
5. `DELETE /api/v1/users/:id/follow`: Unfollows a user (returns `200 OK`).
6. `GET /api/v1/users/:id/followers`: Returns paginated list of followers with profiles.
7. `GET /api/v1/users/:id/following`: Returns paginated list of following with profiles.

---

## 4. Exact API Contract

| Endpoint | Method | Auth Required | Path / Query Params | Request Body | Response Shape | Status Codes |
| :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| `/api/v1/profiles/:username` | `GET` | **No** (Public) | `username: string` | *None* | `PublicProfile` | `200 OK`, `404 Not Found` |
| `/api/v1/users/me` | `GET` | **Yes** (Bearer) | *None* | *None* | `UserMeResponse` | `200 OK`, `401 Unauthorized` |
| `/api/v1/users/me/profile` | `PATCH` | **Yes** (Bearer) | *None* | `UpdateProfileDto`:<br>`{ displayName?: string, bio?: string, avatarMediaId?: string }` | `ProfileEntity` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `/api/v1/users/:id/follow` | `POST` | **Yes** (Bearer) | `id: UUID` (target userId) | *None* | `{ following: boolean, followingId: string }` | `201 Created`, `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `/api/v1/users/:id/follow` | `DELETE` | **Yes** (Bearer) | `id: UUID` (target userId) | *None* | `{ following: boolean, followingId: string }` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `/api/v1/users/:id/followers` | `GET` | **No** (Public) | `id: UUID`<br>`page?: number`, `limit?: number` | *None* | `PaginatedResult<FollowerItem>` | `200 OK` |
| `/api/v1/users/:id/following` | `GET` | **No** (Public) | `id: UUID`<br>`page?: number`, `limit?: number` | *None* | `PaginatedResult<FollowingItem>` | `200 OK` |
| `/api/v1/posts` | `GET` | **No** (Public) | `authorId: UUID`, `status: 'PUBLISHED'`, `page?: number`, `limit?: number` | *None* | `PaginatedResult<PostEntity>` | `200 OK` |

---

## 5. Exact Database Contract

- **`profiles` Table**:
  - `id`: `uuid` PK
  - `user_id`: `uuid` FK -> `users.id` (`onDelete: 'cascade'`), UNIQUE
  - `username`: `varchar(50)` UNIQUE
  - `display_name`: `varchar(100)` nullable
  - `avatar_media_id`: `uuid` nullable FK -> `media.id`
  - `bio`: `text` nullable
  - `created_at`: `timestamp with time zone`
  - `updated_at`: `timestamp with time zone`
- **`follows` Table**:
  - `id`: `uuid` PK
  - `follower_id`: `uuid` FK -> `users.id` (`onDelete: 'cascade'`)
  - `following_id`: `uuid` FK -> `users.id` (`onDelete: 'cascade'`)
  - `created_at`: `timestamp with time zone`
  - Unique constraint: `(follower_id, following_id)`

---

## 6. Authentication & Authorization Model

```
                                      [ Profile Interaction ]
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [ Public Profile Read ]                           [ Protected Actions ]
          - GET /profiles/:username                        - PATCH /users/me/profile (Owner only)
          - GET /users/:id/followers                       - POST /users/:id/follow (Auth users, id !== me)
          - GET /users/:id/following                       - DELETE /users/:id/follow (Auth users, id !== me)
          - GET /posts?authorId=:id
```

- **Anonymous Visitors**: Can view any public profile, read bio, view follower/following lists, and read published analyses. Submitting a follow action prompts the user to Sign In.
- **Self Profile (`user.id === profile.userId`)**: Follow button is replaced with an *"Edit Profile"* button. Cannot follow self (`CANNOT_FOLLOW_SELF`).
- **Other Profiles (`user.id !== profile.userId`)**: Shows Follow / Following toggle button.

---

## 7. User/Profile Data Model (`apps/web/types/users.ts`)

```typescript
export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarMediaId?: string;
}

export interface FollowItemProfile {
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface FollowerItem {
  followerId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowingItem {
  followingId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowStatusResponse {
  following: boolean;
  followingId: string;
}
```

---

## 8. Follow Data Model & State Representation

- Backend returns `FollowerItem[]` and `FollowingItem[]` with `meta.totalItems`.
- Follower count = `followersQuery.data?.meta?.totalItems ?? 0`.
- Following count = `followingQuery.data?.meta?.totalItems ?? 0`.
- Active follow state determined by checking if `currentUserId` is in `followersQuery` or tracked via TanStack Query cache.

---

## 9. Profile Page Architecture (`/profile/[username]/page.tsx`)

```
                                    [ App Router: /profile/[username] ]
                                                    │
                                                    ▼
                                          [ ProfileHeader.tsx ]
                                - Avatar & Display Name & @username
                                - Bio & Analyst ID & Joined Date
                                - Follower & Following & Analyses Counters
                                - Follow / Unfollow / Edit Profile CTA
                                                    │
                                                    ▼
                                          [ ProfileTabs.tsx ]
                                                    │
                   ┌────────────────────────────────┼────────────────────────────────┐
                   ▼                                ▼                                ▼
         [ ProfilePostsTab.tsx ]          [ ProfileFollowersTab.tsx ]      [ ProfileFollowingTab.tsx ]
      (Feed of published analyses)         (List of follower users)         (List of following users)
```

---

## 10. Follow / Unfollow Architecture

- `useFollowUser(targetUserId)`: Executes `POST /api/v1/users/:targetUserId/follow`.
- `useUnfollowUser(targetUserId)`: Executes `DELETE /api/v1/users/:targetUserId/follow`.
- On success: invalidates `['users', targetUserId, 'followers']` and `['users', currentUserId, 'following']`.

---

## 11. TanStack Query Architecture

- `queryKeys.users.profile(username)`: `['users', 'profile', username]`
- `queryKeys.users.followers(userId)`: `['users', userId, 'followers']`
- `queryKeys.users.following(userId)`: `['users', userId, 'following']`
- `queryKeys.posts.list({ authorId: userId, status: 'PUBLISHED' })`: Reuses existing post feed caching.
- Cache settings: `staleTime: 60 * 1000` (1 min), `gcTime: 15 * 60 * 1000` (15 mins).

---

## 12. Mutation Architecture

1. `useUpdateProfile()`:
   - Executes `PATCH /api/v1/users/me/profile`.
   - On success: invalidates `['users', 'me']` and `['users', 'profile', currentUsername]`.
2. `useFollowUser(userId)`:
   - Executes `POST /api/v1/users/:id/follow`.
   - On success: invalidates target user's followers query and current user's following query.
3. `useUnfollowUser(userId)`:
   - Executes `DELETE /api/v1/users/:id/follow`.
   - On success: invalidates target user's followers query and current user's following query.

---

## 13. Cache Invalidation

- Updating profile invalidates both `queryKeys.users.me` and `queryKeys.users.profile(username)`.
- Follow/unfollow mutations invalidate followers and following lists deterministically across views.

---

## 14. Security Threat Model

| Vector | Mitigation | Status |
| :--- | :--- | :---: |
| Self-follow attempt | Backend throws `400 CANNOT_FOLLOW_SELF`; UI hides follow button for self | **PROTECTED** |
| Bio HTML/Script Injection | Bio rendered strictly as React plain text `{profile.bio}` | **PROTECTED** |
| Profile tampering | Backend strictly validates Bearer token against `user.sub` on `PATCH /users/me/profile` | **PROTECTED** |
| Impersonation of deleted user | Backend rejects non-existent profile updates | **PROTECTED** |

---

## 15. XSS / Injection Analysis

- All profile fields (`username`, `displayName`, `bio`) are rendered as plain text nodes in JSX.
- Zero usage of `dangerouslySetInnerHTML` in profile views.

---

## 16. Accessibility (WCAG 2.2 AA)

- Semantic `<main>` and `<header>` landmarks for profile page.
- Accessible `<nav aria-label="Profile tabs">` with `aria-selected` on active tab.
- Form inputs in `EditProfileModal` labeled with `<label>` and live character countdowns.
- High-contrast typography for analyst metrics and bios.

---

## 17. Responsive Architecture

- **Desktop (>=1024px)**: 2-column or centered layout (`max-w-4xl`) with horizontal metrics bar.
- **Mobile (<768px)**: Stacked profile header with wrapped action buttons and full-width tab controls.

---

## 18. Performance Architecture

- Initial profile fetch pre-rendered on server in Server Component (`generateMetadata` and initial view).
- Sub-tabs loaded lazily on demand.
- Zero N+1 queries.

---

## 19. Error Handling

- `404 Not Found` for profile -> calls Next.js `notFound()`.
- `401 Unauthorized` on follow -> prompts user with sign-in modal or redirects to `/login`.
- Network errors -> renders `ErrorState` with retry button.

---

## 20. Loading / Empty States

- `ProfileSkeleton.tsx`: Pulsing avatar, header, and card skeletons.
- Empty states for tabs:
  - Analyses: *"No published analyses yet."*
  - Followers: *"No followers yet."*
  - Following: *"Not following any analysts yet."*

---

## 21. SEO Architecture

- Dynamic `generateMetadata()` in `app/profile/[username]/page.tsx`:
  - Title: `${profile.displayName || profile.username} (@${profile.username}) | Finance Pulse Analyst`
  - Description: `${profile.bio || 'Financial analyst and contributor on Finance Pulse.'}`
  - Canonical URL: `https://financepulse.community/profile/${username}`
  - OpenGraph: `type: 'profile'`
  - JSON-LD: `schema.org/ProfilePage` with `mainEntity: { '@type': 'Person', name, identifier }`.

---

## 22. F6.1 & F5.1 Integration

- Update `CommentItem.tsx`: Wrap `@${authorName}` in `<Link href={username ? `/profile/${username}` : '#'}>`.
- Update `PostHeader.tsx`: Wrap `Analyst #${shortAuthor}` in link to analyst profile when username is available.

---

## 23. Proposed File Tree for Phase F7

```
apps/web/
├── app/
│   └── profile/
│       └── [username]/
│           └── page.tsx                    # Server Component route with generateMetadata & JSON-LD
│
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx               # Avatar, metadata, follower counts, follow CTA
│       ├── ProfileTabs.tsx                 # Tab navigation (Analyses, Followers, Following)
│       ├── ProfilePostsTab.tsx             # Author's published analyses feed
│       ├── ProfileFollowersTab.tsx         # Followers list with FollowUserItem cards
│       ├── ProfileFollowingTab.tsx         # Following list with FollowUserItem cards
│       ├── FollowUserCard.tsx              # Single user card in social lists
│       ├── FollowButton.tsx                # Context-aware Follow/Unfollow button
│       ├── EditProfileModal.tsx            # Modal form for editing displayName & bio
│       ├── ProfileView.tsx                 # Main orchestrator component
│       └── ProfileSkeleton.tsx             # Loading skeleton for profile page
│
├── lib/
│   └── users/
│       ├── users-service.ts                # API service (profiles, me, follow, unfollow, followers, following)
│       └── use-user-profile.ts             # TanStack Query & mutation hooks
│
├── types/
│   └── users.ts                            # Typed PublicProfile, FollowerItem, FollowingItem, DTOs
│
└── tests/
    ├── users/
    │   └── users-service.test.ts           # Unit tests for users-service API calls
    └── profile/
        ├── ProfileHeader.test.tsx          # Unit tests for ProfileHeader
        ├── FollowButton.test.tsx           # Unit tests for FollowButton
        ├── EditProfileModal.test.tsx       # Unit tests for EditProfileModal
        └── ProfileView.test.tsx            # Unit tests for ProfileView orchestration
```

---

## 24. Type Architecture (`apps/web/types/users.ts`)

```typescript
export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarMediaId?: string;
}

export interface FollowItemProfile {
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface FollowerItem {
  followerId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowingItem {
  followingId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowStatusResponse {
  following: boolean;
  followingId: string;
}
```

---

## 25. Test Architecture

Vitest unit and component test suite:
1. `users-service.test.ts`: Verifies `getPublicProfile`, `getCurrentUserMe`, `updateProfile`, `followUser`, `unfollowUser`, `getFollowers`, `getFollowing`.
2. `ProfileHeader.test.tsx`: Verifies profile display name, bio, follower count, analyst ID, and action button.
3. `FollowButton.test.tsx`: Verifies Follow/Unfollow toggle, disabled state for self, and unauthenticated sign-in prompt.
4. `EditProfileModal.test.tsx`: Verifies character counters, input validation, and mutation execution.
5. `ProfileView.test.tsx`: Verifies tab switching and feed rendering.

---

## 26. Implementation Sequence

1. **Types**: Create `apps/web/types/users.ts`.
2. **API Service**: Create `apps/web/lib/users/users-service.ts`.
3. **Query & Mutation Hooks**: Create `apps/web/lib/users/use-user-profile.ts`.
4. **UI Components**:
   - Create `ProfileSkeleton.tsx`.
   - Create `FollowButton.tsx`.
   - Create `FollowUserCard.tsx`.
   - Create `EditProfileModal.tsx`.
   - Create `ProfileHeader.tsx`.
   - Create `ProfilePostsTab.tsx`.
   - Create `ProfileFollowersTab.tsx`.
   - Create `ProfileFollowingTab.tsx`.
   - Create `ProfileTabs.tsx`.
   - Create `ProfileView.tsx`.
5. **Route**: Create `apps/web/app/profile/[username]/page.tsx`.
6. **Tests**: Implement Vitest tests in `apps/web/tests/users/` and `apps/web/tests/profile/`.
7. **Validation**: Execute `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 27. Explicit Non-Scope

- ❌ Media upload for custom avatar image files (Phase F12+ media upload integration)
- ❌ Direct messaging / Chat (Later phase)
- ❌ Notifications for new followers (Phase F8)
- ❌ User blocking / mute lists (Phase F10 moderation)
- ❌ Post creation studio (Phase F9)
- ❌ Backend source code modifications or database migrations

---

## 28. Risks & Architectural Decisions

- **Decision 1 (Follower/Following Counts)**: Backend does not store redundant count columns on `profilesTable` but returns `meta.totalItems` on `GET /users/:id/followers` and `GET /users/:id/following`. Fetching initial counts via `limit: 1` or tab queries provides accurate real-time counts without schema bloat.
- **Decision 2 (SEO)**: Profile pages use dynamic Server Component pre-rendering with Schema.org `Person` JSON-LD for rich search engine indexing.

---

## 29. Acceptance Checklist for Phase F7

- [ ] `usersService` matches all backend user, profile, and follow endpoints
- [ ] Public profile page `/profile/:username` pre-renders with dynamic SEO metadata
- [ ] Profile header displays avatar, display name, username, bio, joined date, and stats
- [ ] Follow / Unfollow mutations update state and invalidate follower/following queries
- [ ] Self profile displays *"Edit Profile"* button; follow button disabled/hidden for self
- [ ] `EditProfileModal` updates display name and bio within character limits
- [ ] Author analyses tab renders published posts using `PostCard`
- [ ] Followers and Following tabs render user list cards with links
- [ ] Plain text rendering enforced for all user bio and name fields (zero XSS)
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] All Vitest tests pass cleanly
- [ ] TypeScript typecheck passes with 0 errors
- [ ] Next.js production build succeeds cleanly

---

## 30. Findings Table

| ID | Severity | Category | Location | Finding | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F7-AUD-001** | **INFO** | Contract | `UsersController` | Public profile endpoint is `GET /profiles/:username` (not `GET /users/:username`) | Route API call to `/profiles/:username` |
| **F7-AUD-002** | **INFO** | Contract | `FollowsController` | Follow endpoints are `POST /users/:id/follow` and `DELETE /users/:id/follow` | Pass target `userId` (not username) to follow endpoints |

*Summary*: 0 Critical, 0 High, 0 Medium, 0 Low, 2 Info.

---

## 31. Human Approval Gate

```text
============================================================
PHASE F7.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Backend Contract: VERIFIED (100% MATCH ACROSS USERS & FOLLOWS ENDPOINTS)
Database Contract: VERIFIED (profilesTable & followsTable)
Security Architecture: VERIFIED (0 XSS Risks — Plain Text)
Accessibility Architecture: VERIFIED (WCAG 2.2 AA)
SEO Architecture: VERIFIED (generateMetadata & JSON-LD Person)

Source Code Changes: 0
Backend Changes: 0
Database Changes: 0
Migrations: 0

CRITICAL: 0
HIGH: 0
MEDIUM: 0
LOW: 0
INFO: 2

FINAL VERDICT:
READY FOR FINAL RE-AUDIT

STOP.
DO NOT IMPLEMENT CODE.
AWAIT HUMAN APPROVAL.
============================================================
```
