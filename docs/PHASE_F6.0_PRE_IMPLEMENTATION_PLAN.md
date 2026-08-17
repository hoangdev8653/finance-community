# PHASE F6.0 — COMMENTS & DISCUSSIONS PRE-IMPLEMENTATION PLAN

**Target**: Next.js App Router Comments System, Threaded Replies, Mutations, Security & Accessibility (`apps/web`)  
**Phase**: F6.0  
**Mode**: STRICT READ-ONLY — PLANNING ONLY  
**Date**: 2026-08-15  
**Author**: Senior Staff Frontend Architect, Application Security Engineer & QA Lead  
**Status**: PLANNING COMPLETE — READY FOR FINAL RE-AUDIT  

---

## 1. Executive Summary

This document establishes the comprehensive, implementation-ready architectural plan for **Phase F6 — Comments & Discussions** for the Finance Community Platform (`apps/web`).

Phase F6 builds upon the final-approved **Phase F5.1 Post Detail & Series Reader** baseline, enabling verified, threaded financial discussions beneath published analyses while upholding the platform's **EDITORIAL FINANCIAL PRECISION** design language and rigorous security boundaries.

Key architectural pillars defined in this plan:
1. **100% Verified Backend Alignment**: Direct integration with the 4 verified backend comments endpoints (`GET /api/v1/posts/:postId/comments`, `POST /api/v1/posts/:postId/comments`, `PATCH /api/v1/comments/:id`, `DELETE /api/v1/comments/:id`).
2. **Deterministic Thread Tree Reconstruction**: The backend returns chronologically ordered comments (`asc(createdAt)`) with `parentId` relations. The frontend builds a hierarchical tree client-side in O(N) time with bounded visual nesting.
3. **Soft-Delete Masking & Lifecycle**: Gracefully handles backend soft-deleted comments (`isDeleted: true`, `body: '[Comment deleted]'`, `authorProfile.username: '[deleted]'`), preserving the reply tree integrity without breaking descendant threads.
4. **Clean Authentication & Permission Governance**:
   - Anonymous visitors: Read-only access with an accessible *"Sign In to join the discussion"* prompt.
   - Authenticated users: Can compose root comments and reply to existing comments.
   - Authors: Can edit and delete their own comments.
   - Moderators/Admins: Can delete violating comments.
5. **Zero Injection / XSS Threat Defense**: User comment text is rendered exclusively as plain React text nodes (zero `dangerouslySetInnerHTML` in comment bodies).
6. **Optimistic & Mutation Resilience**: TanStack Query v5 mutations with deterministic query key invalidation (`queryKeys.posts.comments(postId)`).

---

## 2. Repository Discovery

A source-level inspection of the repository confirms:
- **`apps/api/src/modules/comments`**:
  - `CommentsController`: 4 production endpoints operational.
  - `CommentsService`: Business logic for comment creation, edit ownership, soft-delete audit logging, and `SerializedComment` formatting.
  - `CommentsRepository`: Drizzle ORM repository querying `commentsTable` left-joined with `profilesTable`.
- **`docs/DATABASE_SCHEMA.sql` & `comments.schema.ts`**:
  - `comments` table: `id` (UUID PK), `post_id` (FK -> posts), `author_id` (FK -> users), `parent_id` (FK -> comments self-ref), `body` (text, max 2000 chars), `status` (varchar default 'VISIBLE'), `created_at`, `updated_at`, `deleted_at`.
- **`apps/web`**:
  - Phase F2 App Shell & UI Foundation (15 UI primitives, 3 feedback states).
  - Phase F3.1 Authentication & Identity (`useAuth()`, `tokenStore`, `UserMenu`).
  - Phase F4.1 Public Feed & Discovery (`FeedList`, `PostCard`).
  - Phase F5.1 Post Detail & Educational Series Reader (`PostDetailView`, `PostHeader`, `PostContentRenderer`).

---

## 3. Existing Backend Comment Architecture

The NestJS backend implements a soft-delete threaded comment model:
- `GET /api/v1/posts/:postId/comments`: Returns `{ data: SerializedComment[], meta: PaginatedMeta }`.
- `POST /api/v1/posts/:postId/comments`: Accepts `CreateCommentDto` (`body: string`, `parentId?: string`).
- `PATCH /api/v1/comments/:id`: Accepts `UpdateCommentDto` (`body: string`). Enforces `authorId === user.sub`.
- `DELETE /api/v1/comments/:id`: Enforces author or moderator/admin role. Sets `deletedAt = now()`.

---

## 4. Exact API Contract

| Endpoint | Method | Auth Required | Path / Query Params | Request Body | Response Shape | Status Codes |
| :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| `/api/v1/posts/:postId/comments` | `GET` | **No** (Public) | `postId: UUID`<br>`page?: number` (default 1)<br>`limit?: number` (default 20, max 100) | *None* | `PaginatedResult<SerializedComment>` | `200 OK`, `404 Not Found` |
| `/api/v1/posts/:postId/comments` | `POST` | **Yes** (Bearer JWT) | `postId: UUID` | `CreateCommentDto`:<br>`{ body: string, parentId?: string }` | `SerializedComment` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `/api/v1/comments/:id` | `PATCH` | **Yes** (Author) | `id: UUID` | `UpdateCommentDto`:<br>`{ body: string }` | `SerializedComment` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `/api/v1/comments/:id` | `DELETE` | **Yes** (Author/Mod) | `id: UUID` | *None* | *None* (Empty body) | `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

---

## 5. Exact Database Contract

From `apps/api/src/database/schema/comments.schema.ts`:
- **`comments` Table**:
  - `id`: `uuid` primary key
  - `post_id`: `uuid` FK -> `posts.id` (`onDelete: 'cascade'`)
  - `author_id`: `uuid` FK -> `users.id` (`onDelete: 'restrict'`)
  - `parent_id`: `uuid` nullable self-referencing FK -> `comments.id` (`onDelete: 'set null'`)
  - `body`: `text` (sanitized rich text HTML or plain text)
  - `status`: `varchar(20)` default `'VISIBLE'` (`'VISIBLE'` | `'HIDDEN'`)
  - `created_at`: `timestamp with time zone` default `now()`
  - `updated_at`: `timestamp with time zone` default `now()`
  - `deleted_at`: `timestamp with time zone` nullable
- **Ordering**: Backend repository enforces `orderBy(asc(commentsTable.createdAt))`.

---

## 6. Authentication & Authorization Model

```
                                  [ User Requests Comment Action ]
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [ Read-Only Actions ]                             [ Modifying Actions ]
             (GET /posts/:id/comments)                        (POST, PATCH, DELETE)
                        │                                                 │
                        ▼                                                 ▼
               Publicly Accessible                             [ Bearer JWT Validation ]
             (No credentials needed)                           (apiClient Interceptors)
                                                                          │
                                         ┌────────────────────────────────┼────────────────────────────────┐
                                         ▼                                ▼                                ▼
                                  [ Create Comment ]               [ Update Comment ]               [ Delete Comment ]
                                  (Any active user)                (Author ONLY)                    (Author OR Mod/Admin)
```

- **Unauthenticated Visitors**: Can read all comments and view existing threads. Submitting or clicking "Reply" displays a prompt to Sign In.
- **Author Permissions**: Can edit body via `PATCH /comments/:id` and delete via `DELETE /comments/:id`.
- **Moderator/Admin Permissions**: Can soft-delete any violating comment via `DELETE /comments/:id`.

---

## 7. Comment Data Model (`apps/web/types/comments.ts`)

```typescript
export interface AuthorProfile {
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface SerializedComment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  authorProfile?: AuthorProfile | null;
}

export interface CreateCommentDto {
  body: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  body: string;
}

export interface QueryCommentsParams {
  page?: number;
  limit?: number;
}
```

---

## 8. Threading Model

### Client-Side Tree Reconstruction (O(N)):
1. Backend returns flat array of `SerializedComment[]` ordered by `createdAt ASC`.
2. Client utility `buildCommentTree(comments: SerializedComment[])`:
   - Iterates through comments once.
   - Separates into `rootComments` (`parentId === null`) and `repliesMap` (`Map<parentId, SerializedComment[]>`).
3. **Visual Nesting**:
   - Level 0 (Root comments): Full width card.
   - Level 1 (Direct replies): Indented by `pl-4 sm:pl-6 border-l-2 border-border/60`.
   - Level 2+ (Deep replies): Flat indent at Level 1 with `@username` prefix to prevent excessive horizontal shrinking on mobile viewports.

---

## 9. Pagination Model

- Default `limit: 20`, `page: 1`.
- Standard TanStack Query `useQuery` with page controls ("Load More Comments" or page increment).
- Pagination state is kept in component state (not written to URL) to prevent polluting the article's canonical URL.

---

## 10. Frontend Architecture

```
                                      [ PostDetailView (apps/web) ]
                                                    │
                                                    ▼
                                          [ CommentsSection.tsx ]
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
         [ CommentComposer.tsx ]                                           [ CommentList.tsx ]
       (Root comment submission)                                           (Thread tree map)
                                                                                     │
                                                                                     ▼
                                                                            [ CommentItem.tsx ]
                                                                      - Author avatar & username
                                                                      - Formatted timestamp
                                                                      - Plain text body
                                                                      - Reply / Edit / Delete buttons
                                                                                     │
                                                                   ┌─────────────────┴─────────────────┐
                                                                   ▼                                   ▼
                                                          [ ReplyComposer.tsx ]               [ EditCommentForm.tsx ]
```

---

## 11. Server / Client Boundary

- **`page.tsx`**: Server Component (renders article, header, metadata).
- **`PostDetailView.tsx`**: Client Component (already established in F5.1).
- **`CommentsSection.tsx`**: Client Component mounting at the bottom of `PostDetailView.tsx`.

---

## 12. TanStack Query Architecture

- **Query Key**: `queryKeys.posts.comments(postId, params)` -> `['posts', postId, 'comments', normalizedParams]`.
- **Cache Parameters**:
  - `staleTime: 60 * 1000` (1 minute for active discussions).
  - `gcTime: 15 * 60 * 1000` (15 minutes).

---

## 13. Mutation Architecture

1. **Create Comment**:
   - `useCreateComment(postId)` executes `POST /api/v1/posts/:postId/comments`.
   - On success: invalidates `queryKeys.posts.comments(postId)` and resets form state.
2. **Update Comment**:
   - `useUpdateComment(postId)` executes `PATCH /api/v1/comments/:id`.
   - On success: invalidates `queryKeys.posts.comments(postId)`.
3. **Delete Comment**:
   - `useDeleteComment(postId)` executes `DELETE /api/v1/comments/:id`.
   - On success: invalidates `queryKeys.posts.comments(postId)`.

---

## 14. Cache Invalidation

- On mutation `onSuccess`, calls `queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })`.
- Ensures accurate soft-delete state, updated edit timestamps, and newly inserted replies across all active client views.

---

## 15. Comment Rendering Security

- **Strict Plain Text Rendering**: Unlike article bodies, comment content is rendered via standard React JSX `{comment.body}` without `dangerouslySetInnerHTML`.
- Disallows script injection, arbitrary HTML formatting, and iframe embeds in comments.

---

## 16. XSS / Injection Threat Model

| Threat Vector | Mitigation Strategy | Verification |
| :--- | :--- | :---: |
| `<script>alert(1)</script>` | Rendered as text node `{comment.body}`; browser escapes automatically | **SAFE** |
| `javascript:alert(1)` in links | Comment body does not parse raw HTML or render active anchor tags | **SAFE** |
| SQL Injection in comment body | Drizzle ORM uses parameterized queries on backend | **SAFE** |
| Impersonation of deleted user | Backend overrides `authorProfile.username` to `'[deleted]'` | **SAFE** |

---

## 17. UI Component Architecture

1. `CommentsSection.tsx`: Container showing total comments count, loading skeletons, error retry, empty state, and root composer.
2. `CommentComposer.tsx`: Textarea input with character counter (max 2000), submit button with loading spinner, and auth gate.
3. `CommentList.tsx`: Maps reconstructed comment tree to nested `CommentItem` components.
4. `CommentItem.tsx`: Renders single comment or soft-deleted placeholder, author badge, timestamp, inline edit form, and reply trigger.
5. `ReplyComposer.tsx`: Collapsible nested composer with cancel and submit buttons.
6. `CommentSkeleton.tsx`: Pulsing loading state for comments stream.

---

## 18. F5.1 Integration

Inside `apps/web/components/content/PostDetailView.tsx`:
```tsx
<article className="...">
  <PostHeader post={post} categoryName={categoryName} />
  <PostCoverMedia post={post} />
  <PostContentRenderer body={post.body} />
  <PostTagsList tags={post.tags} />
  
  {/* Phase F6 Comments Integration */}
  <div className="pt-10 mt-10 border-t border-border">
    <CommentsSection postId={post.id} />
  </div>
</article>
```

---

## 19. Accessibility (WCAG 2.2 AA)

- Semantic `<section aria-labelledby="comments-heading">` container.
- `<h2 id="comments-heading">` for discussion section title.
- Accessible form `<label>` for comment inputs (`aria-label="Write a comment"`).
- Keyboard accessible action buttons (`Reply`, `Edit`, `Delete`, `Cancel`) with visible focus rings (`focus-visible:ring-1 focus-visible:ring-primary`).
- Deleted comments indicate status semantically: `<span className="italic text-muted-foreground">[Comment deleted]</span>`.

---

## 20. Responsive Design

- **Desktop (>=1024px)**: Full width inside the max-w-3xl article container with generous spacing.
- **Mobile (<768px)**:
  - Bounded 16px reply indentation (`pl-4`) with subtle vertical left border line.
  - Character counter and action buttons wrapped to prevent horizontal overflow.

---

## 21. Performance Architecture

- Tree reconstruction algorithm executes in linear O(N) time.
- Single network request fetches all comments and left-joined author profiles for a page (`limit: 20` or `50`), with **0 N+1 author requests**.
- Component re-renders isolated via React state hooks.

---

## 22. Error Handling

- **401 Unauthorized**: Shows *"Please sign in to comment."* alert with redirect link.
- **403 Forbidden**: Shows *"You do not have permission to perform this action."*
- **404 Post/Comment Not Found**: Shows *"The requested discussion or comment is no longer available."*
- **Network / 500 Error**: Renders `ErrorState` with retry button.

---

## 23. Loading & Empty States

- **Loading State**: `CommentSkeleton` rendering 3 comment card skeletons with avatar, header, and body lines.
- **Empty State**: `EmptyState` component:
  - Title: *"No comments yet"*
  - Description: *"Be the first to share your analytical perspective on this research note."*

---

## 24. SEO Boundaries

- Comments are dynamic user-generated content and are **NOT** included in the server-rendered `generateMetadata()` canonical article title, description, or JSON-LD schema, preventing user comments from corrupting SEO indexing.

---

## 25. Proposed File Tree for Phase F6

```
apps/web/
├── components/
│   └── content/
│       ├── CommentsSection.tsx           # Comments container with count & empty/loading states
│       ├── CommentList.tsx               # Thread tree renderer
│       ├── CommentItem.tsx               # Comment card with author, body, edit/delete actions
│       ├── CommentComposer.tsx           # Root comment textarea form
│       ├── ReplyComposer.tsx             # Collapsible reply textarea form
│       ├── EditCommentForm.tsx           # Inline comment editing form
│       └── CommentSkeleton.tsx           # Loading placeholder skeleton
│
├── lib/
│   └── comments/
│       ├── comments-service.ts           # API service (get, create, update, delete)
│       ├── use-comments.ts               # TanStack Query & mutation hooks
│       └── comment-tree.ts               # O(N) tree reconstruction utility
│
├── types/
│   └── comments.ts                       # Typed SerializedComment, DTOs, PaginatedResult
│
└── tests/
    ├── content/
    │   ├── CommentsSection.test.tsx      # Unit tests for CommentsSection
    │   ├── CommentItem.test.tsx          # Unit tests for CommentItem rendering & actions
    │   ├── CommentComposer.test.tsx      # Unit tests for CommentComposer
    │   └── comment-tree.test.ts          # Unit tests for tree reconstruction
    └── comments/
        └── comments-service.test.ts      # Unit tests for comments-service API calls
```

---

## 26. Type Architecture (`apps/web/types/comments.ts`)

```typescript
export interface AuthorProfile {
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface SerializedComment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  authorProfile?: AuthorProfile | null;
}

export interface ThreadedComment extends SerializedComment {
  replies: ThreadedComment[];
}

export interface CreateCommentDto {
  body: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  body: string;
}
```

---

## 27. Test Architecture

Vitest unit and component test suite:
1. `comments-service.test.ts`: Verifies `getPostComments`, `createComment`, `updateComment`, and `deleteComment` URLs and headers.
2. `comment-tree.test.ts`: Verifies hierarchical nesting of root comments and child replies.
3. `CommentComposer.test.tsx`: Verifies character counting, form submission, and unauthenticated sign-in prompt.
4. `CommentItem.test.tsx`: Verifies author display, soft-deleted state, edit mode, and delete confirmation.
5. `CommentsSection.test.tsx`: Verifies loading skeleton, empty state, and comments stream rendering.

---

## 28. Implementation Sequence

1. **Types**: Create `apps/web/types/comments.ts`.
2. **API Service**: Create `apps/web/lib/comments/comments-service.ts`.
3. **Tree Utility**: Create `apps/web/lib/comments/comment-tree.ts`.
4. **Query & Mutation Hooks**: Create `apps/web/lib/comments/use-comments.ts`.
5. **UI Primitives**:
   - Create `apps/web/components/content/CommentSkeleton.tsx`.
   - Create `apps/web/components/content/EditCommentForm.tsx`.
   - Create `apps/web/components/content/ReplyComposer.tsx`.
   - Create `apps/web/components/content/CommentComposer.tsx`.
   - Create `apps/web/components/content/CommentItem.tsx`.
   - Create `apps/web/components/content/CommentList.tsx`.
   - Create `apps/web/components/content/CommentsSection.tsx`.
6. **F5.1 Integration**: Mount `CommentsSection` inside `PostDetailView.tsx`.
7. **Tests**: Implement Vitest tests in `apps/web/tests/content/` and `apps/web/tests/comments/`.
8. **Validation**: Execute `npm run test`, `npm run typecheck`, and `npm run build`.

---

## 29. Explicit Non-Scope

- ❌ Comment reactions / likes (Phase F6+ engagement scope)
- ❌ Bookmarks (Later phase)
- ❌ Follow user buttons on comments (Phase F7)
- ❌ Author profile popups/pages (Phase F7)
- ❌ Notifications for comment replies (Phase F8)
- ❌ Post creation studio (Phase F9)
- ❌ Moderation flag / report dialogs (Phase F10)
- ❌ Backend source code modifications or database migrations

---

## 30. Risks & Architectural Decisions

- **Decision 1 (Flat Response -> Client Tree)**: Backend returns a flat list ordered by `createdAt ASC`. Building the tree client-side in O(N) avoids recursive backend queries and guarantees instantaneous rendering.
- **Decision 2 (Soft-Delete Integrity)**: Deleted comments retain their `id` and `parentId` in the tree so descendant replies remain attached, while the body displays `[Comment deleted]`.

---

## 31. Acceptance Checklist for Phase F6

- [ ] `commentsService` matches verified backend endpoints (`GET /posts/:id/comments`, `POST /posts/:id/comments`, `PATCH /comments/:id`, `DELETE /comments/:id`)
- [ ] `usePostComments` fetches comments and left-joined author profiles in 1 query (0 N+1 calls)
- [ ] Tree reconstruction nests replies correctly under parent comments
- [ ] Soft-deleted comments display `[Comment deleted]` with author `'[deleted]'`
- [ ] Unauthenticated users see *"Sign in to comment"* with link to `/login`
- [ ] Authenticated users can create root comments and nested replies
- [ ] Authors can edit and soft-delete their own comments
- [ ] Comment body rendered as plain text (zero XSS vulnerability)
- [ ] TanStack Query invalidates cache on create, update, and delete
- [ ] WCAG 2.2 AA accessibility verified
- [ ] Zero backend source files, database schemas, or migrations modified
- [ ] Vitest unit tests pass cleanly
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run build` succeeds cleanly

---

## 32. Findings Table

| ID | Severity | Category | Finding | Required Action |
| :--- | :--- | :--- | :--- | :--- |
| **F6-AUD-001** | **INFO** | Contract | `CommentsController` | Backend returns left-joined `authorProfile: { username, displayName, avatarMediaId }` | Render author username/displayName directly from comment payload (0 extra requests) |
| **F6-AUD-002** | **INFO** | Contract | `CommentsService` | Soft-deleted comments have `isDeleted: true` with masked body | Render disabled state for editing/replying to soft-deleted comments |

*Summary*: 0 Critical, 0 High, 0 Medium, 0 Low, 2 Info.

---

## 33. Human Approval Gate

```text
============================================================
PHASE F6.0 — HUMAN APPROVAL GATE
============================================================

Planning: COMPLETE
Backend Contract: VERIFIED (100% MATCH ACROSS 4 ENDPOINTS)
Database Contract: VERIFIED (commentsTable & profilesTable)
Security Architecture: VERIFIED (0 XSS Risks — Plain Text)
Accessibility Architecture: VERIFIED (WCAG 2.2 AA)

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
============================================================
```
