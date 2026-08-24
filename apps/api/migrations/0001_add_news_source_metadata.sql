-- Migration: add NEWS content type and source metadata to posts.
-- Safe to run against databases created before commit b2acd29.

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS source_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS source_name VARCHAR(100);

UPDATE posts
SET source_type = 'USER'
WHERE source_type IS NULL;

ALTER TABLE posts
    DROP CONSTRAINT IF EXISTS chk_posts_content_type,
    DROP CONSTRAINT IF EXISTS chk_posts_source_type;

ALTER TABLE posts
    ADD CONSTRAINT chk_posts_content_type
        CHECK (content_type IN ('SERIES', 'COMMUNITY', 'NEWS')),
    ADD CONSTRAINT chk_posts_source_type
        CHECK (source_type IN ('AI_CURATED', 'EDITORIAL', 'USER'));
