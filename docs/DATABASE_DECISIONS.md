# Database Decisions — Finance Community Platform

**Phase**: 1 — Database Architecture & ERD  
**Baseline**: Architecture Review v2.1 (approved)  
**Date**: 2026-08-13

---

## Purpose

This document records the authoritative database design decisions inherited from Architecture Review v2.1 and any clarifications made during database schema design. No decisions from v2.1 have been changed.

---

## 1. Primary Identifiers — UUID

All tables use `UUID` as primary key type.

- PostgreSQL `gen_random_uuid()` for application-generated IDs
- `users.id` is NOT application-generated — it equals the Supabase Auth user UUID from the JWT `sub` claim
- UUID is an identifier strategy, not a security mechanism
- Authorization is the actual security boundary

**Source**: v2.1 §5A

---

## 2. Supabase Auth User UUID → users.id

The `users.id` column stores the Supabase Auth user UUID directly.

- Extracted from the JWT `sub` claim during JIT provisioning
- No `DEFAULT gen_random_uuid()` on `users.id` — the value is explicitly provided
- All other entity PKs use `DEFAULT gen_random_uuid()`
- `users.email` is synced from Supabase Auth claims, treated as a read-only copy

**Source**: v2.1 §4, §5A

---

## 3. Reports Target FK — ON DELETE RESTRICT

Report target FKs use `ON DELETE RESTRICT`:

- `reported_post_id → posts.id ON DELETE RESTRICT`
- `reported_comment_id → comments.id ON DELETE RESTRICT`
- `reported_user_id → users.id ON DELETE RESTRICT`

Rationale: `ON DELETE SET NULL` would violate the CHECK constraint that requires exactly one target FK to be non-null. Since all three target entity types (users, posts, comments) use soft delete, their rows are never physically removed, so RESTRICT will not fire during normal operations.

Reporter FK uses `ON DELETE SET NULL` — the reporter's identity is not critical to report integrity.

**Invariant**: Report target references must remain valid for the lifetime of the report. Hard-delete of a target is blocked by RESTRICT.

**Source**: v2.1 §7

---

## 4. Media FK Relationships

Media is referenced via real foreign keys, not URL strings:

- `profiles.avatar_media_id → media.id ON DELETE SET NULL`
- `posts.cover_media_id → media.id ON DELETE SET NULL`

The `media` table is the canonical source of truth. No URL string columns (avatar_url, cover_image_url) exist on profiles or posts.

Application resolves URLs by joining to the media table or caching on the response DTO.

**Source**: v2.1 §6

---

## 5. Reaction Uniqueness — One Per User Per Target

MVP constraint: one reaction per user per target, regardless of reaction type.

- `post_reactions`: `UNIQUE(user_id, post_id)`
- `comment_reactions`: `UNIQUE(user_id, comment_id)`

`reaction_type` is NOT part of the unique constraint. Since MVP only supports `LIKE`, this is functionally a like/unlike toggle.

If the product later requires multiple simultaneous reaction types, the constraint changes to `UNIQUE(user_id, post_id, reaction_type)` via migration.

**Source**: v2.1 §8

---

## 6. Comment Same-Post Invariant

When `comments.parent_id` is not null, the referenced parent comment must belong to the same post.

- `parent.post_id` must equal `child.post_id`
- Enforced at the application layer (service-level validation) in Phase 1
- Not enforced via database trigger (complexity vs. value tradeoff)

**Source**: v2.1 §5C

---

## 7. Notification Contextual References

Notification reference FKs are contextual navigation targets, NOT mutually exclusive:

- `reference_post_id` — the related post
- `reference_comment_id` — the related comment
- `reference_user_id` — the related user (actor)

A single notification may populate multiple reference FKs simultaneously (e.g., "User X commented on your post" references all three).

No CHECK constraint for mutual exclusivity.

**Source**: v2.1 §5D

---

## 8. Soft Delete Strategy

| Entity | Strategy | Column |
|--------|----------|--------|
| users | Soft delete | `deleted_at TIMESTAMPTZ NULL` |
| posts | Soft delete | `deleted_at TIMESTAMPTZ NULL` |
| comments | Soft delete | `deleted_at TIMESTAMPTZ NULL` |
| media | Soft delete | `deleted_at TIMESTAMPTZ NULL` |
| post_reactions | Hard delete | — |
| comment_reactions | Hard delete | — |
| follows | Hard delete | — |
| post_tags | Hard delete | — |
| post_media | Hard delete | — |
| categories | Restricted delete | Application check |
| tags | Restricted delete | Application check |
| roles | No delete | Seeded data |
| user_roles | Hard delete | Recorded in audit_logs |
| reports | Status lifecycle | Never deleted |
| moderation_actions | Append-only | Never updated or deleted |
| notifications | Hard delete | Bulk TTL cleanup |
| audit_logs | Append-only | Never updated or deleted |
| system_settings | Update only | Never deleted |
| feature_flags | Update only | Never deleted |

**Source**: v2.1 §9, v2 §K

---

## 9. RBAC Architecture

Roles are stored in the database. Permissions are mapped in application configuration.

- `roles` table: seeded with MEMBER, MODERATOR, ADMIN, SUPER_ADMIN
- `user_roles` table: assigns roles to users
- No `permissions` or `role_permissions` database tables in Phase 1
- Permission map is an application-level configuration
- Guards check permissions, never roles directly

**Source**: v2.1 §5, v2 §E

---

## 10. Slug Uniqueness Per Content Type

Post slugs are unique within their `content_type`:

- `UNIQUE(content_type, slug)`
- Allows `/series/investing-101` and `/community/investing-101` to coexist
- Slugs are auto-generated from title
- Collision handling: append short random suffix
- Immutable after publication (preserves URLs and SEO)

**Source**: v2 §F

---

## 11. Category Scope

Categories are scoped per content type:

- `UNIQUE(scope, slug)`
- `UNIQUE(scope, name)`
- `scope IN ('SERIES', 'COMMUNITY')`

Separate taxonomies for Series and Community sharing one table.

**Source**: v2 §F

---

## 12. Audit Log Entity References

Audit logs use descriptive `entity_type` (string label) and `entity_id` (UUID) without FK enforcement.

- Documented exception to the strong-FK rule
- Audit logs are append-only, never joined to source entities in transactional queries
- References may outlive the referenced entity
- `actor_id → users.id ON DELETE SET NULL` is the only FK

**Source**: v2 §J (integrity strategy)

---

## 13. Timestamp Convention

All timestamps use `TIMESTAMPTZ` (timestamp with time zone) for correct timezone handling across deployments.

- `created_at`: set on insertion, never updated
- `updated_at`: set on insertion, updated on every modification
- `deleted_at`: null when active, set to current timestamp on soft delete
- `published_at`: set when post status transitions to PUBLISHED
- `assigned_at`: set when role is assigned
- `resolved_at`: set when report is resolved/dismissed

---

## 14. PostgreSQL-Specific Decisions

- UUID generation: `gen_random_uuid()` (built-in, no extension required in PG 13+)
- CHECK constraints for enum-like columns (not PostgreSQL ENUM types — allows migration flexibility)
- `JSONB` for metadata and settings (indexable, queryable)
- `num_nonnulls()` built-in function for the reports exactly-one-target CHECK
- `IS DISTINCT FROM` for the comment self-reference CHECK (null-safe comparison)
