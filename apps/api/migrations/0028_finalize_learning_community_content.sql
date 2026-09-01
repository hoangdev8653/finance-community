-- Development cleanup: NEWS/RSS is no longer a supported content type.
-- Keep historical migration files, but remove obsolete data and constraints.

DELETE FROM posts
WHERE content_type = 'NEWS';

DELETE FROM categories
WHERE scope = 'NEWS';

ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_content_type;
ALTER TABLE posts
  ADD CONSTRAINT chk_posts_content_type
  CHECK (content_type IN ('SERIES', 'COMMUNITY'));

ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_scope;
ALTER TABLE categories
  ADD CONSTRAINT chk_categories_scope
  CHECK (scope IN ('SERIES', 'COMMUNITY'));
