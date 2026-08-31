-- Every post must be discoverable through a domain and a category.
-- This migration is safe after the content reset/seed because no legacy null rows remain.
ALTER TABLE categories ALTER COLUMN domain_id SET NOT NULL;
ALTER TABLE posts ALTER COLUMN domain_id SET NOT NULL;
ALTER TABLE posts ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_content_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_content_type CHECK (content_type IN ('COMMUNITY', 'NEWS', 'SERIES'));

CREATE INDEX IF NOT EXISTS idx_posts_domain_category_status ON posts (domain_id, category_id, status);
