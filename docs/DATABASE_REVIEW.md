# Database Self-Review — Finance Community Platform

**Phase**: 1 — Database Architecture & ERD  
**Baseline**: Architecture Review v2.1 (approved)  
**Date**: 2026-08-13

---

## Purpose

This document is a systematic self-review of the database schema against Architecture Review v2.1. It verifies that every approved decision is correctly implemented and identifies any issues.

---

## 1. FK Consistency

Verified every FK in DATABASE_SCHEMA.sql against Architecture Review v2.1 §8 (Updated Database Integrity Rules).

| FK | v2.1 Spec | Schema | ✅/❌ |
|----|-----------|--------|------|
| profiles.user_id → users.id | CASCADE | CASCADE | ✅ |
| profiles.avatar_media_id → media.id | SET NULL | SET NULL | ✅ |
| user_roles.user_id → users.id | CASCADE | CASCADE | ✅ |
| user_roles.role_id → roles.id | RESTRICT | RESTRICT | ✅ |
| user_roles.assigned_by → users.id | SET NULL | SET NULL | ✅ |
| posts.author_id → users.id | RESTRICT | RESTRICT | ✅ |
| posts.cover_media_id → media.id | SET NULL | SET NULL | ✅ |
| posts.category_id → categories.id | SET NULL | SET NULL | ✅ |
| post_tags.post_id → posts.id | CASCADE | CASCADE | ✅ |
| post_tags.tag_id → tags.id | RESTRICT | RESTRICT | ✅ |
| comments.post_id → posts.id | CASCADE | CASCADE | ✅ |
| comments.author_id → users.id | RESTRICT | RESTRICT | ✅ |
| comments.parent_id → comments.id | SET NULL | SET NULL | ✅ |
| post_reactions.user_id → users.id | CASCADE | CASCADE | ✅ |
| post_reactions.post_id → posts.id | CASCADE | CASCADE | ✅ |
| comment_reactions.user_id → users.id | CASCADE | CASCADE | ✅ |
| comment_reactions.comment_id → comments.id | CASCADE | CASCADE | ✅ |
| follows.follower_id → users.id | CASCADE | CASCADE | ✅ |
| follows.following_id → users.id | CASCADE | CASCADE | ✅ |
| media.uploader_id → users.id | RESTRICT | RESTRICT | ✅ |
| post_media.post_id → posts.id | CASCADE | CASCADE | ✅ |
| post_media.media_id → media.id | RESTRICT | RESTRICT | ✅ |
| reports.reporter_id → users.id | SET NULL | SET NULL | ✅ |
| reports.reported_post_id → posts.id | RESTRICT | RESTRICT | ✅ |
| reports.reported_comment_id → comments.id | RESTRICT | RESTRICT | ✅ |
| reports.reported_user_id → users.id | RESTRICT | RESTRICT | ✅ |
| moderation_actions.moderator_id → users.id | RESTRICT | RESTRICT | ✅ |
| moderation_actions.report_id → reports.id | SET NULL | SET NULL | ✅ |
| moderation_actions.target_user_id → users.id | SET NULL | SET NULL | ✅ |
| notifications.user_id → users.id | CASCADE | CASCADE | ✅ |
| notifications.reference_post_id → posts.id | SET NULL | SET NULL | ✅ |
| notifications.reference_comment_id → comments.id | SET NULL | SET NULL | ✅ |
| notifications.reference_user_id → users.id | SET NULL | SET NULL | ✅ |
| audit_logs.actor_id → users.id | SET NULL | SET NULL | ✅ |

**Result**: 34/34 FKs match v2.1 specification. ✅ PASS

---

## 2. ON DELETE Consistency

### Cross-reference: Multiple FKs to the same parent table

The `users` table is referenced by 18 FKs across the schema. These FKs have different ON DELETE behaviors depending on the relationship semantics:

| FK → users.id | ON DELETE | Correct? |
|------|----------|----------|
| profiles.user_id | CASCADE | ✅ Profile dies with user |
| user_roles.user_id | CASCADE | ✅ Roles die with user |
| user_roles.assigned_by | SET NULL | ✅ Preserve assignment |
| posts.author_id | RESTRICT | ✅ Soft-delete users instead |
| comments.author_id | RESTRICT | ✅ Soft-delete users instead |
| media.uploader_id | RESTRICT | ✅ Soft-delete users instead |
| post_reactions.user_id | CASCADE | ✅ Reactions die with user |
| comment_reactions.user_id | CASCADE | ✅ Reactions die with user |
| follows.follower_id | CASCADE | ✅ Follows die with user |
| follows.following_id | CASCADE | ✅ Follows die with user |
| reports.reporter_id | SET NULL | ✅ Preserve report |
| reports.reported_user_id | RESTRICT | ✅ Cannot hard-delete reported user |
| moderation_actions.moderator_id | RESTRICT | ✅ Preserve moderation record |
| moderation_actions.target_user_id | SET NULL | ✅ Preserve action |
| notifications.user_id | CASCADE | ✅ Notifications die with user |
| notifications.reference_user_id | SET NULL | ✅ Preserve notification |
| audit_logs.actor_id | SET NULL | ✅ Preserve log |

### RESTRICT vs. soft-delete interaction

All RESTRICT FKs (`posts.author_id`, `comments.author_id`, `media.uploader_id`, `reports.reported_*`, `moderation_actions.moderator_id`) target entities that use soft delete. RESTRICT will only fire on hard delete, which should never occur in normal operations.

**Result**: ✅ PASS — all ON DELETE behaviors are intentional and consistent with soft-delete strategy.

---

## 3. Nullable Constraints

### Columns that MUST be NOT NULL (verified)

| Table | Column | NOT NULL in schema? |
|-------|--------|-------------------|
| users | id, email, status, created_at, updated_at | ✅ |
| profiles | id, user_id, username, created_at, updated_at | ✅ |
| roles | id, name, created_at | ✅ |
| user_roles | id, user_id, role_id, assigned_at | ✅ |
| posts | id, author_id, content_type, title, slug, status, view_count, created_at, updated_at | ✅ |
| categories | id, name, slug, scope, sort_order, created_at, updated_at | ✅ |
| tags | id, name, slug, created_at | ✅ |
| post_tags | id, post_id, tag_id | ✅ |
| comments | id, post_id, author_id, body, status, created_at, updated_at | ✅ |
| post_reactions | id, user_id, post_id, reaction_type, created_at | ✅ |
| comment_reactions | id, user_id, comment_id, reaction_type, created_at | ✅ |
| follows | id, follower_id, following_id, created_at | ✅ |
| media | id, uploader_id, cloudinary_public_id, secure_url, resource_type, purpose, created_at | ✅ |
| post_media | id, post_id, media_id, sort_order | ✅ |
| reports | id, reason, status, created_at | ✅ |
| moderation_actions | id, moderator_id, action_type, reason, created_at | ✅ |
| notifications | id, user_id, type, title, is_read, created_at | ✅ |
| audit_logs | id, action, entity_type, created_at | ✅ |
| system_settings | id, key, value, updated_at | ✅ |
| feature_flags | id, key, is_enabled, updated_at | ✅ |

### Columns that MUST be NULL-able (verified)

| Table | Column | NULL-able? | Reason |
|-------|--------|-----------|--------|
| users | deleted_at | ✅ | Soft delete |
| profiles | display_name, avatar_media_id, bio | ✅ | Optional fields |
| roles | description | ✅ | Optional |
| user_roles | assigned_by | ✅ | System assignments have no assigner |
| posts | body, cover_media_id, category_id, meta_title, meta_description, published_at, deleted_at | ✅ | Optional/lifecycle fields |
| categories | description | ✅ | Optional |
| comments | parent_id, deleted_at | ✅ | Root comments have no parent; soft delete |
| media | format, width, height, file_size, deleted_at | ✅ | Not all media has dimensions; soft delete |
| reports | reporter_id, reported_post_id, reported_comment_id, reported_user_id, description, resolved_at | ✅ | Reporter can be SET NULL; exactly-one-target pattern; optional fields |
| moderation_actions | report_id, target_user_id, metadata | ✅ | Optional fields |
| notifications | message, reference_post_id, reference_comment_id, reference_user_id, read_at | ✅ | Contextual references; optional fields |
| audit_logs | actor_id, entity_id, metadata, ip_address, reason | ✅ | System actions have no actor; optional fields |
| system_settings | description | ✅ | Optional |
| feature_flags | description | ✅ | Optional |

**Result**: ✅ PASS

---

## 4. Unique Constraints

| Table | Unique Constraint | In Schema? |
|-------|------------------|------------|
| users | (email) | ✅ |
| profiles | (user_id) | ✅ |
| profiles | (username) | ✅ |
| roles | (name) | ✅ |
| user_roles | (user_id, role_id) | ✅ |
| posts | (content_type, slug) | ✅ |
| categories | (scope, slug) | ✅ |
| categories | (scope, name) | ✅ |
| tags | (name) | ✅ |
| tags | (slug) | ✅ |
| post_tags | (post_id, tag_id) | ✅ |
| post_reactions | (user_id, post_id) | ✅ |
| comment_reactions | (user_id, comment_id) | ✅ |
| follows | (follower_id, following_id) | ✅ |
| media | (cloudinary_public_id) | ✅ |
| post_media | (post_id, media_id) | ✅ |
| system_settings | (key) | ✅ |
| feature_flags | (key) | ✅ |

**Result**: 18/18 unique constraints present. ✅ PASS

---

## 5. CHECK Constraints

| Table | CHECK Constraint | In Schema? |
|-------|-----------------|------------|
| users | status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED') | ✅ |
| posts | content_type IN ('SERIES', 'COMMUNITY') | ✅ |
| posts | status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN') | ✅ |
| posts | view_count >= 0 | ✅ |
| categories | scope IN ('SERIES', 'COMMUNITY') | ✅ |
| comments | status IN ('VISIBLE', 'HIDDEN') | ✅ |
| comments | parent_id IS DISTINCT FROM id | ✅ |
| reports | num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1 | ✅ |
| reports | status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED') | ✅ |
| follows | follower_id != following_id | ✅ |
| moderation_actions | action_type IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS') | ✅ |

**Note**: moderation_actions CHECK was added during schema design for consistency. v2.1 listed these values in the entity definition but did not have an explicit CHECK requirement. This is a reasonable addition, not an architectural change.

**Result**: 11 CHECK constraints present (10 from v2.1 + 1 added for consistency). ✅ PASS

---

## 6. Soft-Delete Implications

| Entity | deleted_at? | Consistent with v2.1? |
|--------|-------------|----------------------|
| users | ✅ Yes | ✅ |
| posts | ✅ Yes | ✅ |
| comments | ✅ Yes | ✅ |
| media | ✅ Yes | ✅ |
| profiles | ❌ No | ✅ Cascades with user |
| post_reactions | ❌ No | ✅ Hard delete (un-react) |
| comment_reactions | ❌ No | ✅ Hard delete (un-react) |
| follows | ❌ No | ✅ Hard delete (unfollow) |
| post_tags | ❌ No | ✅ Hard delete |
| post_media | ❌ No | ✅ Hard delete |
| categories | ❌ No | ✅ Restricted delete |
| tags | ❌ No | ✅ Restricted delete |
| roles | ❌ No | ✅ No delete |
| user_roles | ❌ No | ✅ Hard delete |
| reports | ❌ No | ✅ Status lifecycle |
| moderation_actions | ❌ No | ✅ Append-only |
| notifications | ❌ No | ✅ Hard delete (TTL) |
| audit_logs | ❌ No | ✅ Append-only |
| system_settings | ❌ No | ✅ Update only |
| feature_flags | ❌ No | ✅ Update only |

### Soft-delete + RESTRICT interaction

RESTRICT FKs referencing soft-deletable entities will only block hard deletes. Since Phase 1 uses soft delete exclusively for users/posts/comments/media, RESTRICT constraints will never fire during normal operation. This is correct and intentional.

### Soft-delete + CASCADE interaction

CASCADE FKs (e.g., `comments.post_id → posts.id ON DELETE CASCADE`) will only fire on hard deletes. Since posts are soft-deleted, comments are preserved during normal deletion. If a post is ever hard-deleted (outside Phase 1 scope), all its comments, reactions, tags, and media attachments are cascaded — this is the intended fallback behavior.

**Result**: ✅ PASS

---

## 7. Indexes

| v2/v2.1 Recommended Index | In Schema? |
|--------------------------|------------|
| posts(content_type, status, published_at DESC) | ✅ |
| posts(author_id, created_at DESC) | ✅ |
| posts(category_id) | ✅ |
| comments(post_id, created_at ASC) | ✅ |
| comments(parent_id) | ✅ |
| comments(author_id) | ✅ |
| post_reactions(post_id) | ✅ |
| comment_reactions(comment_id) | ✅ |
| follows(following_id) | ✅ |
| post_tags(tag_id) | ✅ |
| notifications(user_id, is_read, created_at DESC) | ✅ |
| reports(status, created_at DESC) | ✅ |
| audit_logs(actor_id, created_at DESC) | ✅ |
| audit_logs(entity_type, entity_id, created_at DESC) | ✅ |
| media(uploader_id) | ✅ |
| moderation_actions(moderator_id, created_at DESC) | ✅ |
| moderation_actions(target_user_id) | ✅ |

**Note**: Indexes for `post_reactions(user_id)` and `comment_reactions(user_id)` from v2 are not explicitly created because they are covered by the leading column of the unique constraint index `(user_id, post_id)` / `(user_id, comment_id)`. Similarly, `follows(follower_id)` is covered by the unique index `(follower_id, following_id)`.

**Result**: 17 custom indexes created. All v2/v2.1 access patterns covered. ✅ PASS

---

## 8. Report Integrity

### Exactly-one-target CHECK

```sql
CHECK (num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1)
```

This ensures:
- Exactly one of the three target FKs is non-null ✅
- Cannot have zero targets ✅
- Cannot have multiple targets ✅

### ON DELETE RESTRICT on all targets

All three target FKs use ON DELETE RESTRICT, which is consistent with:
- The CHECK constraint (SET NULL would violate it) ✅
- Soft-delete strategy (targets are never hard-deleted in Phase 1) ✅
- v2.1 §7 correction ✅

### reporter_id ON DELETE SET NULL

Reporter FK uses SET NULL — reporter identity is not critical to report integrity. ✅

**Result**: ✅ PASS

---

## 9. Reaction Integrity

### Separate tables

- `post_reactions` with `user_id NOT NULL`, `post_id NOT NULL` — all FKs are non-nullable ✅
- `comment_reactions` with `user_id NOT NULL`, `comment_id NOT NULL` — all FKs are non-nullable ✅
- No nullable FKs, no CHECK constraints needed for target selection ✅
- Consistent with v2 strong-FK integrity principle ✅

### Uniqueness

- `UNIQUE(user_id, post_id)` — one reaction per user per post (MVP) ✅
- `UNIQUE(user_id, comment_id)` — one reaction per user per comment (MVP) ✅
- `reaction_type` NOT in unique constraint per v2.1 §8 ✅

### Extensibility

- `reaction_type VARCHAR(20) NOT NULL DEFAULT 'LIKE'` — future types can be added ✅
- Changing to multi-type requires only a unique constraint migration ✅

**Result**: ✅ PASS

---

## 10. Comment Parent Same-Post Invariant

**Invariant**: `parent_id`, when present, must reference a comment on the same post.

**Database enforcement**: Not enforced via database constraint or trigger.  
**Application enforcement**: Service-level validation before INSERT.  
**v2.1 reference**: §5C — "Enforced at application layer (service-level validation) in Phase 1."

**Database safeguards present**:
- `parent_id IS DISTINCT FROM id` — prevents self-reference ✅
- `parent_id → comments.id ON DELETE SET NULL` — preserves children if parent is deleted ✅

**Result**: ✅ PASS — consistent with v2.1 (application-enforced invariant)

---

## 11. UUID Consistency

| Table | PK Type | Default | Correct? |
|-------|---------|---------|----------|
| users | UUID | NO DEFAULT (Supabase Auth UUID) | ✅ |
| profiles | UUID | gen_random_uuid() | ✅ |
| roles | UUID | gen_random_uuid() | ✅ |
| user_roles | UUID | gen_random_uuid() | ✅ |
| posts | UUID | gen_random_uuid() | ✅ |
| categories | UUID | gen_random_uuid() | ✅ |
| tags | UUID | gen_random_uuid() | ✅ |
| post_tags | UUID | gen_random_uuid() | ✅ |
| comments | UUID | gen_random_uuid() | ✅ |
| post_reactions | UUID | gen_random_uuid() | ✅ |
| comment_reactions | UUID | gen_random_uuid() | ✅ |
| follows | UUID | gen_random_uuid() | ✅ |
| media | UUID | gen_random_uuid() | ✅ |
| post_media | UUID | gen_random_uuid() | ✅ |
| reports | UUID | gen_random_uuid() | ✅ |
| moderation_actions | UUID | gen_random_uuid() | ✅ |
| notifications | UUID | gen_random_uuid() | ✅ |
| audit_logs | UUID | gen_random_uuid() | ✅ |
| system_settings | UUID | gen_random_uuid() | ✅ |
| feature_flags | UUID | gen_random_uuid() | ✅ |

**Important**: `users.id` has NO DEFAULT because the value is provided by the application (Supabase Auth UUID from JWT `sub` claim). All other tables use `gen_random_uuid()`.

**Result**: 20/20 tables use UUID PKs. ✅ PASS

---

## 12. Supabase Auth User ID Mapping

- `users.id` type: UUID ✅
- `users.id` default: NONE (explicitly provided, not auto-generated) ✅
- `users.id` = JWT `sub` claim (Supabase Auth user UUID) ✅
- `users.email` synced from Supabase Auth claims ✅
- No `password_hash` column ✅
- No `email_verified_at` column (Supabase handles verification) ✅
- No `user_identities` table (Supabase handles OAuth providers) ✅
- No `refresh_tokens` table (Supabase handles token lifecycle) ✅

**Result**: ✅ PASS

---

## 13. Table Creation Order

The SQL schema creates tables in an order that respects FK dependencies:

```text
1.  users             (no FK deps)
2.  roles             (no FK deps)
3.  categories        (no FK deps)
4.  tags              (no FK deps)
5.  media             (depends on: users)
6.  profiles          (depends on: users, media)
7.  user_roles        (depends on: users, roles)
8.  posts             (depends on: users, media, categories)
9.  post_tags         (depends on: posts, tags)
10. comments          (depends on: posts, users, self-ref)
11. post_reactions    (depends on: users, posts)
12. comment_reactions (depends on: users, comments)
13. follows           (depends on: users)
14. post_media        (depends on: posts, media)
15. reports           (depends on: users, posts, comments)
16. moderation_actions (depends on: users, reports)
17. notifications     (depends on: users, posts, comments)
18. audit_logs        (depends on: users)
19. system_settings   (no FK deps)
20. feature_flags     (no FK deps)
```

**Result**: ✅ PASS — no forward references

---

## 14. Identified Issues

### Non-blocking observations

| # | Observation | Severity | Notes |
|---|------------|----------|-------|
| 1 | `moderation_actions` CHECK constraint was added during schema design (v2.1 listed values but didn't have explicit CHECK) | 🟢 Info | Reasonable addition. Does not change architecture |
| 2 | Soft-deleted media referenced by `profiles.avatar_media_id` or `posts.cover_media_id` remains FK-valid but should be treated as "no media" by the application | 🟢 Info | Application concern, not a schema issue |
| 3 | `notification.type` values are not CHECK-constrained | 🟢 Info | Notification types may grow frequently. Application-level validation is appropriate. Adding a CHECK would require a migration for every new notification type |
| 4 | `media.resource_type` and `media.purpose` are not CHECK-constrained | 🟢 Info | Same rationale — these may grow. Application-level validation is preferred |
| 5 | `audit_logs.entity_type` has no FK enforcement | 🟢 Info | Documented exception per v2.1. Audit logs are append-only and may outlive referenced entities |

### Blocking issues

**None identified.**

---

## 15. Summary

| Check Area | Result |
|-----------|--------|
| FK consistency (34 FKs) | ✅ PASS |
| ON DELETE consistency | ✅ PASS |
| Nullable constraints | ✅ PASS |
| Unique constraints (18) | ✅ PASS |
| CHECK constraints (11) | ✅ PASS |
| Soft-delete implications | ✅ PASS |
| Indexes (17 custom) | ✅ PASS |
| Report integrity | ✅ PASS |
| Reaction integrity | ✅ PASS |
| Comment same-post invariant | ✅ PASS |
| UUID consistency (20 tables) | ✅ PASS |
| Supabase Auth user ID mapping | ✅ PASS |
| Table creation order | ✅ PASS |
| Blocking issues | **None** |

**All Architecture Review v2.1 decisions have been correctly implemented in the database schema.**

**No v2.1 decisions were silently changed.**

---

> Phase 1 Database Architecture & ERD is complete and awaiting review.
>
> Do NOT proceed to backend implementation until Phase 1 receives explicit approval.
