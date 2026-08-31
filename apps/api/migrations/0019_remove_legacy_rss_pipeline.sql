-- RSS/news ingestion is no longer part of the Learning product.
-- Drop dependent tables first; historical migrations 0006-0010 are retained as history.
DROP TABLE IF EXISTS ai_evaluation_jobs;
DROP TABLE IF EXISTS raw_news_items;
DROP TABLE IF EXISTS news_fetch_runs;
DROP TABLE IF EXISTS news_sources;
