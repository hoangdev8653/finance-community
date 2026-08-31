CREATE TABLE IF NOT EXISTS news_fetch_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
  status varchar(20) NOT NULL DEFAULT 'RUNNING', items_seen integer NOT NULL DEFAULT 0, items_created integer NOT NULL DEFAULT 0,
  items_duplicate integer NOT NULL DEFAULT 0, error text, started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  CONSTRAINT chk_news_fetch_runs_status CHECK (status IN ('RUNNING','SUCCEEDED','PARTIAL','FAILED'))
);
CREATE TABLE IF NOT EXISTS raw_news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
  fetch_run_id uuid REFERENCES news_fetch_runs(id) ON DELETE SET NULL, title varchar(500) NOT NULL, summary text,
  source_url varchar(1000) NOT NULL, canonical_url varchar(1000) NOT NULL, fingerprint varchar(64) NOT NULL,
  published_at timestamptz, raw_payload jsonb, status varchar(20) NOT NULL DEFAULT 'QUEUED', created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_raw_news_items_canonical UNIQUE (canonical_url), CONSTRAINT uq_raw_news_items_fingerprint UNIQUE (fingerprint),
  CONSTRAINT chk_raw_news_items_status CHECK (status IN ('QUEUED','SELECTED','DUPLICATE','IGNORED','FAILED'))
);
CREATE INDEX IF NOT EXISTS idx_news_fetch_runs_source ON news_fetch_runs(source_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_news_items_status ON raw_news_items(status, created_at DESC);
