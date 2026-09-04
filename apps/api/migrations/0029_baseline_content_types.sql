-- Clean baseline guardrails for new deployments.
-- Legacy News/RSS migrations are intentionally not mounted by docker-compose.

DELETE FROM posts WHERE content_type NOT IN ('COMMUNITY', 'SERIES');
DELETE FROM categories WHERE scope NOT IN ('COMMUNITY', 'SERIES');

ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_content_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_content_type
  CHECK (content_type IN ('COMMUNITY', 'SERIES'));

ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_scope;
ALTER TABLE categories ADD CONSTRAINT chk_categories_scope
  CHECK (scope IN ('COMMUNITY', 'SERIES'));

ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_content_types;
ALTER TABLE categories ADD CONSTRAINT chk_categories_content_types
  CHECK (content_types <@ '["COMMUNITY", "SERIES"]'::jsonb);
