-- Learning lessons are organized by domain and learning course, not categories.
-- Keep categories for community posts, but detach existing SERIES lessons.
UPDATE posts
SET category_id = NULL,
    updated_at = NOW()
WHERE content_type = 'SERIES'
  AND category_id IS NOT NULL;

ALTER TABLE posts
  ALTER COLUMN category_id DROP NOT NULL;
