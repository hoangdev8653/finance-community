CREATE TABLE IF NOT EXISTS ai_evaluation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_item_id uuid NOT NULL REFERENCES raw_news_items(id) ON DELETE CASCADE,
  provider varchar(30) NOT NULL DEFAULT 'GEMINI', model varchar(100), status varchar(20) NOT NULL DEFAULT 'PENDING',
  result jsonb, error text, prompt_version varchar(30) NOT NULL DEFAULT 'v1', created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  CONSTRAINT chk_ai_evaluation_status CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','CONFIGURATION_REQUIRED'))
);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_jobs_item ON ai_evaluation_jobs(news_item_id, created_at DESC);
