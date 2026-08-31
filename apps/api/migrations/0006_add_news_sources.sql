CREATE TABLE IF NOT EXISTS news_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) NOT NULL,
  source_name varchar(150) NOT NULL,
  url varchar(500) NOT NULL,
  source_type varchar(20) NOT NULL DEFAULT 'RSS',
  domain_code varchar(30),
  topic_slug varchar(120),
  language varchar(10) NOT NULL DEFAULT 'vi',
  is_enabled boolean NOT NULL DEFAULT true,
  fetch_interval_minutes integer NOT NULL DEFAULT 30,
  last_fetched_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_news_sources_key UNIQUE (key),
  CONSTRAINT chk_news_sources_type CHECK (source_type IN ('RSS', 'API', 'SCRAPER')),
  CONSTRAINT chk_news_sources_language CHECK (language IN ('vi', 'en')),
  CONSTRAINT chk_news_sources_interval CHECK (fetch_interval_minutes BETWEEN 5 AND 1440)
);

CREATE INDEX IF NOT EXISTS idx_news_sources_enabled ON news_sources (is_enabled);
CREATE INDEX IF NOT EXISTS idx_news_sources_domain_code ON news_sources (domain_code);
