ALTER TABLE media ADD COLUMN IF NOT EXISTS content_hash varchar(64);
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_content_hash ON media(content_hash) WHERE content_hash IS NOT NULL AND deleted_at IS NULL;
