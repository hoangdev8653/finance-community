CREATE TABLE IF NOT EXISTS learning_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(300) NOT NULL,
  slug varchar(320) NOT NULL UNIQUE,
  description text,
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_series_domain_category ON learning_series(domain_id, category_id);
CREATE TABLE IF NOT EXISTS learning_series_posts (
  series_id uuid NOT NULL REFERENCES learning_series(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  lesson_order integer NOT NULL CHECK (lesson_order > 0),
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (series_id, post_id),
  CONSTRAINT uq_learning_series_order UNIQUE (series_id, lesson_order)
);
