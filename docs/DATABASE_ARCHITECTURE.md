# Database Architecture — Finance Community Platform

**Phase**: 1 — Database Architecture & ERD  
**Baseline**: Architecture Review v2.1 (approved)  
**Database**: PostgreSQL  
**Date**: 2026-08-13

---

## Overview

20 tables organized across 8 domain areas:

| Domain | Tables |
|--------|--------|
| Identity | `users`, `profiles`, `roles`, `user_roles` |
| Content | `posts`, `categories`, `tags`, `post_tags` |
| Interaction | `comments`, `post_reactions`, `comment_reactions`, `follows` |
| Media | `media`, `post_media` |
| Governance | `reports`, `moderation_actions` |
| Communication | `notifications` |
| Audit | `audit_logs` |
| System | `system_settings`, `feature_flags` |

---

## Table Definitions

### 1. users

Represents an authenticated user account. `id` equals the Supabase Auth user UUID.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | — | PK. Equals Supabase Auth `sub` claim. Not auto-generated |
| `email` | VARCHAR(255) | NOT NULL | — | Synced from Supabase Auth. Read-only copy |
| `status` | VARCHAR(20) | NOT NULL | `'ACTIVE'` | Account status |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Account creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | NULL | — | Soft delete timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(email)`

**CHECK Constraints**:
- `status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED')`

**Soft Delete**: Yes (`deleted_at`)

**Indexes**:
- PK index (automatic)
- `email` unique index (automatic)

---

### 2. profiles

Public profile data. Strict 1:1 relationship with `users`.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | UUID | NOT NULL | — | FK → users.id |
| `username` | VARCHAR(50) | NOT NULL | — | Public handle. URL-safe |
| `display_name` | VARCHAR(100) | NULL | — | Display name |
| `avatar_media_id` | UUID | NULL | — | FK → media.id. Avatar image |
| `bio` | TEXT | NULL | — | User biography |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Profile creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |

**Primary Key**: `id`

**Foreign Keys**:
- `user_id → users.id ON DELETE CASCADE`
- `avatar_media_id → media.id ON DELETE SET NULL`

**Unique Constraints**:
- `UNIQUE(user_id)` — enforces 1:1
- `UNIQUE(username)` — globally unique handle

**Soft Delete**: No (cascades with user)

**Indexes**:
- PK index (automatic)
- `user_id` unique index (automatic)
- `username` unique index (automatic)

---

### 3. roles

RBAC role definitions. Seeded data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `name` | VARCHAR(50) | NOT NULL | — | Role identifier |
| `description` | TEXT | NULL | — | Human-readable description |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(name)`

**Seed Data**: `MEMBER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`

**Delete Policy**: No delete. Managed through code deployments.

**Indexes**:
- PK index (automatic)
- `name` unique index (automatic)

---

### 4. user_roles

Role assignments. Many-to-many between users and roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | UUID | NOT NULL | — | FK → users.id |
| `role_id` | UUID | NOT NULL | — | FK → roles.id |
| `assigned_by` | UUID | NULL | — | FK → users.id. Who assigned this role |
| `assigned_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Assignment timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `user_id → users.id ON DELETE CASCADE`
- `role_id → roles.id ON DELETE RESTRICT`
- `assigned_by → users.id ON DELETE SET NULL`

**Unique Constraints**:
- `UNIQUE(user_id, role_id)` — prevent duplicate assignments

**Delete Policy**: Hard delete (role revocation). Recorded in audit_logs.

**Indexes**:
- PK index (automatic)
- `(user_id, role_id)` unique index (automatic)
- `user_id` index — user's roles lookup (covered by unique index leading column)

---

### 5. posts

Unified content entity for Series articles and Community posts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `author_id` | UUID | NOT NULL | — | FK → users.id |
| `content_type` | VARCHAR(20) | NOT NULL | — | `'SERIES'` or `'COMMUNITY'` |
| `title` | VARCHAR(300) | NOT NULL | — | Post title |
| `slug` | VARCHAR(350) | NOT NULL | — | URL-friendly identifier |
| `body` | TEXT | NULL | — | Rich content body |
| `cover_media_id` | UUID | NULL | — | FK → media.id. Cover image |
| `category_id` | UUID | NULL | — | FK → categories.id |
| `status` | VARCHAR(20) | NOT NULL | `'DRAFT'` | Publication status |
| `meta_title` | VARCHAR(70) | NULL | — | SEO title override |
| `meta_description` | VARCHAR(160) | NULL | — | SEO description override |
| `view_count` | INTEGER | NOT NULL | `0` | Total views |
| `published_at` | TIMESTAMPTZ | NULL | — | First publication timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | NULL | — | Soft delete timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `author_id → users.id ON DELETE RESTRICT`
- `cover_media_id → media.id ON DELETE SET NULL`
- `category_id → categories.id ON DELETE SET NULL`

**Unique Constraints**:
- `UNIQUE(content_type, slug)` — slug unique per content type

**CHECK Constraints**:
- `content_type IN ('SERIES', 'COMMUNITY')`
- `status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN')`
- `view_count >= 0`

**Soft Delete**: Yes (`deleted_at`)

**Indexes**:
- PK index (automatic)
- `(content_type, slug)` unique index (automatic)
- `(content_type, status, published_at DESC)` — feed queries
- `(author_id, created_at DESC)` — user's posts
- `(category_id)` — posts by category

---

### 6. categories

Content categorization scoped by content type.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `name` | VARCHAR(100) | NOT NULL | — | Category name |
| `slug` | VARCHAR(120) | NOT NULL | — | URL-friendly identifier |
| `scope` | VARCHAR(20) | NOT NULL | — | `'SERIES'` or `'COMMUNITY'` |
| `description` | TEXT | NULL | — | Category description |
| `sort_order` | INTEGER | NOT NULL | `0` | Display ordering |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(scope, slug)` — slug unique within scope
- `UNIQUE(scope, name)` — name unique within scope

**CHECK Constraints**:
- `scope IN ('SERIES', 'COMMUNITY')`

**Delete Policy**: Restricted delete (application check — cannot delete if posts reference it)

**Indexes**:
- PK index (automatic)
- `(scope, slug)` unique index (automatic)
- `(scope, name)` unique index (automatic)

---

### 7. tags

Freeform content labels. Global namespace.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `name` | VARCHAR(100) | NOT NULL | — | Tag display name |
| `slug` | VARCHAR(120) | NOT NULL | — | URL-friendly identifier |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(name)`
- `UNIQUE(slug)`

**Delete Policy**: Restricted delete (application check — cannot delete if post_tags reference it, backed by FK RESTRICT)

**Indexes**:
- PK index (automatic)
- `name` unique index (automatic)
- `slug` unique index (automatic)

---

### 8. post_tags

Junction table: posts ↔ tags.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `post_id` | UUID | NOT NULL | — | FK → posts.id |
| `tag_id` | UUID | NOT NULL | — | FK → tags.id |

**Primary Key**: `id`

**Foreign Keys**:
- `post_id → posts.id ON DELETE CASCADE`
- `tag_id → tags.id ON DELETE RESTRICT`

**Unique Constraints**:
- `UNIQUE(post_id, tag_id)` — prevent duplicate tagging

**Delete Policy**: Hard delete. Cascades with post.

**Indexes**:
- PK index (automatic)
- `(post_id, tag_id)` unique index (automatic)
- `(tag_id)` — posts by tag lookup

---

### 9. comments

Threaded comments using adjacency-list model.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `post_id` | UUID | NOT NULL | — | FK → posts.id. The post being commented on |
| `author_id` | UUID | NOT NULL | — | FK → users.id. Comment author |
| `parent_id` | UUID | NULL | — | FK → comments.id. Reply-to (null for root comments) |
| `body` | TEXT | NOT NULL | — | Comment content |
| `status` | VARCHAR(20) | NOT NULL | `'VISIBLE'` | Moderation status |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |
| `deleted_at` | TIMESTAMPTZ | NULL | — | Soft delete timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `post_id → posts.id ON DELETE CASCADE`
- `author_id → users.id ON DELETE RESTRICT`
- `parent_id → comments.id ON DELETE SET NULL`

**CHECK Constraints**:
- `status IN ('VISIBLE', 'HIDDEN')`
- `parent_id IS DISTINCT FROM id` — prevent self-reference

**Soft Delete**: Yes (`deleted_at`). Soft-deleted comments display as "[deleted]" to preserve thread structure.

**Application Invariant**: When `parent_id` is not null, the parent comment must belong to the same post (`parent.post_id = child.post_id`). Enforced at service layer.

**Indexes**:
- PK index (automatic)
- `(post_id, created_at ASC)` — comments for a post in chronological order
- `(parent_id)` — child replies lookup
- `(author_id)` — user's comment history

---

### 10. post_reactions

Reactions on posts. Separate table for strong FK integrity.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | UUID | NOT NULL | — | FK → users.id. Who reacted |
| `post_id` | UUID | NOT NULL | — | FK → posts.id. Target post |
| `reaction_type` | VARCHAR(20) | NOT NULL | `'LIKE'` | Reaction type. MVP: LIKE only |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Reaction timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `user_id → users.id ON DELETE CASCADE`
- `post_id → posts.id ON DELETE CASCADE`

**Unique Constraints**:
- `UNIQUE(user_id, post_id)` — one reaction per user per post (MVP)

**Delete Policy**: Hard delete (un-react)

**Indexes**:
- PK index (automatic)
- `(user_id, post_id)` unique index (automatic)
- `(post_id)` — reaction count for a post
- `(user_id)` — user's reactions (covered by unique index leading column)

---

### 11. comment_reactions

Reactions on comments. Separate table for strong FK integrity.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | UUID | NOT NULL | — | FK → users.id. Who reacted |
| `comment_id` | UUID | NOT NULL | — | FK → comments.id. Target comment |
| `reaction_type` | VARCHAR(20) | NOT NULL | `'LIKE'` | Reaction type. MVP: LIKE only |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Reaction timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `user_id → users.id ON DELETE CASCADE`
- `comment_id → comments.id ON DELETE CASCADE`

**Unique Constraints**:
- `UNIQUE(user_id, comment_id)` — one reaction per user per comment (MVP)

**Delete Policy**: Hard delete (un-react)

**Indexes**:
- PK index (automatic)
- `(user_id, comment_id)` unique index (automatic)
- `(comment_id)` — reaction count for a comment
- `(user_id)` — user's reactions (covered by unique index leading column)

---

### 12. follows

User-to-user following. Explicit FK design, no polymorphism.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `follower_id` | UUID | NOT NULL | — | FK → users.id. The user who follows |
| `following_id` | UUID | NOT NULL | — | FK → users.id. The user being followed |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Follow timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `follower_id → users.id ON DELETE CASCADE`
- `following_id → users.id ON DELETE CASCADE`

**Unique Constraints**:
- `UNIQUE(follower_id, following_id)` — prevent duplicate follows

**CHECK Constraints**:
- `follower_id != following_id` — prevent self-follow

**Delete Policy**: Hard delete (unfollow)

**Indexes**:
- PK index (automatic)
- `(follower_id, following_id)` unique index (automatic)
- `(follower_id)` — "who am I following?" (covered by unique index leading column)
- `(following_id)` — "who follows me?" / follower count

---

### 13. media

Media asset metadata. Cloudinary is the storage provider.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `uploader_id` | UUID | NOT NULL | — | FK → users.id. Who uploaded |
| `cloudinary_public_id` | VARCHAR(255) | NOT NULL | — | Cloudinary asset identifier |
| `secure_url` | VARCHAR(500) | NOT NULL | — | HTTPS delivery URL |
| `resource_type` | VARCHAR(20) | NOT NULL | — | `'image'`, `'video'`, `'raw'` |
| `format` | VARCHAR(20) | NULL | — | File format (jpg, png, webp, etc.) |
| `width` | INTEGER | NULL | — | Image/video width in pixels |
| `height` | INTEGER | NULL | — | Image/video height in pixels |
| `file_size` | INTEGER | NULL | — | File size in bytes |
| `purpose` | VARCHAR(20) | NOT NULL | `'content'` | Usage category: avatar, cover, content, attachment |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Upload timestamp |
| `deleted_at` | TIMESTAMPTZ | NULL | — | Soft delete for async Cloudinary cleanup |

**Primary Key**: `id`

**Foreign Keys**:
- `uploader_id → users.id ON DELETE RESTRICT`

**Unique Constraints**:
- `UNIQUE(cloudinary_public_id)` — one record per Cloudinary asset

**Soft Delete**: Yes (`deleted_at`). Enables async Cloudinary cleanup without losing FK references.

**Indexes**:
- PK index (automatic)
- `cloudinary_public_id` unique index (automatic)
- `(uploader_id)` — user's uploaded media

---

### 14. post_media

Junction table: posts ↔ media (content images/attachments).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `post_id` | UUID | NOT NULL | — | FK → posts.id |
| `media_id` | UUID | NOT NULL | — | FK → media.id |
| `sort_order` | INTEGER | NOT NULL | `0` | Display ordering |

**Primary Key**: `id`

**Foreign Keys**:
- `post_id → posts.id ON DELETE CASCADE`
- `media_id → media.id ON DELETE RESTRICT`

**Unique Constraints**:
- `UNIQUE(post_id, media_id)` — prevent duplicate attachment

**Delete Policy**: Hard delete. Cascades with post.

**Indexes**:
- PK index (automatic)
- `(post_id, media_id)` unique index (automatic)

---

### 15. reports

User-filed reports targeting posts, comments, or users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `reporter_id` | UUID | NULL | — | FK → users.id. Who filed the report |
| `reported_post_id` | UUID | NULL | — | FK → posts.id. Reported post |
| `reported_comment_id` | UUID | NULL | — | FK → comments.id. Reported comment |
| `reported_user_id` | UUID | NULL | — | FK → users.id. Reported user |
| `reason` | VARCHAR(100) | NOT NULL | — | Report reason category |
| `description` | TEXT | NULL | — | Free-text detail |
| `status` | VARCHAR(20) | NOT NULL | `'OPEN'` | Report lifecycle status |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Report creation |
| `resolved_at` | TIMESTAMPTZ | NULL | — | Resolution timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `reporter_id → users.id ON DELETE SET NULL`
- `reported_post_id → posts.id ON DELETE RESTRICT`
- `reported_comment_id → comments.id ON DELETE RESTRICT`
- `reported_user_id → users.id ON DELETE RESTRICT`

**CHECK Constraints**:
- `num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1` — exactly one target
- `status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED')`

**Delete Policy**: Status lifecycle. Reports are never deleted.

**Indexes**:
- PK index (automatic)
- `(status, created_at DESC)` — moderation queue

---

### 16. moderation_actions

Records of moderator actions. Append-only.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `moderator_id` | UUID | NOT NULL | — | FK → users.id. Who performed the action |
| `report_id` | UUID | NULL | — | FK → reports.id. Related report (if any) |
| `action_type` | VARCHAR(30) | NOT NULL | — | Action performed |
| `target_user_id` | UUID | NULL | — | FK → users.id. Target of moderation action |
| `reason` | TEXT | NOT NULL | — | Justification |
| `metadata` | JSONB | NULL | — | Additional context |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Action timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `moderator_id → users.id ON DELETE RESTRICT`
- `report_id → reports.id ON DELETE SET NULL`
- `target_user_id → users.id ON DELETE SET NULL`

**CHECK Constraints**:
- `action_type IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS')` — valid action types

**Delete Policy**: Append-only. Never updated or deleted.

**Indexes**:
- PK index (automatic)
- `(moderator_id, created_at DESC)` — moderator's action history
- `(target_user_id)` — actions against a specific user

---

### 17. notifications

In-app notifications with contextual references.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `user_id` | UUID | NOT NULL | — | FK → users.id. Notification recipient |
| `type` | VARCHAR(30) | NOT NULL | — | Notification category |
| `title` | VARCHAR(255) | NOT NULL | — | Display title |
| `message` | TEXT | NULL | — | Display message body |
| `reference_post_id` | UUID | NULL | — | FK → posts.id. Contextual reference |
| `reference_comment_id` | UUID | NULL | — | FK → comments.id. Contextual reference |
| `reference_user_id` | UUID | NULL | — | FK → users.id. Contextual reference (actor) |
| `is_read` | BOOLEAN | NOT NULL | `FALSE` | Read state |
| `read_at` | TIMESTAMPTZ | NULL | — | When marked as read |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Creation timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `user_id → users.id ON DELETE CASCADE`
- `reference_post_id → posts.id ON DELETE SET NULL`
- `reference_comment_id → comments.id ON DELETE SET NULL`
- `reference_user_id → users.id ON DELETE SET NULL`

**Note**: Reference FKs are NOT mutually exclusive. A notification may reference multiple entities simultaneously.

**Delete Policy**: Hard delete via bulk TTL cleanup.

**Indexes**:
- PK index (automatic)
- `(user_id, is_read, created_at DESC)` — unread notifications feed

---

### 18. audit_logs

Append-only security and administrative operation log.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `actor_id` | UUID | NULL | — | FK → users.id. Who performed the action (null for system) |
| `action` | VARCHAR(100) | NOT NULL | — | Action identifier (e.g., `USER_BANNED`, `POST_HIDDEN`) |
| `entity_type` | VARCHAR(50) | NOT NULL | — | Descriptive label (e.g., `user`, `post`, `comment`) |
| `entity_id` | UUID | NULL | — | Reference to target entity. No FK — documented exception |
| `metadata` | JSONB | NULL | — | Additional context |
| `ip_address` | VARCHAR(45) | NULL | — | Client IP (supports IPv6) |
| `reason` | TEXT | NULL | — | Justification where applicable |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Log timestamp |

**Primary Key**: `id`

**Foreign Keys**:
- `actor_id → users.id ON DELETE SET NULL`

**Note**: `entity_type`/`entity_id` are descriptive references without FK enforcement. This is a documented exception — audit logs are append-only and may outlive referenced entities.

**Delete Policy**: Append-only. Must not be updated or deleted by any user, including admins.

**Indexes**:
- PK index (automatic)
- `(actor_id, created_at DESC)` — audit trail by actor
- `(entity_type, entity_id, created_at DESC)` — audit trail by target

---

### 19. system_settings

Runtime configuration key-value store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `key` | VARCHAR(100) | NOT NULL | — | Setting identifier |
| `value` | JSONB | NOT NULL | — | Setting value |
| `description` | TEXT | NULL | — | Human-readable description |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(key)`

**Delete Policy**: Update only. Settings are never deleted.

**Indexes**:
- PK index (automatic)
- `key` unique index (automatic)

---

### 20. feature_flags

Feature toggle store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `key` | VARCHAR(100) | NOT NULL | — | Flag identifier |
| `is_enabled` | BOOLEAN | NOT NULL | `FALSE` | Toggle state |
| `description` | TEXT | NULL | — | Human-readable description |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE(key)`

**Delete Policy**: Update only. Flags are toggled, never deleted.

**Indexes**:
- PK index (automatic)
- `key` unique index (automatic)

---

## Complete Index Summary

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `posts` | `(content_type, status, published_at DESC)` | B-tree | Feed queries |
| `posts` | `(author_id, created_at DESC)` | B-tree | User's posts |
| `posts` | `(category_id)` | B-tree | Posts by category |
| `comments` | `(post_id, created_at ASC)` | B-tree | Comments for a post |
| `comments` | `(parent_id)` | B-tree | Child replies |
| `comments` | `(author_id)` | B-tree | User's comments |
| `post_reactions` | `(post_id)` | B-tree | Reaction count |
| `comment_reactions` | `(comment_id)` | B-tree | Reaction count |
| `follows` | `(following_id)` | B-tree | Follower count / list |
| `post_tags` | `(tag_id)` | B-tree | Posts by tag |
| `notifications` | `(user_id, is_read, created_at DESC)` | B-tree | Unread notifications |
| `reports` | `(status, created_at DESC)` | B-tree | Moderation queue |
| `audit_logs` | `(actor_id, created_at DESC)` | B-tree | Audit by actor |
| `audit_logs` | `(entity_type, entity_id, created_at DESC)` | B-tree | Audit by target |
| `media` | `(uploader_id)` | B-tree | User's uploads |
| `moderation_actions` | `(moderator_id, created_at DESC)` | B-tree | Moderator history |
| `moderation_actions` | `(target_user_id)` | B-tree | Actions against user |

Note: PK indexes and unique constraint indexes are automatically created by PostgreSQL and are not listed here.
