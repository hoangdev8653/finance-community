CREATE TABLE IF NOT EXISTS learning_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title varchar(300) NOT NULL,
  url varchar(1000) NOT NULL,
  publisher varchar(200),
  source_type varchar(30) NOT NULL DEFAULT 'REFERENCE',
  checked_at timestamptz,
  is_public boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_sources_post_id ON learning_sources(post_id);
