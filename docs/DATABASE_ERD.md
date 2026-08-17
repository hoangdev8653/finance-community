# Database ERD — Finance Community Platform

**Phase**: 1 — Database Architecture & ERD  
**Baseline**: Architecture Review v2.1 (approved)  
**Date**: 2026-08-13

---

## Complete Entity-Relationship Diagram

```mermaid
erDiagram
    %% ===== IDENTITY DOMAIN =====
    users ||--o| profiles : "has one (CASCADE)"
    users ||--o{ user_roles : "assigned (CASCADE)"
    roles ||--o{ user_roles : "defines (RESTRICT)"

    %% ===== CONTENT DOMAIN =====
    users ||--o{ posts : "authors (RESTRICT)"
    posts }o--o| categories : "categorized (SET NULL)"
    posts ||--o{ post_tags : "tagged (CASCADE)"
    tags ||--o{ post_tags : "applied (RESTRICT)"

    %% ===== MEDIA DOMAIN =====
    users ||--o{ media : "uploads (RESTRICT)"
    media ||--o{ post_media : "referenced (RESTRICT)"
    posts ||--o{ post_media : "has attachments (CASCADE)"
    media |o--o{ profiles : "avatar (SET NULL)"
    media |o--o{ posts : "cover (SET NULL)"

    %% ===== INTERACTION DOMAIN =====
    users ||--o{ comments : "writes (RESTRICT)"
    posts ||--o{ comments : "has (CASCADE)"
    comments ||--o{ comments : "replies to (SET NULL)"
    users ||--o{ post_reactions : "reacts (CASCADE)"
    posts ||--o{ post_reactions : "receives (CASCADE)"
    users ||--o{ comment_reactions : "reacts (CASCADE)"
    comments ||--o{ comment_reactions : "receives (CASCADE)"
    users ||--o{ follows : "follows (CASCADE)"
    users ||--o{ follows : "followed by (CASCADE)"

    %% ===== GOVERNANCE DOMAIN =====
    users ||--o{ reports : "files (SET NULL)"
    posts |o--o{ reports : "reported (RESTRICT)"
    comments |o--o{ reports : "reported (RESTRICT)"
    users |o--o{ reports : "reported (RESTRICT)"
    users ||--o{ moderation_actions : "performs (RESTRICT)"
    reports |o--o{ moderation_actions : "triggers (SET NULL)"

    %% ===== COMMUNICATION DOMAIN =====
    users ||--o{ notifications : "receives (CASCADE)"

    %% ===== AUDIT DOMAIN =====
    users |o--o{ audit_logs : "performs (SET NULL)"

    %% ===== ENTITY DEFINITIONS =====

    users {
        uuid id PK "Supabase Auth UUID"
        varchar email UK "NOT NULL"
        varchar status "NOT NULL DEFAULT ACTIVE"
        timestamptz created_at "NOT NULL"
        timestamptz updated_at "NOT NULL"
        timestamptz deleted_at "SOFT DELETE"
    }

    profiles {
        uuid id PK "gen_random_uuid"
        uuid user_id FK_UK "NOT NULL → users"
        varchar username UK "NOT NULL"
        varchar display_name "NULL"
        uuid avatar_media_id FK "NULL → media"
        text bio "NULL"
        timestamptz created_at "NOT NULL"
        timestamptz updated_at "NOT NULL"
    }

    roles {
        uuid id PK "gen_random_uuid"
        varchar name UK "NOT NULL"
        text description "NULL"
        timestamptz created_at "NOT NULL"
    }

    user_roles {
        uuid id PK "gen_random_uuid"
        uuid user_id FK "NOT NULL → users"
        uuid role_id FK "NOT NULL → roles"
        uuid assigned_by FK "NULL → users"
        timestamptz assigned_at "NOT NULL"
    }

    posts {
        uuid id PK "gen_random_uuid"
        uuid author_id FK "NOT NULL → users"
        varchar content_type "NOT NULL SERIES|COMMUNITY"
        varchar title "NOT NULL"
        varchar slug "NOT NULL"
        text body "NULL"
        uuid cover_media_id FK "NULL → media"
        uuid category_id FK "NULL → categories"
        varchar status "NOT NULL DEFAULT DRAFT"
        varchar meta_title "NULL max 70"
        varchar meta_description "NULL max 160"
        integer view_count "NOT NULL DEFAULT 0"
        timestamptz published_at "NULL"
        timestamptz created_at "NOT NULL"
        timestamptz updated_at "NOT NULL"
        timestamptz deleted_at "SOFT DELETE"
    }

    categories {
        uuid id PK "gen_random_uuid"
        varchar name "NOT NULL"
        varchar slug "NOT NULL"
        varchar scope "NOT NULL SERIES|COMMUNITY"
        text description "NULL"
        integer sort_order "NOT NULL DEFAULT 0"
        timestamptz created_at "NOT NULL"
        timestamptz updated_at "NOT NULL"
    }

    tags {
        uuid id PK "gen_random_uuid"
        varchar name UK "NOT NULL"
        varchar slug UK "NOT NULL"
        timestamptz created_at "NOT NULL"
    }

    post_tags {
        uuid id PK "gen_random_uuid"
        uuid post_id FK "NOT NULL → posts"
        uuid tag_id FK "NOT NULL → tags"
    }

    comments {
        uuid id PK "gen_random_uuid"
        uuid post_id FK "NOT NULL → posts"
        uuid author_id FK "NOT NULL → users"
        uuid parent_id FK "NULL → comments"
        text body "NOT NULL"
        varchar status "NOT NULL DEFAULT VISIBLE"
        timestamptz created_at "NOT NULL"
        timestamptz updated_at "NOT NULL"
        timestamptz deleted_at "SOFT DELETE"
    }

    post_reactions {
        uuid id PK "gen_random_uuid"
        uuid user_id FK "NOT NULL → users"
        uuid post_id FK "NOT NULL → posts"
        varchar reaction_type "NOT NULL DEFAULT LIKE"
        timestamptz created_at "NOT NULL"
    }

    comment_reactions {
        uuid id PK "gen_random_uuid"
        uuid user_id FK "NOT NULL → users"
        uuid comment_id FK "NOT NULL → comments"
        varchar reaction_type "NOT NULL DEFAULT LIKE"
        timestamptz created_at "NOT NULL"
    }

    follows {
        uuid id PK "gen_random_uuid"
        uuid follower_id FK "NOT NULL → users"
        uuid following_id FK "NOT NULL → users"
        timestamptz created_at "NOT NULL"
    }

    media {
        uuid id PK "gen_random_uuid"
        uuid uploader_id FK "NOT NULL → users"
        varchar cloudinary_public_id UK "NOT NULL"
        varchar secure_url "NOT NULL"
        varchar resource_type "NOT NULL"
        varchar format "NULL"
        integer width "NULL"
        integer height "NULL"
        integer file_size "NULL"
        varchar purpose "NOT NULL DEFAULT content"
        timestamptz created_at "NOT NULL"
        timestamptz deleted_at "SOFT DELETE"
    }

    post_media {
        uuid id PK "gen_random_uuid"
        uuid post_id FK "NOT NULL → posts"
        uuid media_id FK "NOT NULL → media"
        integer sort_order "NOT NULL DEFAULT 0"
    }

    reports {
        uuid id PK "gen_random_uuid"
        uuid reporter_id FK "NULL → users"
        uuid reported_post_id FK "NULL → posts"
        uuid reported_comment_id FK "NULL → comments"
        uuid reported_user_id FK "NULL → users"
        varchar reason "NOT NULL"
        text description "NULL"
        varchar status "NOT NULL DEFAULT OPEN"
        timestamptz created_at "NOT NULL"
        timestamptz resolved_at "NULL"
    }

    moderation_actions {
        uuid id PK "gen_random_uuid"
        uuid moderator_id FK "NOT NULL → users"
        uuid report_id FK "NULL → reports"
        varchar action_type "NOT NULL"
        uuid target_user_id FK "NULL → users"
        text reason "NOT NULL"
        jsonb metadata "NULL"
        timestamptz created_at "NOT NULL"
    }

    notifications {
        uuid id PK "gen_random_uuid"
        uuid user_id FK "NOT NULL → users"
        varchar type "NOT NULL"
        varchar title "NOT NULL"
        text message "NULL"
        uuid reference_post_id FK "NULL → posts"
        uuid reference_comment_id FK "NULL → comments"
        uuid reference_user_id FK "NULL → users"
        boolean is_read "NOT NULL DEFAULT FALSE"
        timestamptz read_at "NULL"
        timestamptz created_at "NOT NULL"
    }

    audit_logs {
        uuid id PK "gen_random_uuid"
        uuid actor_id FK "NULL → users"
        varchar action "NOT NULL"
        varchar entity_type "NOT NULL"
        uuid entity_id "NULL no FK"
        jsonb metadata "NULL"
        varchar ip_address "NULL"
        text reason "NULL"
        timestamptz created_at "NOT NULL"
    }

    system_settings {
        uuid id PK "gen_random_uuid"
        varchar key UK "NOT NULL"
        jsonb value "NOT NULL"
        text description "NULL"
        timestamptz updated_at "NOT NULL"
    }

    feature_flags {
        uuid id PK "gen_random_uuid"
        varchar key UK "NOT NULL"
        boolean is_enabled "NOT NULL DEFAULT FALSE"
        text description "NULL"
        timestamptz updated_at "NOT NULL"
    }
```

---

## Relationship Summary

### Cardinality Reference

| Parent | Child | Cardinality | FK Column | ON DELETE |
|--------|-------|-------------|-----------|----------|
| users | profiles | 1:0..1 | profiles.user_id | CASCADE |
| users | user_roles | 1:N | user_roles.user_id | CASCADE |
| roles | user_roles | 1:N | user_roles.role_id | RESTRICT |
| users (assigner) | user_roles | 1:N | user_roles.assigned_by | SET NULL |
| users | posts | 1:N | posts.author_id | RESTRICT |
| media | profiles | 1:0..1 | profiles.avatar_media_id | SET NULL |
| media | posts | 1:N | posts.cover_media_id | SET NULL |
| categories | posts | 1:N | posts.category_id | SET NULL |
| posts | post_tags | 1:N | post_tags.post_id | CASCADE |
| tags | post_tags | 1:N | post_tags.tag_id | RESTRICT |
| posts | comments | 1:N | comments.post_id | CASCADE |
| users | comments | 1:N | comments.author_id | RESTRICT |
| comments (parent) | comments (child) | 1:N | comments.parent_id | SET NULL |
| users | post_reactions | 1:N | post_reactions.user_id | CASCADE |
| posts | post_reactions | 1:N | post_reactions.post_id | CASCADE |
| users | comment_reactions | 1:N | comment_reactions.user_id | CASCADE |
| comments | comment_reactions | 1:N | comment_reactions.comment_id | CASCADE |
| users (follower) | follows | 1:N | follows.follower_id | CASCADE |
| users (following) | follows | 1:N | follows.following_id | CASCADE |
| users | media | 1:N | media.uploader_id | RESTRICT |
| posts | post_media | 1:N | post_media.post_id | CASCADE |
| media | post_media | 1:N | post_media.media_id | RESTRICT |
| users (reporter) | reports | 1:N | reports.reporter_id | SET NULL |
| posts | reports | 1:N | reports.reported_post_id | RESTRICT |
| comments | reports | 1:N | reports.reported_comment_id | RESTRICT |
| users (reported) | reports | 1:N | reports.reported_user_id | RESTRICT |
| users (moderator) | moderation_actions | 1:N | moderation_actions.moderator_id | RESTRICT |
| reports | moderation_actions | 1:N | moderation_actions.report_id | SET NULL |
| users (target) | moderation_actions | 1:N | moderation_actions.target_user_id | SET NULL |
| users (recipient) | notifications | 1:N | notifications.user_id | CASCADE |
| posts | notifications | 1:N | notifications.reference_post_id | SET NULL |
| comments | notifications | 1:N | notifications.reference_comment_id | SET NULL |
| users (actor) | notifications | 1:N | notifications.reference_user_id | SET NULL |
| users (actor) | audit_logs | 1:N | audit_logs.actor_id | SET NULL |

### Total Foreign Keys: 34

### Constraint Summary

| Constraint Type | Count |
|----------------|-------|
| Primary Keys | 20 |
| Foreign Keys | 34 |
| Unique Constraints | 18 |
| CHECK Constraints | 10 |
| Custom Indexes | 17 |
