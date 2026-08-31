ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS editorial_status varchar(20) NOT NULL DEFAULT 'DRAFT';

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS chk_posts_editorial_status;

ALTER TABLE posts
  ADD CONSTRAINT chk_posts_editorial_status
  CHECK (editorial_status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'NEEDS_UPDATE', 'ARCHIVED'));

CREATE INDEX IF NOT EXISTS idx_posts_learning_editorial_status
  ON posts(content_type, editorial_status, updated_at DESC);

UPDATE posts
SET editorial_status = CASE
  WHEN status = 'PUBLISHED' THEN 'PUBLISHED'
  WHEN status = 'ARCHIVED' THEN 'ARCHIVED'
  ELSE 'DRAFT'
END
WHERE content_type = 'SERIES';
