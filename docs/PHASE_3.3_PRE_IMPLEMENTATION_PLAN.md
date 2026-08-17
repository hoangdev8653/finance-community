# PHASE 3.3 — PRE-IMPLEMENTATION PLAN (CONSOLIDATED)

**Target Module**: Social & Engagement Engine  
**Version**: 1.0 — CONSOLIDATED  
**Date**: 2026-08-13  
**Status**: CONSOLIDATED INTO PHASE_3.3_FINAL_IMPLEMENTATION_PLAN.md / AWAITING HUMAN APPROVAL  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (20 Tables, Approved)
- `docs/DATABASE_ERD.md`
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/SECURITY_FOUNDATION_REVIEW.md`
- `docs/DATABASE_ACCESS_LAYER_DECISION.md`
- `docs/PHASE_3_IMPLEMENTATION_PLAN.md`
- Phase 3.1 & Phase 3.2 Final Re-Audit Reports (Approved & Closed)

---

## 1. Executive Summary

Phase 3.3 introduces the **Social & Engagement Engine**, enabling user interaction on published content and user-to-user networking. This pre-implementation plan outlines the architectural specifications for Comments (threaded adjacency-list discussions), Reactions (post & comment liking mechanisms), and Follows (social networking graph). All operations adhere strictly to the approved 20-table PostgreSQL database schema, existing security guard pipelines, and NestJS service delegation rules.

---

## 2. Scope & Modules

The Phase 3.3 implementation scope is partitioned into 3 core domain modules:

1. **Comments Module** (`commentsTable`): Threaded discussion engine with parent-child adjacency hierarchy, body sanitization, and soft-delete thread preservation.
2. **Reactions Module** (`postReactionsTable` & `commentReactionsTable`): Atomic toggle mechanism for liking posts and comments with strict UNIQUE constraint deduplication.
3. **Follows Module** (`followsTable`): User-to-user social networking graph with self-follow prevention constraints.

---

## 3. Out-of-Scope

The following modules belong to **Sub-Phase 3.4 — Platform Operations & Governance** and are explicitly **OUT OF SCOPE** for Phase 3.3:

- **Notifications Module** (`notifications` table) — Deferred to Phase 3.4.
- **Moderation / Reports Module** (`reports` & `moderation_actions` tables) — Deferred to Phase 3.4.
- **Admin Module** (`system_settings`, `feature_flags`, `user_roles` admin operations) — Deferred to Phase 3.4.
- **Bookmarks / Search / Recommendation Engine** — Out of scope.

---

## 4. Database Tables

The following 4 tables defined in [DATABASE_SCHEMA.sql](file:///d:/Web_Projects/finance_community_architecture_v1/docs/DATABASE_SCHEMA.sql) serve as the exclusive database foundation for Phase 3.3:

### 4.1 `comments` (Table 10)
- **Columns**: `id` (UUID PK), `post_id` (UUID FK), `author_id` (UUID FK), `parent_id` (UUID FK NULL), `body` (TEXT), `status` (VARCHAR(20) DEFAULT 'VISIBLE'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `deleted_at` (TIMESTAMPTZ NULL).
- **Constraints**:
  - `fk_comments_post`: `FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE`
  - `fk_comments_author`: `FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT`
  - `fk_comments_parent`: `FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE SET NULL`
  - `chk_comments_status`: `CHECK (status IN ('VISIBLE', 'HIDDEN'))`
  - `chk_comments_no_self_reference`: `CHECK (parent_id IS DISTINCT FROM id)`
- **Indexes**: `idx_comments_post` (`post_id, created_at ASC`), `idx_comments_parent` (`parent_id`), `idx_comments_author` (`author_id`).

### 4.2 `post_reactions` (Table 11)
- **Columns**: `id` (UUID PK), `user_id` (UUID FK), `post_id` (UUID FK), `reaction_type` (VARCHAR(20) DEFAULT 'LIKE'), `created_at` (TIMESTAMPTZ).
- **Constraints**:
  - `fk_post_reactions_user`: `FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE`
  - `fk_post_reactions_post`: `FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE`
  - `uq_post_reactions_user_post`: `UNIQUE (user_id, post_id)`
- **Indexes**: `idx_post_reactions_post` (`post_id`).

### 4.3 `comment_reactions` (Table 12)
- **Columns**: `id` (UUID PK), `user_id` (UUID FK), `comment_id` (UUID FK), `reaction_type` (VARCHAR(20) DEFAULT 'LIKE'), `created_at` (TIMESTAMPTZ).
- **Constraints**:
  - `fk_comment_reactions_user`: `FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE`
  - `fk_comment_reactions_comment`: `FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE`
  - `uq_comment_reactions_user_comment`: `UNIQUE (user_id, comment_id)`
- **Indexes**: `idx_comment_reactions_comment` (`comment_id`).

### 4.4 `follows` (Table 13)
- **Columns**: `id` (UUID PK), `follower_id` (UUID FK), `following_id` (UUID FK), `created_at` (TIMESTAMPTZ).
- **Constraints**:
  - `fk_follows_follower`: `FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE`
  - `fk_follows_following`: `FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE`
  - `uq_follows_follower_following`: `UNIQUE (follower_id, following_id)`
  - `chk_follows_no_self_follow`: `CHECK (follower_id != following_id)`
- **Indexes**: `idx_follows_following` (`following_id`).

---

## 5. Entity Relationships

```
┌──────────────┐         ┌──────────────┐
│  Users Mod.  │────────►│ Posts Module │
└──────┬───────┘         └──────┬───────┘
       │                        │
       ├────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│Follows Module│         │Comments Mod. │         │Reactions Mod.│
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │                        ▲
                                └────────────────────────┘
```

- `comments` references `posts(id)` (Cascade) and `users(id)` (Restrict). `parent_id` self-references `comments(id)` (Set Null).
- `post_reactions` references `users(id)` (Cascade) and `posts(id)` (Cascade).
- `comment_reactions` references `users(id)` (Cascade) and `comments(id)` (Cascade).
- `follows` references `users(id)` for both `follower_id` and `following_id` (Cascade).

---

## 6. Dependencies on Phase 3.1

- **`UsersModule`**: `JitProvisioningService` for user resolution and role lookup (`AccountStatusGuard`).
- **`MediaModule`**: Media asset resolution if comments support media references in future.

---

## 7. Dependencies on Phase 3.2

- **`PostsModule`**: `PostsService` / `PostsRepository` to validate target post existence, publication status (`status = 'PUBLISHED'`), and soft-delete state (`deleted_at IS NULL`) before allowing comments or post reactions.

---

## 8. Authorization Model

### 8.1 Read Access
- **`GET /api/v1/posts/:postId/comments`**: Public (Excludes soft-deleted/hidden comments unless requested).
- **`GET /api/v1/users/:id/followers`**: Public.
- **`GET /api/v1/users/:id/following`**: Public.
- **`GET /api/v1/posts/:id/reactions`**: Public aggregate counts + authenticated user reaction status.

### 8.2 Write Access
- **Comment Creation**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)`. Authenticated user becomes `author_id`.
- **Comment Update**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`. Author only (`comment.authorId === user.sub`).
- **Comment Soft-Delete**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`. Author OR Moderator/Admin (`MODERATOR`, `ADMIN`, `SUPER_ADMIN`).
- **Reaction Toggle**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)`. Authenticated user toggles their own reaction.
- **Follow / Unfollow**: `@UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)`. Authenticated user manages their own follow graph (`follower_id === user.sub`).

---

## 9. Repository Design

### 9.1 `CommentsRepository`
- `createTx(tx, data)`: Inserts new comment.
- `updateTx(tx, id, data)`: Updates comment body/status.
- `findById(id)`: Fetches comment by ID.
- `findThreadByPostId(postId, page, limit)`: Fetches top-level comments and replies tree.
- `softDeleteTx(tx, id)`: Sets `deleted_at = NOW()`.
- `countByPostId(postId)`: Returns total visible comments for a post.

### 9.2 `PostReactionsRepository`
- `findReaction(userId, postId)`: Checks if user reacted.
- `addReactionTx(tx, userId, postId, reactionType)`: Inserts reaction record.
- `removeReactionTx(tx, userId, postId)`: Deletes reaction record.
- `getReactionCounts(postId)`: Returns reaction aggregation counts.

### 9.3 `CommentReactionsRepository`
- `findReaction(userId, commentId)`: Checks if user reacted.
- `addReactionTx(tx, userId, commentId, reactionType)`: Inserts reaction record.
- `removeReactionTx(tx, userId, commentId)`: Deletes reaction record.
- `getReactionCounts(commentId)`: Returns reaction aggregation counts.

### 9.4 `FollowsRepository`
- `followTx(tx, followerId, followingId)`: Inserts follow record (`ON CONFLICT DO NOTHING`).
- `unfollowTx(tx, followerId, followingId)`: Deletes follow record.
- `isFollowing(followerId, followingId)`: Returns boolean status.
- `findFollowersPaginated(followingId, page, limit)`: Fetches followers list with profile metadata.
- `findFollowingPaginated(followerId, page, limit)`: Fetches following list with profile metadata.

---

## 10. Service Design & Delegation Rules

### 10.1 `CommentsService`
- **Delegation**: Uses `PostsService.getPostById(postId)` to ensure post is active and published.
- **Parent Validation**: If `parentId` is provided, verifies parent comment exists, belongs to the *same* `postId`, and is not self-referencing (`parentId !== commentId`).
- **Body Sanitization**: Calls `SanitizerUtil.sanitizeRichText(body)` before storage.

### 10.2 `ReactionsService`
- **Delegation**: Uses `PostsService.getPostById(postId)` for post reactions; uses `CommentsService.getCommentById(commentId)` for comment reactions.
- **Atomic Toggle Logic**:
  ```typescript
  const existing = await repo.findReaction(userId, targetId);
  if (existing) {
    await repo.removeReactionTx(tx, userId, targetId);
    return { reacted: false };
  } else {
    await repo.addReactionTx(tx, userId, targetId, type);
    return { reacted: true };
  }
  ```

### 10.3 `FollowsService`
- **Delegation**: Uses `UsersService` / `ProfilesService` to verify target user exists and is `ACTIVE`.
- **Self-Follow Check**: Rejects `followerId === followingId` with `400 Bad Request` before DB execution.

---

## 11. Transaction Boundaries

1. **Comment Creation**: Single atomic transaction validating parent comment alignment and inserting record.
2. **Reaction Toggle**: Atomic transaction checking existing reaction state and performing insert/delete (`post_reactions` / `comment_reactions`).
3. **Follow / Unfollow**: Atomic transaction checking target user status and performing insert/delete (`follows`).

---

## 12. Concurrency Strategy

- **Duplicate Reactions**: Handled by database unique constraints `uq_post_reactions_user_post` and `uq_comment_reactions_user_comment`. Catch `23505` to handle concurrent toggle gracefully.
- **Duplicate Follows**: Handled by database unique constraint `uq_follows_follower_following` (`ON CONFLICT DO NOTHING`).
- **Self-Follow Protection**: Protected by database `chk_follows_no_self_follow` CHECK constraint and application validation.
- **Self-Comment Reference**: Protected by database `chk_comments_no_self_reference` CHECK constraint and application validation.

---

## 13. API Specification

| Endpoint | Method | Access | Guards |
| :--- | :--- | :--- | :--- |
| `/api/v1/posts/:postId/comments` | `GET` | Public | None |
| `/api/v1/posts/:postId/comments` | `POST` | Verified User | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` |
| `/api/v1/comments/:id` | `PATCH` | Author | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/comments/:id` | `DELETE` | Author / Mod | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/posts/:id/reactions` | `POST` | Verified User | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` |
| `/api/v1/comments/:id/reactions` | `POST` | Verified User | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` |
| `/api/v1/users/:id/follow` | `POST` | Verified User | `JwtAuthGuard`, `AccountStatusGuard`, `EmailVerificationGuard` |
| `/api/v1/users/:id/follow` | `DELETE` | Verified User | `JwtAuthGuard`, `AccountStatusGuard` |
| `/api/v1/users/:id/followers` | `GET` | Public | None |
| `/api/v1/users/:id/following` | `GET` | Public | None |

---

## 14. DTO Specification

- **`CreateCommentDto`**: `body` (string, max 2000, required), `parentId` (UUID, optional).
- **`UpdateCommentDto`**: `body` (string, max 2000, required).
- **`ToggleReactionDto`**: `reactionType` (string, optional, default `'LIKE'`).
- **`QueryCommentsDto`**: `page` (number, min 1), `limit` (number, 1..100).
- **`QueryFollowsDto`**: `page` (number, min 1), `limit` (number, 1..100).

---

## 15. Pagination & Query Design

Reuses standard API pagination contract:
- `page`: Default 1
- `limit`: Default 20 (Max 100)
- `sortBy`: `created_at`
- `order`: `'ASC'` for comments (chronological reading order); `'DESC'` for followers/following feeds.

---

## 16. Notification Architecture

*(Deferred to Phase 3.4 — Platform Operations & Governance)*  
Notification records creation in `notifications` table will be wired in Phase 3.4 when the Notifications Module is implemented.

---

## 17. Moderation Architecture

*(Deferred to Phase 3.4 — Platform Operations & Governance)*  
Moderation actions (`HIDE_CONTENT` on comments) will interface with `reports` and `moderation_actions` in Phase 3.4.

---

## 18. Test Strategy

1. **`comments.spec.ts`**:
   - Create top-level comment.
   - Create nested reply (validating parent post alignment).
   - Reject self-referencing `parentId`.
   - Reject reply to different post's comment.
   - HTML sanitization of comment body.
   - Soft-delete displaying `[Comment deleted]` or masking body.
   - Author vs non-author edit permissions.
2. **`reactions.spec.ts`**:
   - Post reaction toggle (Like -> Unlike).
   - Comment reaction toggle (Like -> Unlike).
   - Concurrent reaction toggle idempotency.
3. **`follows.spec.ts`**:
   - Follow user.
   - Unfollow user.
   - Self-follow rejection (`400 Bad Request`).
   - Duplicate follow idempotency (`ON CONFLICT DO NOTHING`).
   - Followers and Following list pagination.

---

## 19. Implementation Order

```text
Step 3.3.1: Drizzle Schemas (comments, post_reactions, comment_reactions, follows) & Index Export
        ↓
Step 3.3.2: Repositories (CommentsRepository, PostReactionsRepository, CommentReactionsRepository, FollowsRepository)
        ↓
Step 3.3.3: DTOs (CreateCommentDto, UpdateCommentDto, ToggleReactionDto, QueryCommentsDto, QueryFollowsDto)
        ↓
Step 3.3.4: Services (CommentsService, ReactionsService, FollowsService)
        ↓
Step 3.3.5: Controllers (CommentsController, ReactionsController, FollowsController)
        ↓
Step 3.3.6: Module Registration & Wiring (CommentsModule, ReactionsModule, FollowsModule in AppModule)
        ↓
Step 3.3.7: Unit Test Suites (comments.spec.ts, reactions.spec.ts, follows.spec.ts)
        ↓
Step 3.3.8: Complete Verification Pipeline Execution
```

---

## 20. Verification Pipeline

Upon authorization, execution will be verified with:
```bash
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

---

## 21. Stop Conditions

Stop and report if:
1. `DATABASE_SCHEMA.sql` table constraints conflict with planned Drizzle mappings.
2. `PostsService` or `UsersService` APIs lack required methods for validation.
3. Any NestJS dependency injection circular loop is detected without `forwardRef()`.

---

## 22. Final Acceptance Criteria

- All 4 database schemas (`comments`, `post_reactions`, `comment_reactions`, `follows`) map 100% to `DATABASE_SCHEMA.sql`.
- Threaded comments validate `parentId` and post alignment cleanly.
- Reactions toggle atomically without 500 errors.
- Follows prevent self-following and operate idempotently.
- `npx tsc --noEmit`, `npm run build`, `npm test`, `npm run test:e2e` pass with 0 errors.

---

**STATUS**:  
**PHASE 3.3 PRE-IMPLEMENTATION PLAN READY**  
**AWAITING HUMAN REVIEW BEFORE IMPLEMENTATION**
