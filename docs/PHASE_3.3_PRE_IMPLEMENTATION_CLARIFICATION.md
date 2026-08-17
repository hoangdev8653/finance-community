# PHASE 3.3 — PRE-IMPLEMENTATION CLARIFICATION

**Target Module**: Social & Engagement Engine  
**Version**: 1.0  
**Date**: 2026-08-13  
**Status**: PLANNING REVIEW — READ-ONLY / AWAITING HUMAN APPROVAL  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (20 Tables)
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/DATABASE_ACCESS_LAYER_DECISION.md`
- `docs/PHASE_3_IMPLEMENTATION_PLAN.md`
- `docs/PHASE_3.3_PRE_IMPLEMENTATION_PLAN.md`

---

## 1. Reaction Concurrency Analysis

### 1.1 Race Condition Risk
The naive application-side pattern:
```text
findReaction() -> if exists -> remove() else -> insert()
```
is vulnerable to race conditions under concurrent requests:
```text
Request A (User 1, Post X) -> findReaction = NULL
Request B (User 1, Post X) -> findReaction = NULL
Request A -> INSERT INTO post_reactions ... (Succeeds)
Request B -> INSERT INTO post_reactions ... (Fails with PG 23505 uq_post_reactions_user_post)
```

### 1.2 Database Authority & Concurrency Strategy
The database UNIQUE constraints `uq_post_reactions_user_post` (`user_id, post_id`) and `uq_comment_reactions_user_comment` (`user_id, comment_id`) remain the ultimate integrity authority.

To handle concurrent toggles safely, deterministically, and without throwing `500 Internal Server Error` or producing invalid double-insert/double-delete state:

1. **Atomic Toggle Strategy via `ON CONFLICT`**:
   The toggle operation executes inside a Drizzle transaction (`tx`) using PostgreSQL atomic insertion with `ON CONFLICT DO NOTHING`:
   ```typescript
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
   ```

2. **Guarantees**:
   - **Deterministic Output**: Exactly one request creates the row; concurrent duplicate requests gracefully fall through to remove it or return idempotent reaction state.
   - **No Transaction Abort**: PostgreSQL handles conflict without setting `tx` into an aborted error state.
   - **Zero SQL Injection / Race Windows**: Executed atomically at the database layer.

---

## 2. Comment Soft-Delete Semantics

### 2.1 Resolved Semantics
To preserve thread structure and prevent broken nested reply subtrees while strictly protecting user privacy:

1. **Database Row State**: Comment row remains in `comments` table. `deleted_at` is set to `NOW()`. Record is **never** physically deleted.
2. **Thread Hierarchy**: Comment node remains in the discussion tree (`parent_id` is preserved). Child replies remain visible and accessible.
3. **Body Masking**: At the API response serialization layer, if `deleted_at IS NOT NULL`, `body` is masked as:
   ```text
   "[Comment deleted]"
   ```
4. **Author Masking**: `author` identity fields are masked as `null` or `{ username: "[deleted]" }` to prevent identity exposure post-deletion.
5. **Reactions on Deleted Comments**: Existing reaction records remain in database, but new reaction attempts on soft-deleted comments are blocked with `400 Bad Request` (`code: 'CANNOT_REACT_TO_DELETED_COMMENT'`).
6. **Replies to Deleted Comments**: Allowed. Child replies can be posted under a deleted parent node (`deleted_at IS NOT NULL`) to preserve ongoing conversation context.
7. **Editing Deleted Comments**: Blocked. `PATCH /api/v1/comments/:id` on a soft-deleted comment returns `400 Bad Request` (`code: 'COMMENT_ALREADY_DELETED'`).
8. **Re-deleting Comments**: Blocked. Subsequent delete calls on an already soft-deleted comment return `400 Bad Request` / `404 Not Found`.
9. **Public API Response Schema**:
   ```json
   {
     "id": "comment-uuid-1",
     "postId": "post-uuid-1",
     "parentId": "parent-uuid-1",
     "body": "[Comment deleted]",
     "status": "VISIBLE",
     "createdAt": "2026-08-13T20:00:00.000Z",
     "updatedAt": "2026-08-13T22:30:00.000Z",
     "deletedAt": "2026-08-13T22:30:00.000Z",
     "isDeleted": true
   }
   ```

---

## 3. Follow Idempotency Contract

### 3.1 Idempotent HTTP Responses
All follow/unfollow operations are fully idempotent and return deterministic state:

1. **First Follow Attempt**:
   - `POST /api/v1/users/:id/follow`
   - Returns: `201 Created`
   - Payload: `{ "following": true, "followingId": ":id" }`
2. **Duplicate Follow Attempt (Already Following)**:
   - `POST /api/v1/users/:id/follow`
   - Uses `onConflictDoNothing({ target: [followsTable.followerId, followsTable.followingId] })`.
   - Returns: `200 OK`
   - Payload: `{ "following": true, "followingId": ":id" }`
3. **Unfollow Attempt (Currently Following)**:
   - `DELETE /api/v1/users/:id/follow`
   - Returns: `200 OK`
   - Payload: `{ "following": false, "followingId": ":id" }`
4. **Unfollow Attempt (Not Currently Following)**:
   - `DELETE /api/v1/users/:id/follow`
   - Returns: `200 OK`
   - Payload: `{ "following": false, "followingId": ":id" }`
5. **Self-Follow Attempt**:
   - `POST /api/v1/users/:user.sub/follow`
   - Checked at application level and enforced by database constraint `chk_follows_no_self_follow`.
   - Returns: `400 Bad Request`
   - Payload: `{ "statusCode": 400, "error": "Bad Request", "message": "You cannot follow yourself.", "code": "CANNOT_FOLLOW_SELF" }`

---

## 4. Target Visibility Rules

### 4.1 Target Entity Validation Matrix

| Target State | Add Reaction | Add Reply / Comment | Edit Entity | Soft Delete Entity |
| :--- | :--- | :--- | :--- | :--- |
| **Post `PUBLISHED` & `deleted_at IS NULL`** | **ALLOW** | **ALLOW** | **ALLOW** (Author/Mod) | **ALLOW** (Author/Mod) |
| **Post `DRAFT` / `ARCHIVED` / `HIDDEN`** | **DENY (404)** | **DENY (404)** | **ALLOW** (Author/Mod) | **ALLOW** (Author/Mod) |
| **Post `deleted_at IS NOT NULL`** | **DENY (404)** | **DENY (404)** | **DENY (404)** | **DENY (404)** |
| **Comment `VISIBLE` & `deleted_at IS NULL`** | **ALLOW** | **ALLOW** | **ALLOW** (Author) | **ALLOW** (Author/Mod) |
| **Comment `HIDDEN` (Moderated)** | **DENY (404)** | **DENY (404)** | **DENY (403)** | **ALLOW** (Mod/Admin) |
| **Comment `deleted_at IS NOT NULL`** | **DENY (400)** | **ALLOW** (Preserve Thread) | **DENY (400)** | **DENY (400)** |

---

## 5. Existing Baseline Evidence

1. **`AUTH_SECURITY_SPEC.md` v1.2**: Requires strict ownership validation (`author_id === user.sub`) for edits, RBAC authorization (`MODERATOR`/`ADMIN`) for moderation hides/deletes, and `404 Not Found` responses for inaccessible/draft content to prevent information leakage.
2. **Phase 3.2 Implemented Rules**: `PostsService.getPostById()` and `getPostBySlug()` verify `status === 'PUBLISHED'` and `deletedAt IS NULL`.
3. **`DATABASE_SCHEMA.sql` Constraints**:
   - `chk_comments_no_self_reference`: `parent_id IS DISTINCT FROM id`
   - `chk_follows_no_self_follow`: `follower_id != following_id`
   - `uq_post_reactions_user_post`: `UNIQUE (user_id, post_id)`
   - `uq_comment_reactions_user_comment`: `UNIQUE (user_id, comment_id)`
   - `uq_follows_follower_following`: `UNIQUE (follower_id, following_id)`

---

## 6. Recommended Decisions

All 4 audit areas are resolved with concrete, deterministic, baseline-aligned recommendations:
- **Decision 1**: Reaction toggling uses single-transaction `INSERT ... ON CONFLICT DO NOTHING` fallback `DELETE` pattern.
- **Decision 2**: Comment soft-deletes mask body to `"[Comment deleted]"` and author to `null` while preserving tree hierarchy for child replies.
- **Decision 3**: Follow endpoints are 100% idempotent (`201` initial, `200` duplicate/unfollow).
- **Decision 4**: Inactive/draft/deleted posts and hidden comments reject new reactions/comments with `404 Not Found` or `400 Bad Request`.

---

## 7. Remaining Human Decisions

**NONE** (All clarification items are non-blocking and fully specified).

---

## 8. Impact on Phase 3.3 Implementation Plan

The clarification results have been incorporated into [PHASE_3.3_PRE_IMPLEMENTATION_PLAN.md](file:///d:/Web_Projects/finance_community_architecture_v1/docs/PHASE_3.3_PRE_IMPLEMENTATION_PLAN.md):
- Reaction repository design updated with `ON CONFLICT` atomic toggle.
- Comment soft-delete response serializer defined.
- Follow controller response contracts documented.
- Target visibility matrix wired into service validation flows.

---

**PHASE 3.3 CLARIFICATION STATUS**:  
**READY FOR APPROVAL**
