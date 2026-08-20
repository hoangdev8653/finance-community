-- ============================================================================
-- Finance Community Platform — Database Schema
-- Phase 1: Database Architecture & ERD
-- Baseline: Architecture Review v2.1 (approved)
-- Database: PostgreSQL 13+
-- Date: 2026-08-13
-- ============================================================================
-- Table creation order respects FK dependencies.
-- All PKs are UUID. users.id is provided externally (Supabase Auth UUID).
-- All other PKs use gen_random_uuid() (built-in PG 13+).
-- All timestamps use TIMESTAMPTZ (timezone-aware).
-- ============================================================================

-- ============================================================================
-- 1. users
-- Represents an authenticated user account.
-- id = Supabase Auth user UUID (from JWT sub claim). NOT auto-generated.
-- ============================================================================
CREATE TABLE users (
    id              UUID            PRIMARY KEY,  -- Supabase Auth UUID, not gen_random_uuid()
    email           VARCHAR(255)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT uq_users_email
        UNIQUE (email),

    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'))
);

-- ============================================================================
-- 1.1 auth_credentials
-- Persistent local password hashes for email/password authentication.
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_credentials (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_auth_credentials_user_id
        UNIQUE (user_id),

    CONSTRAINT fk_auth_credentials_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. roles
-- RBAC role definitions. Seeded data.
-- ============================================================================
CREATE TABLE roles (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50)     NOT NULL,
    description     TEXT            NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_roles_name
        UNIQUE (name)
);

-- Seed roles
INSERT INTO roles (name, description) VALUES
    ('MEMBER',      'Default role for registered users'),
    ('MODERATOR',   'Can review reports and moderate content'),
    ('ADMIN',       'Full administrative access'),
    ('SUPER_ADMIN', 'System-level access with role management');

-- ============================================================================
-- 3. categories
-- Content categorization scoped by content type.
-- ============================================================================
CREATE TABLE categories (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(120)    NOT NULL,
    scope           VARCHAR(20)     NOT NULL,
    description     TEXT            NULL,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categories_scope_slug
        UNIQUE (scope, slug),

    CONSTRAINT uq_categories_scope_name
        UNIQUE (scope, name),

    CONSTRAINT chk_categories_scope
        CHECK (scope IN ('SERIES', 'COMMUNITY'))
);

-- ============================================================================
-- 4. tags
-- Freeform content labels. Global namespace.
-- ============================================================================
CREATE TABLE tags (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(120)    NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tags_name
        UNIQUE (name),

    CONSTRAINT uq_tags_slug
        UNIQUE (slug)
);

-- ============================================================================
-- 5. media
-- Media asset metadata. Cloudinary is the storage provider.
-- Depends on: users
-- ============================================================================
CREATE TABLE media (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id             UUID            NOT NULL,
    cloudinary_public_id    VARCHAR(255)    NOT NULL,
    secure_url              VARCHAR(500)    NOT NULL,
    resource_type           VARCHAR(20)     NOT NULL,
    format                  VARCHAR(20)     NULL,
    width                   INTEGER         NULL,
    height                  INTEGER         NULL,
    file_size               INTEGER         NULL,
    purpose                 VARCHAR(20)     NOT NULL DEFAULT 'content',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL,

    CONSTRAINT fk_media_uploader
        FOREIGN KEY (uploader_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_media_cloudinary_public_id
        UNIQUE (cloudinary_public_id)
);

CREATE INDEX idx_media_uploader_id ON media (uploader_id);

-- ============================================================================
-- 6. profiles
-- Public profile data. Strict 1:1 with users.
-- Depends on: users, media
-- ============================================================================
CREATE TABLE profiles (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    username            VARCHAR(50)     NOT NULL,
    display_name        VARCHAR(100)    NULL,
    avatar_media_id     UUID            NULL,
    bio                 TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_profiles_avatar_media
        FOREIGN KEY (avatar_media_id) REFERENCES media (id)
        ON DELETE SET NULL,

    CONSTRAINT uq_profiles_user_id
        UNIQUE (user_id),

    CONSTRAINT uq_profiles_username
        UNIQUE (username)
);

-- ============================================================================
-- 7. user_roles
-- Role assignments. Many-to-many between users and roles.
-- Depends on: users, roles
-- ============================================================================
CREATE TABLE user_roles (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    role_id         UUID            NOT NULL,
    assigned_by     UUID            NULL,
    assigned_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_roles_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT uq_user_roles_user_role
        UNIQUE (user_id, role_id)
);

-- ============================================================================
-- 8. posts
-- Unified content entity for Series articles and Community posts.
-- Depends on: users, media, categories
-- ============================================================================
CREATE TABLE posts (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id           UUID            NOT NULL,
    content_type        VARCHAR(20)     NOT NULL,
    title               VARCHAR(300)    NOT NULL,
    slug                VARCHAR(350)    NOT NULL,
    body                TEXT            NULL,
    cover_media_id      UUID            NULL,
    category_id         UUID            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    meta_title          VARCHAR(70)     NULL,
    meta_description    VARCHAR(160)    NULL,
    view_count          INTEGER         NOT NULL DEFAULT 0,
    published_at        TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_posts_cover_media
        FOREIGN KEY (cover_media_id) REFERENCES media (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_posts_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
        ON DELETE SET NULL,

    CONSTRAINT uq_posts_content_type_slug
        UNIQUE (content_type, slug),

    CONSTRAINT chk_posts_content_type
        CHECK (content_type IN ('SERIES', 'COMMUNITY')),

    CONSTRAINT chk_posts_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN')),

    CONSTRAINT chk_posts_view_count
        CHECK (view_count >= 0)
);

CREATE INDEX idx_posts_feed ON posts (content_type, status, published_at DESC);
CREATE INDEX idx_posts_author ON posts (author_id, created_at DESC);
CREATE INDEX idx_posts_category ON posts (category_id);

-- ============================================================================
-- 9. post_tags
-- Junction table: posts <-> tags.
-- Depends on: posts, tags
-- ============================================================================
CREATE TABLE post_tags (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID            NOT NULL,
    tag_id          UUID            NOT NULL,

    CONSTRAINT fk_post_tags_post
        FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_post_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags (id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_post_tags_post_tag
        UNIQUE (post_id, tag_id)
);

CREATE INDEX idx_post_tags_tag ON post_tags (tag_id);

-- ============================================================================
-- 10. comments
-- Threaded comments using adjacency-list model.
-- Depends on: posts, users
-- Application invariant: parent_id must reference a comment on the same post.
-- ============================================================================
CREATE TABLE comments (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID            NOT NULL,
    author_id       UUID            NOT NULL,
    parent_id       UUID            NULL,
    body            TEXT            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'VISIBLE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     NULL,

    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id) REFERENCES comments (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_comments_status
        CHECK (status IN ('VISIBLE', 'HIDDEN')),

    CONSTRAINT chk_comments_no_self_reference
        CHECK (parent_id IS DISTINCT FROM id)
);

CREATE INDEX idx_comments_post ON comments (post_id, created_at ASC);
CREATE INDEX idx_comments_parent ON comments (parent_id);
CREATE INDEX idx_comments_author ON comments (author_id);

-- ============================================================================
-- 11. post_reactions
-- Reactions on posts. Separate table for strong FK integrity.
-- Depends on: users, posts
-- MVP: one reaction per user per post (UNIQUE without reaction_type).
-- ============================================================================
CREATE TABLE post_reactions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    post_id         UUID            NOT NULL,
    reaction_type   VARCHAR(20)     NOT NULL DEFAULT 'LIKE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_post_reactions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_post_reactions_post
        FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_post_reactions_user_post
        UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions (post_id);

-- ============================================================================
-- 12. comment_reactions
-- Reactions on comments. Separate table for strong FK integrity.
-- Depends on: users, comments
-- MVP: one reaction per user per comment (UNIQUE without reaction_type).
-- ============================================================================
CREATE TABLE comment_reactions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    comment_id      UUID            NOT NULL,
    reaction_type   VARCHAR(20)     NOT NULL DEFAULT 'LIKE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_reactions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_reactions_comment
        FOREIGN KEY (comment_id) REFERENCES comments (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_comment_reactions_user_comment
        UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_reactions_comment ON comment_reactions (comment_id);

-- ============================================================================
-- 13. follows
-- User-to-user following. Explicit FK design, no polymorphism.
-- Depends on: users
-- ============================================================================
CREATE TABLE follows (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id     UUID            NOT NULL,
    following_id    UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_follows_following
        FOREIGN KEY (following_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_follows_follower_following
        UNIQUE (follower_id, following_id),

    CONSTRAINT chk_follows_no_self_follow
        CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows (following_id);

-- ============================================================================
-- 14. post_media
-- Junction table: posts <-> media (content images/attachments).
-- Depends on: posts, media
-- ============================================================================
CREATE TABLE post_media (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID            NOT NULL,
    media_id        UUID            NOT NULL,
    sort_order      INTEGER         NOT NULL DEFAULT 0,

    CONSTRAINT fk_post_media_post
        FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_post_media_media
        FOREIGN KEY (media_id) REFERENCES media (id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_post_media_post_media
        UNIQUE (post_id, media_id)
);

-- ============================================================================
-- 15. reports
-- User-filed reports targeting posts, comments, or users.
-- Depends on: users, posts, comments
-- Exactly one target FK must be non-null (CHECK constraint).
-- Target FKs use ON DELETE RESTRICT because targets are soft-deleted.
-- ============================================================================
CREATE TABLE reports (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id             UUID            NULL,
    reported_post_id        UUID            NULL,
    reported_comment_id     UUID            NULL,
    reported_user_id        UUID            NULL,
    reason                  VARCHAR(100)    NOT NULL,
    description             TEXT            NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at             TIMESTAMPTZ     NULL,

    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_reports_reported_post
        FOREIGN KEY (reported_post_id) REFERENCES posts (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reports_reported_comment
        FOREIGN KEY (reported_comment_id) REFERENCES comments (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reports_reported_user
        FOREIGN KEY (reported_user_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_reports_exactly_one_target
        CHECK (num_nonnulls(reported_post_id, reported_comment_id, reported_user_id) = 1),

    CONSTRAINT chk_reports_status
        CHECK (status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'))
);

CREATE INDEX idx_reports_queue ON reports (status, created_at DESC);

-- ============================================================================
-- 16. moderation_actions
-- Records of moderator actions. Append-only.
-- Depends on: users, reports
-- ============================================================================
CREATE TABLE moderation_actions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id        UUID            NOT NULL,
    report_id           UUID            NULL,
    action_type         VARCHAR(30)     NOT NULL,
    target_user_id      UUID            NULL,
    reason              TEXT            NOT NULL,
    metadata            JSONB           NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_moderation_actions_moderator
        FOREIGN KEY (moderator_id) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_moderation_actions_report
        FOREIGN KEY (report_id) REFERENCES reports (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_moderation_actions_target_user
        FOREIGN KEY (target_user_id) REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_moderation_actions_action_type
        CHECK (action_type IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS'))
);

CREATE INDEX idx_moderation_actions_moderator ON moderation_actions (moderator_id, created_at DESC);
CREATE INDEX idx_moderation_actions_target ON moderation_actions (target_user_id);

-- ============================================================================
-- 17. notifications
-- In-app notifications with contextual references.
-- Reference FKs are NOT mutually exclusive — a notification may reference
-- multiple entities simultaneously.
-- Depends on: users, posts, comments
-- ============================================================================
CREATE TABLE notifications (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID            NOT NULL,
    type                    VARCHAR(30)     NOT NULL,
    title                   VARCHAR(255)    NOT NULL,
    message                 TEXT            NULL,
    reference_post_id       UUID            NULL,
    reference_comment_id    UUID            NULL,
    reference_user_id       UUID            NULL,
    is_read                 BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at                 TIMESTAMPTZ     NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_reference_post
        FOREIGN KEY (reference_post_id) REFERENCES posts (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_reference_comment
        FOREIGN KEY (reference_comment_id) REFERENCES comments (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_reference_user
        FOREIGN KEY (reference_user_id) REFERENCES users (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_notifications_feed ON notifications (user_id, is_read, created_at DESC);

-- ============================================================================
-- 18. audit_logs
-- Append-only security and administrative operation log.
-- entity_type/entity_id are descriptive references without FK enforcement.
-- This is a documented exception to the strong-FK rule.
-- Must not be updated or deleted by any user, including admins.
-- Depends on: users (actor_id only)
-- ============================================================================
CREATE TABLE audit_logs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID            NULL,
    action          VARCHAR(100)    NOT NULL,
    entity_type     VARCHAR(50)     NOT NULL,
    entity_id       UUID            NULL,
    metadata        JSONB           NULL,
    ip_address      VARCHAR(45)     NULL,       -- supports IPv6
    reason          TEXT            NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id) REFERENCES users (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id, created_at DESC);

-- ============================================================================
-- 19. system_settings
-- Runtime configuration key-value store.
-- Settings are updated, never deleted.
-- ============================================================================
CREATE TABLE system_settings (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100)    NOT NULL,
    value           JSONB           NOT NULL,
    description     TEXT            NULL,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_system_settings_key
        UNIQUE (key)
);

-- ============================================================================
-- 20. feature_flags
-- Feature toggle store.
-- Flags are toggled, never deleted.
-- ============================================================================
CREATE TABLE feature_flags (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100)    NOT NULL,
    is_enabled      BOOLEAN         NOT NULL DEFAULT FALSE,
    description     TEXT            NULL,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_feature_flags_key
        UNIQUE (key)
);

-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
-- Tables:             20
-- Foreign Keys:       34
-- Unique Constraints: 18
-- CHECK Constraints:  10
-- Custom Indexes:     17
-- Soft-delete tables: 4 (users, posts, comments, media)
-- Append-only tables: 2 (moderation_actions, audit_logs)
-- Seeded tables:      1 (roles)
-- ============================================================================
