# Phase 3 — Domain Features Implementation Plan

**Version**: 1.0  
**Date**: 2026-08-13  
**Status**: DRAFT / AWAITING HUMAN REVIEW  
**Target Application**: Finance Community Platform — NestJS Backend (`apps/api`)  
**Baselines**:
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.sql` (Phase 1 Approved, 20 Tables)
- `docs/DATABASE_ERD.md`
- `docs/DATABASE_PHASE1_FINAL_REVIEW.md`
- `docs/AUTH_SECURITY_SPEC.md` v1.2
- `docs/SECURITY_FOUNDATION_REVIEW.md`
- `docs/DATABASE_ACCESS_LAYER_DECISION.md` (Phase 2.2 Approved)

---

## EXECUTIVE SUMMARY

Phase 3 transitions the platform from core foundation (Authentication, Authorization, System Settings, Database Access Layer) to complete business domain features. All 12 domain modules operate strictly on top of the approved 20-table PostgreSQL database schema via Drizzle ORM and NestJS repositories.

---

## 1. GLOBAL ARCHITECTURE CONVENTIONS

### A. API Versioning Strategy
- Global prefix: `/api/v1`
- RESTful resource Naming: Plural nouns (e.g., `/api/v1/posts`, `/api/v1/comments`).
- Headers: `Accept: application/json`, `Content-Type: application/json`.

### B. Ownership Enforcement Strategy
- **Resource Ownership Rule**: Standard users may only modify (`PATCH`, `PUT`) or delete (`DELETE`) resources where `resource.author_id === currentUser.app_user_id` or `resource.user_id === currentUser.app_user_id`.
- **Administrative Override**: Users with `MODERATOR`, `ADMIN`, or `SUPER_ADMIN` roles bypass ownership checks through explicit RBAC guards (`PermissionGuard`).
- **Implementation**: Custom `@UseGuards(ResourceOwnerGuard)` passing metadata specifying target table and author column.

### C. Pagination, Filtering, and Sorting Conventions
- **Standard Query DTO**:
  - `page`: Integer >= 1 (Default: 1)
  - `limit`: Integer 1..100 (Default: 20)
  - `sortBy`: String field name (Default: `created_at`)
  - `order`: `'ASC'` | `'DESC'` (Default: `'DESC'`)
- **Standard Response Contract**:
  ```json
  {
    "data": [...],
    "meta": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

### D. Error Response Conventions
All standard NestJS exceptions map through `DatabaseExceptionFilter` and global `HttpExceptionFilter`:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [...],
  "timestamp": "2026-08-13T22:00:00.000Z",
  "path": "/api/v1/posts"
}
```

### E. Audit Event Conventions
- Security and admin operations log synchronously/asynchronously to `audit_logs` via `AuditLogService`.
- Actions follow standard verbs: `POST_CREATE`, `POST_DELETE`, `COMMENT_HIDE`, `USER_SUSPEND`, `ROLE_ASSIGN`.

### F. Soft-Delete Requirements
- Soft-delete tables (4 tables): `users`, `posts`, `comments`, `media`.
- Queries defaults: `.where(isNull(table.deletedAt))` unless admin flag `includeDeleted=true` is requested by an authorized caller.

---

## 2. DOMAIN DEPENDENCY GRAPH & IMPLEMENTATION SEQUENCE

### A. Domain Dependency Graph

```
                   ┌──────────────┐
                   │ Media Module │
                   └──────┬───────┘
                          │ (avatar_media_id, cover_media_id)
                          ▼
┌──────────────┐   ┌──────────────┐   ┌────────────────┐
│ Users Module │──►│Profiles Mod. │   │Categories/Tags │
└──────┬───────┘   └──────────────┘   └───────┬────────┘
       │                                      │
       ├──────────────────────────────────────┤
       │                                      │
       ▼                                      ▼
┌──────────────┐                      ┌────────────────┐
│Follows Module│                      │  Posts Module  │
└──────────────┘                      └───────┬────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
             ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
             │Comments Mod. │         │Reactions Mod.│         │ Series Mod.  │
             └──────┬───────┘         └──────────────┘         └──────────────┘
                    │
                    ▼
             ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
             │ Moderation   │────────►│Notifications │────────►│ Admin Module │
             └──────────────┘         └──────────────┘         └──────────────┘
```

### B. Recommended Implementation Sequence

1. **Sub-Phase 3.1 — Core Entities**:
   - Media Module (Asset metadata & Cloudinary contract)
   - Users & Profiles Module (Public profile updates, avatars)
   - Categories & Tags Module (Taxonomy management)
2. **Sub-Phase 3.2 — Core Content Engine**:
   - Posts Module (Series articles & Community posts)
   - Series Module (Curated article grouping)
   - Post Media Junction (Multi-media content attachments)
3. **Sub-Phase 3.3 — Social & Engagement Engine**:
   - Comments Module (Threaded adjacency-list discussions)
   - Reactions Module (Post & Comment likes/reactions)
   - Follows Module (User-to-user social graph)
4. **Sub-Phase 3.4 — Platform Operations & Governance**:
   - Notifications Module (In-app notifications)
   - Moderation Module (Reports & Moderator action log)
   - Admin Module (System settings, user status management, RBAC)

---

## 3. DETAILED MODULE SPECIFICATIONS

---

### MODULE 1: Users & Profiles Module

- **Purpose**: Manage user identity lifecycle, user statuses, public profile customization, and avatar associations.
- **Responsibilities**: Profile retrieval, profile updates, username validation, avatar assignment.
- **Database Tables Used**: `users`, `profiles`, `user_roles`, `roles`, `media`.
- **Repository Requirements**:
  - `UsersRepository`: `findById`, `findByEmail`, `updateStatus`, `softDelete`.
  - `ProfilesRepository`: `findByUserId`, `findByUsername`, `updateProfileTx`, `isUsernameTakenTx`.
- **Service Responsibilities**: Profile CRUD, username update validation with collision resolution, user status state transitions (`ACTIVE` <-> `SUSPENDED` / `BANNED`).
- **Controller/API Responsibilities**:
  - `GET /api/v1/users/me` — Current user profile & roles.
  - `GET /api/v1/profiles/:username` — Public profile details.
  - `PATCH /api/v1/users/me/profile` — Update bio, display name, avatar.
- **DTOs**: `UpdateProfileDto` (`displayName?: string`, `bio?: string`, `avatarMediaId?: string`).
- **Validation Rules**: `displayName` max 100 chars, `bio` max 1000 chars, `avatarMediaId` must be valid UUID.
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`.
- **Required Permissions**: Authenticated self or `ADMIN`.
- **Ownership Rules**: Users can only update their own profile.
- **Email-Verification Requirements**: Email update requires re-verification.
- **Audit Logging Requirements**: Log `PROFILE_UPDATE`, `USER_STATUS_CHANGE`.
- **Soft-Delete Requirements**: Soft-delete user marks `deleted_at = NOW()`.
- **Transaction Requirements**: Profile + Avatar update wrapped in `tx`.
- **Concurrency Requirements**: Username update uses `isUsernameTakenTx` + `uq_profiles_username` SAVEPOINT protection.
- **Pagination Requirements**: N/A for single profile; User list paginated (admin).
- **Error Handling**: `409 Conflict` on taken username; `404 Not Found` on missing user.
- **Security Considerations**: Strip `email` and internal fields from public profile endpoint.
- **Dependencies**: Media Module (for avatar validation).
- **Implementation Order**: 2
- **Test Requirements**: Unit test profile update; E2E public profile lookup.
- **Acceptance Criteria**: Profile updates reflect atomically; invalid avatar UUIDs rejected.

---

### MODULE 2: Categories Module

- **Purpose**: Content classification taxonomy for Series articles and Community posts.
- **Responsibilities**: Category creation, updates, scoped listing (`SERIES` vs `COMMUNITY`).
- **Database Tables Used**: `categories`.
- **Repository Requirements**:
  - `CategoriesRepository`: `create`, `update`, `findByScopeAndSlug`, `findAllByScope`.
- **Service Responsibilities**: Unique slug generation per scope (`scope, slug`), scope validation (`SERIES`, `COMMUNITY`).
- **Controller/API Responsibilities**:
  - `GET /api/v1/categories?scope=COMMUNITY` — Public categories.
  - `POST /api/v1/categories` — Admin category creation.
  - `PATCH /api/v1/categories/:id` — Admin category edit.
- **DTOs**: `CreateCategoryDto` (`name`, `slug`, `scope`, `description?`, `sortOrder?`).
- **Validation Rules**: `name` max 100, `slug` max 120 (kebab-case), `scope` IN ('SERIES', 'COMMUNITY').
- **Authorization Requirements**: Public read; Write requires `ADMIN` or `SUPER_ADMIN`.
- **Required Permissions**: `category:create`, `category:manage`.
- **Ownership Rules**: System resource (Admin managed).
- **Email-Verification Requirements**: N/A.
- **Audit Logging Requirements**: Log `CATEGORY_CREATE`, `CATEGORY_UPDATE`.
- **Soft-Delete Requirements**: Hard delete or disable (No soft-delete in SQL schema).
- **Transaction Requirements**: Single statement updates.
- **Concurrency Requirements**: `uq_categories_scope_slug` enforces uniqueness.
- **Pagination Requirements**: List returned sorted by `sort_order ASC`.
- **Error Handling**: `409 Conflict` on scope + slug collision.
- **Security Considerations**: Sanitize HTML in category descriptions.
- **Dependencies**: None.
- **Implementation Order**: 3
- **Test Requirements**: Unit test scope slug validation; E2E admin category creation.
- **Acceptance Criteria**: Duplicate slugs within same scope rejected.

---

### MODULE 3: Tags Module

- **Purpose**: Global freeform taxonomy tagging for content discovery.
- **Responsibilities**: Tag creation, search/autocomplete, tag normalization.
- **Database Tables Used**: `tags`, `post_tags`.
- **Repository Requirements**:
  - `TagsRepository`: `findOrCreateByName`, `searchTags`, `findPopularTags`.
- **Service Responsibilities**: Slugification, case-insensitive tag deduplication.
- **Controller/API Responsibilities**:
  - `GET /api/v1/tags?search=finance` — Autocomplete tags.
  - `GET /api/v1/tags/popular` — Top tags by post count.
- **DTOs**: `CreateTagDto` (`name`).
- **Validation Rules**: `name` max 100 chars, alphanumeric + hyphens.
- **Authorization Requirements**: Public read; Tag attachment requires authenticated user (`JwtAuthGuard`).
- **Required Permissions**: None for reading/attaching.
- **Ownership Rules**: Global namespace.
- **Email-Verification Requirements**: N/A.
- **Audit Logging Requirements**: None for standard tag creation.
- **Soft-Delete Requirements**: N/A.
- **Transaction Requirements**: Bulk tag resolution uses single transaction.
- **Concurrency Requirements**: `ON CONFLICT (slug) DO NOTHING` during post tagging.
- **Pagination Requirements**: Standard pagination for tag searches.
- **Error Handling**: Return empty array for non-matching search queries.
- **Security Considerations**: Strip illegal characters from tag names.
- **Dependencies**: None.
- **Implementation Order**: 4
- **Test Requirements**: Unit test slug generation; E2E tag autocomplete.
- **Acceptance Criteria**: Autocomplete returns case-insensitive matches in < 50ms.

---

### MODULE 4: Media Module

- **Purpose**: Metadata registry and Cloudinary upload contract for images and attachments.
- **Responsibilities**: Asset metadata registration, uploader association, asset status tracking.
- **Database Tables Used**: `media`, `users`.
- **Repository Requirements**:
  - `MediaRepository`: `create`, `findById`, `findByCloudinaryId`, `softDelete`.
- **Service Responsibilities**: Cloudinary signature generation, asset metadata persistence, orphaned media cleanup.
- **Controller/API Responsibilities**:
  - `POST /api/v1/media/upload-signature` — Request Cloudinary signed params.
  - `POST /api/v1/media` — Register uploaded media metadata.
  - `GET /api/v1/media/:id` — Get media metadata.
- **DTOs**: `RegisterMediaDto` (`cloudinaryPublicId`, `secureUrl`, `resourceType`, `format`, `width`, `height`, `fileSize`, `purpose`).
- **Validation Rules**: `secureUrl` valid HTTPS URL, `purpose` IN ('avatar', 'cover', 'content').
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard, EmailVerificationGuard)`.
- **Required Permissions**: Authenticated uploader.
- **Ownership Rules**: `uploader_id === currentUser.app_user_id`.
- **Email-Verification Requirements**: Required to request upload signatures.
- **Audit Logging Requirements**: Log `MEDIA_UPLOAD`, `MEDIA_DELETE`.
- **Soft-Delete Requirements**: `deleted_at = NOW()`.
- **Transaction Requirements**: Single table inserts.
- **Concurrency Requirements**: `uq_media_cloudinary_public_id` enforces unique asset registration.
- **Pagination Requirements**: User upload list paginated.
- **Error Handling**: `400 Bad Request` for invalid Cloudinary payload.
- **Security Considerations**: Never store API secrets on client; validate Cloudinary webhooks if added.
- **Dependencies**: Auth & Users Module.
- **Implementation Order**: 1
- **Test Requirements**: Unit test signature generation; E2E media metadata registration.
- **Acceptance Criteria**: Only signed HTTPS URLs registered; unverified users blocked.

---

### MODULE 5: Posts / Content Module

- **Purpose**: Core content engine powering Series articles and Community discussions.
- **Responsibilities**: Post CRUD, publishing workflow, feed queries, tag/media associations, view count increments.
- **Database Tables Used**: `posts`, `post_tags`, `post_media`, `users`, `categories`, `media`, `tags`.
- **Repository Requirements**:
  - `PostsRepository`: `createTx`, `updateTx`, `findById`, `findBySlug`, `findFeedPaginated`, `softDelete`.
  - `PostTagsRepository`: `syncTagsTx`.
  - `PostMediaRepository`: `syncMediaTx`.
- **Service Responsibilities**: Unique slug generation (`content_type, slug`), content HTML sanitization (`SanitizerUtil`), status transitions (`DRAFT` -> `PUBLISHED` -> `ARCHIVED` / `HIDDEN`), view counting.
- **Controller/API Responsibilities**:
  - `GET /api/v1/posts` — Public feed (filtering by `contentType`, `category`, `tag`).
  - `GET /api/v1/posts/:contentType/:slug` — Single post details.
  - `POST /api/v1/posts` — Create draft/published post.
  - `PATCH /api/v1/posts/:id` — Update post.
  - `DELETE /api/v1/posts/:id` — Soft-delete post.
- **DTOs**: `CreatePostDto` (`title`, `contentType`, `body?`, `categoryId?`, `coverMediaId?`, `tags?`, `mediaIds?`, `status`, `metaTitle?`, `metaDescription?`).
- **Validation Rules**: `title` max 300, `contentType` IN ('SERIES', 'COMMUNITY'), `status` IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN').
- **Authorization Requirements**: Read public/published; Create/Edit requires `JwtAuthGuard` + `EmailVerificationGuard`.
- **Required Permissions**: Self ownership or `MODERATOR`/`ADMIN` for `status = HIDDEN`.
- **Ownership Rules**: `author_id === currentUser.app_user_id`.
- **Email-Verification Requirements**: Required to publish content.
- **Audit Logging Requirements**: Log `POST_CREATE`, `POST_UPDATE`, `POST_DELETE`, `POST_HIDE`.
- **Soft-Delete Requirements**: `deleted_at = NOW()`.
- **Transaction Requirements**: Post creation + `post_tags` insertion + `post_media` insertion executed inside single `tx`.
- **Concurrency Requirements**: `uq_posts_content_type_slug` guarantees slug uniqueness per content type.
- **Pagination Requirements**: Cursor-based or offset-based feed pagination (`limit`, `page`, `sortBy=published_at`).
- **Error Handling**: `404 Not Found` for missing/draft posts by non-author; `403 Forbidden` on ownership violation.
- **Security Considerations**: Pass `body` through `SanitizerUtil` before DB write to strip `<script>` and malicious HTML.
- **Dependencies**: Users, Categories, Tags, Media Modules.
- **Implementation Order**: 5
- **Test Requirements**: Unit test slug creation & HTML sanitization; E2E post creation transaction test.
- **Acceptance Criteria**: Post + Tags + Media created atomically; XSS injection sanitized.

---

### MODULE 6: Series Module

- **Purpose**: Curated grouping of Series articles into sequential learning paths.
- **Responsibilities**: Grouping posts by `category_id` (where `scope = 'SERIES'`), ordering chapters, computing series progress.
- **Database Tables Used**: `posts`, `categories`.
- **Repository Requirements**:
  - `SeriesRepository`: `findSeriesBySlug`, `findSeriesPostsPaginated`.
- **Service Responsibilities**: Series table-of-contents aggregation.
- **Controller/API Responsibilities**:
  - `GET /api/v1/series` — List published Series categories.
  - `GET /api/v1/series/:slug` — Get Series metadata and ordered articles.
- **DTOs**: `QuerySeriesDto` (`page`, `limit`).
- **Validation Rules**: `scope = 'SERIES'`.
- **Authorization Requirements**: Public read.
- **Required Permissions**: N/A.
- **Ownership Rules**: N/A.
- **Email-Verification Requirements**: N/A.
- **Audit Logging Requirements**: N/A.
- **Soft-Delete Requirements**: Excludes soft-deleted posts (`deleted_at IS NULL`).
- **Transaction Requirements**: Read-only queries.
- **Concurrency Requirements**: Standard read pool scaling.
- **Pagination Requirements**: Articles within series paginated by `sort_order ASC, published_at ASC`.
- **Error Handling**: `404 Not Found` if series category does not exist.
- **Security Considerations**: Read-only cache optimization.
- **Dependencies**: Categories, Posts Modules.
- **Implementation Order**: 6
- **Test Requirements**: E2E Series TOC retrieval.
- **Acceptance Criteria**: Articles returned in strict publication/sequence order.

---

### MODULE 7: Comments Module

- **Purpose**: Threaded discussion engine on posts using an adjacency-list hierarchy (`parent_id`).
- **Responsibilities**: Comment creation, nested thread retrieval, status toggling (`VISIBLE` / `HIDDEN`), soft deletion.
- **Database Tables Used**: `comments`, `posts`, `users`.
- **Repository Requirements**:
  - `CommentsRepository`: `createTx`, `findById`, `findThreadByPostId`, `softDelete`.
- **Service Responsibilities**: Self-reference validation (`parent_id !== id`), post existence check, HTML sanitization of comment body.
- **Controller/API Responsibilities**:
  - `GET /api/v1/posts/:postId/comments` — Fetch comment tree.
  - `POST /api/v1/posts/:postId/comments` — Add comment / reply.
  - `PATCH /api/v1/comments/:id` — Edit comment.
  - `DELETE /api/v1/comments/:id` — Soft-delete comment.
- **DTOs**: `CreateCommentDto` (`body`, `parentId?`).
- **Validation Rules**: `body` NOT empty, max 2000 chars, `parentId` valid UUID if provided.
- **Authorization Requirements**: Read public; Create/Edit/Delete requires `JwtAuthGuard` + `AccountStatusGuard`.
- **Required Permissions**: Self ownership or `MODERATOR`/`ADMIN`.
- **Ownership Rules**: `author_id === currentUser.app_user_id`.
- **Email-Verification Requirements**: Required to post comments.
- **Audit Logging Requirements**: Log `COMMENT_CREATE`, `COMMENT_DELETE`, `COMMENT_HIDE`.
- **Soft-Delete Requirements**: `deleted_at = NOW()`. Soft-deleted comments display `[Comment deleted]`.
- **Transaction Requirements**: Single transaction for comment insertion and parent validation.
- **Concurrency Requirements**: FK `fk_comments_parent` ensures parent integrity.
- **Pagination Requirements**: Top-level comments paginated; replies fetched on demand.
- **Error Handling**: `400 Bad Request` if `parent_id` belongs to a different post or self-references.
- **Security Considerations**: Strict body sanitization via `SanitizerUtil`.
- **Dependencies**: Posts, Users Modules.
- **Implementation Order**: 7
- **Test Requirements**: Unit test self-reference check; E2E threaded comment creation.
- **Acceptance Criteria**: Nested replies validate parent post alignment; soft-delete preserves thread hierarchy.

---

### MODULE 8: Reactions Module

- **Purpose**: Engagement mechanism for liking/reacting to posts and comments.
- **Responsibilities**: Toggle reactions, aggregate reaction counts.
- **Database Tables Used**: `post_reactions`, `comment_reactions`, `posts`, `comments`.
- **Repository Requirements**:
  - `PostReactionsRepository`: `toggleReactionTx`, `getReactionCounts`.
  - `CommentReactionsRepository`: `toggleReactionTx`, `getReactionCounts`.
- **Service Responsibilities**: Atomic toggle logic (Insert if absent, Delete if present).
- **Controller/API Responsibilities**:
  - `POST /api/v1/posts/:id/reactions` — Toggle post reaction.
  - `POST /api/v1/comments/:id/reactions` — Toggle comment reaction.
- **DTOs**: `ToggleReactionDto` (`reactionType?`).
- **Validation Rules**: `reactionType` default `'LIKE'`.
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`.
- **Required Permissions**: Authenticated user.
- **Ownership Rules**: User manages their own reaction.
- **Email-Verification Requirements**: Required to react.
- **Audit Logging Requirements**: None (High volume).
- **Soft-Delete Requirements**: Hard delete on un-like (No soft-delete in SQL schema).
- **Transaction Requirements**: Atomic toggle within `tx`.
- **Concurrency Requirements**: `uq_post_reactions_user_post` and `uq_comment_reactions_user_comment` UNIQUE constraints guarantee single reaction per user per target.
- **Pagination Requirements**: N/A.
- **Error Handling**: `404 Not Found` if target post/comment does not exist.
- **Security Considerations**: Anti-spam rate limiting via NestJS Throttler.
- **Dependencies**: Posts, Comments, Users Modules.
- **Implementation Order**: 8
- **Test Requirements**: Unit test toggle idempotency; E2E concurrent reaction toggling.
- **Acceptance Criteria**: Concurrent duplicate reaction requests toggle cleanly without 500 errors.

---

### MODULE 9: Follows Module

- **Purpose**: User-to-user social networking graph.
- **Responsibilities**: Follow/unfollow users, list followers and followings, check follow status.
- **Database Tables Used**: `follows`, `users`.
- **Repository Requirements**:
  - `FollowsRepository`: `followTx`, `unfollowTx`, `findFollowers`, `findFollowing`, `isFollowing`.
- **Service Responsibilities**: Self-follow prevention (`follower_id !== following_id`).
- **Controller/API Responsibilities**:
  - `POST /api/v1/users/:id/follow` — Follow user.
  - `DELETE /api/v1/users/:id/follow` — Unfollow user.
  - `GET /api/v1/users/:id/followers` — List followers.
  - `GET /api/v1/users/:id/following` — List following.
- **DTOs**: `QueryFollowsDto` (`page`, `limit`).
- **Validation Rules**: Target `following_id` must be valid active user UUID.
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard, AccountStatusGuard)`.
- **Required Permissions**: Authenticated user.
- **Ownership Rules**: `follower_id === currentUser.app_user_id`.
- **Email-Verification Requirements**: Required to follow.
- **Audit Logging Requirements**: Log `USER_FOLLOW`, `USER_UNFOLLOW`.
- **Soft-Delete Requirements**: Hard delete on unfollow (`uq_follows_follower_following`).
- **Transaction Requirements**: Single transaction execution.
- **Concurrency Requirements**: `chk_follows_no_self_follow` CHECK constraint + `uq_follows_follower_following` UNIQUE constraint.
- **Pagination Requirements**: Followers/Following list paginated.
- **Error Handling**: `400 Bad Request` on self-follow attempt; `404 Not Found` on missing target user.
- **Security Considerations**: Prevent follow graph scraping via throttler.
- **Dependencies**: Users Module.
- **Implementation Order**: 9
- **Test Requirements**: Unit test self-follow prevention; E2E follow/unfollow lifecycle.
- **Acceptance Criteria**: Self-follow blocked at DTO/service layer; duplicate follow returns 200/201 idempotently.

---

### MODULE 10: Notifications Module

- **Purpose**: In-app notification engine informing users of social events (comments, reactions, follows).
- **Responsibilities**: Create notification records, list unread notifications, mark notifications as read.
- **Database Tables Used**: `notifications`, `users`, `posts`, `comments`.
- **Repository Requirements**:
  - `NotificationsRepository`: `createTx`, `findUserNotifications`, `markAsRead`, `markAllAsRead`.
- **Service Responsibilities**: Event-driven notification dispatching (via NestJS `EventEmitter2` or service calls).
- **Controller/API Responsibilities**:
  - `GET /api/v1/notifications` — Fetch current user notifications.
  - `PATCH /api/v1/notifications/:id/read` — Mark single notification read.
  - `POST /api/v1/notifications/read-all` — Mark all notifications read.
- **DTOs**: `QueryNotificationsDto` (`isRead?`, `page`, `limit`).
- **Validation Rules**: `type` IN ('COMMENT', 'REACTION', 'FOLLOW', 'SYSTEM').
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard)`.
- **Required Permissions**: Recipient user only.
- **Ownership Rules**: `user_id === currentUser.app_user_id`.
- **Email-Verification Requirements**: N/A for receiving.
- **Audit Logging Requirements**: None.
- **Soft-Delete Requirements**: N/A.
- **Transaction Requirements**: Dispatched inside existing operation transaction or asynchronously.
- **Concurrency Requirements**: Read status updates use `updated_at = NOW()`.
- **Pagination Requirements**: Paginated feed sorted by `created_at DESC`.
- **Error Handling**: `404 Not Found` if notification does not exist or belongs to another user.
- **Security Considerations**: Users cannot view or modify other users' notifications.
- **Dependencies**: Users, Posts, Comments Modules.
- **Implementation Order**: 10
- **Test Requirements**: Unit test notification trigger on comment creation; E2E mark as read.
- **Acceptance Criteria**: Commenting on a post triggers a notification to post author asynchronously.

---

### MODULE 11: Moderation / Reports Module

- **Purpose**: Platform governance engine for user reporting and moderator content review.
- **Responsibilities**: File reports on posts/comments/users, list report queue, record moderation actions (`WARN`, `HIDE_CONTENT`, `SUSPEND`, `BAN`, `DISMISS`).
- **Database Tables Used**: `reports`, `moderation_actions`, `users`, `posts`, `comments`.
- **Repository Requirements**:
  - `ReportsRepository`: `createTx`, `findQueuePaginated`, `updateStatusTx`.
  - `ModerationActionsRepository`: `createActionTx`, `findHistoryByTarget`.
- **Service Responsibilities**: Enforce single-target constraint (`chk_reports_exactly_one_target`), execute status transitions on target entities.
- **Controller/API Responsibilities**:
  - `POST /api/v1/reports` — File report (Public authenticated users).
  - `GET /api/v1/moderation/reports` — View report queue (`MODERATOR` / `ADMIN`).
  - `POST /api/v1/moderation/actions` — Execute moderation action (`MODERATOR` / `ADMIN`).
- **DTOs**:
  - `CreateReportDto` (`reportedPostId?`, `reportedCommentId?`, `reportedUserId?`, `reason`, `description?`).
  - `ExecuteModerationActionDto` (`reportId?`, `actionType`, `targetUserId?`, `reason`, `metadata?`).
- **Validation Rules**: Exactly one target FK must be non-null (`num_nonnulls = 1`), `actionType` IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS').
- **Authorization Requirements**: Report creation requires `JwtAuthGuard`; Moderation actions require `Roles('MODERATOR', 'ADMIN')`.
- **Required Permissions**: `moderation:review`, `moderation:execute`.
- **Ownership Rules**: Reporter files report; Moderators review queue.
- **Email-Verification Requirements**: Required to file reports.
- **Audit Logging Requirements**: Mandatory `AUDIT_LOG` entry for every moderation action.
- **Soft-Delete Requirements**: Targets use `ON DELETE RESTRICT` (soft-deleted targets remain in DB).
- **Transaction Requirements**: Moderation Action + Target Status Update + Report Resolution executed inside single `tx`.
- **Concurrency Requirements**: Transaction isolation for target user status changes.
- **Pagination Requirements**: Report queue paginated by `status`, `created_at DESC`.
- **Error Handling**: `400 Bad Request` if multiple or zero target IDs provided in report.
- **Security Considerations**: Hide reporter identity from standard users; restrict action authorization.
- **Dependencies**: Users, Posts, Comments, Audit Modules.
- **Implementation Order**: 11
- **Test Requirements**: Unit test single-target validation; E2E report creation and moderation action execution.
- **Acceptance Criteria**: Moderate action `HIDE_CONTENT` hides target post and updates report to `RESOLVED` in 1 transaction.

---

### MODULE 12: Admin Module

- **Purpose**: System administration, role management, feature flags, and system settings.
- **Responsibilities**: Assign/revoke user roles, toggle feature flags, update system settings, view global audit logs.
- **Database Tables Used**: `users`, `user_roles`, `roles`, `system_settings`, `feature_flags`, `audit_logs`.
- **Repository Requirements**:
  - `SystemSettingsRepository`: `get`, `set`, `findAll`.
  - `FeatureFlagsRepository`: `isEnabled`, `toggle`, `findAll`.
  - `UserRolesRepository`: `assignRoleTx`, `revokeRoleTx`.
- **Service Responsibilities**: Role hierarchy enforcement (e.g., standard `ADMIN` cannot modify `SUPER_ADMIN`).
- **Controller/API Responsibilities**:
  - `GET /api/v1/admin/users` — Admin user management.
  - `POST /api/v1/admin/roles/assign` — Assign user role (`ADMIN` / `SUPER_ADMIN`).
  - `GET /api/v1/admin/audit-logs` — Query global audit log.
  - `PATCH /api/v1/admin/feature-flags/:key` — Toggle feature flag.
  - `PATCH /api/v1/admin/settings/:key` — Update system setting.
- **DTOs**: `AssignRoleDto` (`userId`, `roleId`), `ToggleFeatureFlagDto` (`isEnabled`).
- **Validation Rules**: Valid role UUID, key alphanumeric + underscore.
- **Authorization Requirements**: `@UseGuards(JwtAuthGuard, RolesGuard)` requiring `ADMIN` or `SUPER_ADMIN`.
- **Required Permissions**: `admin:full`.
- **Ownership Rules**: Administrative restriction.
- **Email-Verification Requirements**: Mandatory.
- **Audit Logging Requirements**: Log all admin actions to `audit_logs`.
- **Soft-Delete Requirements**: System settings and feature flags are updated, never deleted.
- **Transaction Requirements**: Role assignment / revocation executed in single `tx`.
- **Concurrency Requirements**: `uq_system_settings_key` and `uq_feature_flags_key` UNIQUE constraints.
- **Pagination Requirements**: Audit logs and user lists paginated.
- **Error Handling**: `403 Forbidden` if attempting to modify superior role.
- **Security Considerations**: Restrict admin routes behind IP whitelist or strict MFA if configured.
- **Dependencies**: All Modules.
- **Implementation Order**: 12
- **Test Requirements**: Unit test role hierarchy protection; E2E feature flag toggle.
- **Acceptance Criteria**: Non-admin users receiving 403 on all `/api/v1/admin/*` endpoints.

---

## 4. CROSS-MODULE CONTRACTS & TRANSACTION BOUNDARIES

### Cross-Module Call Rules
1. **Direct Repository Access**: Repositories belong strictly to their parent module. Module A MUST NOT import Repository B directly.
2. **Service Delegation**: Module A MUST inject Service B to perform domain operations across boundaries.
3. **Transaction Context Passing**: When Service A calls Service B inside an active transaction, Service A MUST pass `tx` to Service B's transaction-aware API (e.g., `serviceB.performOperationTx(tx, ...)`).

---

## 5. PHASE 3 STOP CONDITIONS & REVIEW GATES

To ensure complete stability and strict adherence to architectural standards, Phase 3 will execute under 4 mandatory Human Review Gates:

1. **Gate 3.1 (Core & Media Review Gate)**:
   - Evaluates Media, Users/Profiles, and Categories/Tags modules.
   - Stop condition: `npm run build`, `npm test`, `npm run test:e2e` pass with 0 errors.

2. **Gate 3.2 (Content & Series Review Gate)**:
   - Evaluates Posts, Series, and Post-Media/Tag junction modules.
   - Stop condition: HTML sanitization, transaction boundaries, and slug concurrency verified.

3. **Gate 3.3 (Social & Engagement Review Gate)**:
   - Evaluates Comments, Reactions, and Follows modules.
   - Stop condition: Adjacency-list hierarchy, reaction toggle idempotency, and self-follow checks verified.

4. **Gate 3.4 (Governance & Final Integration Gate)**:
   - Evaluates Notifications, Moderation, Admin modules, and full platform E2E integration.
   - Stop condition: Final security audit, permission matrix check, 100% build & test pass.

---

## 6. ARCHITECTURAL DECISIONS STATUS

- [x] Database Schema: Approved (Phase 1 `DATABASE_SCHEMA.sql`, 20 Tables)
- [x] Database Access Layer: Approved (Phase 2.2 Drizzle ORM + `pg.Pool` + SAVEPOINT isolation)
- [x] Auth & Security Foundation: Approved (Phase 2.1 JWKS JWT + RBAC Guards)
- [ ] Phase 3 Domain Implementation: Awaiting Human Review

---

PHASE 3 IMPLEMENTATION STATUS:  
DRAFT / AWAITING HUMAN REVIEW
