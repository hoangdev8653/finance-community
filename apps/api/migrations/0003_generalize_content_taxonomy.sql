CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL,
  slug varchar(80) NOT NULL,
  name varchar(120) NOT NULL,
  name_vi varchar(120),
  name_en varchar(120),
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_promoted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_domains_code UNIQUE (code),
  CONSTRAINT uq_domains_slug UNIQUE (slug)
);

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS fk_categories_domain,
  DROP CONSTRAINT IF EXISTS fk_categories_parent;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS domain_id uuid,
  ADD COLUMN IF NOT EXISTS parent_id uuid,
  ADD COLUMN IF NOT EXISTS name_vi varchar(100),
  ADD COLUMN IF NOT EXISTS name_en varchar(100),
  ADD COLUMN IF NOT EXISTS content_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_promoted boolean NOT NULL DEFAULT false;

ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS fk_posts_domain;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS domain_id uuid;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_scope;

INSERT INTO domains (id, code, slug, name, name_vi, name_en, sort_order, is_promoted)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'MONEY', 'money', 'Money', 'Tài chính', 'Money', 10, true),
  ('10000000-0000-4000-8000-000000000002', 'BUSINESS', 'business', 'Business', 'Kinh doanh', 'Business', 20, true),
  ('10000000-0000-4000-8000-000000000003', 'TECH', 'technology', 'Technology', 'Công nghệ', 'Technology', 30, true),
  ('10000000-0000-4000-8000-000000000004', 'CAREER', 'career', 'Career & Learning', 'Nghề nghiệp & Học tập', 'Career & Learning', 40, true),
  ('10000000-0000-4000-8000-000000000005', 'LIFE', 'life', 'Life', 'Đời sống', 'Life', 50, true),
  ('10000000-0000-4000-8000-000000000006', 'SPORTS', 'sports', 'Sports', 'Thể thao', 'Sports', 60, true)
ON CONFLICT (code) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  name_en = EXCLUDED.name_en,
  updated_at = now();

UPDATE categories
SET domain_id = '10000000-0000-4000-8000-000000000001',
    content_types = jsonb_build_array(scope)
WHERE domain_id IS NULL;

UPDATE posts p
SET domain_id = c.domain_id
FROM categories c
WHERE p.category_id = c.id AND p.domain_id IS NULL;

ALTER TABLE categories
  ADD CONSTRAINT fk_categories_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE posts
  ADD CONSTRAINT fk_posts_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_domain_id ON categories(domain_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_domain_id ON posts(domain_id);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  parent_id uuid,
  name varchar(120) NOT NULL,
  slug varchar(140) NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_topics_domain_slug UNIQUE (domain_id, slug),
  CONSTRAINT fk_topics_parent FOREIGN KEY (parent_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_domain_id ON topics(domain_id);
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON topics(category_id);
