# PHASE 3.3 — FINAL IMPLEMENTATION PLAN

**Target Module**: Social & Engagement Engine  
**Version**: 1.0 — FINAL CONSOLIDATED  
**Date**: 2026-08-13  
**Status**: READ-ONLY / AWAITING HUMAN APPROVAL  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (20 Tables, Approved & Locked)
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/DATABASE_ACCESS_LAYER_DECISION.md`
- `docs/PHASE_3_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_3.3_PRE_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_3.3_PRE_IMPLEMENTATION_CLARIFICATION.md`

---

## 1. Scope

The Phase 3.3 implementation scope is partitioned into 3 core domain modules:

1. **Comments Module** (`commentsTable`): Threaded discussion engine with parent-child adjacency hierarchy, rich-text HTML sanitization, and soft-delete thread preservation.
2. **Reactions Module** (`postReactionsTable` & `commentReactionsTable`): Atomic toggle mechanism for liking posts and comments using PostgreSQL `ON CONFLICT DO NOTHING` fallback deletion.
3. **Follows Module** (`followsTable`): User-to-user social networking graph with idempotent follow/unfollow responses and self-follow prevention.

---

## 2. Out-of-Scope

The following modules belong to **Sub-Phase 3.4 — Platform Operations & Governance** and are explicitly **OUT OF SCOPE** for Phase 3.3:

- **Notifications Module** (`notifications` table) — Deferred to Phase 3.4.
- **Moderation / Reports Module** (`reports` & `moderation_actions` tables) — Deferred to Phase 3.4.
- **Admin Module** (`system_settings`, `feature_flags`, `user_roles` admin management) — Deferred to Phase 3.4.
- **Bookmarks / Content Search Engine / Recommendation Systems** — Out of scope.

---

## 3. Database Mappings

All Phase 3.3 Drizzle ORM schema definitions map 1:1 to [DATABASE_SCHEMA.sql](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql):

### 3.1 `comments` (Table 10)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `postId`: `uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' })`
- `authorId`: `uuid('author_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' })`
- `parentId`: `uuid('parent_id').references(() => commentsTable.id, { onDelete: 'set null' })`
- `body`: `text('body').notNull()`
- `status`: `varchar('status', { length: 20 }).notNull().default('VISIBLE')` (CHECK: `'VISIBLE'`, `'HIDDEN'`)
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- `updatedAt`: `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`
- `deletedAt`: `timestamp('deleted_at', { withTimezone: true })`
- CHECK: `parent_id IS DISTINCT FROM id` (`chk_comments_no_self_reference`)

### 3.2 `post_reactions` (Table 11)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `userId`: `uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })`
- `postId`: `uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' })`
- `reactionType`: `varchar('reaction_type', { length: 20 }).notNull().default('LIKE')`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- UNIQUE: `uq_post_reactions_user_post` (`user_id, post_id`)

### 3.3 `comment_reactions` (Table 12)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `userId`: `uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })`
- `commentId`: `uuid('comment_id').notNull().references(() => commentsTable.id, { onDelete: 'cascade' })`
- `reactionType`: `varchar('reaction_type', { length: 20 }).notNull().default('LIKE')`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- UNIQUE: `uq_comment_reactions_user_comment` (`user_id, comment_id`)

### 3.4 `follows` (Table 13)
- `id`: `uuid('id').primaryKey().defaultRandom()`
- `followerId`: `uuid('follower_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })`
- `followingId`: `uuid('following_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })`
- `createdAt`: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- UNIQUE: `uq_follows_follower_following` (`follower_id, following_id`)
- CHECK: `follower_id != following_id` (`chk_follows_no_self_follow`)

---

## 4. Repository Contracts

### 4.1 `CommentsRepository`
- `createTx(tx: DrizzleTransaction, data: NewCommentEntity): Promise<CommentEntity>`
- `updateTx(tx: DrizzleTransaction, id: string, data: Partial<NewCommentEntity>): Promise<CommentEntity | undefined>`
- `findById(id: string): Promise<CommentEntity | undefined>`
- `findThreadByPostId(postId: string, page: number, limit: number): Promise<PaginatedResult<CommentEntity>>`
- `softDeleteTx(tx: DrizzleTransaction, id: string): Promise<boolean>`

### 4.2 `PostReactionsRepository`
- `findReaction(userId: string, postId: string): Promise<PostReactionEntity | undefined>`
- `addReactionTx(tx: DrizzleTransaction, userId: string, postId: string, reactionType: string): Promise<PostReactionEntity | undefined>`
- `removeReactionTx(tx: DrizzleTransaction, userId: string, postId: string): Promise<boolean>`
- `getReactionCounts(postId: string): Promise<{ total: number; userReacted: boolean }>`

### 4.3 `CommentReactionsRepository`
- `findReaction(userId: string, commentId: string): Promise<CommentReactionEntity | undefined>`
- `addReactionTx(tx: DrizzleTransaction, userId: string, commentId: string, reactionType: string): Promise<CommentReactionEntity | undefined>`
- `removeReactionTx(tx: DrizzleTransaction, userId: string, commentId: string): Promise<boolean>`
- `getReactionCounts(commentId: string): Promise<{ total: number; userReacted: boolean }>`

### 4.4 `FollowsRepository`
- `followTx(tx: DrizzleTransaction, followerId: string, followingId: string): Promise<boolean>`
- `unfollowTx(tx: DrizzleTransaction, followerId: string, followingId: string): Promise<boolean>`
- `isFollowing(followerId: string, followingId: string): Promise<boolean>`
- `findFollowersPaginated(followingId: string, page: number, limit: number): Promise<PaginatedResult<ProfileEntity>>`
- `findFollowingPaginated(followerId: string, page: number, limit: number): Promise<PaginatedResult<ProfileEntity>>`

---

## 5. Service Contracts

### 5.1 `CommentsService`
- `createComment(authorId: string, postId: string, dto: CreateCommentDto): Promise<CommentDetailResponse>`
- `updateComment(userSub: string, commentId: string, dto: UpdateCommentDto): Promise<CommentDetailResponse>`
- `deleteComment(userSub: string, userRoles: string[], commentId: string): Promise<boolean>`
- `getPostComments(postId: string, page: number, limit: number): Promise<PaginatedResult<CommentDetailResponse>>`

### 5.2 `ReactionsService`
- `togglePostReaction(userId: string, postId: string, dto: ToggleReactionDto): Promise<{ reacted: boolean; reactionType: string | null }>`
- `toggleCommentReaction(userId: string, commentId: string, dto: ToggleReactionDto): Promise<{ reacted: boolean; reactionType: string | null }>`

### 5.3 `FollowsService`
- `followUser(followerId: string, followingId: string): Promise<{ following: boolean; followingId: string }>`
- `unfollowUser(followerId: string, followingId: string): Promise<{ following: boolean; followingId: string }>`
- `getFollowers(followingId: string, page: number, limit: number): Promise<PaginatedResult<ProfileEntity>>`
- `getFollowing(followerId: string, page: number, limit: number): Promise<PaginatedResult<ProfileEntity>>`

---

## 6. Authorization

| Endpoint | Method | Required Guards | Authorization Rule |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/posts/:postId/comments` | `POST` | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` | Authenticated user (`author_id = user.sub`) |
| `PATCH /api/v1/comments/:id` | `PATCH` | `JwtAuthGuard`, `AccountStatusGuard` | Comment author only (`comment.authorId === user.sub`) |
| `DELETE /api/v1/comments/:id` | `DELETE` | `JwtAuthGuard`, `AccountStatusGuard` | Comment author OR Moderator/Admin (`MODERATOR`, `ADMIN`, `SUPER_ADMIN`) |
| `POST /api/v1/posts/:id/reactions` | `POST` | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` | Authenticated user managing their reaction |
| `POST /api/v1/comments/:id/reactions` | `POST` | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` | Authenticated user managing their reaction |
| `POST /api/v1/users/:id/follow` | `POST` | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` | Authenticated user (`follower_id = user.sub`) |
| `DELETE /api/v1/users/:id/follow` | `DELETE` | `JwtAuthGuard`, `AccountStatusGuard` | Authenticated user (`follower_id = user.sub`) |
| `GET /api/v1/posts/:postId/comments` | `GET` | None | Public |
| `GET /api/v1/users/:id/followers` | `GET` | None | Public |
| `GET /api/v1/users/:id/following` | `GET` | None | Public |

---

## 7. Comment Lifecycle & Soft-Delete Semantics

1. **Persistence Policy**: Comments are **never** physically deleted. `deleted_at` is set to `NOW()`.
2. **Thread Hierarchy Integrity**: Soft-deleted comments remain as nodes in the thread to preserve `parent_id` references for child replies.
3. **Response Serialization Masking**:
   - When `deleted_at IS NOT NULL`:
     - `body` is serialized as `"[Comment deleted]"`.
     - `author` identity fields are masked as `{ username: "[deleted]" }` or `null`.
     - `isDeleted` flag is set to `true`.
4. **Child Reply Policy**: New child replies **can** be posted under a soft-deleted parent comment (`deleted_at IS NOT NULL`) to preserve conversation context.
5. **Editing Restrictions**: Soft-deleted comments **cannot** be edited (`400 Bad Request`, `code: 'COMMENT_ALREADY_DELETED'`).
6. **Reaction Restrictions**: Soft-deleted comments **cannot** receive new reactions (`400 Bad Request`, `code: 'CANNOT_REACT_TO_DELETED_COMMENT'`).
7. **Re-deletion Restrictions**: Calling delete on an already soft-deleted comment returns `400 Bad Request` / `404 Not Found`.

---

## 8. Reaction Concurrency Strategy

The implementation must handle expected unique-conflict concurrency without an unhandled 500 response, while PostgreSQL UNIQUE constraints remain the final integrity authority.

1. **Database Constraint Authority**: `uq_post_reactions_user_post` and `uq_comment_reactions_user_comment` are the ultimate integrity authorities.
2. **Atomic Single-Transaction Toggle Algorithm**:
   ```typescript
   return await this.db.transaction(async (tx) => {
     const inserted = await tx
       .insert(postReactionsTable)
       .values({ userId, postId, reactionType })
       .onConflictDoNothing({ target: [postReactionsTable.userId, postReactionsTable.postId] })
       .returning();

     if (inserted.length === 0) {
       // Row already existed -> Atomic Delete (Unlike)
       await tx
         .delete(postReactionsTable)
         .where(and(eq(postReactionsTable.userId, userId), eq(postReactionsTable.postId, postId)));
       return { reacted: false, reactionType: null };
     }

     return { reacted: true, reactionType };
   });
   ```
3. **Concurrency Guarantees & Test Scope**:
   - Concurrent toggles are atomic within transaction boundaries.
   - Database uniqueness is always preserved.
   - No unhandled unique-constraint 500 response should occur for expected concurrent duplicate reaction requests.
   - The exact final state of truly concurrent toggles is not deterministic and must not be asserted by tests.
   - Tests must verify database integrity and absence of unhandled 500 errors.

---

## 9. Follow Idempotency Contract

All follow/unfollow endpoints are 100% idempotent:

1. **First Follow Request**: `POST /api/v1/users/:id/follow` -> `201 Created` `{ "following": true, "followingId": ":id" }`
2. **Duplicate Follow Request**: `POST /api/v1/users/:id/follow` -> `200 OK` `{ "following": true, "followingId": ":id" }` (via `ON CONFLICT DO NOTHING`)
3. **Unfollow Request (Currently Following)**: `DELETE /api/v1/users/:id/follow` -> `200 OK` `{ "following": false, "followingId": ":id" }`
4. **Unfollow Request (Not Following)**: `DELETE /api/v1/users/:id/follow` -> `200 OK` `{ "following": false, "followingId": ":id" }`
5. **Self-Follow Request**: `POST /api/v1/users/:user.sub/follow` -> `400 Bad Request` `{ "code": "CANNOT_FOLLOW_SELF", "message": "You cannot follow yourself." }`

---

## 10. Target Visibility Rules

| Target Entity State | Add Reaction | Add Comment / Reply | Edit Entity | Delete Entity |
| :--- | :--- | :--- | :--- | :--- |
| **Post `PUBLISHED` & `deleted_at IS NULL`** | **ALLOW** | **ALLOW** | **ALLOW** (Author/Mod) | **ALLOW** (Author/Mod) |
| **Post `DRAFT` / `ARCHIVED` / `HIDDEN`** | **DENY (404)** | **DENY (404)** | **ALLOW** (Author/Mod) | **ALLOW** (Author/Mod) |
| **Post `deleted_at IS NOT NULL`** | **DENY (404)** | **DENY (404)** | **DENY (404)** | **DENY (404)** |
| **Comment `VISIBLE` & `deleted_at IS NULL`** | **ALLOW** | **ALLOW** | **ALLOW** (Author) | **ALLOW** (Author/Mod) |
| **Comment `HIDDEN` (Moderated)** | **DENY (404)** | **DENY (404)** | **DENY (403)** | **ALLOW** (Mod/Admin) |
| **Comment `deleted_at IS NOT NULL`** | **DENY (400)** | **ALLOW** (Preserve Thread) | **DENY (400)** | **DENY (400)** |

---

## 11. Transaction Boundaries

1. **Comment Creation**: Single transaction (`tx`) validating target post publication status, validating parent comment alignment (same `postId`), and creating comment.
2. **Reaction Toggle**: Single transaction (`tx`) executing `INSERT ... ON CONFLICT DO NOTHING` fallback `DELETE`.
3. **Follow / Unfollow**: Single transaction (`tx`) executing `INSERT ... ON CONFLICT DO NOTHING` or `DELETE`.

---

## 12. API Contracts

- Global Prefix: `/api/v1`
- Content Type: `application/json`
- Response Standard: Standard NestJS JSON structure.

---

## 13. DTO Contracts

- **`CreateCommentDto`**: `body` (string, 1..2000, required), `parentId` (UUID, optional).
- **`UpdateCommentDto`**: `body` (string, 1..2000, required).
- **`ToggleReactionDto`**: `reactionType` (string, optional, default `'LIKE'`).
- **`QueryCommentsDto`**: `page` (number, min 1), `limit` (number, 1..100).
- **`QueryFollowsDto`**: `page` (number, min 1), `limit` (number, 1..100).

---

## 14. Pagination

Reuses standard platform pagination:
- `page`: Default 1
- `limit`: Default 20 (Max 100)
- `sortBy`: `created_at`
- `order`: `'ASC'` for comments (chronological reader order); `'DESC'` for follow lists.

---

## 15. Error Contracts

- `400 Bad Request`: Validation failure, self-follow attempt (`CANNOT_FOLLOW_SELF`), invalid `parentId`, attempt to edit or react to soft-deleted comment where specified.
- `401 Unauthorized`:
  - Missing authentication credentials
  - Invalid JWT
  - Expired/invalid authentication token
- `403 Forbidden`:
  - Authenticated user is blocked/restricted by account status
  - Authenticated user lacks required permission
  - Authenticated user fails ownership authorization
  - Authenticated user attempts an operation they are not authorized to perform
- `404 Not Found`: Target resource does not exist, or public interaction target is unpublished/hidden/deleted where the visibility matrix specifies 404.

---

## 16. Test Requirements

- **`comments.spec.ts`**:
  - Top-level comment creation & rich text sanitization.
  - Nested reply creation validating parent post alignment.
  - Self-referencing `parentId` rejection (`chk_comments_no_self_reference`).
  - Cross-post parent ID rejection.
  - Soft-delete body masking as `"[Comment deleted]"`.
  - Child replies remaining allowed under soft-deleted parent comments.
  - Author vs non-author edit/delete authorization.
- **`reactions.spec.ts`**:
  - Post reaction toggle (Like -> Unlike -> Like).
  - Comment reaction toggle.
  - Concurrent duplicate reaction toggle idempotency.
- **`follows.spec.ts`**:
  - Follow user (`201 Created`).
  - Duplicate follow user (`200 OK` idempotent).
  - Unfollow user (`200 OK` idempotent).
  - Self-follow rejection (`400 Bad Request`).
  - Followers and Following list pagination.

---

## 17. Verification Pipeline

Upon authorization, execution will be verified with:
```bash
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

---

## 18. Acceptance Criteria

1. All 4 database schemas (`comments`, `post_reactions`, `comment_reactions`, `follows`) map 100% to `DATABASE_SCHEMA.sql`.
2. Threaded comments validate `parentId` and post alignment cleanly.
3. Soft-deleted comments set `deleted_at = NOW()`, preserve tree nodes, allow child replies, and mask body as `"[Comment deleted]"`.
4. **Concurrent duplicate reaction requests must never violate the database uniqueness constraint or produce an unhandled 500 error. Exact final state ordering under truly concurrent toggles is not guaranteed.**
5. Follow endpoints are 100% idempotent (`201` initial, `200` duplicate/unfollow).
6. Self-follow attempts are rejected with `400 Bad Request` (`CANNOT_FOLLOW_SELF`).
7. All 4 verification commands (`tsc`, `build`, `test`, `test:e2e`) pass with 0 errors.

---

## 19. Stop Conditions

Stop and report if:
1. `DATABASE_SCHEMA.sql` table constraints conflict with planned Drizzle mappings.
2. `PostsService` or `UsersService` APIs lack required methods for target validation.
3. Any NestJS circular dependency loop is detected without `forwardRef()`.

---

**STATUS**:  
**PHASE 3.3 FINAL IMPLEMENTATION PLAN READY**  
**AWAITING HUMAN APPROVAL BEFORE IMPLEMENTATION**
